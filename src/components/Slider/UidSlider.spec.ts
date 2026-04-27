import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSlider from './UidSlider.vue'

describe('UidSlider', () => {
  it('рендерит input[type=range]', () => {
    const wrapper = mount(UidSlider)
    expect(wrapper.find('input[type="range"]').exists()).toBe(true)
  })

  it('устанавливает min/max/step на input', () => {
    const wrapper = mount(UidSlider, { props: { min: 10, max: 200, step: 5 } })
    const input = wrapper.find('input')
    expect(input.attributes('min')).toBe('10')
    expect(input.attributes('max')).toBe('200')
    expect(input.attributes('step')).toBe('5')
  })

  it('v-model обновляется при изменении input', async () => {
    const wrapper = mount(UidSlider, { props: { modelValue: 50, 'onUpdate:modelValue': (v: number) => wrapper.setProps({ modelValue: v }) } })
    await wrapper.find('input').setValue(75)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('рендерит label', () => {
    const wrapper = mount(UidSlider, { props: { label: 'Громкость' } })
    expect(wrapper.find('.uid-slider__label').text()).toBe('Громкость')
  })

  it('не рендерит header без label и showValue', () => {
    const wrapper = mount(UidSlider)
    expect(wrapper.find('.uid-slider__header').exists()).toBe(false)
  })

  it('рендерит текущее значение при showValue=true', () => {
    const wrapper = mount(UidSlider, { props: { modelValue: 42, showValue: true } })
    expect(wrapper.find('.uid-slider__value').text()).toBe('42')
  })

  it('применяет formatValue', () => {
    const wrapper = mount(UidSlider, {
      props: { modelValue: 50, showValue: true, formatValue: (v: number) => `${v}%` },
    })
    expect(wrapper.find('.uid-slider__value').text()).toBe('50%')
  })

  it('применяет disabled класс', () => {
    const wrapper = mount(UidSlider, { props: { disabled: true } })
    expect(wrapper.classes()).toContain('uid-slider--disabled')
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('устанавливает aria-valuemin/max/now', () => {
    const wrapper = mount(UidSlider, { props: { min: 0, max: 100, modelValue: 60 } })
    const input = wrapper.find('input')
    expect(input.attributes('aria-valuemin')).toBe('0')
    expect(input.attributes('aria-valuemax')).toBe('100')
    expect(input.attributes('aria-valuenow')).toBe('60')
  })
})
