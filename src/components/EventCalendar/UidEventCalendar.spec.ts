import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import UidEventCalendar from './UidEventCalendar.vue'
import UidEventCalendarBuilder from './UidEventCalendarBuilder.vue'
import UidCalendar from '../Calendar/UidCalendar.vue'
import UidInput from '../Input/UidInput.vue'
import type { CalendarEvent } from '../Calendar/calendarModel'

const SOURCE = `# Team
date: 2026-11-15
tags: release=danger

2026-11-03 10:00-11:00 Release demo #release {where: Room 4}
every mon 11:00-11:30 Planning {from: 2026-11-02, except: 2026-11-16}
`

afterEach(() => {
  document.body.innerHTML = ''
})

const shown = (wrapper: ReturnType<typeof mount>): CalendarEvent[] => wrapper.findComponent(UidCalendar).props('events') as CalendarEvent[]

describe('UidEventCalendar', () => {
  it('expands a weekly repeat over the visible range', async () => {
    const wrapper = mount(UidEventCalendar, { props: { source: SOURCE } })
    await nextTick()
    expect(wrapper.find('.uid-event-calendar__title').text()).toBe('Team')
    const events = shown(wrapper)
    expect(events.filter((e) => e.title === 'Planning').map((e) => e.date)).toEqual(['2026-11-02', '2026-11-09', '2026-11-23', '2026-11-30'])
    expect(events.find((e) => e.title === 'Release demo')).toMatchObject({ date: '2026-11-03', time: '10:00', endTime: '11:00', color: 'var(--uid-color-danger)' })
    expect(wrapper.emitted('range')?.[0]?.[0]).toMatchObject({ view: 'month', start: '2026-10-26', end: '2026-12-06' })
  })

  it('follows the view and date props', async () => {
    const wrapper = mount(UidEventCalendar, { props: { source: SOURCE, view: 'week', date: '2026-11-09' } })
    await nextTick()
    expect(shown(wrapper).map((e) => `${e.date} ${e.title}`)).toEqual(['2026-11-09 Planning'])
  })

  it('opens an occurrence and emits open', async () => {
    const wrapper = mount(UidEventCalendar, { props: { source: SOURCE } })
    await nextTick()
    wrapper.findComponent(UidCalendar).vm.$emit('event-click', shown(wrapper).find((e) => e.date === '2026-11-09'))
    await nextTick()
    expect(wrapper.emitted('open')?.[0]).toEqual([{ id: 'ev-1', date: '2026-11-09', title: 'Planning' }])
    expect(document.body.querySelector('.uid-event-calendar__props')?.textContent).toContain('every mon')
  })

  it('the builder adds an event', async () => {
    const wrapper = mount(UidEventCalendar, { props: { source: SOURCE, editable: true } })
    await nextTick()
    await wrapper.find('.uid-event-calendar__btn').trigger('click')
    const builder = wrapper.findComponent(UidEventCalendarBuilder)
    expect(builder.exists()).toBe(true)
    builder.findAllComponents(UidInput)[0]!.vm.$emit('update:modelValue', 'Retro')
    await nextTick()
    expect(builder.find('.uid-event-calendar__line code').text()).toBe('2026-11-15 Retro')
    await builder.find('form').trigger('submit')
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(`${SOURCE}2026-11-15 Retro\n`)
  })

  it('moving one occurrence of a repeat detaches it', async () => {
    const wrapper = mount(UidEventCalendar, { props: { source: SOURCE, editable: true } })
    await nextTick()
    const event = shown(wrapper).find((e) => e.date === '2026-11-09')
    wrapper.findComponent(UidCalendar).vm.$emit('event-move', { event, date: '2026-11-10' })
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(SOURCE.replace(
      'every mon 11:00-11:30 Planning {from: 2026-11-02, except: 2026-11-16}',
      'every mon 11:00-11:30 Planning {from: 2026-11-02, except: 2026-11-09, 2026-11-16}\n2026-11-10 11:00-11:30 Planning',
    ))
  })

  it('locked hides editing', async () => {
    const wrapper = mount(UidEventCalendar, { props: { source: SOURCE, editable: true, locked: true, lockable: true } })
    await nextTick()
    expect(wrapper.find('.uid-event-calendar__btn').exists()).toBe(false)
    expect(wrapper.find('.uid-event-calendar__tabs').exists()).toBe(false)
    expect(wrapper.findComponent(UidCalendar).props('editable')).toBe(false)
    await wrapper.find('.uid-event-calendar__lock').trigger('click')
    expect(wrapper.emitted('lock')?.[0]).toEqual([false])
  })
})
