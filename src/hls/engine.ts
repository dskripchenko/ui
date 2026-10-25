import { BandwidthEstimator, chooseLevel } from './abr.js'
import { aesSupported, decryptSegment } from './aes.js'
import { fragmentStart, isFmp4, isMpegTs, parseInit, type Mp4TrackInfo } from './mp4.js'
import {
  HlsParseError, parsePlaylist,
  type HlsByteRange, type HlsInitSection, type HlsMediaPlaylist, type HlsRendition, type HlsSegment, type HlsVariant,
} from './playlist.js'
import { TransmuxError, type SegmentTransmuxer, type TransmuxerFactory } from './transmux.js'
import { isPackedAudio } from './ts/id3.js'
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

export interface HlsAudioTrack {
  index: number
  /** NAME of the rendition, or its language. */
  label: string
  language?: string
  default: boolean
}

export interface HlsOptions {
  /** Use the browser's own HLS (Safari, iOS) when it has one (default `true`). */
  preferNative?: boolean
  /** Starting level index; `-1` (default) lets ABR choose. */
  startLevel?: number
  /** Preferred audio language (BCP 47 prefix, e.g. `ru`); defaults to DEFAULT=YES, then the browser language. */
  audioLanguage?: string
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
  /** Converts non-fMP4 segments; defaults to the built-in MPEG-TS / packed-audio transmuxer, `null` disables it. */
  transmuxer?: TransmuxerFactory | null
  fetch?: typeof fetch
  onLevels?: (levels: HlsLevel[]) => void
  onLevelSwitched?: (index: number) => void
  onAudioTracks?: (tracks: HlsAudioTrack[]) => void
  onAudioTrackSwitched?: (index: number) => void
  onError?: (error: HlsError) => void
}

export interface HlsSession {
  readonly native: boolean
  readonly live: boolean
  readonly levels: HlsLevel[]
  /** Level currently being loaded; `-1` before the first one. */
  readonly level: number
  readonly autoLevel: boolean
  readonly audioTracks: HlsAudioTrack[]
  readonly audioTrack: number
  /** Bandwidth estimate, bits per second. */
  readonly bandwidth: number
  setLevel(index: number): void
  setAudioTrack(index: number): void
  /** Buffered ranges per SourceBuffer (`main`, and `audio` for a separate audio rendition). */
  stats(): HlsStats
  destroy(): void
}

export interface HlsStats {
  buffered: { main: [number, number][], audio?: [number, number][] }
  level: number
  audioTrack: number
  bandwidth: number
}

type Op =
  | { kind: 'append', data: Uint8Array }
  | { kind: 'remove', start: number, end: number }
  | { kind: 'offset', value: number }
  | { kind: 'changeType', mime: string }

interface QueuedOp { op: Op, resolve: () => void, reject: (e: unknown) => void }

/** A media playlist the engine can load: a variant or an audio rendition. */
interface Source {
  id: number
  uri: string
  codecs?: string
  playlist?: HlsMediaPlaylist
  loading?: Promise<HlsMediaPlaylist>
}

interface Level extends Source {
  variant: HlsVariant
  info: HlsLevel
}

interface AudioRendition extends Source {
  rendition: HlsRendition
  info: HlsAudioTrack
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

function rangesOf(b: TimeRanges | undefined): [number, number][] {
  const out: [number, number][] = []
  if (!b) return out
  for (let i = 0; i < b.length; i++) out.push([b.start(i), b.end(i)])
  return out
}

function endOfRange(ranges: [number, number][], t: number): number {
  let end = t
  for (const [s, e] of ranges) if (s - 0.3 <= end && e > end) end = e
  return end
}

function isAbort(e: unknown): boolean {
  return (e as DOMException)?.name === 'AbortError'
}

/** Picks the audio rendition: preferred language, DEFAULT=YES, AUTOSELECT in the browser language, first. */
export function pickAudioRendition(list: HlsRendition[], preferred?: string): number {
  if (!list.length) return -1
  const lang = (l?: string): string => (l ?? '').toLowerCase()
  const matches = (l: string | undefined, want: string): boolean => !!want && (lang(l) === want || lang(l).startsWith(`${want}-`) || want.startsWith(`${lang(l)}-`))
  if (preferred) {
    const i = list.findIndex((r) => matches(r.language, lang(preferred)))
    if (i >= 0) return i
  }
  const def = list.findIndex((r) => r.default)
  if (def >= 0) return def
  const nav = typeof navigator !== 'undefined' ? lang(navigator.language) : ''
  const auto = list.findIndex((r) => r.autoselect && matches(r.language, nav))
  return auto >= 0 ? auto : 0
}

/** Loads one media playlist into one SourceBuffer: the main (video or muxed) stream or an audio rendition. */
class Stream {
  sb: SourceBuffer | null = null
  source: Source
  ended = false
  private mime = ''
  private queue: QueuedOp[] = []
  private running: QueuedOp | null = null
  private loading = false
  private segmentAbort: AbortController | null = null
  private last: { source: number, sn: number, cc: number } | null = null
  private appendedInit = ''
  private tracks: Mp4TrackInfo[] = []
  private transmuxer: SegmentTransmuxer | null = null
  private reloadTimer: ReturnType<typeof setTimeout> | null = null

