import { describe, expect, it } from 'vitest'
import { normalizeColor, parseColor } from './colorParse'

describe('colorParse', () => {
  it('разворачивает 3- и 4-значный hex', () => {
    expect(normalizeColor('#f00')).toBe('#ff0000')
    expect(normalizeColor('#F0A')).toBe('#ff00aa')
    expect(normalizeColor('#f00c')).toBe('#ff0000cc')
  })

  it('принимает 6- и 8-значный hex, в том числе без решётки', () => {
    expect(normalizeColor('#3B82F6')).toBe('#3b82f6')
    expect(normalizeColor('3b82f6')).toBe('#3b82f6')
    expect(normalizeColor('#3b82f680')).toBe('#3b82f680')
  })

  it('разбирает rgb() и rgba() с запятыми', () => {
    expect(normalizeColor('rgb(255, 0, 0)')).toBe('#ff0000')
    expect(normalizeColor('rgba(0, 128, 255, 0.5)')).toBe('#0080ff80')
    expect(normalizeColor('RGB(100%, 0%, 50%)')).toBe('#ff0080')
  })

  it('разбирает rgb() в синтаксисе через пробел и процентную альфу', () => {
    expect(normalizeColor('rgb(255 0 0 / 50%)')).toBe('#ff000080')
    expect(normalizeColor('rgb(0 0 255)')).toBe('#0000ff')
  })

  it('разбирает hsl() и hsla()', () => {
    expect(normalizeColor('hsl(0, 100%, 50%)')).toBe('#ff0000')
    expect(normalizeColor('hsl(120deg 100% 25%)')).toBe('#008000')
    expect(normalizeColor('hsla(240, 100%, 50%, 0.5)')).toBe('#0000ff80')
    expect(normalizeColor('hsl(0.5turn 100% 50%)')).toBe('#00ffff')
  })

  it('альфа = 1 даёт 6-значный hex', () => {
    expect(normalizeColor('rgba(0, 0, 0, 1)')).toBe('#000000')
  })

  it('возвращает альфу в диапазоне 0..100', () => {
    expect(parseColor('rgba(10, 20, 30, 0.25)')).toEqual([10, 20, 30, 25])
  })

  it('возвращает null на невалидном вводе', () => {
    expect(parseColor('')).toBeNull()
    expect(parseColor(null)).toBeNull()
    expect(parseColor('#12')).toBeNull()
    expect(parseColor('#12345')).toBeNull()
    expect(parseColor('#gggggg')).toBeNull()
    expect(parseColor('rgb(1, 2)')).toBeNull()
    expect(parseColor('rgb(a, b, c)')).toBeNull()
    expect(parseColor('hsl(red, 10%, 10%)')).toBeNull()
    expect(parseColor('red')).toBeNull()
  })
})
