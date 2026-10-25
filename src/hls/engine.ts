import { BandwidthEstimator, chooseLevel } from './abr.js'
import { aesSupported, decryptSegment } from './aes.js'
import { fragmentStart, isFmp4, isMpegTs, parseInit, type Mp4TrackInfo } from './mp4.js'
import {
  HlsParseError, parsePlaylist,
  type HlsByteRange, type HlsInitSection, type HlsMediaPlaylist, type HlsSegment, type HlsVariant,
} from './playlist.js'
import { TransmuxError, type SegmentTransmuxer, type TransmuxerFactory } from './transmux.js'
import { createTsTransmuxer } from './ts/transmuxer.js'

export type HlsErrorCode = 'mse' | 'manifest' | 'network' | 'encrypted' | 'codec'

export class HlsError extends Error {
  constructor(readonly code: HlsErrorCode, message: string) {
    super(message)
    this.name = 'HlsError'
  }
}

export interface HlsLevel {
  index: number
  bandwidth: number
  width?: number
  height?: number
  codecs?: string
  /** `720p`, or the bitrate when the resolution is unknown. */
  label: string
}

export interface HlsOptions {
  /** Use the browser's own HLS (Safari, iOS) when it has one (default `true`). */
  preferNative?: boolean
  /** Starting level index; `-1` (default) lets ABR choose. */
  startLevel?: number
  /** Seconds to buffer ahead of the playhead (default 30). */
  maxBufferAhead?: number
  /** Seconds kept behind the playhead before eviction (default 30). */
  maxBufferBehind?: number
  /** Attempts per request after the first failure (default 3). */
  retries?: number
  /** Initial bandwidth estimate in bits per second (default 1 Mbit/s). */
  initialBandwidth?: number
  /** ABR never picks levels much taller than the player (default `true`). */
  capToPlayerSize?: boolean
  /** Converts non-fMP4 segments; defaults to the built-in MPEG-TS transmuxer, `null` disables it. */
  transmuxer?: TransmuxerFactory | null
  fetch?: typeof fetch
  onLevels?: (levels: HlsLevel[]) => void
  onLevelSwitched?: (index: number) => void
  onError?: (error: HlsError) => void
}

export interface HlsSession {
  readonly native: boolean
  readonly live: boolean
  readonly levels: HlsLevel[]
  /** Level currently being loaded; `-1` before the first one. */
  readonly level: number
  readonly autoLevel: boolean
  /** Bandwidth estimate, bits per second. */
  readonly bandwidth: number
  setLevel(index: number): void
  destroy(): void
}

type Op =
  | { kind: 'append', data: Uint8Array }
  | { kind: 'remove', start: number, end: number }
  | { kind: 'offset', value: number }
  | { kind: 'changeType', mime: string }
  | { kind: 'eos' }

interface QueuedOp { op: Op, resolve: () => void, reject: (e: unknown) => void }

interface Level {
  variant: HlsVariant
  info: HlsLevel
  playlist?: HlsMediaPlaylist
  loading?: Promise<HlsMediaPlaylist>
}

type MediaSourceCtor = typeof MediaSource

export function getMediaSource(): MediaSourceCtor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { MediaSource?: MediaSourceCtor, ManagedMediaSource?: MediaSourceCtor }
  return w.MediaSource ?? w.ManagedMediaSource
}

export function canPlayNativeHls(media: HTMLMediaElement): boolean {
  return !!media.canPlayType('application/vnd.apple.mpegurl') || !!media.canPlayType('application/x-mpegURL')
}

export function isHlsSupported(media?: HTMLMediaElement): boolean {
  return !!getMediaSource() || (!!media && canPlayNativeHls(media))
}

function levelLabel(v: HlsVariant): string {
  if (v.height) return `${v.height}p`
  if (v.name) return v.name
  return `${Math.round(v.bandwidth / 1000)} kbps`
}

const RETRYABLE = (status: number): boolean => status >= 500 || status === 429 || status === 0

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

function rangesOf(media: HTMLMediaElement): [number, number][] {
  const out: [number, number][] = []
  const b = media.buffered
  for (let i = 0; i < b.length; i++) out.push([b.start(i), b.end(i)])
  return out
}

function bufferedEnd(media: HTMLMediaElement, t: number): number {
  let end = t
  for (const [s, e] of rangesOf(media)) if (s - 0.3 <= end && e > end) end = e
  return end
}

