import { mount, config } from '@vue/test-utils'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import UidDateRangePicker from './UidDateRangePicker.vue'

// The panel is teleported to the body; render it in place so the wrapper finds it.
beforeAll(() => { config.global.stubs.teleport = true })
afterAll(() => { delete config.global.stubs.teleport })

describe('UidDateRangePicker', () => {
  it('показывает плейсхолдер без значения', () => {
    const wrapper = mount(UidDateRangePicker, { props: { placeholder: 'Период' } })
    expect(wrapper.find('.uid-daterange__value').text()).toBe('Период')
  })

  it('форматирует диапазон', () => {
    const wrapper = mount(UidDateRangePicker, {
      props: { modelValue: { start: '2026-01-01', end: '2026-01-15' } },
    })
    expect(wrapper.find('.uid-daterange__value').text()).toBe('01.01.2026 — 15.01.2026')
  })

  it('открывает панель по клику', async () => {
    const wrapper = mount(UidDateRangePicker)
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    expect(wrapper.classes()).toContain('uid-daterange--open')
    expect(wrapper.find('.uid-daterange__panel').exists()).toBe(true)
  })

  it('рендерит две сетки месяцев', async () => {
    const wrapper = mount(UidDateRangePicker)
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    expect(wrapper.findAll('.uid-daterange__month')).toHaveLength(2)
  })

  it('очищает значение', async () => {
    const wrapper = mount(UidDateRangePicker, {
      props: { modelValue: { start: '2026-01-01', end: '2026-01-15' } },
    })
    await wrapper.find('.uid-daterange__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([{ start: null, end: null }])
  })

  it('не открывается при disabled', async () => {
    const wrapper = mount(UidDateRangePicker, { props: { disabled: true } })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    expect(wrapper.find('.uid-daterange__panel').exists()).toBe(false)
  })

  it('применяет пресет на N дней', async () => {
    const wrapper = mount(UidDateRangePicker)
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    const presets = wrapper.findAll('.uid-daterange__btn')
    await presets[0].trigger('click')
    const evt = wrapper.emitted('update:modelValue')?.[0]?.[0] as { start: string; end: string }
    expect(evt.start).toBeTruthy()
    expect(evt.end).toBeTruthy()
  })

  it('кастомный format используется', () => {
    const fmt = (d: Date): string => `${d.getFullYear()}/${d.getMonth() + 1}`
    const wrapper = mount(UidDateRangePicker, {
      props: {
        modelValue: { start: '2026-01-15', end: '2026-02-20' },
        format: fmt,
      },
    })
    expect(wrapper.find('.uid-daterange__value').text()).toBe('2026/1 — 2026/2')
  })

  it('показывает частичный диапазон с ...', () => {
    const wrapper = mount(UidDateRangePicker, {
      props: { modelValue: { start: '2026-01-01', end: null } },
    })
    expect(wrapper.find('.uid-daterange__value').text()).toBe('01.01.2026 — ...')
  })

  it('без withTime выбор двух дней закрывает панель и эмитит даты без времени', async () => {
    const wrapper = mount(UidDateRangePicker, {
      props: { modelValue: { start: '2026-03-01', end: '2026-03-02' } },
    })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    const days = wrapper.findAll('.uid-daterange__month')[0].findAll('.uid-daterange__day:not([disabled])')
    await days[4].trigger('click')
    await days[9].trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([{ start: '2026-03-05', end: '2026-03-10' }])
    expect(wrapper.find('.uid-daterange__panel').exists()).toBe(false)
  })

  it('withTime: выбор дней даёт 00:00 и 23:59 и оставляет панель открытой', async () => {
    const wrapper = mount(UidDateRangePicker, {
      props: { withTime: true, modelValue: { start: '2026-03-01T00:00', end: '2026-03-02T23:59' } },
    })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    expect(wrapper.findAll('.uid-daterange__time')).toHaveLength(2)
    const days = wrapper.findAll('.uid-daterange__month')[0].findAll('.uid-daterange__day:not([disabled])')
    await days[4].trigger('click')
    await days[9].trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([{ start: '2026-03-05T00:00', end: '2026-03-10T23:59' }])
    expect(wrapper.find('.uid-daterange__panel').exists()).toBe(true)
  })

  it('withTime: сохраняет уже выбранное время при смене дней', async () => {
    const wrapper = mount(UidDateRangePicker, {
      props: { withTime: true, modelValue: { start: '2026-03-01T09:30', end: '2026-03-02T18:00' } },
    })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    const days = wrapper.findAll('.uid-daterange__month')[0].findAll('.uid-daterange__day:not([disabled])')
    await days[2].trigger('click')
    await days[3].trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([{ start: '2026-03-03T09:30', end: '2026-03-04T18:00' }])
  })

  it('withTime: поле времени меняет время конца', async () => {
    const wrapper = mount(UidDateRangePicker, {
      props: { withTime: true, modelValue: { start: '2026-03-01T00:00', end: '2026-03-02T23:59' } },
    })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    const endInput = wrapper.find('.uid-daterange__time--end')
    expect((endInput.element as HTMLInputElement).value).toBe('23:59')
    await endInput.setValue('17:45')
    expect(wrapper.emitted('change')?.[0]).toEqual([{ start: '2026-03-01T00:00', end: '2026-03-02T17:45' }])
  })

  it('withTime: поля времени заблокированы без значения', async () => {
    const wrapper = mount(UidDateRangePicker, { props: { withTime: true } })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    const inputs = wrapper.findAll('.uid-daterange__time')
    expect(inputs[0].attributes('disabled')).toBeDefined()
    expect(inputs[1].attributes('disabled')).toBeDefined()
  })

  it('withTime: показывает время в значении', () => {
    const wrapper = mount(UidDateRangePicker, {
      props: { withTime: true, modelValue: { start: '2026-01-01T08:15', end: '2026-01-15T20:00' } },
    })
    expect(wrapper.find('.uid-daterange__value').text()).toBe('01.01.2026 08:15 — 15.01.2026 20:00')
  })

  it('withTime: format получает Date со временем', () => {
    const fmt = (d: Date): string => `${d.getHours()}:${d.getMinutes()}`
    const wrapper = mount(UidDateRangePicker, {
      props: { withTime: true, format: fmt, modelValue: { start: '2026-01-01T08:15', end: '2026-01-15T20:05' } },
    })
    expect(wrapper.find('.uid-daterange__value').text()).toBe('8:15 — 20:5')
  })

  it('по умолчанию рендерит три встроенных пресета', async () => {
    const wrapper = mount(UidDateRangePicker)
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    expect(wrapper.findAll('.uid-daterange__btn')).toHaveLength(3)
  })

  it('кастомные presets заменяют встроенные', async () => {
    const wrapper = mount(UidDateRangePicker, {
      props: {
        presets: [
          { label: 'Январь', range: () => ({ start: '2026-01-01', end: '2026-01-31' }) },
          { label: 'Февраль', range: () => ({ start: '2026-02-01', end: '2026-02-28' }) },
        ],
      },
    })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    const buttons = wrapper.findAll('.uid-daterange__btn')
    expect(buttons.map((b) => b.text())).toEqual(['Январь', 'Февраль'])
    await buttons[1].trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([{ start: '2026-02-01', end: '2026-02-28' }])
    expect(wrapper.find('.uid-daterange__panel').exists()).toBe(false)
  })

  it('presets=false скрывает пресеты', async () => {
    const wrapper = mount(UidDateRangePicker, { props: { presets: false } })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    expect(wrapper.find('.uid-daterange__footer').exists()).toBe(false)
  })

  it('presets=[] скрывает пресеты', async () => {
    const wrapper = mount(UidDateRangePicker, { props: { presets: [] } })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    expect(wrapper.find('.uid-daterange__footer').exists()).toBe(false)
  })

  it('withTime: пресет без времени дополняется 00:00 и 23:59', async () => {
    const wrapper = mount(UidDateRangePicker, {
      props: {
        withTime: true,
        presets: [{ label: 'Январь', range: () => ({ start: '2026-01-01', end: '2026-01-31' }) }],
      },
    })
    await wrapper.find('.uid-daterange__trigger').trigger('click')
    await wrapper.find('.uid-daterange__btn').trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([{ start: '2026-01-01T00:00', end: '2026-01-31T23:59' }])
  })
})
