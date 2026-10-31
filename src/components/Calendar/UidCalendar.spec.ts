import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UidCalendar from './UidCalendar.vue'
import type { CalendarEvent, CalendarEventMove, CalendarRange, CalendarSlot, CalendarView, UidCalendarProps } from '../../index.js'

/** Drag from the pointerdown target to the cell of `to` (elementFromPoint is stubbed: jsdom has no layout). */
async function dragTo(handle: ReturnType<ReturnType<typeof mount>['find']>, root: HTMLElement, to: string): Promise<void> {
  handle.element.dispatchEvent(new MouseEvent('pointerdown', { button: 0, clientX: 0, clientY: 0, bubbles: true }))
  await nextTick()
  const cell = root.querySelector<HTMLElement>(`[data-date="${to}"]`)
  document.elementFromPoint = vi.fn(() => cell) as typeof document.elementFromPoint
  window.dispatchEvent(new MouseEvent('pointermove', { clientX: 40, clientY: 0 }))
  await nextTick()
  window.dispatchEvent(new MouseEvent('pointerup', { clientX: 40, clientY: 0 }))
  await nextTick()
}

describe('UidCalendar', () => {
  it('рендерит сетку 42 дня', () => {
    const wrapper = mount(UidCalendar, { props: { modelValue: '2026-04-15' } })
    expect(wrapper.findAll('.uid-calendar__day')).toHaveLength(42)
  })

  it('показывает заголовок месяца', () => {
    const wrapper = mount(UidCalendar, { props: { modelValue: '2026-04-15' } })
    expect(wrapper.find('.uid-calendar__title').text()).toMatch(/Апрель.*2026/)
  })

  it('выбирает день по клику', async () => {
    const wrapper = mount(UidCalendar, { props: { modelValue: '2026-04-01' } })
    const days = wrapper.findAll('.uid-calendar__day')
    const apr15 = days.find(d => d.attributes('aria-label') === '2026-04-15')
    await apr15?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-04-15'])
    expect(wrapper.emitted('date-click')?.[0]).toEqual(['2026-04-15'])
  })

  it('переключает месяц вперёд', async () => {
    const wrapper = mount(UidCalendar, { props: { modelValue: '2026-04-01' } })
    const buttons = wrapper.findAll('.uid-calendar__btn--icon')
    await buttons[1].trigger('click')
    expect(wrapper.find('.uid-calendar__title').text()).toMatch(/Май.*2026/)
  })

  it('переключает месяц назад', async () => {
    const wrapper = mount(UidCalendar, { props: { modelValue: '2026-04-01' } })
    const buttons = wrapper.findAll('.uid-calendar__btn--icon')
    await buttons[0].trigger('click')
    expect(wrapper.find('.uid-calendar__title').text()).toMatch(/Март.*2026/)
  })

  it('кнопка Сегодня возвращает к текущему месяцу', async () => {
    const wrapper = mount(UidCalendar, { props: { modelValue: '2020-01-01' } })
    const today = new Date()
    const todayBtn = wrapper.findAll('.uid-calendar__btn').find(b => b.text() === 'Сегодня')
    await todayBtn?.trigger('click')
    const expectedMonth = new Intl.DateTimeFormat('ru', { month: 'long' }).format(today)
    expect(wrapper.find('.uid-calendar__title').text().toLowerCase()).toContain(expectedMonth.toLowerCase().slice(0, 3))
  })

  it('рендерит события', () => {
    const wrapper = mount(UidCalendar, {
      props: {
        modelValue: '2026-04-15',
        events: [
          { date: '2026-04-15', title: 'Встреча' },
          { date: '2026-04-15', title: 'Звонок' },
        ],
      },
    })
    const day15 = wrapper.findAll('.uid-calendar__day').find(d => d.attributes('aria-label') === '2026-04-15')
    expect(day15?.findAll('.uid-calendar__event')).toHaveLength(2)
  })

  it('обрезает события по maxEventsPerDay', () => {
    const events = Array.from({ length: 10 }, (_, i) => ({ date: '2026-04-15', title: `E${i}` }))
    const wrapper = mount(UidCalendar, {
      props: { modelValue: '2026-04-15', events, maxEventsPerDay: 3 },
    })
    const day15 = wrapper.findAll('.uid-calendar__day').find(d => d.attributes('aria-label') === '2026-04-15')
    expect(day15?.findAll('.uid-calendar__event')).toHaveLength(3)
    expect(day15?.find('.uid-calendar__more').text()).toBe('+7')
  })

  it('эмитит event-click', async () => {
    const wrapper = mount(UidCalendar, {
      props: {
        modelValue: '2026-04-15',
        events: [{ date: '2026-04-15', title: 'X' }],
      },
    })
    const day15 = wrapper.findAll('.uid-calendar__day').find(d => d.attributes('aria-label') === '2026-04-15')
    await day15?.find('.uid-calendar__event').trigger('click')
    expect(wrapper.emitted('event-click')?.[0]?.[0]).toMatchObject({ title: 'X' })
  })

  it('blocked min/max', async () => {
    const wrapper = mount(UidCalendar, {
      props: { modelValue: '2026-04-15', min: '2026-04-10', max: '2026-04-20' },
    })
    const apr5 = wrapper.findAll('.uid-calendar__day').find(d => d.attributes('aria-label') === '2026-04-05')
    expect(apr5?.classes()).toContain('uid-calendar__day--disabled')
    await apr5?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('применяет compact-класс', () => {
    const wrapper = mount(UidCalendar, { props: { compact: true } })
    expect(wrapper.classes()).toContain('uid-calendar--compact')
  })

  it('подсвечивает selected', () => {
    const wrapper = mount(UidCalendar, { props: { modelValue: '2026-04-15' } })
    const apr15 = wrapper.findAll('.uid-calendar__day').find(d => d.attributes('aria-label') === '2026-04-15')
    expect(apr15?.classes()).toContain('uid-calendar__day--selected')
  })

  it('Enter выбирает день', async () => {
    const wrapper = mount(UidCalendar, { props: { modelValue: '2026-04-01' } })
    const apr10 = wrapper.findAll('.uid-calendar__day').find(d => d.attributes('aria-label') === '2026-04-10')
    await apr10?.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-04-10'])
  })

  it('по умолчанию без переключателя видов', () => {
    const wrapper = mount(UidCalendar, { props: { modelValue: '2026-04-15' } })
    expect(wrapper.find('.uid-calendar__views').exists()).toBe(false)
  })

  it('переключает вид и сообщает видимый диапазон', async () => {
    const wrapper = mount(UidCalendar, { props: { anchor: '2026-11-04', views: ['day', 'week', 'month', 'year', 'agenda'] } })
    expect(wrapper.emitted('range')?.[0]).toEqual([{ view: 'month', start: '2026-10-26', end: '2026-12-06' }])
    await wrapper.findAll('.uid-calendar__view')[1].trigger('click')
    expect(wrapper.emitted('update:view')?.[0]).toEqual(['week'])
  })

  it('неделя: события со временем в колонках, многодневные — в строке «весь день»', () => {
    const wrapper = mount(UidCalendar, {
      props: {
        view: 'week',
        anchor: '2026-11-04',
        events: [
          { date: '2026-11-03', time: '10:00', endTime: '11:00', title: 'Демо' },
          { date: '2026-11-02', endDate: '2026-11-06', title: 'Код-фриз' },
        ],
      },
    })
    expect(wrapper.findAll('.uid-calendar__col')).toHaveLength(7)
    expect(wrapper.find('.uid-calendar__col[data-date="2026-11-03"] .uid-calendar__block').text()).toContain('Демо')
    expect(wrapper.findAll('.uid-calendar__allday-cell .uid-calendar__event')).toHaveLength(5)
    expect(wrapper.find('.uid-calendar__title').text()).toBe('2 – 8 ноября 2026')
  })

  it('день: заголовок с днём недели', () => {
    const wrapper = mount(UidCalendar, { props: { view: 'day', anchor: '2026-11-04' } })
    expect(wrapper.findAll('.uid-calendar__col')).toHaveLength(1)
    expect(wrapper.find('.uid-calendar__title').text()).toBe('Среда, 4 ноября 2026')
  })

  it('год: 12 месяцев, дни с событиями отмечены', () => {
    const wrapper = mount(UidCalendar, {
      props: { view: 'year', anchor: '2026-05-01', events: [{ date: '2026-03-08', title: 'x' }] },
    })
    expect(wrapper.findAll('.uid-calendar__mini')).toHaveLength(12)
    expect(wrapper.find('.uid-calendar__mini-day--busy').attributes('aria-label')).toBe('2026-03-08')
  })

  it('повестка: дни с событиями и пустое состояние', async () => {
    const wrapper = mount(UidCalendar, {
      props: { view: 'agenda', anchor: '2026-11-01', events: [{ date: '2026-11-03', time: '10:00', endTime: '11:00', title: 'Демо' }] },
    })
    expect(wrapper.find('.uid-calendar__agenda-date').text()).toBe('Вторник, 3 ноября')
    expect(wrapper.find('.uid-calendar__agenda-time').text()).toBe('10:00–11:00')
    await wrapper.setProps({ anchor: '2026-12-01' })
    expect(wrapper.find('.uid-calendar__empty').exists()).toBe(true)
  })

  it('клик по пустому месту сетки — slot-click только в режиме правки', async () => {
    const wrapper = mount(UidCalendar, { props: { view: 'day', anchor: '2026-11-04', editable: true } })
    await wrapper.find('.uid-calendar__col').trigger('click', { clientY: 0 })
    expect(wrapper.emitted('slot-click')?.[0]).toEqual([{ date: '2026-11-04', time: '00:00' }])
  })
  afterEach(() => {
    // @ts-expect-error -- restore jsdom's missing method
    delete document.elementFromPoint
  })

  it('месяц: у однодневного и многодневного события есть ручка конца; её протяжка даёт новый endDate', async () => {
    const events: CalendarEvent[] = [
      { id: 1, date: '2026-11-03', title: 'Весь день' },
      { id: 2, date: '2026-11-10', endDate: '2026-11-12', title: 'Фриз' },
      { id: 3, date: '2026-11-05', time: '10:00', endTime: '11:00', title: 'Встреча' },
    ]
    const wrapper = mount(UidCalendar, { attachTo: document.body, props: { anchor: '2026-11-04', editable: true, events } })
    const day = (iso: string) => wrapper.find(`.uid-calendar__day[data-date="${iso}"]`)
    expect(day('2026-11-03').find('.uid-calendar__resize--end').attributes('aria-label')).toBe('Потяните, чтобы изменить окончание')
    expect(day('2026-11-10').find('.uid-calendar__resize--end').exists()).toBe(false)
    expect(day('2026-11-12').find('.uid-calendar__resize--end').exists()).toBe(true)
    expect(day('2026-11-05').find('.uid-calendar__resize--end').exists()).toBe(false)

    await dragTo(day('2026-11-03').find('.uid-calendar__resize--end'), wrapper.element as HTMLElement, '2026-11-06')
    const first = wrapper.emitted('event-move')?.[0]?.[0] as CalendarEventMove
    expect(first).toEqual({ event: events[0], date: '2026-11-03', endDate: '2026-11-06' })

    await dragTo(day('2026-11-12').find('.uid-calendar__resize--end'), wrapper.element as HTMLElement, '2026-11-01')
    // The end never goes before the start: the event shrinks to its first day.
    expect(wrapper.emitted('event-move')?.[1]?.[0]).toEqual({ event: events[1], date: '2026-11-10', endDate: '2026-11-10' })
    wrapper.unmount()
  })

  it('месяц: перетаскивание события переносит его', async () => {
    const events: CalendarEvent[] = [{ id: 1, date: '2026-11-03', title: 'A' }]
    const wrapper = mount(UidCalendar, { attachTo: document.body, props: { anchor: '2026-11-04', editable: true, events } })
    await dragTo(wrapper.find('.uid-calendar__day[data-date="2026-11-03"] .uid-calendar__event'), wrapper.element as HTMLElement, '2026-11-07')
    expect(wrapper.emitted('event-move')?.[0]?.[0]).toEqual({ event: events[0], date: '2026-11-07' })
    wrapper.unmount()
  })

  it('editable: false у события — ни переноса, ни растягивания', async () => {
    const events: CalendarEvent[] = [
      { id: 1, date: '2026-11-03', title: 'Закреплено', editable: false },
      { id: 2, date: '2026-11-04', time: '10:00', endTime: '11:00', title: 'Встреча', editable: false },
      { id: 3, date: '2026-11-04', time: '12:00', endTime: '13:00', title: 'Своё', editable: true },
    ]
    const month = mount(UidCalendar, { attachTo: document.body, props: { anchor: '2026-11-04', editable: true, events } })
    const chip = month.find('.uid-calendar__day[data-date="2026-11-03"] .uid-calendar__event')
    expect(chip.classes()).not.toContain('uid-calendar__event--draggable')
    expect(chip.find('.uid-calendar__resize--end').exists()).toBe(false)
    await dragTo(chip, month.element as HTMLElement, '2026-11-07')
    expect(month.emitted('event-move')).toBeUndefined()
    month.unmount()

    const week = mount(UidCalendar, { attachTo: document.body, props: { view: 'week', anchor: '2026-11-04', editable: true, events } })
    const [locked, own] = week.findAll('.uid-calendar__col[data-date="2026-11-04"] .uid-calendar__block')
    expect(locked!.find('.uid-calendar__resize').exists()).toBe(false)
    expect(locked!.classes()).not.toContain('uid-calendar__block--draggable')
    expect(own!.find('.uid-calendar__resize').exists()).toBe(true)
    expect(own!.classes()).toContain('uid-calendar__block--draggable')
    await dragTo(locked!, week.element as HTMLElement, '2026-11-06')
    expect(week.emitted('event-move')).toBeUndefined()
    // A click still opens it.
    await locked!.trigger('click')
    expect(week.emitted('event-click')?.[0]?.[0]).toMatchObject({ id: 2 })
    week.unmount()
  })

  it('selectable без editable: slot-click есть, ручек и переноса нет', async () => {
    const wrapper = mount(UidCalendar, {
      props: { view: 'week', anchor: '2026-11-04', selectable: true, events: [{ date: '2026-11-04', time: '10:00', endTime: '11:00', title: 'X' }] },
    })
    expect(wrapper.classes()).toContain('uid-calendar--selectable')
    expect(wrapper.classes()).not.toContain('uid-calendar--editable')
    expect(wrapper.find('.uid-calendar__resize').exists()).toBe(false)
    await wrapper.find('.uid-calendar__col[data-date="2026-11-05"]').trigger('click', { clientY: 0 })
    await wrapper.find('.uid-calendar__allday-cell[data-date="2026-11-06"]').trigger('click')
    expect(wrapper.emitted('slot-click')).toEqual([[{ date: '2026-11-05', time: '00:00' }], [{ date: '2026-11-06' }]])
  })

  it('selectable по умолчанию следует editable; selectable: false его выключает', async () => {
    const readOnly = mount(UidCalendar, { props: { view: 'day', anchor: '2026-11-04' } })
    expect(readOnly.classes()).not.toContain('uid-calendar--selectable')
    await readOnly.find('.uid-calendar__col').trigger('click', { clientY: 0 })
    expect(readOnly.emitted('slot-click')).toBeUndefined()

    const editable = mount(UidCalendar, { props: { view: 'day', anchor: '2026-11-04', editable: true } })
    expect(editable.classes()).toContain('uid-calendar--selectable')

    const noSlots = mount(UidCalendar, { props: { view: 'day', anchor: '2026-11-04', editable: true, selectable: false } })
    await noSlots.find('.uid-calendar__col').trigger('click', { clientY: 0 })
    expect(noSlots.emitted('slot-click')).toBeUndefined()
  })

  it('год: клик по дню сперва открывает его, затем выбирает (date-click как в месяце)', async () => {
    const order: string[] = []
    const wrapper = mount(UidCalendar, {
      props: {
        view: 'year',
        anchor: '2026-05-01',
        views: ['day', 'month', 'year'],
        'onUpdate:view': (v: CalendarView) => order.push(`view:${v}`),
        onDateClick: (iso: string) => order.push(`date:${iso}`),
      },
    })
    const day = wrapper.findAll('.uid-calendar__mini-day[aria-label="2026-03-08"]').find((b) => b.attributes('disabled') === undefined)!
    await day.trigger('click')
    expect(order).toEqual(['view:day', 'date:2026-03-08'])
    expect(wrapper.emitted('update:anchor')?.[0]).toEqual(['2026-03-08'])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-03-08'])
    expect(wrapper.emitted('date-click')?.[0]).toEqual(['2026-03-08'])
  })

  it('экспортирует типы событий и вспомогательные типы', () => {
    const view: CalendarView = 'month'
    const range: CalendarRange = { view, start: '2026-11-01', end: '2026-11-30' }
    const slot: CalendarSlot = { date: range.start, time: '10:00' }
    const move: CalendarEventMove = { event: { date: slot.date, title: 'x', editable: false }, date: '2026-11-02', endDate: '2026-11-03' }
    const props: UidCalendarProps = { selectable: true, editable: false, events: [move.event] }
    expect(props.events).toHaveLength(1)
  })
})

