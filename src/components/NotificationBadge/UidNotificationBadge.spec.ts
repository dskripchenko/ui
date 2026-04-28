import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidNotificationBadge from './UidNotificationBadge.vue'

describe('UidNotificationBadge', () => {
  it('рендерит default-слот', () => {
    const wrapper = mount(UidNotificationBadge, {
      slots: { default: '<button>btn</button>' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('не показывает badge при count=0 без showZero', () => {
    const wrapper = mount(UidNotificationBadge, { props: { count: 0 } })
    expect(wrapper.find('.uid-notification-badge__count').exists()).toBe(false)
  })

  it('показывает count при count>0', () => {
    const wrapper = mount(UidNotificationBadge, { props: { count: 5 } })
    expect(wrapper.find('.uid-notification-badge__count').text()).toBe('5')
  })

  it('обрезает по max', () => {
    const wrapper = mount(UidNotificationBadge, { props: { count: 150, max: 99 } })
    expect(wrapper.find('.uid-notification-badge__count').text()).toBe('99+')
  })

  it('показывает 0 при showZero', () => {
    const wrapper = mount(UidNotificationBadge, { props: { count: 0, showZero: true } })
    expect(wrapper.find('.uid-notification-badge__count').text()).toBe('0')
  })

  it('режим dot скрывает число', () => {
    const wrapper = mount(UidNotificationBadge, { props: { count: 5, dot: true } })
    expect(wrapper.find('.uid-notification-badge__dot').exists()).toBe(true)
    expect(wrapper.find('.uid-notification-badge__count').exists()).toBe(false)
  })

  it('применяет placement', () => {
    expect(mount(UidNotificationBadge, { props: { placement: 'top-left' } }).classes())
      .toContain('uid-notification-badge--top-left')
    expect(mount(UidNotificationBadge, { props: { placement: 'bottom-right' } }).classes())
      .toContain('uid-notification-badge--bottom-right')
  })

  it('применяет tone', () => {
    const wrapper = mount(UidNotificationBadge, { props: { tone: 'success' } })
    expect(wrapper.classes()).toContain('uid-notification-badge--success')
  })

  it('по умолчанию tone=danger без класса', () => {
    const wrapper = mount(UidNotificationBadge)
    expect(wrapper.classes()).not.toContain('uid-notification-badge--danger')
  })

  it('применяет offset через CSS-переменные', () => {
    const wrapper = mount(UidNotificationBadge, { props: { count: 5, offset: [4, 4] } })
    const style = wrapper.attributes('style')
    expect(style).toContain('--uid-notif-badge-offset-x: 4px')
    expect(style).toContain('--uid-notif-badge-offset-y: 4px')
  })

  it('aria-label с числом', () => {
    const wrapper = mount(UidNotificationBadge, { props: { count: 7 } })
    expect(wrapper.find('.uid-notification-badge__count').attributes('aria-label')).toBe('7')
  })
})
