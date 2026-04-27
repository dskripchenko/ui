import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSwitch from './UidSwitch.vue'

describe('UidSwitch', () => {
  it('рендерит track и thumb', () => {
    const wrapper = mount(UidSwitch)
    expect(wrapper.find('.uid-switch__track').exists()).toBe(true)
    expect(wrapper.find('.uid-switch__thumb').exists()).toBe(true)
  })

  it('рендерит label', () => {
    const wrapper = mount(UidSwitch, { props: { label: 'Уведомления' } })
    expect(wrapper.find('.uid-switch__text').text()).toBe('Уведомления')
  })

  it('показывает * при required=true', () => {
    const wrapper = mount(UidSwitch, { props: { label: 'Текст', required: true } })
    expect(wrapper.find('.uid-switch__required').exists()).toBe(true)
  })

  it('показывает hint', () => {
    const wrapper = mount(UidSwitch, { props: { hint: 'Подсказка' } })
    expect(wrapper.find('.uid-switch__hint').text()).toBe('Подсказка')
  })

  it('показывает ошибку и добавляет error-класс', () => {
    const wrapper = mount(UidSwitch, { props: { error: 'Ошибка' } })
    expect(wrapper.find('.uid-switch__hint--error').text()).toBe('Ошибка')
    expect(wrapper.classes()).toContain('uid-switch--error')
  })

  it('применяет disabled', () => {
    const wrapper = mount(UidSwitch, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('uid-switch--disabled')
  })

  it('применяет size классы', () => {
    const sm = mount(UidSwitch, { props: { size: 'sm' } })
    expect(sm.classes()).toContain('uid-switch--sm')
    const lg = mount(UidSwitch, { props: { size: 'lg' } })
    expect(lg.classes()).toContain('uid-switch--lg')
  })

  it('эмитит change при переключении', async () => {
    const wrapper = mount(UidSwitch, { props: { modelValue: false } })
    await wrapper.find('input').trigger('change')
    expect(wrapper.emitted('change')).toBeDefined()
  })

  it('role="switch" присутствует', () => {
    const wrapper = mount(UidSwitch)
    expect(wrapper.find('input').attributes('role')).toBe('switch')
  })

  it('устанавливает aria-invalid при ошибке', () => {
    const wrapper = mount(UidSwitch, { props: { error: 'Ошибка' } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })
})
