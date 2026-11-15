import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidBadge from './UidBadge.vue'

describe('UidBadge', () => {
  it('рендерит slot-контент', () => {
    const wrapper = mount(UidBadge, { slots: { default: 'Новый' } })
    expect(wrapper.text()).toBe('Новый')
  })

  it('применяет variant класс', () => {
    expect(mount(UidBadge, { props: { variant: 'success' } }).classes()).toContain('uid-badge--success')
    expect(mount(UidBadge, { props: { variant: 'danger' } }).classes()).toContain('uid-badge--danger')
  })

  it('применяет size класс', () => {
    expect(mount(UidBadge, { props: { size: 'sm' } }).classes()).toContain('uid-badge--sm')
  })

  it('в режиме dot добавляет класс uid-badge--dot', () => {
    const wrapper = mount(UidBadge, { props: { dot: true }, slots: { default: 'Текст' } })
    expect(wrapper.classes()).toContain('uid-badge--dot')
  })

  it('в режиме dot не рендерит slot-контент', () => {
    const wrapper = mount(UidBadge, { props: { dot: true }, slots: { default: 'Текст' } })
    expect(wrapper.text()).toBe('')
  })

  it('default variant по умолчанию', () => {
    const wrapper = mount(UidBadge)
    expect(wrapper.classes()).toContain('uid-badge--default')
  })

  it('marker puts a dot of the tone before the text', () => {
    const wrapper = mount(UidBadge, { props: { marker: true, variant: 'success' }, slots: { default: 'Up' } })
    expect(wrapper.find('.uid-badge__marker').exists()).toBe(true)
    expect(wrapper.find('.uid-badge__marker').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toBe('Up')
    expect(mount(UidBadge, { slots: { default: 'x' } }).find('.uid-badge__marker').exists()).toBe(false)
  })

  it('has an accent variant apart from info', () => {
    expect(mount(UidBadge, { props: { variant: 'accent' } }).classes()).toContain('uid-badge--accent')
  })
})
