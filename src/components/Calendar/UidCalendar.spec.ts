import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidCalendar from './UidCalendar.vue'

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
})
