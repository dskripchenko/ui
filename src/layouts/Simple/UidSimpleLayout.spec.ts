import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSimpleLayout from './UidSimpleLayout.vue'

describe('UidSimpleLayout', () => {
  it('рендерит default-слот в main', () => {
    const wrapper = mount(UidSimpleLayout, {
      slots: { default: '<p class="page">Контент</p>' },
    })
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('.page').exists()).toBe(true)
  })

  it('рендерит header-слот когда передан', () => {
    const wrapper = mount(UidSimpleLayout, {
      slots: { header: '<header class="hdr">Шапка</header>' },
    })
    expect(wrapper.find('.uid-layout-simple__header').exists()).toBe(true)
    expect(wrapper.find('.hdr').exists()).toBe(true)
  })

  it('не рендерит header без слота', () => {
    const wrapper = mount(UidSimpleLayout)
    expect(wrapper.find('.uid-layout-simple__header').exists()).toBe(false)
  })

  it('рендерит footer-слот когда передан', () => {
    const wrapper = mount(UidSimpleLayout, {
      slots: { footer: '<footer class="ftr">Подвал</footer>' },
    })
    expect(wrapper.find('.uid-layout-simple__footer').exists()).toBe(true)
    expect(wrapper.find('.ftr').exists()).toBe(true)
  })

  it('не рендерит footer без слота', () => {
    const wrapper = mount(UidSimpleLayout)
    expect(wrapper.find('.uid-layout-simple__footer').exists()).toBe(false)
  })

  it('применяет full класс', () => {
    const wrapper = mount(UidSimpleLayout, { props: { full: true } })
    expect(wrapper.classes()).toContain('uid-layout-simple--full')
  })
})
