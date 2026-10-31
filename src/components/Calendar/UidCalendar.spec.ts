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
})

