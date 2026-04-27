import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTextarea from './UidTextarea.vue'

describe('UidTextarea', () => {
  it('рендерит label', () => {
    const wrapper = mount(UidTextarea, { props: { label: 'Комментарий' } })
    expect(wrapper.find('.uid-textarea-field__label').text()).toContain('Комментарий')
  })

  it('связывает label[for] и textarea[id]', () => {
    const wrapper = mount(UidTextarea, { props: { label: 'Текст', id: 'ta-1' } })
    expect(wrapper.find('label').attributes('for')).toBe('ta-1')
    expect(wrapper.find('textarea').attributes('id')).toBe('ta-1')
  })

  it('показывает * при required=true', () => {
    const wrapper = mount(UidTextarea, { props: { label: 'Текст', required: true } })
    expect(wrapper.find('.uid-textarea-field__required').exists()).toBe(true)
  })

  it('показывает hint', () => {
    const wrapper = mount(UidTextarea, { props: { hint: 'Подсказка' } })
    expect(wrapper.find('.uid-textarea-field__hint').text()).toBe('Подсказка')
  })

  it('показывает ошибку и добавляет error-класс', () => {
    const wrapper = mount(UidTextarea, { props: { error: 'Ошибка!' } })
    expect(wrapper.find('.uid-textarea-field__hint--error').text()).toBe('Ошибка!')
    expect(wrapper.classes()).toContain('uid-textarea-field--error')
  })

  it('внешняя ошибка перекрывает hint', () => {
    const wrapper = mount(UidTextarea, { props: { hint: 'Подсказка', error: 'Ошибка' } })
    expect(wrapper.find('.uid-textarea-field__hint').text()).toBe('Ошибка')
  })

  it('применяет disabled', () => {
    const wrapper = mount(UidTextarea, { props: { disabled: true } })
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('uid-textarea-field--disabled')
  })

  it('применяет readonly', () => {
    const wrapper = mount(UidTextarea, { props: { readonly: true } })
    expect(wrapper.find('textarea').attributes('readonly')).toBeDefined()
    expect(wrapper.classes()).toContain('uid-textarea-field--readonly')
  })

  it('применяет size классы', () => {
    const sm = mount(UidTextarea, { props: { size: 'sm' } })
    expect(sm.classes()).toContain('uid-textarea-field--sm')
    const lg = mount(UidTextarea, { props: { size: 'lg' } })
    expect(lg.classes()).toContain('uid-textarea-field--lg')
  })

  it('устанавливает aria-invalid при ошибке', () => {
    const wrapper = mount(UidTextarea, { props: { error: 'Ошибка' } })
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true')
  })

  it('передаёт rows в textarea', () => {
    const wrapper = mount(UidTextarea, { props: { rows: 5 } })
    expect(wrapper.find('textarea').attributes('rows')).toBe('5')
  })

  it('валидирует через expose validate()', async () => {
    const wrapper = mount(UidTextarea, { props: { rules: 'required', id: 'ta' } })
    const result = (wrapper.vm as { validate: () => boolean }).validate()
    expect(result).toBe(false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.uid-textarea-field__hint--error').exists()).toBe(true)
  })
})
