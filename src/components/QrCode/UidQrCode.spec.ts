import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import UidQrCode from './UidQrCode.vue'
import { provideLocale } from '../../composables/useLocale.js'
import { en } from '../../locales/en.js'
import {
  alignmentPositions,
  dataCodewords,
  encodeQr,
  formatBits,
  maskPenalty,
  qrCodewords,
  qrMode,
  rsGenerator,
  rsRemainder,
  versionBits,
  type QrErrorCorrection,
} from './qrEncode.js'

// The widely published example key of authenticator apps, not a real one.
const OTP_PARAMS = new URLSearchParams([
  ['secret', 'JBSWY3DPEHPK3PXP'],
  ['issuer', 'Issuer'],
  ['algorithm', 'SHA1'],
  ['digits', '6'],
  ['period', '30'],
])
const OTPAUTH = `otpauth://totp/Issuer:alice@example.com?${OTP_PARAMS.toString()}`

/** α^k in GF(256) with the QR polynomial 0x11d. */
function alpha(k: number): number {
  let x = 1
  for (let i = 0; i < k; i++) {
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  return x
}

/** Reads the first copy of the format bits around the top-left finder, most significant first. */
function readFormat(modules: boolean[][]): string {
  const bits: boolean[] = []
  for (let x = 0; x <= 5; x++) bits.push(modules[8]![x]!)
  bits.push(modules[8]![7]!, modules[8]![8]!, modules[7]![8]!)
  for (let y = 5; y >= 0; y--) bits.push(modules[y]![8]!)
  return bits.map(b => (b ? '1' : '0')).join('')
}

/** Reads the second copy: the bottom-left column and the top-right row. */
function readFormatCopy(modules: boolean[][]): string {
  const n = modules.length
  const bits: boolean[] = []
  for (let y = n - 1; y >= n - 7; y--) bits.push(modules[y]![8]!)
  for (let x = n - 8; x < n; x++) bits.push(modules[8]![x]!)
  return bits.map(b => (b ? '1' : '0')).join('')
}

function finderAt(modules: boolean[][], top: number, left: number): boolean {
  for (let dy = 0; dy < 7; dy++) {
    for (let dx = 0; dx < 7; dx++) {
      const ring = Math.min(dx, dy, 6 - dx, 6 - dy)
      if (modules[top + dy]![left + dx] !== (ring !== 1)) return false
    }
  }
  return true
}

describe('Reed–Solomon', () => {
  it('builds the generator polynomials of the standard', () => {
    // Thonky / ISO 18004 Annex A, in exponent form.
    expect(rsGenerator(7)).toEqual([0, 87, 229, 146, 149, 238, 102, 21].map(alpha))
    expect(rsGenerator(10)).toEqual([0, 251, 67, 46, 61, 118, 70, 64, 94, 32, 45].map(alpha))
  })

  it('computes the error correction codewords', () => {
    // ISO 18004 Annex I: "01234567", 1-M.
    expect(rsRemainder([16, 32, 12, 86, 97, 128, 236, 17, 236, 17, 236, 17, 236, 17, 236, 17], 10))
      .toEqual([165, 36, 212, 193, 237, 54, 199, 135, 44, 85])
    // Thonky: "HELLO WORLD", 1-M.
    expect(rsRemainder([32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17], 10))
      .toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23])
  })
})

