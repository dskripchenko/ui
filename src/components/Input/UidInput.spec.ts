import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidInput from './UidInput.vue'

describe('UidInput', () => {
  it('рендерит label', () => {
    const wrapper = mount(UidInput, { props: { label: 'Email' } })
    expect(wrapper.find('.uid-input-field__label').text()).toContain('Email')
  })

  it('связывает label[for] и input[id]', () => {
    const wrapper = mount(UidInput, { props: { label: 'Email', id: 'email-field' } })
    expect(wrapper.find('label').attributes('for')).toBe('email-field')
    expect(wrapper.find('input').attributes('id')).toBe('email-field')
  })

  it('показывает * при required=true', () => {
    const wrapper = mount(UidInput, { props: { label: 'Email', required: true } })
    expect(wrapper.find('.uid-input-field__required').exists()).toBe(true)
  })

  it('показывает hint', () => {
    const wrapper = mount(UidInput, { props: { hint: 'Подсказка' } })
    expect(wrapper.find('.uid-input-field__hint').text()).toBe('Подсказка')
  })

  it('показывает внешнюю ошибку и добавляет error-класс', () => {
    const wrapper = mount(UidInput, { props: { error: 'Ошибка!' } })
    expect(wrapper.find('.uid-input-field__hint--error').text()).toBe('Ошибка!')
    expect(wrapper.classes()).toContain('uid-input-field--error')
  })

  it('внешняя ошибка перекрывает hint', () => {
    const wrapper = mount(UidInput, { props: { hint: 'Подсказка', error: 'Ошибка' } })
    expect(wrapper.find('.uid-input-field__hint').text()).toBe('Ошибка')
  })

  it('применяет disabled', () => {
    const wrapper = mount(UidInput, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('uid-input-field--disabled')
  })

  it('применяет readonly', () => {
    const wrapper = mount(UidInput, { props: { readonly: true } })
    expect(wrapper.find('input').attributes('readonly')).toBeDefined()
    expect(wrapper.classes()).toContain('uid-input-field--readonly')
  })

  it('применяет size классы', () => {
    const sm = mount(UidInput, { props: { size: 'sm' } })
    expect(sm.classes()).toContain('uid-input-field--sm')
    const lg = mount(UidInput, { props: { size: 'lg' } })
    expect(lg.classes()).toContain('uid-input-field--lg')
  })

  it('эмитит blur', async () => {
    const wrapper = mount(UidInput)
    await wrapper.find('input').trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('эмитит focus', async () => {
    const wrapper = mount(UidInput)
    await wrapper.find('input').trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('устанавливает aria-invalid при ошибке', () => {
    const wrapper = mount(UidInput, { props: { error: 'Ошибка' } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('не показывает prepend-слот если не передан', () => {
    const wrapper = mount(UidInput)
    expect(wrapper.find('.uid-input-field__prepend').exists()).toBe(false)
  })

  it('рендерит prepend-слот', () => {
    const wrapper = mount(UidInput, { slots: { prepend: '<span class="icon" />' } })
    expect(wrapper.find('.uid-input-field__prepend').exists()).toBe(true)
  })

  it('валидирует через expose validate()', async () => {
    const wrapper = mount(UidInput, { props: { rules: 'required', id: 'f' } })
    const result = (wrapper.vm as { validate: () => boolean }).validate()
    expect(result).toBe(false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.uid-input-field__hint--error').exists()).toBe(true)
  })

  it('проходит валидацию с заполненным полем', async () => {
    const wrapper = mount(UidInput, {
      props: { rules: 'required', modelValue: 'test', id: 'f' },
    })
    const result = (wrapper.vm as { validate: () => boolean }).validate()
    expect(result).toBe(true)
  })
})
