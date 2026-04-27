import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidDatePicker from './UidDatePicker.vue'

describe('UidDatePicker', () => {
  it('рендерит placeholder по умолчанию', () => {
    const wrapper = mount(UidDatePicker)
    expect(wrapper.find('.uid-datepicker__value').text()).toBe('Выберите дату')
    expect(wrapper.find('.uid-datepicker__value').classes()).toContain('uid-datepicker__value--placeholder')
  })

  it('показывает отформатированную дату', () => {
    const wrapper = mount(UidDatePicker, { props: { modelValue: '2025-04-15' } })
    expect(wrapper.find('.uid-datepicker__value').text()).toBe('15.04.2025')
  })

  it('применяет кастомный format', () => {
    const wrapper = mount(UidDatePicker, {
      props: {
        modelValue: '2025-04-15',
        format: (d: Date) => `${d.getDate()} апреля ${d.getFullYear()}`,
      },
    })
    expect(wrapper.find('.uid-datepicker__value').text()).toBe('15 апреля 2025')
  })

  it('открывает панель при клике', async () => {
    const wrapper = mount(UidDatePicker)
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    expect(wrapper.find('.uid-datepicker__panel').exists()).toBe(true)
  })

  it('закрывает панель повторным кликом', async () => {
    const wrapper = mount(UidDatePicker)
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    expect(wrapper.find('.uid-datepicker__panel').exists()).toBe(false)
  })

  it('рендерит 42 дня в сетке', async () => {
    const wrapper = mount(UidDatePicker)
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    expect(wrapper.findAll('.uid-datepicker__day')).toHaveLength(42)
  })

  it('рендерит заголовки дней недели', async () => {
    const wrapper = mount(UidDatePicker)
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    const weekdays = wrapper.findAll('.uid-datepicker__weekday')
    expect(weekdays).toHaveLength(7)
    expect(weekdays[0].text()).toBe('Пн')
  })

  it('выбирает день при клике', async () => {
    const wrapper = mount(UidDatePicker)
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    const days = wrapper.findAll('.uid-datepicker__day')
    const clickable = days.find(d =>
      !d.classes().includes('uid-datepicker__day--other') &&
      !d.classes().includes('uid-datepicker__day--disabled'),
    )!
    await clickable.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('переходит к следующему месяцу', async () => {
    const wrapper = mount(UidDatePicker, { props: { modelValue: '2025-01-01' } })
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    const label = wrapper.find('.uid-datepicker__month-label')
    const initial = label.text()
    await wrapper.findAll('.uid-datepicker__nav-btn')[1].trigger('click')
    expect(label.text()).not.toBe(initial)
  })

  it('переходит к предыдущему месяцу', async () => {
    const wrapper = mount(UidDatePicker, { props: { modelValue: '2025-06-01' } })
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    const label = wrapper.find('.uid-datepicker__month-label')
    const initial = label.text()
    await wrapper.findAll('.uid-datepicker__nav-btn')[0].trigger('click')
    expect(label.text()).not.toBe(initial)
  })

  it('отключает дни за пределами min/max', async () => {
    const wrapper = mount(UidDatePicker, {
      props: { min: '2025-04-10', max: '2025-04-20', modelValue: '2025-04-15' },
    })
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    const disabled = wrapper.findAll('.uid-datepicker__day--disabled')
    expect(disabled.length).toBeGreaterThan(0)
  })

  it('рендерит кнопку clear при наличии значения', () => {
    const wrapper = mount(UidDatePicker, { props: { modelValue: '2025-04-15' } })
    expect(wrapper.find('.uid-datepicker__clear').exists()).toBe(true)
  })

  it('очищает значение при клике на clear', async () => {
    const wrapper = mount(UidDatePicker, { props: { modelValue: '2025-04-15' } })
    await wrapper.find('.uid-datepicker__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('не открывается при disabled=true', async () => {
    const wrapper = mount(UidDatePicker, { props: { disabled: true } })
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    expect(wrapper.find('.uid-datepicker__panel').exists()).toBe(false)
  })
})
