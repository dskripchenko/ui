import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidAlert from './UidAlert.vue'

describe('UidAlert', () => {
  it('рендерит slot-контент', () => {
    const wrapper = mount(UidAlert, { slots: { default: 'Текст предупреждения' } })
    expect(wrapper.find('.uid-alert__body').text()).toBe('Текст предупреждения')
  })

  it('применяет variant класс', () => {
    expect(mount(UidAlert, { props: { variant: 'success' } }).classes()).toContain('uid-alert--success')
    expect(mount(UidAlert, { props: { variant: 'danger' } }).classes()).toContain('uid-alert--danger')
  })

  it('рендерит title', () => {
    const wrapper = mount(UidAlert, { props: { title: 'Заголовок' } })
    expect(wrapper.find('.uid-alert__title').text()).toBe('Заголовок')
  })

  it('не рендерит title без prop', () => {
    const wrapper = mount(UidAlert)
    expect(wrapper.find('.uid-alert__title').exists()).toBe(false)
  })

  it('не показывает кнопку закрытия без dismissible', () => {
    const wrapper = mount(UidAlert)
    expect(wrapper.find('.uid-alert__close').exists()).toBe(false)
  })

  it('показывает кнопку закрытия при dismissible=true', () => {
    const wrapper = mount(UidAlert, { props: { dismissible: true } })
    expect(wrapper.find('.uid-alert__close').exists()).toBe(true)
  })

  it('эмитит dismiss при нажатии на кнопку', async () => {
    const wrapper = mount(UidAlert, { props: { dismissible: true } })
    await wrapper.find('.uid-alert__close').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('role="alert" присутствует', () => {
    const wrapper = mount(UidAlert)
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('рендерит icon-слот', () => {
    const wrapper = mount(UidAlert, { slots: { icon: '<span class="custom-icon" />' } })
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })
})
