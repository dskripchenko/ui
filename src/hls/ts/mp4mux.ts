export interface MuxVideoTrack {
  id: number
  kind: 'video'
  timescale: number
  width: number
  height: number
  sps: Uint8Array
  pps: Uint8Array
}

export interface MuxAudioTrack {
  id: number
  kind: 'audio'
  timescale: number
  channels: number
  sampleRate: number
  config: Uint8Array
}

export type MuxTrack = MuxVideoTrack | MuxAudioTrack

export interface MuxSample {
  size: number
  duration: number
  /** Composition offset (pts − dts) in track timescale. */
  cts: number
  key: boolean
}

function type4(t: string): number[] {
  return [t.charCodeAt(0), t.charCodeAt(1), t.charCodeAt(2), t.charCodeAt(3)]
}

function u32(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]
}

function u16(n: number): number[] {
  return [(n >>> 8) & 0xff, n & 0xff]
}

function u64(n: number): number[] {
  const hi = Math.floor(n / 4294967296)
  return [...u32(hi), ...u32(n - hi * 4294967296)]
}

type Part = Uint8Array | number[]

export function box(type: string, ...parts: Part[]): Uint8Array {
  let size = 8
  for (const p of parts) size += p.length
  const out = new Uint8Array(size)
  out.set(u32(size), 0)
  out.set(type4(type), 4)
  let o = 8
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

function full(version: number, flags: number): number[] {
  return [version, (flags >> 16) & 0xff, (flags >> 8) & 0xff, flags & 0xff]
}

const MATRIX = [
  ...u32(0x00010000), ...u32(0), ...u32(0),
  ...u32(0), ...u32(0x00010000), ...u32(0),
  ...u32(0), ...u32(0), ...u32(0x40000000),
]

function zeros(n: number): number[] {
  return new Array<number>(n).fill(0)
}

function mvhd(timescale: number, nextTrack: number): Uint8Array {
  return box('mvhd', full(0, 0), u32(0), u32(0), u32(timescale), u32(0),
    u32(0x00010000), u16(0x0100), zeros(10), MATRIX, zeros(24), u32(nextTrack))
}

function tkhd(t: MuxTrack): Uint8Array {
  const w = t.kind === 'video' ? t.width : 0
  const h = t.kind === 'video' ? t.height : 0
  return box('tkhd', full(0, 3), u32(0), u32(0), u32(t.id), u32(0), u32(0), zeros(8),
    u16(0), u16(0), u16(t.kind === 'audio' ? 0x0100 : 0), u16(0), MATRIX,
    u32(w * 65536), u32(h * 65536))
}

function mdhd(timescale: number): Uint8Array {
  return box('mdhd', full(0, 0), u32(0), u32(0), u32(timescale), u32(0), u16(0x55c4), u16(0))
}

function hdlr(kind: 'video' | 'audio'): Uint8Array {
  const name = kind === 'video' ? 'VideoHandler' : 'SoundHandler'
  return box('hdlr', full(0, 0), u32(0), type4(kind === 'video' ? 'vide' : 'soun'), zeros(12),
    [...Array.from(name, (c) => c.charCodeAt(0)), 0])
}

function avc1(t: MuxVideoTrack): Uint8Array {
  const avcC = box('avcC', [1, t.sps[1], t.sps[2], t.sps[3], 0xff, 0xe1],
    u16(t.sps.length), t.sps, [1], u16(t.pps.length), t.pps)
  return box('avc1', zeros(6), u16(1), u16(0), u16(0), zeros(12),
    u16(t.width), u16(t.height), u32(0x00480000), u32(0x00480000), u32(0),
    u16(1), zeros(32), u16(0x0018), u16(0xffff), avcC)
}

function descriptorLength(n: number): number[] {
  return [0x80 | ((n >> 21) & 0x7f), 0x80 | ((n >> 14) & 0x7f), 0x80 | ((n >> 7) & 0x7f), n & 0x7f]
}

function mp4a(t: MuxAudioTrack): Uint8Array {
  const dsi = [0x05, ...descriptorLength(t.config.length), ...t.config]
  const dcd = [0x04, ...descriptorLength(13 + dsi.length), 0x40, 0x15, 0, 0, 0, ...u32(0), ...u32(0), ...dsi]
  const sl = [0x06, ...descriptorLength(1), 0x02]
  const es = [0x03, ...descriptorLength(3 + dcd.length + sl.length), ...u16(t.id), 0, ...dcd, ...sl]
  const esds = box('esds', full(0, 0), es)
  return box('mp4a', zeros(6), u16(1), zeros(8), u16(t.channels), u16(16), u16(0), u16(0),
    u32(Math.min(t.sampleRate, 65535) * 65536), esds)
}

function stbl(t: MuxTrack): Uint8Array {
  const entry = t.kind === 'video' ? avc1(t) : mp4a(t)
  return box('stbl',
    box('stsd', full(0, 0), u32(1), entry),
    box('stts', full(0, 0), u32(0)),
    box('stsc', full(0, 0), u32(0)),
    box('stsz', full(0, 0), u32(0), u32(0)),
    box('stco', full(0, 0), u32(0)))
}

function trak(t: MuxTrack): Uint8Array {
  const header = t.kind === 'video'
    ? box('vmhd', full(0, 1), zeros(8))
    : box('smhd', full(0, 0), zeros(4))
  const dinf = box('dinf', box('dref', full(0, 0), u32(1), box('url ', full(0, 1))))
  return box('trak', tkhd(t), box('mdia', mdhd(t.timescale), hdlr(t.kind), box('minf', header, dinf, stbl(t))))
}

export function initSegment(tracks: MuxTrack[]): Uint8Array {
  const ftyp = box('ftyp', type4('isom'), u32(1), type4('isom'), type4('iso5'), type4('avc1'), type4('mp41'))
  const trex = tracks.map((t) => box('trex', full(0, 0), u32(t.id), u32(1), u32(0), u32(0), u32(0x00010001)))
  const moov = box('moov', mvhd(1000, tracks.length + 1), ...tracks.map(trak), box('mvex', ...trex))
  return concatBytes([ftyp, moov])
}

/** One `moof` + `mdat` pair for a track's samples. */
export function fragment(seq: number, trackId: number, baseTime: number, samples: MuxSample[], payload: Uint8Array): Uint8Array {
  const entries: number[] = []
  for (const s of samples) {
    entries.push(...u32(s.duration), ...u32(s.size),
      ...u32(s.key ? 0x02000000 : 0x01010000), ...u32(s.cts | 0))
  }
  const trun = box('trun', full(1, 0x000f01), u32(samples.length), u32(0), entries)
  const traf = box('traf',
    box('tfhd', full(0, 0x020000), u32(trackId)),
    box('tfdt', full(1, 0), u64(Math.max(0, Math.round(baseTime)))),
    trun)
  const moof = box('moof', box('mfhd', full(0, 0), u32(seq)), traf)
  // trun data_offset: moof(8) + mfhd(16) + traf(8) + tfhd(16) + tfdt(20) + trun header(8) + flags(4) + count(4).
  moof.set(u32(moof.length + 8), 84)
  return concatBytes([moof, box('mdat', payload)])
}

export function concatBytes(parts: Uint8Array[]): Uint8Array {
  let len = 0
  for (const p of parts) len += p.length
  const out = new Uint8Array(len)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}
