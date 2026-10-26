export interface UidMediaSource {
  src: string
  /** MIME type, e.g. `video/mp4`, `video/webm; codecs="vp9,opus"`, `application/x-mpegURL`. */
  type?: string
  /** Quality label shown in the quality menu (`1080p`, `720p`…). */
  label?: string
}

export interface UidMediaTrack {
  src: string
  kind?: 'subtitles' | 'captions' | 'chapters'
  srclang?: string
  label?: string
  default?: boolean
}

export interface UidMediaCue {
  start: number
  end: number
  text: string
}

export type UidMediaRange = [number, number]

export function formatTime(value: number, withHours = false): string {
  if (!Number.isFinite(value) || value < 0) value = 0
  const total = Math.floor(value)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  if (h > 0 || withHours) return `${h}:${String(m).padStart(2, '0')}:${ss}`
  return `${m}:${ss}`
}

export function toRanges(ranges: TimeRanges | null | undefined): UidMediaRange[] {
  if (!ranges) return []
  const out: UidMediaRange[] = []
  for (let i = 0; i < ranges.length; i++) out.push([ranges.start(i), ranges.end(i)])
  return out
}

/** End of the buffered range that contains `time` (with a small gap tolerance), or `time` itself. */
export function bufferedEndAt(ranges: UidMediaRange[], time: number, gap = 0.25): number {
  let end = time
  for (const [s, e] of ranges) {
    if (s - gap <= end && e > end) end = e
  }
  return end
}

const HLS_TYPES = ['application/x-mpegurl', 'application/vnd.apple.mpegurl', 'audio/mpegurl', 'audio/x-mpegurl']

export function isHlsSource(source: UidMediaSource): boolean {
  const type = source.type?.toLowerCase().split(';')[0].trim()
  if (type) return HLS_TYPES.includes(type)
  return /\.m3u8(\?|#|$)/i.test(source.src)
}

/**
 * Candidates in the order the browser should try them: the ones `canPlay` vouches for first,
 * HLS sources count as playable when `hlsPlayable` says so (native or MSE).
 */
export function orderSources(
  sources: UidMediaSource[],
  canPlay: (type: string) => string,
  hlsPlayable: boolean,
): UidMediaSource[] {
  const score = (s: UidMediaSource): number => {
    if (isHlsSource(s)) return hlsPlayable ? 2 : 0
    if (!s.type) return 1
    const r = canPlay(s.type)
    return r === 'probably' ? 2 : r === 'maybe' ? 2 : 0
  }
  return sources
    .map((s, i) => ({ s, i, score: score(s) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .filter((x) => x.score > 0)
    .map((x) => x.s)
}

function parseTimestamp(raw: string): number {
  const parts = raw.trim().split(':')
  let sec = 0
  for (const p of parts) sec = sec * 60 + parseFloat(p.replace(',', '.'))
  return sec
}

/** Minimal WebVTT parser: cue timings and text (settings, styles and regions are ignored). */
export function parseVtt(text: string): UidMediaCue[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const cues: UidMediaCue[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.includes('-->')) continue
    const [a, rest] = line.split('-->')
    const b = rest.trim().split(/\s+/)[0]
    const start = parseTimestamp(a)
    const end = parseTimestamp(b)
    const body: string[] = []
    while (i + 1 < lines.length && lines[i + 1].trim() !== '') body.push(lines[++i])
    if (Number.isFinite(start) && Number.isFinite(end)) cues.push({ start, end, text: body.join('\n') })
  }
  return cues
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', nbsp: ' ', quot: '"', apos: "'", lrm: '', rlm: '' }

/** Plain text of a cue: VTT tags (`<v Bob>`, `<i>`, timestamps) dropped, entities decoded. */
export function cueText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&(\w+);/g, (m, name: string) => (name in ENTITIES ? ENTITIES[name] : m))
}

export function cueAt(cues: UidMediaCue[], time: number): UidMediaCue | undefined {
  for (const c of cues) if (time >= c.start && time < c.end) return c
  return undefined
}

export interface UidMediaThumbnail {
  url: string
  x: number
  y: number
  w: number
  h: number
}

/** A thumbnails-VTT cue body: `sprite.jpg#xywh=0,0,160,90` (or a whole image), resolved against `base`. */
export function parseThumbnail(text: string, base: string): UidMediaThumbnail | null {
  const value = text.trim()
  if (!value) return null
  const [path, hash] = value.split('#')
  const url = resolveUrl(path, base)
  const m = hash && /xywh=(\d+),(\d+),(\d+),(\d+)/.exec(hash)
  if (!m) return { url, x: 0, y: 0, w: 0, h: 0 }
  return { url, x: +m[1], y: +m[2], w: +m[3], h: +m[4] }
}

export function resolveUrl(path: string, base: string): string {
  try {
    const origin = typeof location !== 'undefined' ? location.href : 'http://localhost/'
    return new URL(path, new URL(base, origin)).href
  } catch {
    return path
  }
}

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}
