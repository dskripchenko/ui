import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidNumberInput from './UidNumberInput.vue'

describe('UidNumberInput', () => {
  it('рендерит label и связывает с input', () => {
    const wrapper = mount(UidNumberInput, { props: { label: 'Кол-во', id: 'qty' } })
    expect(wrapper.find('label').attributes('for')).toBe('qty')
    expect(wrapper.find('input').attributes('id')).toBe('qty')
  })

  it('инкрементирует при клике на +', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 5, step: 2 } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([7])
  })

  it('декрементирует при клике на −', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 5, step: 1 } })
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([4])
  })

  it('эмитит change при изменении', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 0 } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([1])
  })

  it('блокирует декремент на min', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 0, min: 0 } })
    expect(wrapper.findAll('button')[0].attributes('disabled')).toBeDefined()
  })

  it('блокирует инкремент на max', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 10, max: 10 } })
    expect(wrapper.findAll('button')[1].attributes('disabled')).toBeDefined()
  })

  it('обрезает значение в clamp на blur', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 50, max: 10 } })
    await wrapper.find('input').trigger('blur')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10])
  })

  it('инкремент через ArrowUp', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 1 } })
    await wrapper.find('input').trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
  })

  it('декремент через ArrowDown', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 5 } })
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([4])
  })

  it('применяет precision', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 1, step: 0.1, precision: 1 } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1.1])
  })

  it('null при пустом значении', async () => {
    const wrapper = mount(UidNumberInput, { props: { modelValue: 5 } })
    const input = wrapper.find('input').element as HTMLInputElement
    input.value = ''
    await wrapper.find('input').trigger('input')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('применяет size классы', () => {
    const sm = mount(UidNumberInput, { props: { size: 'sm' } })
    expect(sm.classes()).toContain('uid-number-input--sm')
    const lg = mount(UidNumberInput, { props: { size: 'lg' } })
    expect(lg.classes()).toContain('uid-number-input--lg')
  })

  it('показывает ошибку и aria-invalid', () => {
    const wrapper = mount(UidNumberInput, { props: { error: 'Ошибка' } })
    expect(wrapper.find('.uid-number-input__hint--error').text()).toBe('Ошибка')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('не рендерит кнопки при controls=false', () => {
    const wrapper = mount(UidNumberInput, { props: { controls: false } })
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('применяет disabled', () => {
    const wrapper = mount(UidNumberInput, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('uid-number-input--disabled')
  })
})
