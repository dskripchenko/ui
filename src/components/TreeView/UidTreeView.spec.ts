import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTreeView from './UidTreeView.vue'
import type { TreeNode } from './context.js'

const nodes: TreeNode[] = [
  {
    key: 'root',
    label: 'Корень',
    children: [
      { key: 'a', label: 'A', children: [{ key: 'a1', label: 'A1' }] },
      { key: 'b', label: 'B' },
    ],
  },
]

describe('UidTreeView', () => {
  it('рендерит корневые узлы', () => {
    const wrapper = mount(UidTreeView, { props: { nodes } })
    expect(wrapper.findAll('.uid-tree-item')).toHaveLength(1)
  })

  it('раскрывает узел по клику на chevron', async () => {
    const wrapper = mount(UidTreeView, { props: { nodes } })
    await wrapper.find('.uid-tree-item__chevron').trigger('click')
    expect(wrapper.emitted('update:expandedKeys')?.[0]).toEqual([['root']])
  })

  it('раскрыт по defaultExpandAll', () => {
    const wrapper = mount(UidTreeView, { props: { nodes, defaultExpandAll: true } })
    expect(wrapper.findAll('.uid-tree-item')).toHaveLength(4)
  })

  it('эмитит select при single selection', async () => {
    const wrapper = mount(UidTreeView, {
      props: { nodes, defaultExpandAll: true, selectable: 'single' },
    })
    const items = wrapper.findAll('.uid-tree-item__row')
    await items[1].trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('update:selectedKeys')?.[0]).toEqual([['a']])
  })

  it('single заменяет предыдущий выбор', async () => {
    const wrapper = mount(UidTreeView, {
      props: { nodes, defaultExpandAll: true, selectable: 'single', selectedKeys: ['root'] },
    })
    const items = wrapper.findAll('.uid-tree-item__row')
    await items[1].trigger('click')
    expect(wrapper.emitted('update:selectedKeys')?.[0]).toEqual([['a']])
  })

  it('multiple добавляет к выбору', async () => {
    const wrapper = mount(UidTreeView, {
      props: { nodes, defaultExpandAll: true, selectable: 'multiple', selectedKeys: ['root'] },
    })
    const items = wrapper.findAll('.uid-tree-item__row')
    await items[1].trigger('click')
    const evt = wrapper.emitted('update:selectedKeys')?.[0]?.[0] as string[]
    expect(evt).toContain('root')
    expect(evt).toContain('a')
  })

  it('не выбирает disabled узлы', async () => {
    const disabledNodes: TreeNode[] = [{ key: 'x', label: 'X', disabled: true }]
    const wrapper = mount(UidTreeView, { props: { nodes: disabledNodes, selectable: 'single' } })
    await wrapper.find('.uid-tree-item__row').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('checkable показывает чекбоксы', () => {
    const wrapper = mount(UidTreeView, { props: { nodes, checkable: true } })
    expect(wrapper.find('.uid-tree-item__check').exists()).toBe(true)
  })

  it('check родителя проставляет всех потомков', async () => {
    const wrapper = mount(UidTreeView, {
      props: { nodes, checkable: true, defaultExpandAll: true },
    })
    await wrapper.find('.uid-tree-item__check').trigger('click')
    const evt = wrapper.emitted('update:checkedKeys')?.at(-1)?.[0] as string[]
    expect(evt).toContain('root')
    expect(evt).toContain('a')
    expect(evt).toContain('a1')
    expect(evt).toContain('b')
  })

  it('эмитит check', async () => {
    const wrapper = mount(UidTreeView, { props: { nodes, checkable: true } })
    await wrapper.find('.uid-tree-item__check').trigger('click')
    expect(wrapper.emitted('check')?.[0]?.[1]).toBe(true)
  })

  it('keydown ArrowRight раскрывает', async () => {
    const wrapper = mount(UidTreeView, { props: { nodes } })
    await wrapper.find('.uid-tree-item__row').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:expandedKeys')?.[0]).toEqual([['root']])
  })

  it('keydown ArrowLeft сворачивает', async () => {
    const wrapper = mount(UidTreeView, { props: { nodes, expandedKeys: ['root'] } })
    await wrapper.find('.uid-tree-item__row').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:expandedKeys')?.[0]).toEqual([[]])
  })

  it('keydown Enter выбирает узел', async () => {
    const wrapper = mount(UidTreeView, { props: { nodes, selectable: 'single' } })
    await wrapper.find('.uid-tree-item__row').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('disabled блокирует все взаимодействия', async () => {
    const wrapper = mount(UidTreeView, { props: { nodes, disabled: true } })
    await wrapper.find('.uid-tree-item__row').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('virtualRoot (строка) оборачивает узлы в один корневой', () => {
    const wrapper = mount(UidTreeView, {
      props: {
        nodes: [
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
        ],
        virtualRoot: 'Все',
      },
    })
    const rows = wrapper.findAll('.uid-tree-item__row')
    expect(rows[0].text()).toContain('Все')
    expect(wrapper.findAll('.uid-tree-item')).toHaveLength(3)
  })

  it('virtualRoot автоматически раскрыт', () => {
    const wrapper = mount(UidTreeView, {
      props: {
        nodes: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
        virtualRoot: 'Все',
      },
    })
    const labels = wrapper.findAll('.uid-tree-item__label').map((w) => w.text())
    expect(labels).toContain('Все')
    expect(labels).toContain('A')
    expect(labels).toContain('B')
  })

  it('virtualRoot не выбирается по клику (selectable=false)', async () => {
    const wrapper = mount(UidTreeView, {
      props: {
        nodes: [{ key: 'a', label: 'A' }],
        virtualRoot: 'Все',
        selectable: 'single',
      },
    })
    await wrapper.find('.uid-tree-item__row').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('virtualRoot TreeNode используется как корень', () => {
    const wrapper = mount(UidTreeView, {
      props: {
        nodes: [{ key: 'a', label: 'A' }],
        virtualRoot: { key: 'custom', label: 'Custom Root' },
      },
    })
    const rows = wrapper.findAll('.uid-tree-item__row')
    expect(rows[0].text()).toContain('Custom Root')
  })
})
