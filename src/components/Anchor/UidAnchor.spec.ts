import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UidAnchor, { type AnchorItem } from './UidAnchor.vue'

const items: AnchorItem[] = [
  { key: 'intro', href: '#intro', title: 'Введение' },
  {
    key: 'usage',
    href: '#usage',
    title: 'Использование',
    children: [
      { key: 'install', href: '#install', title: 'Установка' },
      { key: 'config', href: '#config', title: 'Настройка' },
    ],
  },
  { key: 'api', href: '#api', title: 'API' },
]

describe('UidAnchor', () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      constructor(_cb: IntersectionObserverCallback) {
        void _cb
      }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    })
    window.scrollTo = vi.fn()
  })

  it('рендерит все ссылки включая дочерние', () => {
    const wrapper = mount(UidAnchor, { props: { items } })
    expect(wrapper.findAll('.uid-anchor__link')).toHaveLength(5)
  })

  it('применяет active-класс к current', () => {
    const wrapper = mount(UidAnchor, { props: { items, modelValue: 'usage' } })
    const links = wrapper.findAll('.uid-anchor__link')
    expect(links[1].classes()).toContain('uid-anchor__link--active')
  })

  it('эмитит click и change при клике', async () => {
    document.body.innerHTML = '<div id="intro" /><div id="usage" /><div id="api" />'
    const wrapper = mount(UidAnchor, { props: { items, modelValue: '' } })
    await wrapper.findAll('.uid-anchor__link')[0].trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['intro'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['intro'])
  })

  it('вызывает scrollTo при клике на ссылку', async () => {
    document.body.innerHTML = '<div id="intro" style="margin-top:500px" />'
    const wrapper = mount(UidAnchor, { props: { items } })
    await wrapper.findAll('.uid-anchor__link')[0].trigger('click')
    expect(window.scrollTo).toHaveBeenCalled()
  })

  it('рендерит nested-список для children', () => {
    const wrapper = mount(UidAnchor, { props: { items } })
    expect(wrapper.find('.uid-anchor__sublist').exists()).toBe(true)
    expect(wrapper.findAll('.uid-anchor__sublist .uid-anchor__link')).toHaveLength(2)
  })

  it('не делает scroll при preventDefault', async () => {
    document.body.innerHTML = '<div id="intro" />'
    const wrapper = mount(UidAnchor, {
      props: { items },
      attrs: {
        onClick: (_item: AnchorItem, e: MouseEvent) => e.preventDefault(),
      },
    })
    await wrapper.findAll('.uid-anchor__link')[0].trigger('click')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
