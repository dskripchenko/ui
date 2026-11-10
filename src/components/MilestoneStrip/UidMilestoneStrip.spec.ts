import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h } from 'vue'
import UidMilestoneStrip, { type UidMilestoneStripProps } from './UidMilestoneStrip.vue'
import { provideLocale } from '../../composables/useLocale.js'
import { en } from '../../locales/en.js'
import { dayNumber, milestoneRange, monthStarts, type Milestone } from './milestoneStrip'

const items: Milestone[] = [
  { key: 'a', label: 'Alpha', date: '2026-01-01', caption: 'Internal' },
  { key: 'b', label: 'Beta', date: '2026-02-15', caption: 'Slipping', risk: true },
  { key: 'c', label: 'Release', date: '2026-03-25', href: '#release' },
]

function inEnglish(props: UidMilestoneStripProps) {
  return mount(defineComponent({
    setup() {
      provideLocale(computed(() => en))
      return () => h(UidMilestoneStrip, props)
    },
  }))
}

// Jan 1 – Mar 31, 2026: 90 days.
const pct = (day: string) => Math.round((((dayNumber(day) ?? 0) - (dayNumber('2026-01-01') ?? 0)) / 90) * 10000) / 100

describe('milestone scale', () => {
  it('spans whole months around the items and today', () => {
    const r = milestoneRange(items, undefined, undefined, '2026-04-02')!
    expect(r.start).toBe(dayNumber('2026-01-01'))
    expect(r.end).toBe(dayNumber('2026-04-30'))
    expect(monthStarts(r)).toHaveLength(4)
    expect(milestoneRange(items, '2025-12-15', '2026-06-01')).toEqual({ start: dayNumber('2025-12-15'), end: dayNumber('2026-06-01') })
    expect(milestoneRange([], undefined, undefined)).toBeNull()
  })
})

describe('UidMilestoneStrip', () => {
  it('places each milestone at its date and names the months', () => {
    const w = inEnglish({ items })
    expect(w.findAll('.uid-milestone-strip__month').map((m) => m.text())).toEqual(['Jan', 'Feb', 'Mar'])
    expect(w.findAll('.uid-milestone-strip__month')[1]!.attributes('style')).toContain(`inset-inline-start: ${pct('2026-02-01')}%`)
    const rows = w.findAll('.uid-milestone-strip__item')
    expect(rows.map((r) => Number(r.attributes('data-left')))).toEqual([0, pct('2026-02-15'), pct('2026-03-25')])
    expect(rows[1]!.attributes('style')).toContain(`margin-inline-start: calc(${pct('2026-02-15')}% - var(--uid-milestone-half))`)
  })

  it('puts the text to the left of a marker near the right edge', () => {
    const rows = inEnglish({ items }).findAll('.uid-milestone-strip__item')
    expect(rows[0]!.classes()).not.toContain('uid-milestone-strip__item--flip')
    expect(rows[1]!.classes()).not.toContain('uid-milestone-strip__item--flip')
    expect(rows[2]!.classes()).toContain('uid-milestone-strip__item--flip')
    expect(rows[2]!.attributes('style')).toContain('margin-inline-start: auto')
  })

  it('marks a milestone at risk and announces it', () => {
    const w = inEnglish({ items })
    const risky = w.findAll('.uid-milestone-strip__item')[1]!
    expect(risky.classes()).toContain('uid-milestone-strip__item--risk')
    expect(risky.attributes('aria-label')).toBe('Beta, February 15, 2026, Slipping, at risk')
    expect(w.get('ol').attributes('aria-label')).toBe('Milestones')
    expect(w.findAll('li')).toHaveLength(3)
  })

  it('draws the today line and its footnote', () => {
    const w = inEnglish({ items, today: '2026-02-10', todayLabel: 'Today, Feb 10' })
    expect(w.get('.uid-milestone-strip__today').attributes('style')).toContain(`inset-inline-start: ${pct('2026-02-10')}%`)
    expect(w.get('.uid-milestone-strip__footnote').text()).toBe('Today, Feb 10')
    expect(inEnglish({ items }).find('.uid-milestone-strip__today').exists()).toBe(false)
  })

  it('links a milestone with href, emits select for the others', async () => {
    const w = inEnglish({ items })
    const link = w.get('a.uid-milestone-strip__item')
    expect(link.attributes('href')).toBe('#release')
    const buttons = w.findAll('button.uid-milestone-strip__item')
    expect(buttons).toHaveLength(2)
    await buttons[0]!.trigger('click')
    await link.trigger('click')
    expect(w.findComponent(UidMilestoneStrip).emitted('select')).toEqual([[items[0]]])
  })

  it('follows the locale for months and dates', () => {
    const w = mount(UidMilestoneStrip, { props: { items, monthFormat: 'long' } })
    expect(w.findAll('.uid-milestone-strip__month').map((m) => m.text())).toEqual(['январь', 'февраль', 'март'])
    expect(w.findAll('.uid-milestone-strip__item')[1]!.attributes('aria-label')).toContain('под угрозой')
  })
})
