import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import UidVirtualList from './UidVirtualList.vue'

beforeEach(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Item ${i}` }))

describe('UidVirtualList', () => {
  it('рендерит видимые элементы', () => {
    const wrapper = mount(UidVirtualList, {
      props: { items, itemHeight: 40, height: 400 },
      slots: { item: '<div class="row">{{ item.label }}</div>' },
    })
    const rows = wrapper.findAll('.row')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(items.length)
  })

  it('устанавливает высоту контейнера из prop', () => {
    const wrapper = mount(UidVirtualList, {
      props: { items, itemHeight: 40, height: 300 },
      slots: { item: '<div />' },
    })
    expect(wrapper.element.style.height).toBe('300px')
  })

  it('принимает строковую высоту', () => {
    const wrapper = mount(UidVirtualList, {
      props: { items, itemHeight: 40, height: '50vh' },
      slots: { item: '<div />' },
    })
    expect(wrapper.element.style.height).toBe('50vh')
  })

  it('устанавливает общую высоту spacer', () => {
    const wrapper = mount(UidVirtualList, {
      props: { items, itemHeight: 40, height: 400 },
      slots: { item: '<div />' },
    })
    const spacer = wrapper.find('.uid-virtual-list__spacer')
    expect(spacer.element.style.height).toBe(`${items.length * 40}px`)
  })

  it('рендерит slot с item и index', () => {
    const small = [{ name: 'A' }, { name: 'B' }, { name: 'C' }]
    const wrapper = mount(UidVirtualList, {
      props: { items: small, itemHeight: 40, height: 400 },
      slots: { item: '<span class="cell">{{ item.name }}-{{ index }}</span>' },
    })
    const cells = wrapper.findAll('.cell')
    expect(cells[0].text()).toBe('A-0')
    expect(cells[1].text()).toBe('B-1')
  })

  it('каждый item имеет правильную высоту', () => {
    const small = [1, 2, 3]
    const wrapper = mount(UidVirtualList, {
      props: { items: small, itemHeight: 60, height: 400 },
      slots: { item: '<div />' },
    })
    const rows = wrapper.findAll('.uid-virtual-list__item')
    rows.forEach(row => {
      expect(row.element.style.height).toBe('60px')
    })
  })
})