function isAbort(e: unknown): boolean {
  return (e as DOMException)?.name === 'AbortError'
}

class HlsEngine implements HlsSession {
  readonly native = false
  live = false
  levels: HlsLevel[] = []
  level = -1
  autoLevel = true

  private readonly opts: Required<Pick<HlsOptions, 'maxBufferAhead' | 'maxBufferBehind' | 'retries'>> & HlsOptions
  private readonly abort = new AbortController()
  private readonly est: BandwidthEstimator
  private readonly fetchFn: typeof fetch
  private all: Level[] = []
  private ms: MediaSource | null = null
  private objectUrl = ''
  private sb: SourceBuffer | null = null
  private mime = ''
  private queue: QueuedOp[] = []
  private running: QueuedOp | null = null
  private loading = false
  private segmentAbort: AbortController | null = null
  private last: { level: number, sn: number, cc: number } | null = null
  private appendedInit = ''
  private tracks: Mp4TrackInfo[] = []
  private offsets = new Map<number, number>()
  private transmuxer: SegmentTransmuxer | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private reloadTimer: ReturnType<typeof setTimeout> | null = null
  private ended = false
  private destroyed = false
  private failed = false
  private startPositioned = false

  constructor(private readonly media: HTMLMediaElement, private readonly url: string, options: HlsOptions) {
    this.opts = { maxBufferAhead: 30, maxBufferBehind: 30, retries: 3, ...options }
    this.est = new BandwidthEstimator(options.initialBandwidth ?? 1_000_000)
    this.fetchFn = options.fetch ?? ((...args) => fetch(...args))
    this.media.addEventListener('seeking', this.onSeeking)
    this.start().catch((e) => this.fail(e))
  }

  get bandwidth(): number {
    return this.est.estimate
  }

  // ---- lifecycle ----

  private async start(): Promise<void> {
    const MS = getMediaSource()
    if (!MS) throw new HlsError('mse', 'MediaSource is not available')
    const text = await this.fetchText(this.url)
    const parsed = parsePlaylist(text, this.url)
    if (parsed.type === 'master') {
      const variants = parsed.variants
        .filter((v) => !v.codecs || MS.isTypeSupported(`video/mp4; codecs="${v.codecs}"`) || MS.isTypeSupported(`audio/mp4; codecs="${v.codecs}"`))
        .sort((a, b) => a.bandwidth - b.bandwidth)
      if (!variants.length) throw new HlsError('codec', 'No variant has codecs this browser supports')
      this.all = variants.map((variant, index) => ({
        variant,
        info: { index, bandwidth: variant.bandwidth, width: variant.width, height: variant.height, codecs: variant.codecs, label: levelLabel(variant) },
      }))
    } else {
      const variant: HlsVariant = { uri: this.url, bandwidth: 0 }
      this.all = [{ variant, playlist: parsed, info: { index: 0, bandwidth: 0, label: 'auto' } }]
    }
    this.levels = this.all.map((l) => l.info)
    this.opts.onLevels?.(this.levels)

    const start = this.opts.startLevel ?? -1
    this.autoLevel = start < 0
    this.level = start >= 0 && start < this.all.length ? start : this.pickLevel()

    const ms = new MS()
    this.ms = ms
    if ('disableRemotePlayback' in this.media && (window as unknown as { ManagedMediaSource?: unknown }).ManagedMediaSource === MS) {
      this.media.disableRemotePlayback = true
    }
    this.objectUrl = URL.createObjectURL(ms)
    const opened = new Promise<void>((resolve) => ms.addEventListener('sourceopen', () => resolve(), { once: true }))
    this.media.src = this.objectUrl
    await opened
    if (this.destroyed) return

    const pl = await this.loadPlaylist(this.level)
    this.live = !pl.endList
    if (!this.live) ms.duration = pl.totalDuration
    this.opts.onLevelSwitched?.(this.level)
    if (this.live) this.scheduleReload(pl.targetDuration)
    this.timer = setInterval(() => this.tick(), 250)
    this.tick()
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.abort.abort()
    this.segmentAbort?.abort()
    if (this.timer) clearInterval(this.timer)
    if (this.reloadTimer) clearTimeout(this.reloadTimer)
    this.media.removeEventListener('seeking', this.onSeeking)
    for (const q of this.queue) q.reject(new DOMException('Aborted', 'AbortError'))
    this.queue = []
    if (this.objectUrl) {
      this.media.removeAttribute('src')
      this.media.load()
      URL.revokeObjectURL(this.objectUrl)
    }
    this.sb = null
    this.ms = null
  }

