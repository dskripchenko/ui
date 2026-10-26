export const STREAM_H264 = 0x1b
export const STREAM_AAC = 0x0f
export const STREAM_HEVC = 0x24
export const STREAM_MP3 = [0x03, 0x04]
export const STREAM_AC3 = [0x81, 0x87]

export interface PesPacket {
  pts?: number
  dts?: number
  data: Uint8Array
}

export interface DemuxState {
  pmtPid?: number
  videoPid?: number
  audioPid?: number
  videoType?: number
  audioType?: number
}

export interface DemuxResult extends DemuxState {
  video: PesPacket[]
  audio: PesPacket[]
}

/** 33-bit PES timestamp at `o` (90 kHz), without bitwise ops beyond 32 bits. */
export function readTimestamp(d: Uint8Array, o: number): number {
  return (d[o] & 0x0e) * 536870912
    + d[o + 1] * 4194304
    + (d[o + 2] & 0xfe) * 16384
    + d[o + 3] * 128
    + (d[o + 4] & 0xfe) / 2
}

export function parsePes(d: Uint8Array): PesPacket | null {
  if (d.length < 9 || d[0] !== 0 || d[1] !== 0 || d[2] !== 1) return null
  const flags = d[7]
  const headerLength = d[8]
  let pts: number | undefined
  let dts: number | undefined
  if (flags & 0x80) {
    pts = readTimestamp(d, 9)
    dts = (flags & 0xc0) === 0xc0 ? readTimestamp(d, 14) : pts
  }
  const start = 9 + headerLength
  if (start > d.length) return null
  return { pts, dts, data: d.subarray(start) }
}

function concat(chunks: Uint8Array[]): Uint8Array {
  if (chunks.length === 1) return chunks[0]
  let len = 0
  for (const c of chunks) len += c.length
  const out = new Uint8Array(len)
  let o = 0
  for (const c of chunks) {
    out.set(c, o)
    o += c.length
  }
  return out
}

function parsePat(d: Uint8Array, p: number): number | undefined {
  const sectionLength = ((d[p + 1] & 0x0f) << 8) | d[p + 2]
  const end = Math.min(d.length, p + 3 + sectionLength - 4)
  for (let o = p + 8; o + 4 <= end; o += 4) {
    const program = (d[o] << 8) | d[o + 1]
    if (program !== 0) return ((d[o + 2] & 0x1f) << 8) | d[o + 3]
  }
  return undefined
}

function parsePmt(d: Uint8Array, p: number, state: DemuxState): void {
  const sectionLength = ((d[p + 1] & 0x0f) << 8) | d[p + 2]
  const end = Math.min(d.length, p + 3 + sectionLength - 4)
  const infoLength = ((d[p + 10] & 0x0f) << 8) | d[p + 11]
  let o = p + 12 + infoLength
  while (o + 5 <= end) {
    const type = d[o]
    const pid = ((d[o + 1] & 0x1f) << 8) | d[o + 2]
    const esLength = ((d[o + 3] & 0x0f) << 8) | d[o + 4]
    const isVideo = type === STREAM_H264 || type === STREAM_HEVC
    const isAudio = type === STREAM_AAC || STREAM_MP3.includes(type) || STREAM_AC3.includes(type)
    if (isVideo && state.videoPid === undefined) {
      state.videoPid = pid
      state.videoType = type
    } else if (isAudio && state.audioPid === undefined) {
      state.audioPid = pid
      state.audioType = type
    }
    o += 5 + esLength
  }
}

/** Splits a transport stream segment into video and audio PES packets. */
export function demuxTs(d: Uint8Array, previous: DemuxState = {}): DemuxResult {
  const state: DemuxState = { ...previous }
  const pending = new Map<number, Uint8Array[]>()
  const video: PesPacket[] = []
  const audio: PesPacket[] = []
  let sawPmt = false

  const flush = (pid: number): void => {
    const chunks = pending.get(pid)
    pending.delete(pid)
    if (!chunks?.length) return
    const pes = parsePes(concat(chunks))
    if (!pes) return
    if (pid === state.videoPid) video.push(pes)
    else if (pid === state.audioPid) audio.push(pes)
  }

  let start = 0
  while (start < d.length && d[start] !== 0x47) start++
  for (let o = start; o + 188 <= d.length; o += 188) {
    if (d[o] !== 0x47) continue
    const pusi = (d[o + 1] & 0x40) !== 0
    const pid = ((d[o + 1] & 0x1f) << 8) | d[o + 2]
    const afc = (d[o + 3] & 0x30) >> 4
    let p = o + 4
    if (afc === 2) continue
    if (afc === 3) p += d[p] + 1
    if (p >= o + 188) continue
    if (pid === 0) {
      if (pusi) p += d[p] + 1
      state.pmtPid = parsePat(d, p)
      continue
    }
    if (pid === state.pmtPid) {
      if (!sawPmt) {
        if (pusi) p += d[p] + 1
        state.videoPid = state.audioPid = state.videoType = state.audioType = undefined
        parsePmt(d, p, state)
        sawPmt = true
      }
      continue
    }
    if (pid !== state.videoPid && pid !== state.audioPid) continue
    if (pusi) flush(pid)
    let list = pending.get(pid)
    if (!list) {
      if (!pusi) continue
      list = []
      pending.set(pid, list)
    }
    list.push(d.subarray(p, o + 188))
  }
  for (const pid of Array.from(pending.keys())) flush(pid)
  return { ...state, video, audio }
}
