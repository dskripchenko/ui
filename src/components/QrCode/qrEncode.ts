/**
 * A QR code encoder after ISO/IEC 18004: numeric, alphanumeric and byte
 * (UTF-8) modes, versions 1–40, error correction levels L, M, Q and H,
 * Reed–Solomon over GF(256), block interleaving, all eight masks scored by
 * the standard penalty rules. No dependencies.
 */

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H'

export interface QrEncodeOptions {
  /** Error correction level. Default 'M'. */
  errorCorrection?: QrErrorCorrection
  /** The smallest version to use, 1–40. Default 1. */
  minVersion?: number
  /** Force a mask pattern 0–7 instead of picking the one with the lowest penalty. */
  mask?: number
}

export interface QrCode {
  /** Version 1–40. */
  version: number
  /** Modules per side: 17 + 4 × version. */
  size: number
  /** `modules[row][column]`, true for a dark module. No quiet zone. */
  modules: boolean[][]
  errorCorrection: QrErrorCorrection
  /** The mask pattern applied, 0–7. */
  mask: number
}

export type QrMode = 'numeric' | 'alphanumeric' | 'byte'

const LEVELS: readonly QrErrorCorrection[] = ['L', 'M', 'Q', 'H']
/** The two format bits of each level. */
const FORMAT_BITS: Record<QrErrorCorrection, number> = { L: 1, M: 0, Q: 3, H: 2 }

/* Error correction codewords per block, by level then version (index 0 unused). */
const ECC_PER_BLOCK: readonly (readonly number[])[] = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
]

/* Number of error correction blocks, by level then version (index 0 unused). */
const BLOCKS: readonly (readonly number[])[] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
]

const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'

/* ---------- GF(256) and Reed–Solomon ---------- */

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
{
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]!
}

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a]! + LOG[b]!]!
}

/** The generator polynomial of the given degree, highest power first, leading 1 included. */
export function rsGenerator(degree: number): number[] {
  let poly = [1]
  for (let i = 0; i < degree; i++) {
    // Multiply by (x - α^i); in GF(2^8) minus is plus.
    const next = new Array<number>(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] = next[j]! ^ poly[j]!
      next[j + 1] = next[j + 1]! ^ gfMul(poly[j]!, EXP[i]!)
    }
    poly = next
  }
  return poly
}

/** The `degree` error correction codewords of `data`: the remainder of data·x^degree divided by the generator. */
export function rsRemainder(data: readonly number[], degree: number): number[] {
  const gen = rsGenerator(degree)
  const rem = new Array<number>(degree).fill(0)
  for (const byte of data) {
    const factor = byte ^ rem.shift()!
    rem.push(0)
    for (let i = 0; i < degree; i++) rem[i] = rem[i]! ^ gfMul(gen[i + 1]!, factor)
  }
  return rem
}

/* ---------- Capacity ---------- */

/** Modules available for data and error correction codewords (remainder bits included). */
function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2
    result -= (25 * align - 10) * align - 55
    if (version >= 7) result -= 36
  }
  return result
}

/** Data codewords (error correction excluded) of a version at a level. */
export function dataCodewords(version: number, level: QrErrorCorrection): number {
  const e = LEVELS.indexOf(level)
  return Math.floor(rawDataModules(version) / 8) - ECC_PER_BLOCK[e]![version]! * BLOCKS[e]![version]!
}

function countBits(mode: QrMode, version: number): number {
  const band = version <= 9 ? 0 : version <= 26 ? 1 : 2
  if (mode === 'numeric') return [10, 12, 14][band]!
  if (mode === 'alphanumeric') return [9, 11, 13][band]!
  return [8, 16, 16][band]!
}

/* ---------- Data encoding ---------- */

class BitBuffer {
  readonly bits: number[] = []
  put(value: number, length: number): void {
    for (let i = length - 1; i >= 0; i--) this.bits.push((value >>> i) & 1)
  }
}

/** The most compact single mode the whole text fits. */
export function qrMode(text: string): QrMode {
  if (/^[0-9]*$/.test(text)) return 'numeric'
  if ([...text].every(ch => ALPHANUMERIC.includes(ch))) return 'alphanumeric'
  return 'byte'
}