  private fail(e: unknown): void {
    if (this.destroyed || isAbort(e) || this.failed) return
    this.failed = true
    let err: HlsError
    if (e instanceof HlsError) err = e
    else if (e instanceof HlsParseError) err = new HlsError('manifest', e.message)
    else if (e instanceof TransmuxError) err = new HlsError('codec', e.message)
    else if ((e as DOMException)?.name === 'NotSupportedError') err = new HlsError('codec', (e as Error).message)
    else err = new HlsError('network', (e as Error)?.message ?? String(e))
    if (this.timer) clearInterval(this.timer)
    if (this.reloadTimer) clearTimeout(this.reloadTimer)
    this.opts.onError?.(err)
  }

  // ---- networking ----

  private async request(url: string, range: HlsByteRange | undefined, signal: AbortSignal): Promise<Response> {
    const headers: Record<string, string> = {}
    if (range) headers.Range = `bytes=${range.offset}-${range.offset + range.length - 1}`
    let attempt = 0
    for (;;) {
      try {
        const res = await this.fetchFn(url, { headers, signal })
        if (res.ok) return res
        if (!RETRYABLE(res.status) || attempt >= this.opts.retries) {
          throw new HlsError('network', `HTTP ${res.status} for ${url}`)
        }
      } catch (e) {
        if (isAbort(e) || e instanceof HlsError || attempt >= this.opts.retries) throw e
      }
      await sleep(500 * 2 ** attempt, signal)
      attempt++
    }
  }

  private async fetchText(url: string): Promise<string> {
    return (await this.request(url, undefined, this.abort.signal)).text()
  }

  private async fetchBytes(url: string, range: HlsByteRange | undefined, signal: AbortSignal): Promise<{ data: Uint8Array, ms: number }> {
    const t0 = performance.now()
    const res = await this.request(url, range, signal)
    const buf = await res.arrayBuffer()
    let data = new Uint8Array(buf)
    // A server that ignores Range sends the whole file.
    if (range && res.status === 200 && data.length > range.length) data = data.subarray(range.offset, range.offset + range.length)
    return { data, ms: performance.now() - t0 }
  }

  private loadKey = async (uri: string): Promise<ArrayBuffer> => {
    const { data } = await this.fetchBytes(uri, undefined, this.abort.signal)
    return data.slice().buffer
  }

  // ---- playlists ----

  private loadPlaylist(index: number, force = false): Promise<HlsMediaPlaylist> {
    const level = this.all[index]
    if (level.playlist && !force) return Promise.resolve(level.playlist)
    if (level.loading) return level.loading
    level.loading = this.fetchText(level.variant.uri)
      .then((text) => {
        const parsed = parsePlaylist(text, level.variant.uri)
        if (parsed.type !== 'media') throw new HlsParseError('Expected a media playlist')
        const reference = level.playlist ?? this.all[this.level]?.playlist
        if (reference && reference !== parsed) alignTimes(reference, parsed)
        level.playlist = parsed
        return parsed
      })
      .finally(() => { level.loading = undefined })
    return level.loading
  }

  private scheduleReload(seconds: number): void {
    if (this.destroyed) return
    this.reloadTimer = setTimeout(async () => {
      try {
        const before = this.all[this.level].playlist
        const pl = await this.loadPlaylist(this.level, true)
        const changed = !before || pl.segments[pl.segments.length - 1]?.sn !== before.segments[before.segments.length - 1]?.sn
        if (pl.endList) {
          this.live = false
          return
        }
        this.updateSeekable(pl)
        this.scheduleReload(changed ? pl.targetDuration : pl.targetDuration / 2)
        this.tick()
      } catch (e) {
        this.fail(e)
      }
    }, Math.max(1, seconds) * 1000)
  }

  private updateSeekable(pl: HlsMediaPlaylist): void {
    const ms = this.ms as (MediaSource & { setLiveSeekableRange?: (s: number, e: number) => void }) | null
    if (!ms || ms.readyState !== 'open' || !pl.segments.length) return
    const first = pl.segments[0]
    const last = pl.segments[pl.segments.length - 1]
    try {
      if (ms.duration !== Infinity && !this.sb?.updating) ms.duration = Infinity
      ms.setLiveSeekableRange?.(first.start, last.start + last.duration)
    } catch {
      // Not every implementation accepts the change while updating.
    }
  }

