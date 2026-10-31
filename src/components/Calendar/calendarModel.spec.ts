import { describe, expect, it } from 'vitest'
import { eventsOn, layoutDay, moved, rangeOf, resized, step } from './calendarModel'

describe('calendarModel', () => {
  it('диапазоны видов', () => {
    expect(rangeOf('day', '2026-11-04')).toEqual({ view: 'day', start: '2026-11-04', end: '2026-11-04' })
    expect(rangeOf('week', '2026-11-04')).toEqual({ view: 'week', start: '2026-11-02', end: '2026-11-08' })
    expect(rangeOf('month', '2026-11-15')).toEqual({ view: 'month', start: '2026-10-26', end: '2026-12-06' })
    expect(rangeOf('year', '2026-11-15')).toEqual({ view: 'year', start: '2026-01-01', end: '2026-12-31' })
    expect(rangeOf('agenda', '2026-02-10')).toEqual({ view: 'agenda', start: '2026-02-01', end: '2026-02-28' })
  })

  it('шаг вида', () => {
    expect(step('day', '2026-12-31', 1)).toBe('2027-01-01')
    expect(step('week', '2026-11-04', -1)).toBe('2026-10-28')
    expect(step('month', '2026-01-31', 1)).toBe('2026-02-01')
    expect(step('year', '2026-05-10', -1)).toBe('2025-05-01')
  })

  it('события дня: многодневные и на весь день первыми, затем по времени', () => {
    const events = [
      { date: '2026-11-03', time: '14:00', title: 'b' },
      { date: '2026-11-03', time: '09:30', title: 'a' },
      { date: '2026-11-01', endDate: '2026-11-05', title: 'freeze' },
      { date: '2026-11-04', title: 'other day' },
    ]
    expect(eventsOn(events, '2026-11-03').map((e) => e.title)).toEqual(['freeze', 'a', 'b'])
  })

  it('пересекающиеся события делят ширину', () => {
    const blocks = layoutDay([
      { date: '2026-11-03', time: '10:00', endTime: '11:00', title: 'a' },
      { date: '2026-11-03', time: '10:30', endTime: '12:00', title: 'b' },
      { date: '2026-11-03', time: '11:00', endTime: '11:30', title: 'c' },
      { date: '2026-11-03', time: '13:00', title: 'd' },
    ], '2026-11-03')
    const by = Object.fromEntries(blocks.map((b) => [b.event.title, [b.col, b.cols, b.start, b.end]]))
    expect(by.a).toEqual([0, 2, 600, 660])
    expect(by.b).toEqual([1, 2, 630, 720])
    expect(by.c).toEqual([0, 2, 660, 690])
    expect(by.d).toEqual([0, 1, 780, 840])
  })

  it('перенос сохраняет длительность', () => {
    expect(moved({ date: '2026-11-03', time: '10:00', endTime: '11:30', title: 'x' }, '2026-11-05', '15:00'))
      .toEqual({ date: '2026-11-05', time: '15:00', endTime: '16:30' })
    expect(moved({ date: '2026-11-10', endDate: '2026-11-14', title: 'freeze' }, '2026-11-17'))
      .toEqual({ date: '2026-11-17', endDate: '2026-11-21' })
    expect(moved({ date: '2026-11-03', time: '10:00', title: 'x' }, '2026-11-04'))
      .toEqual({ date: '2026-11-04', time: '10:00' })
  })
  it('растягивание меняет включительный конец и не уходит раньше начала', () => {
    expect(resized({ date: '2026-11-03', title: 'x' }, '2026-11-05')).toEqual({ date: '2026-11-03', endDate: '2026-11-05' })
    expect(resized({ date: '2026-11-10', endDate: '2026-11-14', title: 'x' }, '2026-11-01')).toEqual({ date: '2026-11-10', endDate: '2026-11-10' })
    expect(resized({ date: '2026-11-03', endDate: '2026-11-04', time: '22:00', endTime: '02:00', title: 'x' }, '2026-11-06'))
      .toEqual({ date: '2026-11-03', endDate: '2026-11-06', time: '22:00', endTime: '02:00' })
  })
})
