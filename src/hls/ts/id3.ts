const PTS_OWNER = 'com.apple.streaming.transportStreamTimestamp'

function syncsafe(d: Uint8Array, o: number): number {
  return ((d[o] & 0x7f) << 21) | ((d[o + 1] & 0x7f) << 14) | ((d[o + 2] & 0x7f) << 7) | (d[o + 3] & 0x7f)
}

function isId3(d: Uint8Array, o: number): boolean {
  return d.length >= o + 10 && d[o] === 0x49 && d[o + 1] === 0x44 && d[o + 2] === 0x33 && d[o + 3] < 0xff && d[o + 4] < 0xff
}

export function isAdtsSync(d: Uint8Array, o = 0): boolean {
  return d.length > o + 1 && d[o] === 0xff && (d[o + 1] & 0xf6) === 0xf0
}

/** Packed audio (HLS "raw" AAC segments): ID3 tags followed by ADTS frames. */
export function isPackedAudio(d: Uint8Array): boolean {
  return isId3(d, 0) || isAdtsSync(d, 0)
}

export interface PackedAudio {
  /** 90 kHz timestamp from the ID3 PRIV frame of Apple's transport stream timestamp. */
  pts?: number
  /** ADTS payload after the leading ID3 tags. */
  data: Uint8Array
}

export function parsePackedAudio(d: Uint8Array): PackedAudio {
  let o = 0
  let pts: number | undefined
  while (isId3(d, o)) {
    const version = d[o + 3]
    const size = syncsafe(d, o + 6)
    const end = o + 10 + size
    let f = o + 10
    while (f + 10 <= end) {
      const id = String.fromCharCode(d[f], d[f + 1], d[f + 2], d[f + 3])
      const frameSize = version >= 4 ? syncsafe(d, f + 4) : ((d[f + 4] << 24) >>> 0) + (d[f + 5] << 16) + (d[f + 6] << 8) + d[f + 7]
      if (!id.trim() || frameSize <= 0) break
      const body = f + 10
      if (id === 'PRIV') {
        let z = body
        while (z < body + frameSize && d[z] !== 0) z++
        const owner = String.fromCharCode(...d.subarray(body, z))
        if (owner === PTS_OWNER && z + 9 <= body + frameSize) {
          const b = z + 1
          pts = (d[b + 3] & 1) * 4294967296 + ((d[b + 4] << 24) >>> 0) + (d[b + 5] << 16) + (d[b + 6] << 8) + d[b + 7]
        }
      }
      f = body + frameSize
    }
    o = end
  }
  return { pts, data: d.subarray(o) }
}