interface Segment {
  mode: QrMode
  /** Characters for numeric and alphanumeric, bytes for byte mode. */
  count: number
  data: BitBuffer
}

function segment(text: string): Segment {
  const mode = qrMode(text)
  const data = new BitBuffer()
  if (mode === 'numeric') {
    for (let i = 0; i < text.length; i += 3) {
      const group = text.slice(i, i + 3)
      data.put(Number(group), group.length * 3 + 1)
    }
    return { mode, count: text.length, data }
  }
  if (mode === 'alphanumeric') {
    for (let i = 0; i + 1 < text.length; i += 2) {
      data.put(ALPHANUMERIC.indexOf(text[i]!) * 45 + ALPHANUMERIC.indexOf(text[i + 1]!), 11)
    }
    if (text.length % 2 === 1) data.put(ALPHANUMERIC.indexOf(text[text.length - 1]!), 6)
    return { mode, count: text.length, data }
  }
  const bytes = new TextEncoder().encode(text)
  for (const b of bytes) data.put(b, 8)
  return { mode, count: bytes.length, data }
}

const MODE_INDICATOR: Record<QrMode, number> = { numeric: 0b0001, alphanumeric: 0b0010, byte: 0b0100 }

export interface QrCodewords {
  version: number
  mode: QrMode
  /** Data codewords, padded, before error correction. */
  data: number[]
  /** The final sequence: data and error correction codewords interleaved by block. */
  codewords: number[]
}

/** Picks the version and builds the codeword sequence. Throws when the text does not fit version 40. */
export function qrCodewords(text: string, level: QrErrorCorrection = 'M', minVersion = 1): QrCodewords {
  if (!LEVELS.includes(level)) throw new RangeError(`encodeQr: unknown error correction level "${String(level)}"`)
  if (!Number.isInteger(minVersion) || minVersion < 1 || minVersion > 40) {
    throw new RangeError(`encodeQr: minVersion must be an integer from 1 to 40, got ${minVersion}`)
  }
  const seg = segment(text)
  let version = minVersion
  for (; ; version++) {
    if (version > 40) {
      const unit = seg.mode === 'byte' ? 'bytes' : 'characters'
      throw new RangeError(
        `encodeQr: the text (${seg.count} ${unit} in ${seg.mode} mode) does not fit a version 40 QR code at error correction level ${level}`,
      )
    }
    const cc = countBits(seg.mode, version)
    const needed = 4 + cc + seg.data.bits.length
    if (seg.count < 2 ** cc && needed <= dataCodewords(version, level) * 8) break
  }

  const capacity = dataCodewords(version, level) * 8
  const buf = new BitBuffer()
  buf.put(MODE_INDICATOR[seg.mode], 4)
  buf.put(seg.count, countBits(seg.mode, version))
  buf.bits.push(...seg.data.bits)
  buf.put(0, Math.min(4, capacity - buf.bits.length))
  buf.put(0, (8 - (buf.bits.length % 8)) % 8)
  for (let pad = 0xec; buf.bits.length < capacity; pad ^= 0xec ^ 0x11) buf.put(pad, 8)

  const data: number[] = []
  for (let i = 0; i < buf.bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) byte = (byte << 1) | buf.bits[i + j]!
    data.push(byte)
  }
  return { version, mode: seg.mode, data, codewords: interleave(data, version, level) }
}

function interleave(data: readonly number[], version: number, level: QrErrorCorrection): number[] {
  const e = LEVELS.indexOf(level)
  const blockCount = BLOCKS[e]![version]!
  const eccLen = ECC_PER_BLOCK[e]![version]!
  const raw = Math.floor(rawDataModules(version) / 8)
  const shortCount = blockCount - (raw % blockCount)
  const shortLen = Math.floor(raw / blockCount)

  const blocks: number[][] = []
  for (let i = 0, k = 0; i < blockCount; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < shortCount ? 0 : 1))
    k += dat.length
    const ecc = rsRemainder(dat, eccLen)
    // Short blocks get a placeholder so every block has the same length.
    if (i < shortCount) dat.push(-1)
    blocks.push([...dat, ...ecc])
  }
  const out: number[] = []
  for (let i = 0; i < blocks[0]!.length; i++) {
    for (const block of blocks) if (block[i] !== -1) out.push(block[i]!)
  }
  return out
}

