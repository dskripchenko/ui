import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTag from './UidTag.vue'

describe('UidTag', () => {
  it('рендерит slot-контент', () => {
    const wrapper = mount(UidTag, { slots: { default: 'Статус' } })
    expect(wrapper.text()).toContain('Статус')
  })

  it('применяет variant класс', () => {
    expect(mount(UidTag, { props: { variant: 'success' } }).classes()).toContain('uid-tag--success')
    expect(mount(UidTag, { props: { variant: 'danger' } }).classes()).toContain('uid-tag--danger')
  })

  it('применяет size класс', () => {
    expect(mount(UidTag, { props: { size: 'sm' } }).classes()).toContain('uid-tag--sm')
  })

  it('не рендерит кнопку без dismissible', () => {
    const wrapper = mount(UidTag, { slots: { default: 'Tag' } })
    expect(wrapper.find('.uid-tag__dismiss').exists()).toBe(false)
  })

  it('рендерит кнопку при dismissible=true', () => {
    const wrapper = mount(UidTag, {
      props: { dismissible: true },
      slots: { default: 'Tag' },
    })
    expect(wrapper.find('.uid-tag__dismiss').exists()).toBe(true)
  })

  it('эмитит dismiss при клике на кнопку', async () => {
    const wrapper = mount(UidTag, {
      props: { dismissible: true },
      slots: { default: 'Tag' },
    })
    await wrapper.find('.uid-tag__dismiss').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })
})
