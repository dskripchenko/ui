import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import UidSidebar from './UidSidebar.vue'
import UidSidebarItem from './UidSidebarItem.vue'
import UidSidebarGroup from './UidSidebarGroup.vue'
import UidSidebarDivider from './UidSidebarDivider.vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sidebarCss = readFileSync(resolve(process.cwd(), 'src/patterns/Sidebar/UidSidebar.css'), 'utf8')

describe('UidSidebar', () => {
  it('рендерит <aside>', () => {
    const wrapper = mount(UidSidebar)
    expect(wrapper.element.tagName).toBe('ASIDE')
  })

  it('применяет collapsed класс', () => {
    const wrapper = mount(UidSidebar, { props: { collapsed: true } })
    expect(wrapper.classes()).toContain('uid-pattern-sidebar--collapsed')
  })

  it('применяет position класс', () => {
    expect(mount(UidSidebar, { props: { position: 'right' } }).classes())
      .toContain('uid-pattern-sidebar--right')
  })

  it('aria-label присутствует', () => {
    const wrapper = mount(UidSidebar)
    expect(wrapper.attributes('aria-label')).toBe('Боковая навигация')
  })

  it('рендерит nav с aria-label', () => {
    const wrapper = mount(UidSidebar)
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Навигация')
  })

  it('рендерит header-слот', () => {
    const wrapper = mount(UidSidebar, {
      slots: { header: '<span class="brand">Brand</span>' },
    })
    expect(wrapper.find('.uid-pattern-sidebar__header').exists()).toBe(true)
  })
})

describe('UidSidebarItem', () => {
  it('рендерит тег <a> по умолчанию', () => {
    const wrapper = mount(UidSidebarItem, { slots: { default: 'Главная' } })
    expect(wrapper.element.tagName).toBe('A')
  })

  it('применяет active класс и aria-current', () => {
    const wrapper = mount(UidSidebarItem, {
      props: { active: true },
      slots: { default: 'Главная' },
    })
    expect(wrapper.classes()).toContain('uid-sidebar-item--active')
    expect(wrapper.attributes('aria-current')).toBe('page')
  })

  it('применяет disabled класс', () => {
    const wrapper = mount(UidSidebarItem, {
      props: { disabled: true },
      slots: { default: 'Пункт' },
    })
    expect(wrapper.classes()).toContain('uid-sidebar-item--disabled')
  })

  it('рендерит badge', () => {
    const wrapper = mount(UidSidebarItem, {
      props: { badge: 5 },
      slots: { default: 'Сообщения' },
    })
    expect(wrapper.find('.uid-sidebar-item__badge').text()).toBe('5')
  })

  it('рендерит icon-слот', () => {
    const wrapper = mount(UidSidebarItem, {
      slots: { default: 'Главная', icon: '<svg class="icon" />' },
    })
    expect(wrapper.find('.uid-sidebar-item__icon').exists()).toBe(true)
  })
})

describe('UidSidebarGroup', () => {
  it('рендерит title', () => {
    const wrapper = mount(UidSidebarGroup, {
      props: { title: 'Настройки' },
      slots: { default: '' },
    })
    expect(wrapper.find('.uid-sidebar-group__title').text()).toBe('Настройки')
  })

  it('не рендерит title без prop', () => {
    const wrapper = mount(UidSidebarGroup, { slots: { default: '' } })
    expect(wrapper.find('.uid-sidebar-group__title').exists()).toBe(false)
  })
})

describe('UidSidebarDivider', () => {
  it('рендерит разделитель', () => {
    const wrapper = mount(UidSidebarDivider)
    expect(wrapper.find('.uid-sidebar-divider').exists()).toBe(true)
    expect(wrapper.attributes('role')).toBe('separator')
  })
})

describe('UidSidebarItem to / RouterLink', () => {
  const RouterLink = defineComponent({
    name: 'RouterLink',
    props: { to: { type: [String, Object], required: true } },
    template: '<a class="rl" :data-to="JSON.stringify(to)"><slot /></a>',
  })

  it('без vue-router строковый to откатывается на <a href>', () => {
    const wrapper = mount(UidSidebarItem, { props: { to: '/users' }, slots: { default: 'Users' } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/users')
    expect(wrapper.attributes('to')).toBeUndefined()
  })

  it('disabled убирает href в фолбэке', () => {
    const wrapper = mount(UidSidebarItem, { props: { to: '/users', disabled: true }, slots: { default: 'Users' } })
    expect(wrapper.attributes('href')).toBeUndefined()
  })

  it('с глобальным RouterLink рендерит его', () => {
    const wrapper = mount(UidSidebarItem, {
      props: { to: { name: 'users' } },
      slots: { default: 'Users' },
      global: { components: { RouterLink } },
    })
    expect(wrapper.classes()).toContain('rl')
    expect(wrapper.classes()).toContain('uid-sidebar-item')
    expect(wrapper.attributes('data-to')).toBe('{"name":"users"}')
  })

  // jsdom computes no styles: a border-style with no width falls back to the
  // UA `medium` (3px) on every side in a real browser, so pin the width.
  it('the base rule resets border-width, so only the side modifier draws', () => {
    const base = /\.uid-pattern-sidebar \{([^}]*)\}/.exec(sidebarCss)?.[1] ?? ''
    expect(base).toContain('border-style: solid')
    expect(base).toMatch(/border-width:\s*0/)
  })
})
