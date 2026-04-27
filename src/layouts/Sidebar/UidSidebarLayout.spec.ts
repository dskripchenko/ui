import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import UidSidebarLayout from './UidSidebarLayout.vue'
import { SIDEBAR_LAYOUT_KEY } from '../../composables/useSidebar'

describe('UidSidebarLayout', () => {
  it('рендерит sidebar-слот', () => {
    const wrapper = mount(UidSidebarLayout, {
      slots: { sidebar: '<nav class="nav">Навигация</nav>' },
    })
    expect(wrapper.find('.uid-layout-sidebar__sidebar').exists()).toBe(true)
    expect(wrapper.find('.nav').exists()).toBe(true)
  })

  it('рендерит default-слот в main', () => {
    const wrapper = mount(UidSidebarLayout, {
      slots: { default: '<div class="content">Контент</div>' },
    })
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('.content').exists()).toBe(true)
  })

  it('рендерит header-слот', () => {
    const wrapper = mount(UidSidebarLayout, {
      slots: { header: '<div class="hdr">Шапка</div>' },
    })
    expect(wrapper.find('.uid-layout-sidebar__main-header').exists()).toBe(true)
  })

  it('не рендерит header без слота', () => {
    const wrapper = mount(UidSidebarLayout)
    expect(wrapper.find('.uid-layout-sidebar__main-header').exists()).toBe(false)
  })

  it('применяет collapsed класс', () => {
    const wrapper = mount(UidSidebarLayout, { props: { modelValue: true } })
    expect(wrapper.classes()).toContain('uid-layout-sidebar--collapsed')
  })

  it('backdrop click эмитит close (update:modelValue=true)', async () => {
    const wrapper = mount(UidSidebarLayout, {
      props: { modelValue: false },
    })
    await wrapper.find('.uid-layout-sidebar__backdrop').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })

  it('предоставляет SidebarContext через provide', () => {
    let toggleCalled = false

    const Consumer = defineComponent({
      setup() {
        const ctx = inject(SIDEBAR_LAYOUT_KEY)!
        ctx.toggle()
        toggleCalled = true
      },
      template: '<span />',
    })

    mount(UidSidebarLayout, {
      slots: { default: () => h(Consumer) },
    })

    expect(toggleCalled).toBe(true)
  })
})
