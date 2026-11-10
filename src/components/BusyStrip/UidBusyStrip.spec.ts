import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidBusyStrip from './UidBusyStrip.vue'
import { firstFree, type BusyRow } from '../../index.js'

const rows: BusyRow[] = [
  { id: 1, label: 'Ada', segments: [{ start: 12 * 60, end: 13 * 60, kind: 'own', label: 'Lunch' }] },
  { id: 2, label: 'Bob', segments: [{ start: 15 * 60 + 30, end: 16 * 60, kind: 'busy' }] },
  { id: 3, label: 'Maria', segments: [{ start: 0, end: 24 * 60, kind: 'away' }] },
]

describe('UidBusyStrip', () => {
  it('draws a row per person, stretches on the scale, others without titles', () => {
    const wrapper = mount(UidBusyStrip, { props: { rows, from: 9, to: 19 } })
    expect(wrapper.findAll('.uid-busy-strip__row')).toHaveLength(3)
    expect(wrapper.findAll('.uid-busy-strip__hour').map((h) => h.text())).toEqual(['9', '11', '13', '15', '17', '19'])
    const own = wrapper.find('.uid-busy-strip__segment--own')
    expect(own.text()).toBe('Lunch')
    expect(own.attributes('style')).toContain('left: 30%')
    expect(own.attributes('style')).toContain('width: 10%')
    expect(wrapper.find('.uid-busy-strip__segment--busy').text()).toBe('')
    // A whole-day absence is cut to the scale.
    expect(wrapper.find('.uid-busy-strip__segment--away').attributes('style')).toContain('width: 100%')
    expect(wrapper.findAll('.uid-busy-strip__track')[1].attributes('aria-label')).toBe('Bob, busy 15:30–16:00')
  })

  it('frames the chosen time over every row and takes a label slot', () => {
    const wrapper = mount(UidBusyStrip, {
      props: { rows, selection: { start: 15 * 60, end: 16 * 60 } },
      slots: { label: '<template #label="{ row }"><b>{{ row.label }}!</b></template>' },
    })
    expect(wrapper.find('.uid-busy-strip__frame').attributes('style')).toContain('left: 60%')
    expect(wrapper.find('.uid-busy-strip__label b').text()).toBe('Ada!')
  })

  it('picks a time on a track when asked', async () => {
    const wrapper = mount(UidBusyStrip, { props: { rows, pickStep: 30 } })
    const track = wrapper.find('.uid-busy-strip__track')
    track.element.getBoundingClientRect = () => ({ left: 0, width: 600, top: 0, height: 20, right: 600, bottom: 20, x: 0, y: 0, toJSON: () => ({}) })
    await track.trigger('click', { clientX: 330 })
    expect(wrapper.emitted('pick')?.[0]).toEqual([14 * 60 + 30])
  })

  it('finds the first stretch free for everyone', () => {
    const free = [rows[0], rows[1]]
    expect(firstFree(free, { from: 15 * 60, to: 19 * 60, duration: 60 })).toBe(16 * 60)
    expect(firstFree(free, { from: 9 * 60, to: 19 * 60, duration: 60, after: 11 * 60 + 20 })).toBe(13 * 60)
    expect(firstFree(rows, { from: 9 * 60, to: 19 * 60, duration: 30 })).toBeNull()
  })
})
