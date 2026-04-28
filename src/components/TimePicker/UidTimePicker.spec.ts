import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTimePicker from './UidTimePicker.vue'

describe('UidTimePicker', () => {
  it('показывает плейсхолдер без значения', () => {
    const wrapper = mount(UidTimePicker, { props: { placeholder: 'Выбор' } })
    expect(wrapper.find('.uid-timepicker__value').text()).toBe('Выбор')
  })

  it('форматирует значение HH:MM', () => {
    const wrapper = mount(UidTimePicker, { props: { modelValue: '09:30' } })
    expect(wrapper.find('.uid-timepicker__value').text()).toBe('09:30')
  })

  it('форматирует с секундами при withSeconds', () => {
    const wrapper = mount(UidTimePicker, {
      props: { modelValue: '09:30:45', withSeconds: true },
    })
    expect(wrapper.find('.uid-timepicker__value').text()).toBe('09:30:45')
  })

  it('форматирует в 12-часовой системе при hour12', () => {
    const wrapper = mount(UidTimePicker, {
      props: { modelValue: '14:30', hour12: true },
    })
    expect(wrapper.find('.uid-timepicker__value').text()).toBe('02:30 PM')
  })

  it('открывает панель по клику', async () => {
    const wrapper = mount(UidTimePicker)
    await wrapper.find('.uid-timepicker__trigger').trigger('click')
    expect(wrapper.classes()).toContain('uid-timepicker--open')
    expect(wrapper.find('.uid-timepicker__panel').exists()).toBe(true)
  })

  it('очищает значение при clearable', async () => {
    const wrapper = mount(UidTimePicker, {
      props: { modelValue: '10:00', clearable: true },
    })
    await wrapper.find('.uid-timepicker__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('блокируется при disabled', () => {
    const wrapper = mount(UidTimePicker, { props: { disabled: true } })
    expect(wrapper.classes()).toContain('uid-timepicker--disabled')
  })

  it('не открывается при disabled', async () => {
    const wrapper = mount(UidTimePicker, { props: { disabled: true } })
    await wrapper.find('.uid-timepicker__trigger').trigger('click')
    expect(wrapper.find('.uid-timepicker__panel').exists()).toBe(false)
  })

  it('коммитит выбранное время по кнопке', async () => {
    const wrapper = mount(UidTimePicker, { props: { modelValue: null, step: 30 } })
    await wrapper.find('.uid-timepicker__trigger').trigger('click')
    const cells = wrapper.findAll('.uid-timepicker__cell')
    await cells[10].trigger('click')
    const btns = wrapper.findAll('.uid-timepicker__btn')
    await btns[btns.length - 1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('генерирует часы 0..23 по умолчанию', async () => {
    const wrapper = mount(UidTimePicker)
    await wrapper.find('.uid-timepicker__trigger').trigger('click')
    const firstCol = wrapper.find('.uid-timepicker__column')
    expect(firstCol.findAll('.uid-timepicker__cell')).toHaveLength(24)
  })

  it('генерирует часы 1..12 при hour12', async () => {
    const wrapper = mount(UidTimePicker, { props: { hour12: true } })
    await wrapper.find('.uid-timepicker__trigger').trigger('click')
    const firstCol = wrapper.find('.uid-timepicker__column')
    expect(firstCol.findAll('.uid-timepicker__cell')).toHaveLength(12)
  })
})
