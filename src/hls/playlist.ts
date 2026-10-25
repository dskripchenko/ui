export interface HlsByteRange {
  offset: number
  length: number
}

export interface HlsKey {
  method: 'NONE' | 'AES-128' | 'SAMPLE-AES' | string
  uri?: string
  iv?: Uint8Array
}

export interface HlsInitSection {
  uri: string
  byteRange?: HlsByteRange
  key?: HlsKey
}

export interface HlsSegment {
  uri: string
  duration: number
  /** Start on the playlist timeline (sum of the preceding durations). */
  start: number
  /** Media sequence number. */
  sn: number
  /** Discontinuity sequence: grows by one at every EXT-X-DISCONTINUITY. */
  cc: number
  title?: string
  byteRange?: HlsByteRange
  key?: HlsKey
  map?: HlsInitSection
}

export interface HlsMediaPlaylist {
  type: 'media'
  url: string
  targetDuration: number
  mediaSequence: number
  discontinuitySequence: number
  endList: boolean
  playlistType?: string
  segments: HlsSegment[]
  totalDuration: number
}

export interface HlsVariant {
  uri: string
  bandwidth: number
  averageBandwidth?: number
  width?: number
  height?: number
  codecs?: string
  frameRate?: number
  name?: string
  audio?: string
}

export interface HlsRendition {
  type: string
  groupId: string
  name?: string
  language?: string
  uri?: string
  default?: boolean
}

export interface HlsMasterPlaylist {
  type: 'master'
  url: string
  variants: HlsVariant[]
  media: HlsRendition[]
}

export type HlsPlaylist = HlsMasterPlaylist | HlsMediaPlaylist

export class HlsParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HlsParseError'
  }
}

/** Attribute list of a tag: `BANDWIDTH=1280000,CODECS="avc1.4d401f,mp4a.40.2"`. */
export function parseAttributes(input: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /([A-Z0-9-]+)=("[^"]*"|[^,]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(input))) {
    let v = m[2]
    if (v.startsWith('"')) v = v.slice(1, -1)
    out[m[1]] = v
  }
  return out
}

function resolve(uri: string, base: string): string {
  try {
    return new URL(uri, base).href
  } catch {
    return uri
  }
}

function parseByteRange(value: string, previousEnd: number): HlsByteRange {
  const [len, off] = value.split('@')
  const length = parseInt(len, 10)
  const offset = off !== undefined ? parseInt(off, 10) : previousEnd
  return { length, offset }
}

export function parseHexIv(value: string): Uint8Array {
  const hex = value.replace(/^0x/i, '').padStart(32, '0')
  const out = new Uint8Array(16)
  for (let i = 0; i < 16; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16)
  return out
}

export function parsePlaylist(text: string, url: string): HlsPlaylist {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim())
  if (lines[0]?.replace(/^﻿/, '') !== '#EXTM3U') throw new HlsParseError('Not an M3U8 playlist')
  if (lines.some((l) => l.startsWith('#EXT-X-STREAM-INF'))) return parseMaster(lines, url)
  return parseMedia(lines, url)
}

function parseMaster(lines: string[], url: string): HlsMasterPlaylist {
  const variants: HlsVariant[] = []
  const media: HlsRendition[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('#EXT-X-STREAM-INF:')) {
      const a = parseAttributes(line.slice(18))
      let uri = ''
      while (i + 1 < lines.length) {
        const next = lines[++i]
        if (next && !next.startsWith('#')) {
          uri = next
          break
        }
      }
      if (!uri) continue
      const res = a.RESOLUTION?.split('x').map(Number)
      variants.push({
        uri: resolve(uri, url),
        bandwidth: Number(a.BANDWIDTH) || 0,
        averageBandwidth: a['AVERAGE-BANDWIDTH'] ? Number(a['AVERAGE-BANDWIDTH']) : undefined,
        width: res?.[0] || undefined,
        height: res?.[1] || undefined,
        codecs: a.CODECS || undefined,
        frameRate: a['FRAME-RATE'] ? Number(a['FRAME-RATE']) : undefined,
        name: a.NAME || undefined,
        audio: a.AUDIO || undefined,
      })
    } else if (line.startsWith('#EXT-X-MEDIA:')) {
      const a = parseAttributes(line.slice(13))
      media.push({
        type: a.TYPE,
        groupId: a['GROUP-ID'],
        name: a.NAME,
        language: a.LANGUAGE,
        uri: a.URI ? resolve(a.URI, url) : undefined,
        default: a.DEFAULT === 'YES',
      })
    }
  }
  if (!variants.length) throw new HlsParseError('Master playlist without variants')
  return { type: 'master', url, variants, media }
}

