import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidHeader from './UidHeader.vue'

describe('UidHeader', () => {
  it('рендерит <header>', () => {
    const wrapper = mount(UidHeader)
    expect(wrapper.element.tagName).toBe('HEADER')
  })

  it('применяет sticky класс', () => {
    const wrapper = mount(UidHeader, { props: { sticky: true } })
    expect(wrapper.classes()).toContain('uid-pattern-header--sticky')
  })

  it('применяет bordered класс по умолчанию', () => {
    const wrapper = mount(UidHeader)
    expect(wrapper.classes()).toContain('uid-pattern-header--bordered')
  })

  it('применяет transparent класс', () => {
    const wrapper = mount(UidHeader, { props: { transparent: true } })
    expect(wrapper.classes()).toContain('uid-pattern-header--transparent')
  })

  it('рендерит logo-слот', () => {
    const wrapper = mount(UidHeader, { slots: { logo: '<span class="logo">Brand</span>' } })
    expect(wrapper.find('.logo').exists()).toBe(true)
    expect(wrapper.find('.uid-pattern-header__logo').exists()).toBe(true)
  })

  it('не рендерит nav без слота', () => {
    const wrapper = mount(UidHeader)
    expect(wrapper.find('.uid-pattern-header__nav').exists()).toBe(false)
  })

  it('рендерит nav с aria-label', () => {
    const wrapper = mount(UidHeader, { slots: { nav: '<a href="/">Главная</a>' } })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Основная навигация')
  })

  it('рендерит actions-слот', () => {
    const wrapper = mount(UidHeader, {
      slots: { actions: '<button class="btn">Войти</button>' },
    })
    expect(wrapper.find('.btn').exists()).toBe(true)
  })
})