  // ---- ABR ----

  private pickLevel(): number {
    const levels = this.all.map((l) => l.info)
    const maxHeight = this.opts.capToPlayerSize === false
      ? undefined
      : Math.round((this.media.clientHeight || 0) * (window.devicePixelRatio || 1)) || undefined
    const ahead = bufferedEnd(this.media, this.media.currentTime) - this.media.currentTime
    return chooseLevel(levels, this.est.estimate, {
      maxHeight,
      bufferAhead: this.est.hasSamples ? ahead : undefined,
      current: this.level >= 0 ? this.level : undefined,
    })
  }

  setLevel(index: number): void {
    if (index < 0) {
      this.autoLevel = true
      return
    }
    if (index >= this.all.length) return
    this.autoLevel = false
    if (index === this.level) return
    this.switchTo(index, true)
  }

  private switchTo(index: number, flush: boolean): void {
    this.level = index
    this.opts.onLevelSwitched?.(index)
    if (flush) {
      this.segmentAbort?.abort()
      const keepUntil = this.media.currentTime + 1
      if (bufferedEnd(this.media, this.media.currentTime) > keepUntil) {
        this.enqueue({ kind: 'remove', start: keepUntil, end: Infinity }).catch(() => {})
      }
      this.last = null
    }
    this.loadPlaylist(index).then(() => this.tick(), (e) => this.fail(e))
  }

  // ---- source buffer ----

  private ensureBuffer(mime: string): void {
    if (!this.ms) return
    if (!this.sb) {
      try {
        this.sb = this.ms.addSourceBuffer(mime)
      } catch (e) {
        throw new HlsError('codec', `${mime}: ${(e as Error).message}`)
      }
      this.mime = mime
      this.sb.addEventListener('updateend', this.onUpdateEnd)
      this.sb.addEventListener('error', this.onBufferError)
      return
    }
    if (mime !== this.mime) {
      this.mime = mime
      if (typeof this.sb.changeType === 'function') this.enqueue({ kind: 'changeType', mime }).catch(() => {})
    }
  }