  constructor(private readonly engine: HlsEngine, readonly kind: 'main' | 'audio', source: Source) {
    this.source = source
  }

  get idle(): boolean {
    return !this.loading && !this.running && !this.queue.length && !this.sb?.updating
  }

  buffered(): [number, number][] {
    try {
      return rangesOf(this.sb?.buffered)
    } catch {
      return []
    }
  }

  bufferedEnd(t: number): number {
    return endOfRange(this.buffered(), t)
  }

  // ---- playlists ----

  loadPlaylist(source = this.source, force = false): Promise<HlsMediaPlaylist> {
    if (source.playlist && !force) return Promise.resolve(source.playlist)
    if (source.loading) return source.loading
    source.loading = this.engine.fetchText(source.uri)
      .then((text) => {
        const parsed = parsePlaylist(text, source.uri)
        if (parsed.type !== 'media') throw new HlsParseError('Expected a media playlist')
        const reference = source.playlist ?? this.source.playlist
        if (reference && reference !== parsed) alignTimes(reference, parsed)
        source.playlist = parsed
        return parsed
      })
      .finally(() => { source.loading = undefined })
    return source.loading
  }

  scheduleReload(seconds: number): void {
    if (this.engine.destroyed) return
    if (this.reloadTimer) clearTimeout(this.reloadTimer)
    this.reloadTimer = setTimeout(async () => {
      try {
        const before = this.source.playlist
        const pl = await this.loadPlaylist(this.source, true)
        const lastSn = (p?: HlsMediaPlaylist): number | undefined => p?.segments[p.segments.length - 1]?.sn
        if (pl.endList) {
          if (this.kind === 'main') this.engine.live = false
          return
        }
        if (this.kind === 'main') this.engine.updateSeekable(pl)
        this.scheduleReload(lastSn(before) !== lastSn(pl) ? pl.targetDuration : pl.targetDuration / 2)
        this.tick()
      } catch (e) {
        this.engine.fail(e)
      }
    }, Math.max(1, seconds) * 1000)
  }

  /** Switches to another variant / rendition; `flush` drops what is buffered ahead (or everything). */
  switchSource(source: Source, flush: 'none' | 'ahead' | 'all'): void {
    const previous = this.source.playlist
    this.source = source
    this.segmentAbort?.abort()
    this.last = null
    this.ended = false
    if (flush !== 'none' && this.sb) {
      const t = this.engine.media.currentTime
      const keepUntil = flush === 'all' ? 0 : t + 1
      if (flush === 'all' || this.bufferedEnd(t) > keepUntil) {
        this.enqueue({ kind: 'remove', start: keepUntil, end: Infinity }).catch(() => {})
      }
    }
    this.loadPlaylist(source).then((pl) => {
      if (previous && previous !== pl && this.kind === 'audio' && !source.playlist?.endList) alignTimes(previous, pl)
      if (this.engine.live) this.scheduleReload(pl.targetDuration)
      this.tick()
    }, (e) => this.engine.fail(e))
  }

  // ---- source buffer ----

  ensureBuffer(mime: string): void {
    const ms = this.engine.ms
    if (!ms) return
    if (!this.sb) {
      try {
        this.sb = ms.addSourceBuffer(mime)
      } catch (e) {
        throw new HlsError('codec', `${mime}: ${(e as Error).message}`)
      }
      this.mime = mime
      this.sb.addEventListener('updateend', this.onUpdateEnd)
      this.sb.addEventListener('error', this.onBufferError)
      this.engine.bufferCreated()
      return
    }
    if (mime !== this.mime) {
      this.mime = mime
      if (typeof this.sb.changeType === 'function') this.enqueue({ kind: 'changeType', mime }).catch(() => {})
    }
  }

