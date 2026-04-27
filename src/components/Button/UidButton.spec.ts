import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidButton from './UidButton.vue'

describe('UidButton', () => {
  it('рендерит с классами по умолчанию', () => {
    const wrapper = mount(UidButton, { slots: { default: 'OK' } })
    expect(wrapper.classes()).toContain('uid-button')
    expect(wrapper.classes()).toContain('uid-button--primary')
    expect(wrapper.classes()).toContain('uid-button--md')
  })

  it('применяет variant и size классы', () => {
    const wrapper = mount(UidButton, {
      props: { variant: 'danger', size: 'lg' },
      slots: { default: 'Удалить' },
    })
    expect(wrapper.classes()).toContain('uid-button--danger')
    expect(wrapper.classes()).toContain('uid-button--lg')
  })

  it('эмитит click при нажатии', async () => {
    const wrapper = mount(UidButton, { slots: { default: 'OK' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('не эмитит click при disabled', async () => {
    const wrapper = mount(UidButton, { props: { disabled: true }, slots: { default: 'OK' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('не эмитит click при loading', async () => {
    const wrapper = mount(UidButton, { props: { loading: true }, slots: { default: 'OK' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('выставляет атрибут disabled при disabled=true', () => {
    const wrapper = mount(UidButton, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('выставляет data-loading при loading=true', () => {
    const wrapper = mount(UidButton, { props: { loading: true } })
    expect(wrapper.attributes('data-loading')).toBe('true')
  })

  it('рендерит slot prepend', () => {
    const wrapper = mount(UidButton, {
      slots: { default: 'Текст', prepend: '<span class="icon" />' },
    })
    expect(wrapper.find('.uid-button__prepend').exists()).toBe(true)
  })

  it('рендерит slot append', () => {
    const wrapper = mount(UidButton, {
      slots: { default: 'Текст', append: '<span class="icon" />' },
    })
    expect(wrapper.find('.uid-button__append').exists()).toBe(true)
  })

  it('прокидывает prop type на нативный button', () => {
    const wrapper = mount(UidButton, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })
})