  private enqueue(op: Op): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ op, resolve, reject })
      this.pump()
    })
  }

  private onUpdateEnd = (): void => {
    const done = this.running
    this.running = null
    done?.resolve()
    this.pump()
  }

  private onBufferError = (): void => {
    const done = this.running
    this.running = null
    done?.reject(new HlsError('codec', 'SourceBuffer error'))
  }

  private pump(): void {
    const sb = this.sb
    const ms = this.ms
    if (!sb || !ms || this.running || sb.updating) return
    while (this.queue.length) {
      const item = this.queue.shift() as QueuedOp
      const { op } = item
      try {
        if (op.kind === 'append') {
          this.running = item
          sb.appendBuffer(op.data as BufferSource)
          return
        }
        if (op.kind === 'remove') {
          const end = Math.min(op.end, Number.isFinite(ms.duration) ? ms.duration : op.end)
          if (end > op.start) {
            this.running = item
            sb.remove(op.start, op.end)
            return
          }
          item.resolve()
        } else if (op.kind === 'offset') {
          sb.timestampOffset = op.value
          item.resolve()
        } else if (op.kind === 'changeType') {
          sb.changeType(op.mime)
          item.resolve()
        } else if (op.kind === 'eos') {
          if (ms.readyState === 'open') ms.endOfStream()
          item.resolve()
        }
      } catch (e) {
        this.running = null
        if ((e as DOMException)?.name === 'QuotaExceededError' && op.kind === 'append') {
          const behind = this.media.currentTime - 5
          if (behind > 0) {
            this.queue.unshift({ op: { kind: 'remove', start: 0, end: behind }, resolve: () => {}, reject: () => {} }, item)
            continue
          }
        }
        item.reject(e)
      }
    }
  }

  // ---- loading loop ----

  private onSeeking = (): void => {
    const t = this.media.currentTime
    if (bufferedEnd(this.media, t) - t > 0.1) return
    this.segmentAbort?.abort()
    this.last = null
    this.ended = false
    setTimeout(() => this.tick(), 0)
  }

  private nextSegment(pl: HlsMediaPlaylist): HlsSegment | undefined {
    const segs = pl.segments
    if (!segs.length) return undefined
    if (this.last && this.last.level === this.level) {
      const next = segs.find((s) => s.sn === (this.last as { sn: number }).sn + 1)
      if (next) return next
      if (segs[segs.length - 1].sn <= this.last.sn) return undefined
    }
    if (this.live && !this.startPositioned && !this.last) {
      return segs[Math.max(0, segs.length - 3)]
    }
    const t = bufferedEnd(this.media, this.media.currentTime)
    if (t < segs[0].start) return segs[0]
    return segs.find((s) => t >= s.start - 0.05 && t < s.start + s.duration - 0.05)
  }

  private tick(): void {
    if (this.destroyed || this.failed || this.loading || !this.ms) return
    const level = this.all[this.level]
    const pl = level?.playlist
    if (!pl) return
    const pos = this.media.currentTime
    this.jumpGap(pos)
    this.evict(pos)
    const ahead = bufferedEnd(this.media, pos) - pos
    if (ahead >= this.opts.maxBufferAhead) return
    const seg = this.nextSegment(pl)
    if (!seg) {
      if (pl.endList && !this.ended && this.last) {
        this.ended = true
        this.enqueue({ kind: 'eos' }).catch(() => {})
      }
      return
    }
    this.loading = true
    this.loadSegment(seg, this.level)
      .catch((e) => {
        if (!isAbort(e)) this.fail(e)
      })
      .finally(() => {
        this.loading = false
        if (!this.destroyed) setTimeout(() => this.tick(), 0)
      })
  }

  private stallPos = -1
  private stallSince = 0

  private jumpGap(pos: number): void {
    const ranges = rangesOf(this.media)
    if (!ranges.length || this.media.seeking) return
    const current = ranges.find(([s, e]) => pos >= s && pos < e)
    const ahead = ranges.find(([s]) => s > pos)
    if (!current) {
      // The first append of a live window, or the playhead sits in a hole between fragments.
      if (ahead && (ahead[0] - pos < 1 || (!this.startPositioned && this.live))) this.media.currentTime = ahead[0] + 0.01
      return
    }
    // Stuck just before the end of a range with the next one right after it (timestamp jitter at a discontinuity).
    const stuck = !this.media.paused && this.media.readyState < 3
    if (!stuck) {
      this.stallPos = -1
      return
    }
    if (this.stallPos !== pos) {
      this.stallPos = pos
      this.stallSince = performance.now()
      return
    }
    if (performance.now() - this.stallSince < 500) return
    if (ahead && current[1] - pos < 0.5 && ahead[0] - current[1] < 1) this.media.currentTime = ahead[0] + 0.01
  }

  private evict(pos: number): void {
    const ranges = rangesOf(this.media)
    if (!ranges.length || !this.sb || this.queue.some((q) => q.op.kind === 'remove')) return
    const limit = pos - this.opts.maxBufferBehind
    if (ranges[0][0] < limit - 1) this.enqueue({ kind: 'remove', start: 0, end: limit }).catch(() => {})
  }

  private async loadInit(map: HlsInitSection, levelIndex: number, signal: AbortSignal): Promise<void> {
    const key = `${levelIndex}|${map.uri}|${map.byteRange?.offset ?? ''}`
    if (key === this.appendedInit) return
    let { data } = await this.fetchBytes(map.uri, map.byteRange, signal)
    if (map.key?.method === 'AES-128' && !isFmp4(data)) {
      data = new Uint8Array(await decryptSegment(data.slice().buffer, map.key, 0, this.loadKey))
    }
    this.tracks = parseInit(data)
    const variantCodecs = this.all[levelIndex].variant.codecs
    const codecs = this.tracks.map((t) => t.codec).filter(Boolean).join(',') || variantCodecs || ''
    const kind = this.tracks.some((t) => t.kind === 'video') || !this.tracks.length ? 'video' : 'audio'
    this.ensureBuffer(`${kind}/mp4; codecs="${codecs}"`)
    await this.enqueue({ kind: 'append', data })
    this.appendedInit = key
  }

  private async loadSegment(seg: HlsSegment, levelIndex: number): Promise<void> {
    const ctrl = new AbortController()
    this.segmentAbort = ctrl
    const abortAll = (): void => ctrl.abort()
    this.abort.signal.addEventListener('abort', abortAll, { once: true })
    try {
      if (seg.key && seg.key.method !== 'AES-128') {
        throw new HlsError('encrypted', `${seg.key.method} encryption is not supported`)
      }
      if (seg.key && !aesSupported()) throw new HlsError('encrypted', 'WebCrypto is not available')
      if (seg.map) await this.loadInit(seg.map, levelIndex, ctrl.signal)

      const { data: raw, ms } = await this.fetchBytes(seg.uri, seg.byteRange, ctrl.signal)
      this.est.sample({ bytes: raw.length, ms })
      let data = raw
      if (seg.key) data = new Uint8Array(await decryptSegment(raw.slice().buffer, seg.key, seg.sn, this.loadKey))
      if (ctrl.signal.aborted) return

      const sequential = !!this.last && this.last.level === levelIndex && this.last.sn + 1 === seg.sn && this.last.cc === seg.cc
      let startTime: number | null
      if (isMpegTs(data)) {
        if (this.opts.transmuxer === null) throw new HlsError('codec', 'MPEG-TS segments need a transmuxer')
        this.transmuxer ??= (this.opts.transmuxer ?? createTsTransmuxer)()
        const out = this.transmuxer.push(data, { discontinuity: !sequential })
        if (out.init) {
          this.ensureBuffer(out.mimeType)
          await this.enqueue({ kind: 'append', data: out.init })
          this.appendedInit = ''
        }
        this.tracks = out.tracks
        data = out.data
        startTime = out.startTime
      } else if (isFmp4(data)) {
        if (!this.sb) throw new HlsError('codec', 'fMP4 segment without an initialization section')
        startTime = fragmentStart(data, this.tracks)
      } else {
        throw new HlsError('codec', 'Unknown segment container')
      }

      // One offset per discontinuity domain maps media time onto the playlist timeline.
      if (startTime !== null) {
        let offset = this.offsets.get(seg.cc)
        if (offset === undefined) {
          offset = seg.start - startTime
          this.offsets.set(seg.cc, offset)
        }
        if (this.sb && Math.abs(this.sb.timestampOffset - offset) > 1e-3) await this.enqueue({ kind: 'offset', value: offset })
      }
      if (ctrl.signal.aborted) return
      await this.enqueue({ kind: 'append', data })
      this.last = { level: levelIndex, sn: seg.sn, cc: seg.cc }

      if (!this.startPositioned) {
        this.startPositioned = true
        if (this.live) this.media.currentTime = seg.start + 0.01
        if (this.live) this.updateSeekable(this.all[levelIndex].playlist as HlsMediaPlaylist)
      }

      if (this.autoLevel && this.all.length > 1) {
        const next = this.pickLevel()
        if (next !== this.level) this.switchTo(next, false)
      }
    } finally {
      this.abort.signal.removeEventListener('abort', abortAll)
      if (this.segmentAbort === ctrl) this.segmentAbort = null
    }
  }
}

