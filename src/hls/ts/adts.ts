export const ADTS_RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350]

export interface AdtsConfig {
  objectType: number
  rateIndex: number
  sampleRate: number
  channels: number
}

export interface AdtsFrames {
  config?: AdtsConfig
  frames: Uint8Array[]
  /** Bytes after the last complete frame (a frame cut at the end of the input). */
  rest: Uint8Array
}

export function parseAdts(d: Uint8Array): AdtsFrames {
  const frames: Uint8Array[] = []
  let config: AdtsConfig | undefined
  let o = 0
  while (o + 7 <= d.length) {
    if (d[o] !== 0xff || (d[o + 1] & 0xf6) !== 0xf0) {
      o++
      continue
    }
    const header = d[o + 1] & 0x01 ? 7 : 9
    const frameLength = ((d[o + 3] & 0x03) << 11) | (d[o + 4] << 3) | (d[o + 5] >> 5)
    if (frameLength < header) {
      o++
      continue
    }
    if (o + frameLength > d.length) break
    if (!config) {
      const rateIndex = (d[o + 2] >> 2) & 0x0f
      config = {
        objectType: (d[o + 2] >> 6) + 1,
        rateIndex,
        sampleRate: ADTS_RATES[rateIndex] ?? 44100,
        channels: ((d[o + 2] & 0x01) << 2) | (d[o + 3] >> 6),
      }
    }
    frames.push(d.subarray(o + header, o + frameLength))
    o += frameLength
  }
  return { config, frames, rest: d.subarray(o) }
}

/** AudioSpecificConfig (2 bytes) for the esds box. */
export function audioSpecificConfig(c: AdtsConfig): Uint8Array {
  return new Uint8Array([
    (c.objectType << 3) | (c.rateIndex >> 1),
    ((c.rateIndex & 1) << 7) | (c.channels << 3),
  ])
}