  enqueue(op: Op): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ op, resolve, reject })
      this.pump()
    })
  }

  private async append(data: Uint8Array): Promise<void> {
    // Every SourceBuffer must exist before the first media data reaches any of them.
    await this.engine.buffersReady()
    await this.enqueue({ kind: 'append', data })
  }

  private onUpdateEnd = (): void => {
    const done = this.running
    this.running = null
    done?.resolve()
    this.pump()
    this.engine.maybeEndOfStream()
  }

  private onBufferError = (): void => {
    const done = this.running
    this.running = null
    done?.reject(new HlsError('codec', 'SourceBuffer error'))
  }

  private pump(): void {
    const sb = this.sb
    const ms = this.engine.ms
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
          if (this.buffered().some(([, e]) => e > op.start)) {
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
        }
      } catch (e) {
        this.running = null
        if ((e as DOMException)?.name === 'QuotaExceededError' && op.kind === 'append') {
          const behind = this.engine.media.currentTime - 5
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

  onSeeking(t: number): void {
    if (this.bufferedEnd(t) - t > 0.1) return
    this.segmentAbort?.abort()
    this.last = null
    this.ended = false
  }

  private nextSegment(pl: HlsMediaPlaylist): HlsSegment | undefined {
    const segs = pl.segments
    if (!segs.length) return undefined
    const last = this.last
    if (last && last.source === this.source.id) {
      const next = segs.find((s) => s.sn === last.sn + 1)
      if (next) return next
      if (segs[segs.length - 1].sn <= last.sn) return undefined
    }
    if (this.engine.live && !this.engine.startPositioned && !last) {
      // Live start: the main stream picks the window, the audio stream follows its playlist time.
      if (this.kind === 'main') return segs[Math.max(0, segs.length - 3)]
    }
    const t = this.bufferedEnd(this.engine.targetTime())
    if (t < segs[0].start) return segs[0]
    return segs.find((s) => t >= s.start - 0.05 && t < s.start + s.duration - 0.05)
  }

  tick(): void {
    const engine = this.engine
    if (engine.destroyed || engine.failed || this.loading || !engine.ms) return
    if (this.kind === 'audio' && engine.live && !engine.startPositioned) return
    const pl = this.source.playlist
    if (!pl) return
    const pos = engine.media.currentTime
    this.evict(pos)
    if (this.bufferedEnd(pos) - pos >= engine.opts.maxBufferAhead) return
    const seg = this.nextSegment(pl)
    if (!seg) {
      if (pl.endList && this.last) this.ended = true
      engine.maybeEndOfStream()
      return
    }
    this.ended = false
    this.loading = true
    const sourceId = this.source.id
    this.loadSegment(seg, sourceId)
      .catch((e) => {
        if (!isAbort(e)) engine.fail(e)
      })
      .finally(() => {
        this.loading = false
        if (!engine.destroyed) setTimeout(() => this.tick(), 0)
      })
  }

  private evict(pos: number): void {
    const ranges = this.buffered()
    if (!ranges.length || !this.sb || this.queue.some((q) => q.op.kind === 'remove')) return
    const limit = pos - this.engine.opts.maxBufferBehind
    if (ranges[0][0] < limit - 1) this.enqueue({ kind: 'remove', start: 0, end: limit }).catch(() => {})
  }

  private async loadInit(map: HlsInitSection, signal: AbortSignal): Promise<void> {
    const key = `${this.source.id}|${map.uri}|${map.byteRange?.offset ?? ''}`
    if (key === this.appendedInit) return
    let { data } = await this.engine.fetchBytes(map.uri, map.byteRange, signal)
    if (map.key?.method === 'AES-128' && !isFmp4(data)) {
      data = new Uint8Array(await decryptSegment(data.slice().buffer, map.key, 0, this.engine.loadKey))
    }
    this.tracks = parseInit(data)
    const codecs = this.tracks.map((t) => t.codec).filter(Boolean).join(',') || this.source.codecs || ''
    const kind = this.tracks.some((t) => t.kind === 'video') ? 'video' : this.tracks.length ? 'audio' : this.kind === 'audio' ? 'audio' : 'video'
    this.ensureBuffer(`${kind}/mp4; codecs="${codecs}"`)
    await this.append(data)
    this.appendedInit = key
  }

  private async loadSegment(seg: HlsSegment, sourceId: number): Promise<void> {
    const engine = this.engine
    const ctrl = new AbortController()
    this.segmentAbort = ctrl
    const abortAll = (): void => ctrl.abort()
    engine.abort.signal.addEventListener('abort', abortAll, { once: true })
    try {
      if (seg.key && seg.key.method !== 'AES-128') {
        throw new HlsError('encrypted', `${seg.key.method} encryption is not supported`)
      }
      if (seg.key && !aesSupported()) throw new HlsError('encrypted', 'WebCrypto is not available')
      if (seg.map) await this.loadInit(seg.map, ctrl.signal)

      const { data: raw, ms } = await engine.fetchBytes(seg.uri, seg.byteRange, ctrl.signal)
      if (this.kind === 'main') engine.est.sample({ bytes: raw.length, ms })
      let data = raw
      if (seg.key) data = new Uint8Array(await decryptSegment(raw.slice().buffer, seg.key, seg.sn, engine.loadKey))
      if (ctrl.signal.aborted) return

      const sequential = !!this.last && this.last.source === sourceId && this.last.sn + 1 === seg.sn && this.last.cc === seg.cc
      let startTime: number | null
      if (isMpegTs(data) || (!isFmp4(data) && isPackedAudio(data))) {
        if (engine.opts.transmuxer === null) throw new HlsError('codec', 'MPEG-TS segments need a transmuxer')
        this.transmuxer ??= (engine.opts.transmuxer ?? createTsTransmuxer)()
        if (!this.transmuxer.canHandle(data)) throw new HlsError('codec', 'The transmuxer cannot read this segment')
        const out = this.transmuxer.push(data, { discontinuity: !sequential })
        if (out.init) {
          this.ensureBuffer(out.mimeType)
          await this.append(out.init)
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

      if (startTime !== null) {
        const offset = engine.offsetFor(seg, startTime)
        if (this.sb && Math.abs(this.sb.timestampOffset - offset) > 1e-3) await this.enqueue({ kind: 'offset', value: offset })
        // Renditions share the media clock: an audio playlist whose times drifted from it is re-anchored.
        const actual = startTime + offset
        const drift = actual - seg.start
        if (this.kind === 'audio' && Math.abs(drift) > Math.max(0.5, seg.duration / 2) && this.source.playlist) {
          for (const s of this.source.playlist.segments) s.start += drift
        }
      }
      if (ctrl.signal.aborted) return
      await this.append(data)
      this.last = { source: sourceId, sn: seg.sn, cc: seg.cc }

      if (this.kind === 'main' && !engine.startPositioned) {
        engine.startPositioned = true
        if (engine.live) {
          engine.media.currentTime = seg.start + 0.01
          engine.updateSeekable(this.source.playlist as HlsMediaPlaylist)
        }
        engine.tickAll()
      }
      if (this.kind === 'main') engine.afterMainSegment()
    } finally {
      engine.abort.signal.removeEventListener('abort', abortAll)
      if (this.segmentAbort === ctrl) this.segmentAbort = null
    }
  }

  destroy(): void {
    this.segmentAbort?.abort()
    if (this.reloadTimer) clearTimeout(this.reloadTimer)
    for (const q of this.queue) q.reject(new DOMException('Aborted', 'AbortError'))
    this.queue = []
    this.sb = null
  }

  stopTimers(): void {
    if (this.reloadTimer) clearTimeout(this.reloadTimer)
  }
}

class HlsEngine implements HlsSession {
  readonly native = false
  live = false
  levels: HlsLevel[] = []
  level = -1
  autoLevel = true
  audioTracks: HlsAudioTrack[] = []
  audioTrack = -1

  readonly opts: Required<Pick<HlsOptions, 'maxBufferAhead' | 'maxBufferBehind' | 'retries'>> & HlsOptions
  readonly abort = new AbortController()
  readonly est: BandwidthEstimator
  ms: MediaSource | null = null
  destroyed = false
  failed = false
  startPositioned = false
  private readonly fetchFn: typeof fetch
  private all: Level[] = []
  private renditions: HlsRendition[] = []
  private audioSources: AudioRendition[] = []
  private streams: Stream[] = []
  private main: Stream | null = null
  private audio: Stream | null = null
  private objectUrl = ''
  private offsets = new Map<number, number>()
  private timer: ReturnType<typeof setInterval> | null = null
  private created = 0
  private readyWaiters: (() => void)[] = []
  private stallPos = -1
  private stallSince = 0

  constructor(readonly media: HTMLMediaElement, private readonly url: string, options: HlsOptions) {
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
      const supported = (codecs: string): boolean =>
        MS.isTypeSupported(`video/mp4; codecs="${codecs}"`) || MS.isTypeSupported(`audio/mp4; codecs="${codecs}"`)
      const variants = parsed.variants
        .filter((v) => !v.codecs || supported(v.codecs))
        .sort((a, b) => a.bandwidth - b.bandwidth)
      if (!variants.length) throw new HlsError('codec', 'No variant has codecs this browser supports')
      this.all = variants.map((variant, index) => ({
        id: index,
        uri: variant.uri,
        codecs: variant.codecs,
        variant,
        info: { index, bandwidth: variant.bandwidth, width: variant.width, height: variant.height, codecs: variant.codecs, label: levelLabel(variant) },
      }))
      this.renditions = parsed.media.filter((m) => m.type === 'AUDIO')
    } else {
      const variant: HlsVariant = { uri: this.url, bandwidth: 0 }
      this.all = [{ id: 0, uri: this.url, variant, playlist: parsed, info: { index: 0, bandwidth: 0, label: 'auto' } }]
    }
    this.levels = this.all.map((l) => l.info)
    this.opts.onLevels?.(this.levels)

    const start = this.opts.startLevel ?? -1
    this.autoLevel = start < 0
    this.level = start >= 0 && start < this.all.length ? start : this.pickLevel()
    this.buildAudioTracks(this.all[this.level].variant.audio)

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

    this.main = new Stream(this, 'main', this.all[this.level])
    this.streams = [this.main]
    const audioSource = this.audioSources[this.audioTrack]
    if (audioSource) {
      this.audio = new Stream(this, 'audio', audioSource)
      this.streams.push(this.audio)
    }
    const [pl] = await Promise.all(this.streams.map((s) => s.loadPlaylist()))
    this.live = !pl.endList
    if (!this.live) ms.duration = pl.totalDuration
    this.opts.onLevelSwitched?.(this.level)
    if (this.audio) this.opts.onAudioTrackSwitched?.(this.audioTrack)
    if (this.live) for (const s of this.streams) s.scheduleReload((s.source.playlist as HlsMediaPlaylist).targetDuration)
    this.timer = setInterval(() => this.tickAll(), 250)
    this.tickAll()
  }

  private buildAudioTracks(group: string | undefined): void {
    const list = group ? this.renditions.filter((r) => r.groupId === group && r.uri) : []
    this.audioSources = list.map((rendition, index) => ({
      id: 1000 + index,
      uri: rendition.uri as string,
      rendition,
      info: { index, label: rendition.name || rendition.language || `#${index + 1}`, language: rendition.language, default: !!rendition.default },
    }))
    this.audioTracks = this.audioSources.map((a) => a.info)
    const preferred = this.audioTrack >= 0 ? this.audioSources[this.audioTrack]?.rendition.language ?? this.opts.audioLanguage : this.opts.audioLanguage
    this.audioTrack = pickAudioRendition(list, preferred)
    this.opts.onAudioTracks?.(this.audioTracks)
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.abort.abort()
    if (this.timer) clearInterval(this.timer)
    this.media.removeEventListener('seeking', this.onSeeking)
    for (const s of this.streams) s.destroy()
    if (this.objectUrl) {
      this.media.removeAttribute('src')
      this.media.load()
      URL.revokeObjectURL(this.objectUrl)
    }
    this.ms = null
  }

  fail(e: unknown): void {
    if (this.destroyed || isAbort(e) || this.failed) return
    this.failed = true
    let err: HlsError
    if (e instanceof HlsError) err = e
    else if (e instanceof HlsParseError) err = new HlsError('manifest', e.message)
    else if (e instanceof TransmuxError) err = new HlsError('codec', e.message)
    else if ((e as DOMException)?.name === 'NotSupportedError') err = new HlsError('codec', (e as Error).message)
    else err = new HlsError('network', (e as Error)?.message ?? String(e))
    if (this.timer) clearInterval(this.timer)
    for (const s of this.streams) s.stopTimers()
    this.opts.onError?.(err)
  }

  // ---- shared services for the streams ----

  bufferCreated(): void {
    this.created++
    if (this.created >= this.streams.length) this.readyWaiters.splice(0).forEach((r) => r())
  }

  buffersReady(): Promise<void> {
    if (this.created >= this.streams.length) return Promise.resolve()
    return new Promise((resolve) => this.readyWaiters.push(resolve))
  }

  /** One timestamp offset per discontinuity domain, shared by all streams so audio and video stay in sync. */
  offsetFor(seg: HlsSegment, startTime: number): number {
    let offset = this.offsets.get(seg.cc)
    if (offset === undefined) {
      offset = seg.start - startTime
      this.offsets.set(seg.cc, offset)
    }
    return offset
  }

  targetTime(): number {
    return this.media.currentTime
  }

  tickAll(): void {
    if (this.destroyed || this.failed) return
    this.jumpGap(this.media.currentTime)
    for (const s of this.streams) s.tick()
  }

  maybeEndOfStream(): void {
    const ms = this.ms
    if (!ms || ms.readyState !== 'open' || this.live) return
    if (this.streams.length && this.streams.every((s) => s.ended && s.idle)) {
      try {
        ms.endOfStream()
      } catch {
        // A buffer started updating meanwhile; the next tick retries.
      }
    }
  }

  async request(url: string, range: HlsByteRange | undefined, signal: AbortSignal): Promise<Response> {
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

  async fetchText(url: string): Promise<string> {
    return (await this.request(url, undefined, this.abort.signal)).text()
  }

  async fetchBytes(url: string, range: HlsByteRange | undefined, signal: AbortSignal): Promise<{ data: Uint8Array, ms: number }> {
    const t0 = performance.now()
    const res = await this.request(url, range, signal)
    const buf = await res.arrayBuffer()
    let data = new Uint8Array(buf)
    // A server that ignores Range sends the whole file.
    if (range && res.status === 200 && data.length > range.length) data = data.subarray(range.offset, range.offset + range.length)
    return { data, ms: performance.now() - t0 }
  }

  loadKey = async (uri: string): Promise<ArrayBuffer> => {
    const { data } = await this.fetchBytes(uri, undefined, this.abort.signal)
    return data.slice().buffer
  }

  updateSeekable(pl: HlsMediaPlaylist): void {
    const ms = this.ms as (MediaSource & { setLiveSeekableRange?: (s: number, e: number) => void }) | null
    if (!ms || ms.readyState !== 'open' || !pl.segments.length) return
    const first = pl.segments[0]
    const last = pl.segments[pl.segments.length - 1]
    try {
      if (ms.duration !== Infinity && !this.streams.some((s) => s.sb?.updating)) ms.duration = Infinity
      ms.setLiveSeekableRange?.(first.start, last.start + last.duration)
    } catch {
      // Not every implementation accepts the change while updating.
    }
  }

  // ---- ABR and switching ----

  private pickLevel(): number {
    const levels = this.all.map((l) => l.info)
    const maxHeight = this.opts.capToPlayerSize === false
      ? undefined
      : Math.round((this.media.clientHeight || 0) * (window.devicePixelRatio || 1)) || undefined
    const t = this.media.currentTime
    const ahead = this.main ? this.main.bufferedEnd(t) - t : 0
    return chooseLevel(levels, this.est.estimate, {
      maxHeight,
      bufferAhead: this.est.hasSamples ? ahead : undefined,
      current: this.level >= 0 ? this.level : undefined,
    })
  }

  afterMainSegment(): void {
    if (this.autoLevel && this.all.length > 1) {
      const next = this.pickLevel()
      if (next !== this.level) this.switchTo(next, false)
    }
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
    const prevGroup = this.all[this.level]?.variant.audio
    this.level = index
    this.opts.onLevelSwitched?.(index)
    this.main?.switchSource(this.all[index], flush ? 'ahead' : 'none')
    const group = this.all[index].variant.audio
    if (group !== prevGroup && this.audio) {
      // Another audio group: keep the same language / name.
      const before = this.audioSources[this.audioTrack]?.rendition
      this.buildAudioTracks(group)
      const same = this.audioSources.findIndex((a) => a.rendition.language === before?.language && a.rendition.name === before?.name)
      if (same >= 0) this.audioTrack = same
      const src = this.audioSources[this.audioTrack]
      if (src) this.audio.switchSource(src, 'all')
      this.opts.onAudioTrackSwitched?.(this.audioTrack)
    }
  }

  stats(): HlsStats {
    return {
      buffered: { main: this.main?.buffered() ?? [], ...(this.audio ? { audio: this.audio.buffered() } : {}) },
      level: this.level,
      audioTrack: this.audioTrack,
      bandwidth: this.est.estimate,
    }
  }

  setAudioTrack(index: number): void {
    const src = this.audioSources[index]
    if (!src || index === this.audioTrack || !this.audio) return
    this.audioTrack = index
    this.audio.switchSource(src, 'all')
    this.opts.onAudioTrackSwitched?.(index)
  }

  // ---- playback position ----

  private onSeeking = (): void => {
    const t = this.media.currentTime
    for (const s of this.streams) s.onSeeking(t)
    setTimeout(() => this.tickAll(), 0)
  }

  private jumpGap(pos: number): void {
    const ranges = rangesOf(this.media.buffered)
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

type NativeAudioTrack = { id: string, label: string, language: string, enabled: boolean, kind: string }
type NativeAudioTrackList = EventTarget & { length: number, [index: number]: NativeAudioTrack }

function nativeSession(media: HTMLMediaElement, url: string, options: HlsOptions): HlsSession {
  media.src = url
  const list = (media as unknown as { audioTracks?: NativeAudioTrackList }).audioTracks
  const session = {
    native: true as const,
    get live() { return media.duration === Infinity },
    levels: [] as HlsLevel[],
    level: -1,
    autoLevel: true,
    audioTracks: [] as HlsAudioTrack[],
    audioTrack: -1,
    bandwidth: 0,
    setLevel: () => {},
    stats: () => ({ buffered: { main: rangesOf(media.buffered) }, level: -1, audioTrack: session.audioTrack, bandwidth: 0 }),
    setAudioTrack(index: number) {
      if (!list || index < 0 || index >= list.length) return
      for (let i = 0; i < list.length; i++) list[i].enabled = i === index
    },
    destroy() {
      list?.removeEventListener('addtrack', sync)
      list?.removeEventListener('removetrack', sync)
      list?.removeEventListener('change', sync)
      media.removeAttribute('src')
      media.load()
    },
  }
  // Safari exposes the stream's audio renditions as media.audioTracks.
  function sync(): void {
    if (!list) return
    const tracks: HlsAudioTrack[] = []
    let current = -1
    for (let i = 0; i < list.length; i++) {
      const t = list[i]
      tracks.push({ index: i, label: t.label || t.language || `#${i + 1}`, language: t.language || undefined, default: t.kind === 'main' })
      if (t.enabled) current = i
    }
    const changed = tracks.length !== session.audioTracks.length
    session.audioTracks = tracks
    if (changed) options.onAudioTracks?.(tracks)
    if (current !== session.audioTrack) {
      session.audioTrack = current
      options.onAudioTrackSwitched?.(current)
    }
  }
  list?.addEventListener('addtrack', sync)
  list?.addEventListener('removetrack', sync)
  list?.addEventListener('change', sync)
  return session
}

/** Plays an HLS stream in `media`: natively where the browser can, otherwise through MediaSource. */
export function attachHls(media: HTMLMediaElement, url: string, options: HlsOptions = {}): HlsSession {
  if (options.preferNative !== false && canPlayNativeHls(media)) return nativeSession(media, url, options)
  if (!getMediaSource()) {
    const err = new HlsError('mse', 'MediaSource is not available')
    queueMicrotask(() => options.onError?.(err))
    return {
      native: false, live: false, levels: [], level: -1, autoLevel: true, audioTracks: [], audioTrack: -1, bandwidth: 0,
      setLevel: () => {}, setAudioTrack: () => {}, destroy: () => {},
      stats: () => ({ buffered: { main: [] }, level: -1, audioTrack: -1, bandwidth: 0 }),
    }
  }
  const absolute = typeof location !== 'undefined' ? new URL(url, location.href).href : url
  return new HlsEngine(media, absolute, options)
}
