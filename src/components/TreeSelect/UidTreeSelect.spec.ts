import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTreeSelect from './UidTreeSelect.vue'
import type { TreeNode } from '../TreeView/context.js'

const nodes: TreeNode[] = [
  {
    key: 'root',
    label: 'Root',
    children: [
      { key: 'a', label: 'A', children: [{ key: 'a1', label: 'A1' }] },
      { key: 'b', label: 'B' },
    ],
  },
]

describe('UidTreeSelect', () => {
  it('показывает плейсхолдер без значения', () => {
    const wrapper = mount(UidTreeSelect, { props: { nodes, placeholder: 'Выбор' } })
    expect(wrapper.find('.uid-tree-select__placeholder').text()).toBe('Выбор')
  })

  it('показывает label выбранного узла', () => {
    const wrapper = mount(UidTreeSelect, { props: { nodes, modelValue: 'a' } })
    expect(wrapper.find('.uid-tree-select__value').text()).toContain('A')
  })

  it('открывает дропдаун по клику', async () => {
    const wrapper = mount(UidTreeSelect, { props: { nodes } })
    await wrapper.find('.uid-tree-select__trigger').trigger('click')
    expect(wrapper.classes()).toContain('uid-tree-select--open')
    expect(wrapper.find('.uid-tree-select__dropdown').exists()).toBe(true)
  })

  it('выбирает узел single и закрывает', async () => {
    const wrapper = mount(UidTreeSelect, {
      props: { nodes, defaultExpandAll: true },
    })
    await wrapper.find('.uid-tree-select__trigger').trigger('click')
    const items = wrapper.findAll('.uid-tree-item__row')
    await items[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('a')
    expect(wrapper.classes()).not.toContain('uid-tree-select--open')
  })

  it('multiple добавляет к выбору', async () => {
    const wrapper = mount(UidTreeSelect, {
      props: { nodes, multiple: true, modelValue: ['a'], defaultExpandAll: true },
    })
    await wrapper.find('.uid-tree-select__trigger').trigger('click')
    const items = wrapper.findAll('.uid-tree-item__row')
    await items[2].trigger('click')
    const last = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as string[]
    expect(last).toContain('a')
    expect(last).toContain('a1')
  })

  it('multiple показывает чипы', () => {
    const wrapper = mount(UidTreeSelect, {
      props: { nodes, multiple: true, modelValue: ['a', 'b'] },
    })
    expect(wrapper.findAll('.uid-tree-select__chip')).toHaveLength(2)
  })

  it('удаляет чип', async () => {
    const wrapper = mount(UidTreeSelect, {
      props: { nodes, multiple: true, modelValue: ['a', 'b'] },
    })
    await wrapper.findAll('.uid-tree-select__chip-remove')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b']])
  })

  it('clearable — кнопка очистки', async () => {
    const wrapper = mount(UidTreeSelect, {
      props: { nodes, modelValue: 'a', clearable: true },
    })
    await wrapper.find('.uid-tree-select__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('multiple clearable очищает в []', async () => {
    const wrapper = mount(UidTreeSelect, {
      props: { nodes, multiple: true, modelValue: ['a', 'b'], clearable: true },
    })
    await wrapper.find('.uid-tree-select__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])
  })

  it('disabled блокирует открытие', async () => {
    const wrapper = mount(UidTreeSelect, { props: { nodes, disabled: true } })
    await wrapper.find('.uid-tree-select__trigger').trigger('click')
    expect(wrapper.find('.uid-tree-select__dropdown').exists()).toBe(false)
  })

  it('maxTagCount режет видимые теги', () => {
    const wrapper = mount(UidTreeSelect, {
      props: {
        nodes,
        multiple: true,
        modelValue: ['a', 'b', 'a1'],
        maxTagCount: 2,
      },
    })
    const chips = wrapper.findAll('.uid-tree-select__chip')
    expect(chips).toHaveLength(3)
    expect(chips[2].text()).toContain('+1')
  })

  it('error показывает hint и aria-invalid', () => {
    const wrapper = mount(UidTreeSelect, {
      props: { nodes, error: 'Обязательно' },
    })
    expect(wrapper.find('.uid-tree-select__hint--error').text()).toBe('Обязательно')
    expect(wrapper.find('.uid-tree-select__trigger').attributes('aria-invalid')).toBe('true')
  })
})