describe('encodeQr', () => {
  it('HELLO WORLD at 1-Q: data and error correction codewords, format bits', () => {
    const cw = qrCodewords('HELLO WORLD', 'Q')
    expect(cw.version).toBe(1)
    expect(cw.mode).toBe('alphanumeric')
    expect(cw.data).toEqual([32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236])
    expect(cw.codewords).toEqual([
      32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236,
      168, 72, 22, 82, 217, 54, 156, 0, 46, 15, 180, 122, 16,
    ])
    const qr = encodeQr('HELLO WORLD', { errorCorrection: 'Q' })
    expect(qr).toMatchObject({ version: 1, size: 21, errorCorrection: 'Q', mask: 0 })
    expect(readFormat(qr.modules)).toBe('011010101011111')
    expect(readFormatCopy(qr.modules)).toBe('011010101011111')
  })

  it('ISO 18004 Annex I: "01234567" at 1-M picks mask 2', () => {
    const qr = encodeQr('01234567', { errorCorrection: 'M' })
    expect(qr.mask).toBe(2)
    expect(readFormat(qr.modules)).toBe('101111001111100')
  })

  it('format bits follow the BCH table', () => {
    expect(formatBits('M', 0).toString(2).padStart(15, '0')).toBe('101010000010010')
    expect(formatBits('L', 4).toString(2).padStart(15, '0')).toBe('110011000101111')
    expect(formatBits('H', 7).toString(2).padStart(15, '0')).toBe('000100000111011')
  })

  it('version information bits', () => {
    expect(versionBits(7).toString(2).padStart(18, '0')).toBe('000111110010010100')
    expect(versionBits(40).toString(2).padStart(18, '0')).toBe('101000110001101001')
  })

  it('alignment pattern centres', () => {
    expect(alignmentPositions(1)).toEqual([])
    expect(alignmentPositions(2)).toEqual([6, 18])
    expect(alignmentPositions(7)).toEqual([6, 22, 38])
    expect(alignmentPositions(32)).toEqual([6, 34, 60, 86, 112, 138])
    expect(alignmentPositions(40)).toEqual([6, 30, 58, 86, 114, 142, 170])
  })

  it('data capacity per version and level', () => {
    expect([1, 2, 10, 40].map(v => (['L', 'M', 'Q', 'H'] as const).map(l => dataCodewords(v, l)))).toEqual([
      [19, 16, 13, 9],
      [34, 28, 22, 16],
      [274, 216, 154, 122],
      [2956, 2334, 1666, 1276],
    ])
  })

  it.each<[QrErrorCorrection, number, number]>([
    ['L', 17, 32],
    ['M', 14, 26],
    ['Q', 11, 20],
    ['H', 7, 14],
  ])('byte mode at %s: %i bytes fit version 1, one more needs version 2', (level, v1, v2) => {
    expect(encodeQr('a'.repeat(v1), { errorCorrection: level }).version).toBe(1)
    expect(encodeQr('a'.repeat(v1 + 1), { errorCorrection: level }).version).toBe(2)
    expect(encodeQr('a'.repeat(v2), { errorCorrection: level }).version).toBe(2)
    expect(encodeQr('a'.repeat(v2 + 1), { errorCorrection: level }).version).toBe(3)
  })

  it('numeric and alphanumeric capacity of version 1-L', () => {
    expect(encodeQr('1'.repeat(41), { errorCorrection: 'L' }).version).toBe(1)
    expect(encodeQr('1'.repeat(42), { errorCorrection: 'L' }).version).toBe(2)
    expect(encodeQr('A'.repeat(25), { errorCorrection: 'L' }).version).toBe(1)
    expect(encodeQr('A'.repeat(26), { errorCorrection: 'L' }).version).toBe(2)
  })

  it('fills version 40 and throws a clear error past it', () => {
    expect(encodeQr('a'.repeat(2953), { errorCorrection: 'L' }).version).toBe(40)
    expect(encodeQr('a'.repeat(1273), { errorCorrection: 'H' }).version).toBe(40)
    expect(() => encodeQr('a'.repeat(2954), { errorCorrection: 'L' }))
      .toThrow('does not fit a version 40 QR code at error correction level L')
    expect(() => encodeQr('a'.repeat(1274), { errorCorrection: 'H' })).toThrow(RangeError)
  })

  it('respects minVersion and rejects a bad one', () => {
    expect(encodeQr('hi', { minVersion: 5 }).version).toBe(5)
    expect(() => encodeQr('hi', { minVersion: 41 })).toThrow(RangeError)
  })

  it('draws finder patterns, timing patterns and the dark module', () => {
    const { modules, size } = encodeQr('https://example.com/', { errorCorrection: 'M' })
    expect(size).toBe(modules.length)
    expect(finderAt(modules, 0, 0)).toBe(true)
    expect(finderAt(modules, 0, size - 7)).toBe(true)
    expect(finderAt(modules, size - 7, 0)).toBe(true)
    for (let i = 8; i < size - 8; i++) {
      expect(modules[6]![i]).toBe(i % 2 === 0)
      expect(modules[i]![6]).toBe(i % 2 === 0)
    }
    expect(modules[size - 8]![8]).toBe(true)
    // The separators around the top-left finder are light.
    for (let i = 0; i < 8; i++) {
      expect(modules[7]![i]).toBe(false)
      expect(modules[i]![7]).toBe(false)
    }
  })

  it('writes the version information blocks from version 7', () => {
    const qr = encodeQr('a'.repeat(140), { errorCorrection: 'L' })
    expect(qr.version).toBe(7)
    const n = qr.size
    const bits = versionBits(7)
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >>> i) & 1) === 1
      const a = n - 11 + (i % 3)
      const b = Math.floor(i / 3)
      expect(qr.modules[b]![a]).toBe(dark)
      expect(qr.modules[a]![b]).toBe(dark)
    }
    // An alignment pattern centred at (22, 22).
    expect(qr.modules[22]![22]).toBe(true)
    expect(qr.modules[21]![22]).toBe(false)
    expect(qr.modules[20]![22]).toBe(true)
  })

  it.each(['Lowest penalty wins', OTPAUTH, 'x'.repeat(300)])('picks the mask with the lowest penalty: %s', (text) => {
    const qr = encodeQr(text, { errorCorrection: 'Q' })
    const scores = [0, 1, 2, 3, 4, 5, 6, 7].map(mask => maskPenalty(encodeQr(text, { errorCorrection: 'Q', mask }).modules))
    expect(maskPenalty(qr.modules)).toBe(Math.min(...scores))
    expect(scores.indexOf(Math.min(...scores))).toBe(qr.mask)
  })

  it('a forced mask is applied and written to the format bits', () => {
    const qr = encodeQr('HELLO WORLD', { errorCorrection: 'Q', mask: 6 })
    expect(qr.mask).toBe(6)
    expect(readFormat(qr.modules)).toBe(formatBits('Q', 6).toString(2).padStart(15, '0'))
    expect(() => encodeQr('x', { mask: 8 })).toThrow(RangeError)
  })

  it('UTF-8 text goes in byte mode', () => {
    expect(qrMode('Привет, мир')).toBe('byte')
    const cw = qrCodewords('Привет', 'M')
    expect(cw.mode).toBe('byte')
    // Mode 0100, count 12 (bytes), then the first UTF-8 byte 0xD0.
    expect(cw.data[0]).toBe(0b0100_0000)
    expect(cw.data[1]).toBe(0b1100_1101)
    expect(cw.data[2]! >> 4).toBe(0x0)
  })

  it('picks the mode from the text', () => {
    expect(qrMode('0123')).toBe('numeric')
    expect(qrMode('HELLO WORLD $%*+-./:')).toBe('alphanumeric')
    expect(qrMode('hello')).toBe('byte')
    expect(qrMode('')).toBe('numeric')
  })

  it('encodes an otpauth URI', () => {
    expect(OTPAUTH).toHaveLength(111)
    const qr = encodeQr(OTPAUTH)
    expect(qrCodewords(OTPAUTH, 'M').mode).toBe('byte')
    // 111 bytes: past the 106 of version 6-M, within the 122 of 7-M.
    expect(qr.version).toBe(7)
    expect(qr.size).toBe(45)
  })

  it('a long text reaches a large version', () => {
    expect(encodeQr('x'.repeat(300), { errorCorrection: 'H' }).version).toBeGreaterThanOrEqual(10)
  })
})

