export interface ComputePeaksOptions {
  /** Samples processed between yields to the event loop. */
  chunkSize?: number
  /** Yields between chunks; defaults to requestIdleCallback / setTimeout. */
  yieldFn?: () => Promise<void>
  signal?: AbortSignal
}

export interface WaveformOptions {
  /** Number of peaks to compute (default 1024). */
  count?: number
  /** Skip files larger than this many bytes (default 40 MB). */
  maxBytes?: number
  /** Skip audio longer than this many seconds (default 30 min). */
  maxDuration?: number
  fetchInit?: RequestInit
}

export function idleYield(): Promise<void> {
  return new Promise((resolve) => {
    const ric = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    if (ric) ric(() => resolve(), { timeout: 50 })
    else setTimeout(resolve, 0)
  })
}

function abortError(): DOMException {
  return new DOMException('Aborted', 'AbortError')
}

/** Max absolute amplitude per bucket across all channels, normalised to 0..1, processed in chunks. */
export async function computePeaks(
  channels: ArrayLike<number>[],
  count: number,
  options: ComputePeaksOptions = {},
): Promise<number[]> {
  const length = channels.length ? channels[0].length : 0
  const peaks = new Array<number>(count).fill(0)
  if (!length || count <= 0) return peaks
  const chunk = options.chunkSize ?? 262144
  const yieldFn = options.yieldFn ?? idleYield
  const bucket = length / count
  let processed = 0
  for (let start = 0; start < length; start += chunk) {
    if (options.signal?.aborted) throw abortError()
    const end = Math.min(length, start + chunk)
    for (const data of channels) {
      for (let i = start; i < end; i++) {
        const v = data[i]
        const a = v < 0 ? -v : v
        const b = Math.min(count - 1, Math.floor(i / bucket))
        if (a > peaks[b]) peaks[b] = a
      }
    }
    processed = end
    if (processed < length) await yieldFn()
  }
  return normalizePeaks(peaks)
}

export function normalizePeaks(peaks: number[]): number[] {
  let max = 0
  for (const p of peaks) if (p > max) max = p
  if (max <= 0) return peaks.map(() => 0)
  return peaks.map((p) => Math.min(1, p / max))
}

/** Reduces (max) or stretches (nearest) peaks to `n` bars for drawing. */
export function resamplePeaks(peaks: number[], n: number): number[] {
  if (n <= 0 || !peaks.length) return []
  if (peaks.length === n) return peaks.slice()
  const out = new Array<number>(n)
  const ratio = peaks.length / n
  for (let i = 0; i < n; i++) {
    const from = Math.floor(i * ratio)
    const to = Math.max(from + 1, Math.floor((i + 1) * ratio))
    let m = 0
    for (let j = from; j < to && j < peaks.length; j++) if (peaks[j] > m) m = peaks[j]
    out[i] = m
  }
  return out
}

/** SVG path of centred bars (viewBox `0 0 n*step 100`), heights clamped to a visible minimum. */
export function peaksToPath(peaks: number[], step = 3, bar = 2, minHeight = 4): string {
  let d = ''
  for (let i = 0; i < peaks.length; i++) {
    const h = Math.max(minHeight, peaks[i] * 100)
    const y = (100 - h) / 2
    d += `M${i * step} ${y.toFixed(1)}h${bar}v${h.toFixed(1)}h-${bar}z`
  }
  return d
}

const cache = new Map<string, Promise<number[] | null>>()
// Decoding is memory- and CPU-heavy: files are processed one after another.
let chain: Promise<unknown> = Promise.resolve()

type AudioCtor = new (channels: number, length: number, rate: number) => BaseAudioContext

function createDecoder(): BaseAudioContext | null {
  const g = globalThis as unknown as { OfflineAudioContext?: AudioCtor, webkitOfflineAudioContext?: AudioCtor }
  const Offline = g.OfflineAudioContext ?? g.webkitOfflineAudioContext
  if (!Offline) return null
  // A low sample rate keeps the decoded buffer small; peaks don't need high frequencies.
  return new Offline(1, 1, 8000)
}

function decode(ctx: BaseAudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const p = ctx.decodeAudioData(data, resolve, reject)
    if (p && typeof p.then === 'function') p.then(resolve, reject)
  })
}

async function loadPeaks(src: string, count: number, o: WaveformOptions): Promise<number[] | null> {
  const ctx = createDecoder()
  if (!ctx) return null
  const maxBytes = o.maxBytes ?? 40 * 1024 * 1024
  const res = await fetch(src, o.fetchInit)
  if (!res.ok) return null
  const declared = Number(res.headers.get('content-length') ?? 0)
  if (declared > maxBytes) {
    res.body?.cancel().catch(() => {})
    return null
  }
  const data = await res.arrayBuffer()
  if (data.byteLength > maxBytes) return null
  const audio = await decode(ctx, data)
  if (audio.duration > (o.maxDuration ?? 1800)) return null
  const channels: Float32Array[] = []
  for (let c = 0; c < Math.min(audio.numberOfChannels, 2); c++) channels.push(audio.getChannelData(c))
  return computePeaks(channels, count)
}

/** Peaks of an audio file decoded in the browser; `null` when skipped or impossible. Cached per src. */
export function getWaveform(src: string, options: WaveformOptions = {}): Promise<number[] | null> {
  const count = options.count ?? 1024
  const key = `${count}:${src}`
  const hit = cache.get(key)
  if (hit) return hit
  const job = chain.then(() => loadPeaks(src, count, options)).catch(() => {
    cache.delete(key)
    return null
  })
  cache.set(key, job)
  chain = job
  return job
}

export function clearWaveformCache(): void {
  cache.clear()
}