/** Keeps playlist times stable across reloads and renditions by matching media sequence numbers. */
export function alignTimes(reference: HlsMediaPlaylist, next: HlsMediaPlaylist): void {
  if (!reference.segments.length || !next.segments.length) return
  const byId = new Map(reference.segments.map((s) => [s.sn, s]))
  let shift: number | null = null
  for (const s of next.segments) {
    const ref = byId.get(s.sn)
    if (ref) {
      shift = ref.start - s.start
      break
    }
  }
  if (shift === null) {
    const last = reference.segments[reference.segments.length - 1]
    const first = next.segments[0]
    if (first.sn <= last.sn) return
    const gap = (first.sn - last.sn - 1) * (next.targetDuration || last.duration)
    shift = last.start + last.duration + gap - first.start
  }
  if (!shift) return
  for (const s of next.segments) s.start += shift
}

/** Plays an HLS stream in `media`: natively where the browser can, otherwise through MediaSource. */
export function attachHls(media: HTMLMediaElement, url: string, options: HlsOptions = {}): HlsSession {
  if (options.preferNative !== false && canPlayNativeHls(media)) {
    media.src = url
    return {
      native: true,
      get live() { return media.duration === Infinity },
      levels: [],
      level: -1,
      autoLevel: true,
      bandwidth: 0,
      setLevel: () => {},
      destroy: () => {
        media.removeAttribute('src')
        media.load()
      },
    }
  }
  if (!getMediaSource()) {
    const err = new HlsError('mse', 'MediaSource is not available')
    queueMicrotask(() => options.onError?.(err))
    return { native: false, live: false, levels: [], level: -1, autoLevel: true, bandwidth: 0, setLevel: () => {}, destroy: () => {} }
  }
  const absolute = typeof location !== 'undefined' ? new URL(url, location.href).href : url
  return new HlsEngine(media, absolute, options)
}