describe('UidQrCode', () => {
  it('renders one svg with one path and crisp edges', () => {
    const w = mount(UidQrCode, { props: { value: 'hello' } })
    const svg = w.get('svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toBe('QR-код')
    expect(svg.attributes('shape-rendering')).toBe('crispEdges')
    expect(svg.attributes('width')).toBe('176')
    expect(svg.attributes('height')).toBe('176')
    // Version 1 (21 modules) plus a 4-module quiet zone on each side.
    expect(svg.attributes('viewBox')).toBe('0 0 29 29')
    expect(w.findAll('path')).toHaveLength(1)
  })

  it('draws exactly the dark modules, offset by the margin', () => {
    const w = mount(UidQrCode, { props: { value: 'hello', margin: 2, size: 100 } })
    const d = w.get('path').attributes('d')!
    const { modules, size } = encodeQr('hello')
    const grid = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
    for (const m of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
      const [x, y, len] = [Number(m[1]) - 2, Number(m[2]) - 2, Number(m[3])]
      for (let i = 0; i < len; i++) grid[y]![x + i] = true
    }
    expect(grid).toEqual(modules)
    expect(w.get('svg').attributes('viewBox')).toBe(`0 0 ${size + 4} ${size + 4}`)
  })

  it('recomputes when the value changes', async () => {
    const w = mount(UidQrCode, { props: { value: 'a' } })
    const before = w.get('path').attributes('d')
    // 40 bytes at M need version 3: 29 modules plus the quiet zone.
    await w.setProps({ value: 'a'.repeat(40) })
    expect(w.get('path').attributes('d')).not.toBe(before)
    expect(w.get('svg').attributes('viewBox')).toBe('0 0 37 37')
  })

  it('takes the error correction level', () => {
    const w = mount(UidQrCode, { props: { value: 'a'.repeat(20), errorCorrection: 'H' } })
    // 20 bytes at H need version 3: 29 modules.
    expect(w.get('svg').attributes('viewBox')).toBe('0 0 37 37')
  })

  it('takes a label, and the locale default otherwise', async () => {
    const w = mount(UidQrCode, { props: { value: 'x', label: 'Scan to open the page' } })
    expect(w.get('svg').attributes('aria-label')).toBe('Scan to open the page')
    const Host = defineComponent({
      setup() {
        provideLocale(en)
        return () => h(UidQrCode, { value: 'x' })
      },
    })
    const r = mount(Host)
    await nextTick()
    expect(r.get('svg').attributes('aria-label')).toBe('QR code')
  })

  it('emits error and renders no modules when the value does not fit', () => {
    const w = mount(UidQrCode, { props: { value: 'a'.repeat(3000), errorCorrection: 'L' } })
    expect(w.find('path').exists()).toBe(false)
    expect(w.emitted('error')?.[0]?.[0]).toBeInstanceOf(RangeError)
  })
})
