import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { UidHistoryStrip, type HistoryCell } from '../../index.js'

const cells: HistoryCell[] = [
  { key: 1, tone: 'success', title: 'Mon: up' },
  { key: 2, tone: 'warning' },
  { key: 3, tone: 'danger', title: 'Wed: down 12 min' },
  { key: 4, tone: 'none' },
]

describe('UidHistoryStrip', () => {
  it('draws a cell per entry in order, with its tone and title', () => {
    const wrapper = mount(UidHistoryStrip, { props: { cells, label: '4 days' } })
    const drawn = wrapper.findAll('.uid-history-strip__cell')
    expect(drawn.map((c) => c.classes().find((k) => k.includes('--')))).toEqual([
      'uid-history-strip__cell--success',
      'uid-history-strip__cell--warning',
      'uid-history-strip__cell--danger',
      'uid-history-strip__cell--none',
    ])
    expect(drawn[2]!.attributes('title')).toBe('Wed: down 12 min')
  })

  it('speaks as one image with its label, fixed by default, at the height asked', () => {
    const wrapper = mount(UidHistoryStrip, { props: { cells, label: 'Uptime 99%', fit: 'fill', height: 28 } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Uptime 99%')
    expect(wrapper.classes()).toContain('uid-history-strip--fill')
    expect(wrapper.attributes('style')).toContain('height: 28px')
    expect(mount(UidHistoryStrip, { props: { cells: [], label: 'x' } }).classes()).toContain('uid-history-strip--fixed')
  })
})
