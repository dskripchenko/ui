import { describe, expect, it, vi } from 'vitest'
import { computePeaks, normalizePeaks, peaksToPath, resamplePeaks } from './waveform'

describe('computePeaks', () => {
  it('максимум модуля по корзинам, нормированный', async () => {
    const ch = Float32Array.from([0.1, -0.5, 0.2, 0.25, 0, -0.1, 0.05, 0.1])
    const peaks = await computePeaks([ch], 4, { yieldFn: async () => {} })
    expect(peaks.map((p) => Math.round(p * 100) / 100)).toEqual([1, 0.5, 0.2, 0.2])
  })

  it('берёт максимум по каналам', async () => {
    const l = Float32Array.from([0.1, 0.1])
    const r = Float32Array.from([0.4, 0.2])
    expect(await computePeaks([l, r], 2, { yieldFn: async () => {} })).toEqual([1, 0.5])
  })

  it('обрабатывает кусками и уступает поток между ними', async () => {
    const data = new Float32Array(1000).map((_, i) => Math.sin(i / 10))
    const yieldFn = vi.fn(async () => {})
    const peaks = await computePeaks([data], 10, { chunkSize: 100, yieldFn })
    expect(yieldFn).toHaveBeenCalledTimes(9)
    expect(peaks).toHaveLength(10)
    expect(Math.max(...peaks)).toBe(1)
  })

  it('прерывается по AbortSignal', async () => {
    const ctrl = new AbortController()
    ctrl.abort()
    await expect(computePeaks([new Float32Array(10)], 2, { signal: ctrl.signal })).rejects.toThrow('Aborted')
  })

  it('пустой вход', async () => {
    expect(await computePeaks([], 3)).toEqual([0, 0, 0])
  })
})

describe('resample / path', () => {
  it('сжимает по максимуму и растягивает', () => {
    expect(resamplePeaks([0.1, 0.9, 0.3, 0.4], 2)).toEqual([0.9, 0.4])
    expect(resamplePeaks([0.2, 0.8], 4)).toEqual([0.2, 0.2, 0.8, 0.8])
    expect(resamplePeaks([], 3)).toEqual([])
  })

  it('normalizePeaks: тишина остаётся нулём', () => {
    expect(normalizePeaks([0, 0])).toEqual([0, 0])
    expect(normalizePeaks([0.25, 0.5])).toEqual([0.5, 1])
  })

  it('peaksToPath рисует бар на каждый пик с минимальной высотой', () => {
    const d = peaksToPath([0, 1])
    expect(d.match(/M/g)).toHaveLength(2)
    expect(d).toContain('M0 48.0h2v4.0h-2z')
    expect(d).toContain('M3 0.0h2v100.0h-2z')
  })
})