/* ---------- Matrix ---------- */

/** Centres of the alignment patterns along one axis. */
export function alignmentPositions(version: number): number[] {
  if (version === 1) return []
  const count = Math.floor(version / 7) + 2
  const size = version * 4 + 17
  const step = Math.floor((version * 8 + count * 3 + 5) / (count * 4 - 4)) * 2
  const result: number[] = []
  for (let pos = size - 7; result.length < count - 1; pos -= step) result.unshift(pos)
  return [6, ...result]
}

/** The 15 format bits (after the 0x5412 mask) of a level and a mask pattern. */
export function formatBits(level: QrErrorCorrection, mask: number): number {
  const data = (FORMAT_BITS[level] << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  return ((data << 10) | rem) ^ 0x5412
}

/** The 18 version information bits (versions 7 and up). */
export function versionBits(version: number): number {
  let rem = version
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
  return (version << 12) | rem
}

const MASKS: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
]

class Matrix {
  readonly modules: boolean[][]
  readonly reserved: boolean[][]
  readonly size: number
  constructor(size: number) {
    this.size = size
    this.modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
    this.reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  }
  /** A function module at column x, row y. */
  fn(x: number, y: number, dark: boolean): void {
    this.modules[y]![x] = dark
    this.reserved[y]![x] = true
  }
}

function drawFunctionPatterns(m: Matrix, version: number): void {
  const size = m.size
  for (let i = 0; i < size; i++) {
    m.fn(6, i, i % 2 === 0)
    m.fn(i, 6, i % 2 === 0)
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]] as const) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx
        const y = cy + dy
        if (x < 0 || y < 0 || x >= size || y >= size) continue
        const d = Math.max(Math.abs(dx), Math.abs(dy))
        m.fn(x, y, d !== 2 && d !== 4)
      }
    }
  }
  const pos = alignmentPositions(version)
  const last = pos.length - 1
  for (let i = 0; i <= last; i++) {
    for (let j = 0; j <= last; j++) {
      // Skip the three corners taken by the finder patterns.
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) continue
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          m.fn(pos[i]! + dx, pos[j]! + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
        }
      }
    }
  }
  drawFormat(m, 0)
  if (version >= 7) {
    const bits = versionBits(version)
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >>> i) & 1) === 1
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      m.fn(a, b, dark)
      m.fn(b, a, dark)
    }
  }
}

/** Writes the 15 format bits (both copies) and the dark module. `bits` 0 only reserves the area. */
function drawFormat(m: Matrix, bits: number): void {
  const size = m.size
  const bit = (i: number): boolean => ((bits >>> i) & 1) === 1
  for (let i = 0; i <= 5; i++) m.fn(8, i, bit(i))
  m.fn(8, 7, bit(6))
  m.fn(8, 8, bit(7))
  m.fn(7, 8, bit(8))
  for (let i = 9; i < 15; i++) m.fn(14 - i, 8, bit(i))
  for (let i = 0; i < 8; i++) m.fn(size - 1 - i, 8, bit(i))
  for (let i = 8; i < 15; i++) m.fn(8, size - 15 + i, bit(i))
  m.fn(8, size - 8, true)
}

function placeCodewords(m: Matrix, codewords: readonly number[]): void {
  const size = m.size
  const total = codewords.length * 8
  let i = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    const upward = ((right + 1) & 2) === 0
    for (let vert = 0; vert < size; vert++) {
      const y = upward ? size - 1 - vert : vert
      for (let j = 0; j < 2; j++) {
        const x = right - j
        if (m.reserved[y]![x]) continue
        // Remainder bits past the last codeword stay light.
        if (i < total) {
          m.modules[y]![x] = ((codewords[i >>> 3]! >>> (7 - (i & 7))) & 1) === 1
          i++
        }
      }
    }
  }
}

