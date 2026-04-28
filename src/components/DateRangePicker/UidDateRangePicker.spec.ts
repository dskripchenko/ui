import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidDateRangePicker from './UidDateRangePicker.vue'

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
})
