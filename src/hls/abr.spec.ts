import { describe, expect, it } from 'vitest'
import { BandwidthEstimator, chooseLevel } from './abr'

const levels = [
  { bandwidth: 400_000, height: 360 },
  { bandwidth: 1_200_000, height: 540 },
  { bandwidth: 2_500_000, height: 720 },
  { bandwidth: 5_000_000, height: 1080 },
]

describe('BandwidthEstimator', () => {
  it('без замеров — начальная оценка', () => {
    const e = new BandwidthEstimator(800_000)
    expect(e.estimate).toBe(800_000)
    expect(e.hasSamples).toBe(false)
  })

  it('сходится к измеренной скорости и игнорирует мелкие загрузки', () => {
    const e = new BandwidthEstimator()
    e.sample({ bytes: 100, ms: 1 })
    expect(e.hasSamples).toBe(false)
    for (let i = 0; i < 20; i++) e.sample({ bytes: 500_000, ms: 1000 })
    expect(e.estimate).toBeGreaterThan(3_900_000)
    expect(e.estimate).toBeLessThan(4_100_000)
  })

  it('падение скорости быстро снижает оценку (минимум из быстрой и медленной)', () => {
    const e = new BandwidthEstimator()
    for (let i = 0; i < 10; i++) e.sample({ bytes: 1_000_000, ms: 1000 })
    const before = e.estimate
    for (let i = 0; i < 5; i++) e.sample({ bytes: 100_000, ms: 1000 })
    expect(e.estimate).toBeLessThan(before / 2)
  })
})

describe('chooseLevel', () => {
  it('лучший уровень в пределах запаса', () => {
    expect(chooseLevel(levels, 3_500_000)).toBe(2)
    expect(chooseLevel(levels, 100_000)).toBe(0)
    expect(chooseLevel(levels, 50_000_000)).toBe(3)
    expect(chooseLevel([], 1)).toBe(-1)
  })

  it('тонкий буфер делает выбор осторожнее', () => {
    expect(chooseLevel(levels, 3_500_000, { bufferAhead: 2 })).toBe(1)
  })

  it('не выше, чем нужно для размера плеера', () => {
    expect(chooseLevel(levels, 50_000_000, { maxHeight: 500 })).toBe(1)
    expect(chooseLevel(levels, 50_000_000, { maxHeight: 720 })).toBe(2)
  })

  it('вверх — не больше чем на одну ступень за раз', () => {
    expect(chooseLevel(levels, 50_000_000, { current: 0 })).toBe(1)
    expect(chooseLevel(levels, 100_000, { current: 3 })).toBe(0)
  })
})
