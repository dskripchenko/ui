import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { BookOpen, ListChecks } from '../../icons/index.js'
import UidProductSwitcher from './UidProductSwitcher.vue'

const items = [
  { key: 'docs', label: 'Docs', href: 'https://docs.example.test/kb/KB-12', icon: BookOpen },
  { key: 'tasks', label: 'Tasks', href: 'https://tasks.example.test/', icon: ListChecks, current: true },
]

describe('UidProductSwitcher', () => {
  it('renders a link per product and marks the current one', () => {
    const wrapper = mount(UidProductSwitcher, { props: { items, label: 'Switch product' } })
    const links = wrapper.findAll('a')
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Switch product')
    expect(links).toHaveLength(2)
    expect(links[0]?.attributes('href')).toBe('https://docs.example.test/kb/KB-12')
    expect(links[1]?.attributes('aria-current')).toBe('page')
    expect(links[1]?.attributes('href')).toBeUndefined()
    expect(links[1]?.classes()).toContain('uid-product-switcher__item--current')
  })

  it('names the target with the hint', () => {
    const wrapper = mount(UidProductSwitcher, {
      props: { items, hint: (item: { label: string }) => `Open KB-12 in ${item.label}` },
    })
    expect(wrapper.findAll('a')[0]?.attributes('title')).toBe('Open KB-12 in Docs')
    expect(wrapper.findAll('a')[0]?.attributes('aria-label')).toBe('Open KB-12 in Docs')
  })

  it('collapses to one button leading to the next product', () => {
    const wrapper = mount(UidProductSwitcher, { props: { items, compact: true } })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0]?.attributes('href')).toBe('https://docs.example.test/kb/KB-12')
    expect(wrapper.classes()).toContain('uid-product-switcher--compact')
  })

  it('shows the first letter when a product has no icon', () => {
    const wrapper = mount(UidProductSwitcher, { props: { items: [{ key: 'a', label: 'Alpha', href: '/a' }] } })
    expect(wrapper.find('.uid-product-switcher__letter').text()).toBe('A')
  })
})
