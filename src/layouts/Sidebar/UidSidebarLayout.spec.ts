import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import UidSidebarLayout from './UidSidebarLayout.vue'
import { SIDEBAR_LAYOUT_KEY } from '../../composables/useSidebar'

const layoutCss = (): string =>
  readFileSync(resolve(process.cwd(), 'src/layouts/Sidebar/UidSidebarLayout.css'), 'utf8')

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

  // Without it the sidebar ends where its content ends: half a window of border, the footer in the middle.
  it('the sidebar spans the window and a UidSidebar in it fills it', () => {
    const css = layoutCss()
    const column = /\.uid-layout-sidebar__sidebar \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(column).toContain('position: sticky')
    expect(column).toContain('height: 100vh')
    expect(css).toMatch(/\.uid-layout-sidebar__sidebar > \.uid-pattern-sidebar \{\s*height: 100%;/)
  })
  it('no sticky-header modifier by default', () => {
    const wrapper = mount(UidSidebarLayout, { slots: { header: '<div>Header</div>' } })
    expect(wrapper.classes()).not.toContain('uid-layout-sidebar--sticky-header')
  })

  it('stickyHeader adds the sticky-header modifier', () => {
    const wrapper = mount(UidSidebarLayout, {
      props: { stickyHeader: true },
      slots: { header: '<div>Header</div>' },
    })
    expect(wrapper.classes()).toContain('uid-layout-sidebar--sticky-header')
  })

  // The wrapper itself sticks, for every width: a sticky child of the slot cannot.
  it('the sticky header wrapper sticks to the top above the content', () => {
    const css = layoutCss()
    const rule = /\.uid-layout-sidebar--sticky-header \.uid-layout-sidebar__main-header \{([^}]*)\}/.exec(css)
    expect(rule).not.toBeNull()
    expect(rule![1]).toContain('position: sticky')
    expect(rule![1]).toContain('top: 0')
    expect(rule![1]).toContain('z-index: var(--uid-z-sticky')
    const media = css.indexOf('@media')
    expect(media === -1 || rule!.index < media).toBe(true)
  })
})