function parseMedia(lines: string[], url: string): HlsMediaPlaylist {
  const pl: HlsMediaPlaylist = {
    type: 'media',
    url,
    targetDuration: 0,
    mediaSequence: 0,
    discontinuitySequence: 0,
    endList: false,
    segments: [],
    totalDuration: 0,
  }
  let duration = 0
  let title: string | undefined
  let byteRange: HlsByteRange | undefined
  let lastRangeEnd = 0
  let key: HlsKey | undefined
  let map: HlsInitSection | undefined
  let discontinuity = false
  let cc = 0
  let start = 0

  for (const line of lines) {
    if (!line) continue
    if (line.startsWith('#EXTINF:')) {
      const body = line.slice(8)
      const comma = body.indexOf(',')
      duration = parseFloat(comma === -1 ? body : body.slice(0, comma))
      title = comma === -1 ? undefined : body.slice(comma + 1) || undefined
    } else if (line.startsWith('#EXT-X-TARGETDURATION:')) {
      pl.targetDuration = parseFloat(line.slice(22))
    } else if (line.startsWith('#EXT-X-MEDIA-SEQUENCE:')) {
      pl.mediaSequence = parseInt(line.slice(22), 10)
    } else if (line.startsWith('#EXT-X-DISCONTINUITY-SEQUENCE:')) {
      pl.discontinuitySequence = parseInt(line.slice(30), 10)
      cc = pl.discontinuitySequence
    } else if (line === '#EXT-X-DISCONTINUITY') {
      discontinuity = true
    } else if (line === '#EXT-X-ENDLIST') {
      pl.endList = true
    } else if (line.startsWith('#EXT-X-PLAYLIST-TYPE:')) {
      pl.playlistType = line.slice(21)
    } else if (line.startsWith('#EXT-X-BYTERANGE:')) {
      byteRange = parseByteRange(line.slice(17), lastRangeEnd)
    } else if (line.startsWith('#EXT-X-KEY:')) {
      const a = parseAttributes(line.slice(11))
      key = a.METHOD === 'NONE'
        ? undefined
        : { method: a.METHOD, uri: a.URI ? resolve(a.URI, url) : undefined, iv: a.IV ? parseHexIv(a.IV) : undefined }
    } else if (line.startsWith('#EXT-X-MAP:')) {
      const a = parseAttributes(line.slice(11))
      map = {
        uri: resolve(a.URI, url),
        byteRange: a.BYTERANGE ? parseByteRange(a.BYTERANGE, 0) : undefined,
        key,
      }
    } else if (!line.startsWith('#')) {
      if (discontinuity) cc++
      const seg: HlsSegment = {
        uri: resolve(line, url),
        duration,
        start,
        sn: pl.mediaSequence + pl.segments.length,
        cc,
        title,
        byteRange,
        key,
        map,
      }
      pl.segments.push(seg)
      start += duration
      if (byteRange) lastRangeEnd = byteRange.offset + byteRange.length
      duration = 0
      title = undefined
      byteRange = undefined
      discontinuity = false
    }
  }
  pl.totalDuration = start
  if (!pl.targetDuration && pl.segments.length) {
    pl.targetDuration = Math.ceil(Math.max(...pl.segments.map((s) => s.duration)))
  }
  return pl
}

/** IV of a segment without an explicit IV attribute: its media sequence number, big-endian. */
export function sequenceIv(sn: number): Uint8Array {
  const iv = new Uint8Array(16)
  let n = sn
  for (let i = 15; i >= 8 && n > 0; i--) {
    iv[i] = n % 256
    n = Math.floor(n / 256)
  }
  return iv
}
