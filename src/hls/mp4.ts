export interface Mp4Box {
  type: string
  start: number
  /** First byte after the header. */
  data: number
  end: number
}

function u32(d: Uint8Array, o: number): number {
  return ((d[o] << 24) >>> 0) + (d[o + 1] << 16) + (d[o + 2] << 8) + d[o + 3]
}

function fourcc(d: Uint8Array, o: number): string {
  return String.fromCharCode(d[o], d[o + 1], d[o + 2], d[o + 3])
}

export function readBoxes(d: Uint8Array, start = 0, end = d.length): Mp4Box[] {
  const out: Mp4Box[] = []
  let o = start
  while (o + 8 <= end) {
    let size = u32(d, o)
    const type = fourcc(d, o + 4)
    let header = 8
    if (size === 1) {
      size = u32(d, o + 8) * 4294967296 + u32(d, o + 12)
      header = 16
    } else if (size === 0) {
      size = end - o
    }
    if (size < header || o + size > end) break
    out.push({ type, start: o, data: o + header, end: o + size })
    o += size
  }
  return out
}

/** Boxes at a path like `['moov', 'trak', 'mdia']`, descending through every match. */
export function findBoxes(d: Uint8Array, path: string[], start = 0, end = d.length): Mp4Box[] {
  if (!path.length) return []
  const [head, ...rest] = path
  const matches = readBoxes(d, start, end).filter((b) => b.type === head)
  if (!rest.length) return matches
  return matches.flatMap((b) => findBoxes(d, rest, b.data, b.end))
}

const FMP4_FIRST = ['ftyp', 'styp', 'moof', 'sidx', 'moov', 'emsg', 'prft', 'free']

export function isFmp4(d: Uint8Array): boolean {
  return d.length >= 8 && FMP4_FIRST.includes(fourcc(d, 4))
}

export function isMpegTs(d: Uint8Array): boolean {
  if (d.length < 188 || d[0] !== 0x47) return false
  return d.length < 376 || d[188] === 0x47
}

export interface Mp4TrackInfo {
  id: number
  timescale: number
  kind: 'video' | 'audio' | 'other'
  codec?: string
}

function hex2(n: number): string {
  return n.toString(16).padStart(2, '0')
}

function descriptor(d: Uint8Array, o: number): { tag: number, data: number, end: number } {
  const tag = d[o]
  let len = 0
  let p = o + 1
  for (let i = 0; i < 4; i++) {
    const b = d[p++]
    len = (len << 7) | (b & 0x7f)
    if (!(b & 0x80)) break
  }
  return { tag, data: p, end: p + len }
}

function esdsObjectType(d: Uint8Array, start: number, end: number): number | undefined {
  const es = descriptor(d, start)
  if (es.tag !== 0x03 || es.end > end) return undefined
  const flags = d[es.data + 2]
  let o = es.data + 3
  if (flags & 0x80) o += 2
  if (flags & 0x40) o += d[o] + 1
  if (flags & 0x20) o += 2
  const dc = descriptor(d, o)
  if (dc.tag !== 0x04) return undefined
  const objectType = d[dc.data]
  if (objectType !== 0x40) return undefined
  const dsi = descriptor(d, dc.data + 13)
  if (dsi.tag !== 0x05) return undefined
  const aot = d[dsi.data] >> 3
  return aot > 0 && aot < 31 ? aot : undefined
}

function sampleEntryCodec(d: Uint8Array, entry: Mp4Box): string | undefined {
  const type = entry.type
  if (type === 'avc1' || type === 'avc3') {
    const avcC = readBoxes(d, entry.data + 78, entry.end).find((b) => b.type === 'avcC')
    if (avcC) return `${type}.${hex2(d[avcC.data + 1])}${hex2(d[avcC.data + 2])}${hex2(d[avcC.data + 3])}`
    return `${type}.42e01e`
  }
  if (type === 'mp4a') {
    const esds = readBoxes(d, entry.data + 28, entry.end).find((b) => b.type === 'esds')
    const aot = esds ? esdsObjectType(d, esds.data + 4, esds.end) : undefined
    if (aot) return `mp4a.40.${aot}`
    return 'mp4a.40.2'
  }
  if (type === 'hvc1' || type === 'hev1') return `${type}.1.6.L93.B0`
  if (type === 'Opus') return 'opus'
  if (type === 'fLaC') return 'flac'
  if (type === 'vp09') return 'vp09.00.10.08'
  if (type === 'av01') return 'av01.0.04M.08'
  if (type === 'ac-3') return 'ac-3'
  if (type === 'ec-3') return 'ec-3'
  return undefined
}

export function parseInit(d: Uint8Array): Mp4TrackInfo[] {
  return findBoxes(d, ['moov', 'trak']).map((trak) => {
    const tkhd = findBoxes(d, ['tkhd'], trak.data, trak.end)[0]
    const mdhd = findBoxes(d, ['mdia', 'mdhd'], trak.data, trak.end)[0]
    const hdlr = findBoxes(d, ['mdia', 'hdlr'], trak.data, trak.end)[0]
    const stsd = findBoxes(d, ['mdia', 'minf', 'stbl', 'stsd'], trak.data, trak.end)[0]
    const id = tkhd ? u32(d, tkhd.data + (d[tkhd.data] === 1 ? 20 : 12)) : 0
    const timescale = mdhd ? u32(d, mdhd.data + (d[mdhd.data] === 1 ? 20 : 12)) : 90000
    const handler = hdlr ? fourcc(d, hdlr.data + 8) : ''
    const entry = stsd ? readBoxes(d, stsd.data + 8, stsd.end)[0] : undefined
    return {
      id,
      timescale,
      kind: handler === 'vide' ? 'video' : handler === 'soun' ? 'audio' : 'other',
      codec: entry ? sampleEntryCodec(d, entry) : undefined,
    }
  })
}

/** Decode time (seconds) of the first fragment in a media segment, from `tfdt`. */
export function fragmentStart(d: Uint8Array, tracks: Mp4TrackInfo[]): number | null {
  let min: number | null = null
  for (const traf of findBoxes(d, ['moof', 'traf'])) {
    const tfhd = findBoxes(d, ['tfhd'], traf.data, traf.end)[0]
    const tfdt = findBoxes(d, ['tfdt'], traf.data, traf.end)[0]
    if (!tfhd || !tfdt) continue
    const id = u32(d, tfhd.data + 4)
    const track = tracks.find((t) => t.id === id)
    const ts = track?.timescale ?? 90000
    const v1 = d[tfdt.data] === 1
    const base = v1 ? u32(d, tfdt.data + 4) * 4294967296 + u32(d, tfdt.data + 8) : u32(d, tfdt.data + 4)
    const t = base / ts
    if (min === null || t < min) min = t
  }
  return min
}
