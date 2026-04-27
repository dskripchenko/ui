import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidAuthLayout from './UidAuthLayout.vue'

describe('UidAuthLayout', () => {
  it('рендерит default-слот в card', () => {
    const wrapper = mount(UidAuthLayout, {
      slots: { default: '<form class="form">Форма</form>' },
    })
    expect(wrapper.find('.uid-layout-auth__card').exists()).toBe(true)
    expect(wrapper.find('.form').exists()).toBe(true)
  })

  it('применяет centered вариант по умолчанию', () => {
    const wrapper = mount(UidAuthLayout)
    expect(wrapper.classes()).toContain('uid-layout-auth--centered')
  })

  it('применяет split вариант', () => {
    const wrapper = mount(UidAuthLayout, { props: { variant: 'split' } })
    expect(wrapper.classes()).toContain('uid-layout-auth--split')
  })

  it('рендерит brand-слот в split варианте', () => {
    const wrapper = mount(UidAuthLayout, {
      props: { variant: 'split' },
      slots: { brand: '<div class="brand">Логотип</div>' },
    })
    expect(wrapper.find('.uid-layout-auth__brand').exists()).toBe(true)
    expect(wrapper.find('.brand').exists()).toBe(true)
  })

  it('не рендерит brand-слот в centered варианте', () => {
    const wrapper = mount(UidAuthLayout, {
      props: { variant: 'centered' },
      slots: { brand: '<div class="brand">Логотип</div>' },
    })
    expect(wrapper.find('.uid-layout-auth__brand').exists()).toBe(false)
  })

  it('рендерит footer-слот', () => {
    const wrapper = mount(UidAuthLayout, {
      slots: { footer: '<p class="terms">Условия</p>' },
    })
    expect(wrapper.find('.uid-layout-auth__footer').exists()).toBe(true)
    expect(wrapper.find('.terms').exists()).toBe(true)
  })

  it('не рендерит footer без слота', () => {
    const wrapper = mount(UidAuthLayout)
    expect(wrapper.find('.uid-layout-auth__footer').exists()).toBe(false)
  })
})
