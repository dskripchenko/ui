import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import UidSidebar from './UidSidebar.vue'
import UidSidebarItem from './UidSidebarItem.vue'
import UidSidebarJump from './UidSidebarJump.vue'
import UidSidebarMore from './UidSidebarMore.vue'
import UidSidebarSection from './UidSidebarSection.vue'

describe('UidSidebarSection', () => {
  it('сворачивается по заголовку и показывает сводку', async () => {
    const wrapper = mount(UidSidebarSection, { props: { title: 'Каналы', summary: '5 новых' }, slots: { default: '<a class="row">x</a>' } })
    const toggle = wrapper.get('.uid-sidebar-section__toggle')
    expect(toggle.text()).toContain('5 новых')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await toggle.trigger('click')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('в свёрнутой панели — иконка со счётчиком, раздел открывается поповером', async () => {
    const wrapper = mount(UidSidebar, {
      props: { collapsed: true },
      slots: { nav: () => h(UidSidebarSection, { title: 'Каналы', count: 19, mentions: 3 }, { icon: () => '#', default: () => h('a', { class: 'row', href: '#' }, 'ops') }) },
      attachTo: document.body,
    })
    const rail = wrapper.get('.uid-sidebar-section__rail')
    expect(rail.get('.uid-sidebar-section__rail-count').text()).toBe('3')
    expect(document.querySelector('.uid-sidebar-section__flyout')).toBeNull()
    await rail.trigger('click')
    expect(document.querySelector('.uid-sidebar-section__flyout .row')).not.toBeNull()
    wrapper.unmount()
  })
})

describe('UidSidebarItem — строка беседы', () => {
  it('показывает время, упоминания, счётчик и метку; жирная — новое', () => {
    const wrapper = mount(UidSidebarItem, {
      props: { href: '#', dense: true, meta: '12:44', mentions: 1, count: 12, strong: true },
      slots: { default: 'ops-incidents', suffix: '<span class="tag">гость</span>' },
    })
    expect(wrapper.classes()).toContain('uid-sidebar-item--strong')
    expect(wrapper.get('.uid-sidebar-item__meta').text()).toBe('12:44')
    expect(wrapper.get('.uid-sidebar-item__mentions').text()).toBe('@1')
    expect(wrapper.get('.uid-sidebar-item__count').text()).toBe('12')
    expect(wrapper.find('.tag').exists()).toBe(true)
  })

  it('с действиями — ставит их рядом со ссылкой, не внутрь', () => {
    const wrapper = mount(UidSidebarItem, { props: { href: '#' }, slots: { default: 'x', actions: '<button class="act">★</button>' } })
    expect(wrapper.classes()).toContain('uid-sidebar-item-row')
    expect(wrapper.find('a .act').exists()).toBe(false)
    expect(wrapper.find('.uid-sidebar-item__actions .act').exists()).toBe(true)
  })
})

describe('UidSidebarMore и UidSidebarJump', () => {
  it('«Ещё N» — ссылка в тоне', () => {
    const wrapper = mount(UidSidebarMore, { props: { href: '#all', tone: 'primary' }, slots: { default: 'Ещё 13 непрочитанных' } })
    expect(wrapper.classes()).toContain('uid-sidebar-more--primary')
    expect(wrapper.attributes('href')).toBe('#all')
  })

  it('поле перехода называет и клавиши, сообщает о нажатии', async () => {
    const wrapper = mount(UidSidebarJump, { props: { label: 'Перейти к беседе…' } })
    expect(wrapper.attributes('aria-label')).toBe('Перейти к беседе… ⌘K')
    await wrapper.trigger('click')
    expect(wrapper.emitted('open')).toHaveLength(1)
  })
})