function applyMask(m: Matrix, mask: number): void {
  const fn = MASKS[mask]!
  for (let y = 0; y < m.size; y++) {
    for (let x = 0; x < m.size; x++) {
      if (!m.reserved[y]![x] && fn(x, y)) m.modules[y]![x] = !m.modules[y]![x]
    }
  }
}

/** The ISO/IEC 18004 penalty score of a finished symbol; lower is better. */
export function maskPenalty(modules: readonly (readonly boolean[])[]): number {
  const size = modules.length
  const at = (x: number, y: number): boolean => modules[y]![x]!
  let penalty = 0

  // Rule 1: five or more same-coloured modules in a row or column.
  for (let horizontal = 0; horizontal < 2; horizontal++) {
    for (let a = 0; a < size; a++) {
      let run = 1
      for (let b = 1; b <= size; b++) {
        const same = b < size
          && (horizontal ? at(b, a) === at(b - 1, a) : at(a, b) === at(a, b - 1))
        if (same) {
          run++
        } else {
          if (run >= 5) penalty += 3 + (run - 5)
          run = 1
        }
      }
    }
  }

  // Rule 2: 2×2 blocks of one colour.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = at(x, y)
      if (c === at(x + 1, y) && c === at(x, y + 1) && c === at(x + 1, y + 1)) penalty += 3
    }
  }

  // Rule 3: a 1:1:3:1:1 finder-like run with four light modules on one side
  // (outside the symbol counts as light).
  const light = (horizontal: boolean, line: number, from: number, to: number): boolean => {
    for (let k = Math.max(from, 0); k < Math.min(to, size); k++) {
      if (horizontal ? at(k, line) : at(line, k)) return false
    }
    return true
  }
  const PATTERN = [true, false, true, true, true, false, true]
  for (let line = 0; line < size; line++) {
    for (let k = 0; k + 7 <= size; k++) {
      for (const horizontal of [true, false]) {
        let match = true
        for (let p = 0; p < 7 && match; p++) {
          if ((horizontal ? at(k + p, line) : at(line, k + p)) !== PATTERN[p]) match = false
        }
        if (match && (light(horizontal, line, k - 4, k) || light(horizontal, line, k + 7, k + 11))) penalty += 40
      }
    }
  }

  // Rule 4: the share of dark modules away from 50 %, per 5 %.
  let dark = 0
  for (const row of modules) for (const c of row) if (c) dark++
  const total = size * size
  penalty += Math.floor((Math.abs(dark * 2 - total) * 10) / total) * 10
  return penalty
}

/**
 * Encodes `text` as a QR code. Picks the smallest version (from `minVersion`)
 * the text fits at the requested level, and the mask with the lowest penalty
 * unless `mask` forces one.
 * Byte mode carries UTF-8 without an ECI header, which is what scanners expect.
 * Throws a RangeError when the text does not fit version 40.
 */
export function encodeQr(text: string, options: QrEncodeOptions = {}): QrCode {
  const level = options.errorCorrection ?? 'M'
  const forced = options.mask
  if (forced !== undefined && !(Number.isInteger(forced) && forced >= 0 && forced <= 7)) {
    throw new RangeError(`encodeQr: mask must be an integer from 0 to 7, got ${forced}`)
  }
  const { version, codewords } = qrCodewords(text, level, options.minVersion ?? 1)
  const size = version * 4 + 17

  const base = new Matrix(size)
  drawFunctionPatterns(base, version)
  placeCodewords(base, codewords)

  let best: { mask: number; modules: boolean[][]; penalty: number } | null = null
  for (let mask = 0; mask < 8; mask++) {
    if (forced !== undefined && mask !== forced) continue
    const m = new Matrix(size)
    for (let y = 0; y < size; y++) {
      m.modules[y] = [...base.modules[y]!]
      m.reserved[y] = [...base.reserved[y]!]
    }
    applyMask(m, mask)
    drawFormat(m, formatBits(level, mask))
    const penalty = maskPenalty(m.modules)
    if (!best || penalty < best.penalty) best = { mask, modules: m.modules, penalty }
  }
  return { version, size, modules: best!.modules, errorCorrection: level, mask: best!.mask }
}
