import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTabBar from './UidTabBar.vue'
import UidTabBarItem from './UidTabBarItem.vue'

describe('UidTabBar', () => {
  it('рендерит <nav> с подписью из локали', () => {
    const wrapper = mount(UidTabBar)
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('Нижняя навигация')
  })

  it('принимает свою подпись', () => {
    expect(mount(UidTabBar, { props: { label: 'Разделы' } }).attributes('aria-label')).toBe('Разделы')
  })

  it('fixed прижимает к низу', () => {
    expect(mount(UidTabBar, { props: { fixed: true } }).classes()).toContain('uid-tab-bar--fixed')
  })
})

describe('UidTabBarItem', () => {
  it('ссылка с href, подписью и иконкой', () => {
    const wrapper = mount(UidTabBarItem, {
      props: { href: '/home' },
      slots: { default: 'Главная', icon: '<svg class="i" />' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/home')
    expect(wrapper.find('.uid-tab-bar-item__label').text()).toBe('Главная')
    expect(wrapper.find('.uid-tab-bar-item__icon .i').exists()).toBe(true)
  })

  it('активная — aria-current="page"', () => {
    const wrapper = mount(UidTabBarItem, { props: { href: '/', active: true }, slots: { default: 'A' } })
    expect(wrapper.attributes('aria-current')).toBe('page')
    expect(wrapper.classes()).toContain('uid-tab-bar-item--active')
  })

  it('счётчик показывается, ноль — нет', () => {
    expect(mount(UidTabBarItem, { props: { badge: 3 }, slots: { default: 'A' } }).find('.uid-tab-bar-item__badge').text()).toBe('3')
    expect(mount(UidTabBarItem, { props: { badge: 0 }, slots: { default: 'A' } }).find('.uid-tab-bar-item__badge').exists()).toBe(false)
  })

  it('точка без счётчика', () => {
    const wrapper = mount(UidTabBarItem, { props: { dot: true }, slots: { default: 'A' } })
    expect(wrapper.find('.uid-tab-bar-item__dot').exists()).toBe(true)
  })

  it('as="button" — кнопка с type', () => {
    const wrapper = mount(UidTabBarItem, { props: { as: 'button' }, slots: { default: 'A' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('выключенная не ведёт никуда', () => {
    const wrapper = mount(UidTabBarItem, { props: { href: '/x', disabled: true }, slots: { default: 'A' } })
    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })
})
