import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidColorPicker from './UidColorPicker.vue'

describe('UidColorPicker', () => {
  it('рендерит триггер с placeholder при пустом значении', () => {
    const wrapper = mount(UidColorPicker)
    expect(wrapper.find('.uid-colorpicker__trigger-label').text()).toBe('Выберите цвет')
    expect(wrapper.find('.uid-colorpicker__trigger-label').classes()).toContain('uid-colorpicker__trigger-label--empty')
  })

  it('показывает hex-значение модели', () => {
    const wrapper = mount(UidColorPicker, { props: { modelValue: '#ff0000' } })
    expect(wrapper.find('.uid-colorpicker__trigger-label').text()).toBe('#FF0000')
  })

  it('swatch получает background из модели', () => {
    const wrapper = mount(UidColorPicker, { props: { modelValue: '#00ff00' } })
    const swatch = wrapper.find('.uid-colorpicker__swatch')
    expect(swatch.attributes('style')).toContain('background')
  })

  it('открывает панель при клике', async () => {
    const wrapper = mount(UidColorPicker)
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    expect(wrapper.find('.uid-colorpicker__panel').exists()).toBe(true)
  })

  it('закрывает панель повторным кликом', async () => {
    const wrapper = mount(UidColorPicker)
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    expect(wrapper.find('.uid-colorpicker__panel').exists()).toBe(false)
  })

  it('не открывается при disabled=true', async () => {
    const wrapper = mount(UidColorPicker, { props: { disabled: true } })
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    expect(wrapper.find('.uid-colorpicker__panel').exists()).toBe(false)
  })

  it('рендерит градиент, hue-track и hex-input в открытом состоянии', async () => {
    const wrapper = mount(UidColorPicker)
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    expect(wrapper.find('.uid-colorpicker__gradient').exists()).toBe(true)
    expect(wrapper.find('.uid-colorpicker__hue-track').exists()).toBe(true)
    expect(wrapper.find('.uid-colorpicker__hex-input').exists()).toBe(true)
  })

  it('не рендерит alpha-track без alpha prop', async () => {
    const wrapper = mount(UidColorPicker)
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    expect(wrapper.find('.uid-colorpicker__alpha-track').exists()).toBe(false)
  })

  it('рендерит alpha-track при alpha=true', async () => {
    const wrapper = mount(UidColorPicker, { props: { alpha: true } })
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    expect(wrapper.find('.uid-colorpicker__alpha-track').exists()).toBe(true)
  })

  it('рендерит presets', async () => {
    const presets = ['#ff0000', '#00ff00', '#0000ff']
    const wrapper = mount(UidColorPicker, { props: { presets } })
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    const buttons = wrapper.findAll('.uid-colorpicker__preset')
    expect(buttons).toHaveLength(3)
  })

  it('не рендерит presets без prop', async () => {
    const wrapper = mount(UidColorPicker)
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    expect(wrapper.find('.uid-colorpicker__presets').exists()).toBe(false)
  })

  it('выбор preset эмитит update:modelValue', async () => {
    const presets = ['#ff0000']
    const wrapper = mount(UidColorPicker, { props: { presets } })
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    await wrapper.find('.uid-colorpicker__preset').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('выбор preset эмитит change', async () => {
    const presets = ['#ff0000']
    const wrapper = mount(UidColorPicker, { props: { presets } })
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    await wrapper.find('.uid-colorpicker__preset').trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('hex-input содержит текущий цвет при открытии', async () => {
    const wrapper = mount(UidColorPicker, { props: { modelValue: '#3b82f6' } })
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    const input = wrapper.find('.uid-colorpicker__hex-input')
    expect((input.element as HTMLInputElement).value).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('применяет css-класс --disabled', () => {
    const wrapper = mount(UidColorPicker, { props: { disabled: true } })
    expect(wrapper.find('.uid-colorpicker').classes()).toContain('uid-colorpicker--disabled')
  })

  it('применяет css-класс --open при открытии', async () => {
    const wrapper = mount(UidColorPicker)
    await wrapper.find('.uid-colorpicker__trigger').trigger('click')
    expect(wrapper.find('.uid-colorpicker').classes()).toContain('uid-colorpicker--open')
  })
})
