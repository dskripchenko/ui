import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidCheckbox from './UidCheckbox.vue'

describe('UidCheckbox', () => {
  it('рендерит label', () => {
    const wrapper = mount(UidCheckbox, { props: { label: 'Принять условия' } })
    expect(wrapper.find('.uid-checkbox__text').text()).toContain('Принять условия')
  })

  it('показывает * при required=true', () => {
    const wrapper = mount(UidCheckbox, { props: { label: 'Текст', required: true } })
    expect(wrapper.find('.uid-checkbox__required').exists()).toBe(true)
  })

  it('показывает hint', () => {
    const wrapper = mount(UidCheckbox, { props: { hint: 'Подсказка' } })
    expect(wrapper.find('.uid-checkbox__hint').text()).toBe('Подсказка')
  })

  it('показывает ошибку и добавляет error-класс', () => {
    const wrapper = mount(UidCheckbox, { props: { error: 'Ошибка' } })
    expect(wrapper.find('.uid-checkbox__hint--error').text()).toBe('Ошибка')
    expect(wrapper.classes()).toContain('uid-checkbox--error')
  })

  it('применяет disabled', () => {
    const wrapper = mount(UidCheckbox, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('uid-checkbox--disabled')
  })

  it('эмитит change при переключении', async () => {
    const wrapper = mount(UidCheckbox, { props: { modelValue: false } })
    await wrapper.find('input').trigger('change')
    expect(wrapper.emitted('change')).toBeDefined()
  })

  it('отображает box-элемент', () => {
    const wrapper = mount(UidCheckbox)
    expect(wrapper.find('.uid-checkbox__box').exists()).toBe(true)
  })

  it('устанавливает aria-invalid при ошибке', () => {
    const wrapper = mount(UidCheckbox, { props: { error: 'Ошибка' } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('не рендерит hint-блок без hint/error', () => {
    const wrapper = mount(UidCheckbox, { props: { label: 'Текст' } })
    expect(wrapper.find('.uid-checkbox__hint').exists()).toBe(false)
  })
})
