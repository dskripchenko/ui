export const NAL_IDR = 5
export const NAL_SPS = 7
export const NAL_PPS = 8
export const NAL_AUD = 9

/** NAL units of an Annex-B byte stream (start codes removed). */
export function splitNals(d: Uint8Array): Uint8Array[] {
  const nals: Uint8Array[] = []
  let start = -1
  let i = 0
  const n = d.length
  while (i + 2 < n) {
    if (d[i + 2] > 1) {
      i += 3
    } else if (d[i] === 0 && d[i + 1] === 0 && d[i + 2] === 1) {
      if (start >= 0) nals.push(trimZeros(d.subarray(start, i)))
      i += 3
      start = i
    } else {
      i++
    }
  }
  if (start >= 0 && start < n) nals.push(d.subarray(start))
  return nals.filter((x) => x.length > 0)
}

function trimZeros(d: Uint8Array): Uint8Array {
  let end = d.length
  while (end > 0 && d[end - 1] === 0) end--
  return d.subarray(0, end)
}

export function nalType(nal: Uint8Array): number {
  return nal[0] & 0x1f
}

/** RBSP: drops emulation prevention bytes (00 00 03 → 00 00). */
export function unescapeRbsp(d: Uint8Array): Uint8Array {
  const out = new Uint8Array(d.length)
  let o = 0
  let zeros = 0
  for (let i = 0; i < d.length; i++) {
    const b = d[i]
    if (zeros >= 2 && b === 3) {
      zeros = 0
      continue
    }
    out[o++] = b
    zeros = b === 0 ? zeros + 1 : 0
  }
  return out.subarray(0, o)
}

export class BitReader {
  private pos = 0
  constructor(private readonly d: Uint8Array) {}

  bit(): number {
    const byte = this.d[this.pos >> 3] ?? 0
    const v = (byte >> (7 - (this.pos & 7))) & 1
    this.pos++
    return v
  }

  bits(n: number): number {
    let v = 0
    for (let i = 0; i < n; i++) v = v * 2 + this.bit()
    return v
  }

  ue(): number {
    let zeros = 0
    while (this.bit() === 0 && zeros < 32) zeros++
    return 2 ** zeros - 1 + this.bits(zeros)
  }

  se(): number {
    const v = this.ue()
    return v & 1 ? (v + 1) / 2 : -v / 2
  }
}

export interface SpsInfo {
  profile: number
  compatibility: number
  level: number
  width: number
  height: number
}

const HIGH_PROFILES = [100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135]

function skipScalingList(r: BitReader, size: number): void {
  let last = 8
  let next = 8
  for (let j = 0; j < size; j++) {
    if (next !== 0) next = (last + r.se() + 256) % 256
    last = next === 0 ? last : next
  }
}

/** Profile, level and coded picture size from a sequence parameter set NAL unit. */
export function parseSps(nal: Uint8Array): SpsInfo {
  const r = new BitReader(unescapeRbsp(nal.subarray(1)))
  const profile = r.bits(8)
  const compatibility = r.bits(8)
  const level = r.bits(8)
  r.ue()
  let chroma = 1
  let frameMbsOnly = 1
  if (HIGH_PROFILES.includes(profile)) {
    chroma = r.ue()
    if (chroma === 3) r.bit()
    r.ue()
    r.ue()
    r.bit()
    if (r.bit()) {
      for (let i = 0; i < (chroma === 3 ? 12 : 8); i++) {
        if (r.bit()) skipScalingList(r, i < 6 ? 16 : 64)
      }
    }
  }
  r.ue()
  const pocType = r.ue()
  if (pocType === 0) {
    r.ue()
  } else if (pocType === 1) {
    r.bit()
    r.se()
    r.se()
    const n = r.ue()
    for (let i = 0; i < n; i++) r.se()
  }
  r.ue()
  r.bit()
  const widthMbs = r.ue() + 1
  const heightUnits = r.ue() + 1
  frameMbsOnly = r.bit()
  if (!frameMbsOnly) r.bit()
  r.bit()
  let cropL = 0
  let cropR = 0
  let cropT = 0
  let cropB = 0
  if (r.bit()) {
    cropL = r.ue()
    cropR = r.ue()
    cropT = r.ue()
    cropB = r.ue()
  }
  const subW = chroma === 1 || chroma === 2 ? 2 : 1
  const subH = chroma === 1 ? 2 : 1
  const unitX = chroma === 0 ? 1 : subW
  const unitY = (chroma === 0 ? 1 : subH) * (2 - frameMbsOnly)
  return {
    profile,
    compatibility,
    level,
    width: widthMbs * 16 - (cropL + cropR) * unitX,
    height: (2 - frameMbsOnly) * heightUnits * 16 - (cropT + cropB) * unitY,
  }
}

export function avcCodec(sps: Uint8Array): string {
  const h = (n: number): string => n.toString(16).padStart(2, '0')
  return `avc1.${h(sps[1])}${h(sps[2])}${h(sps[3])}`
}

/** Length-prefixed (4-byte) sample payload from NAL units. */
export function toAvcc(nals: Uint8Array[]): Uint8Array {
  let len = 0
  for (const n of nals) len += 4 + n.length
  const out = new Uint8Array(len)
  let o = 0
  for (const n of nals) {
    const l = n.length
    out[o] = (l >>> 24) & 0xff
    out[o + 1] = (l >>> 16) & 0xff
    out[o + 2] = (l >>> 8) & 0xff
    out[o + 3] = l & 0xff
    out.set(n, o + 4)
    o += 4 + l
  }
  return out
}
