import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTransfer from './UidTransfer.vue'

const items = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
  { key: 'c', label: 'C' },
  { key: 'd', label: 'D', disabled: true },
]

describe('UidTransfer', () => {
  it('рендерит две панели', () => {
    const wrapper = mount(UidTransfer, { props: { items } })
    expect(wrapper.findAll('.uid-transfer__panel')).toHaveLength(2)
  })

  it('делит элементы по выбору', () => {
    const wrapper = mount(UidTransfer, { props: { items, modelValue: ['a', 'c'] } })
    const lists = wrapper.findAll('.uid-transfer__list')
    expect(lists[0].findAll('.uid-transfer__item')).toHaveLength(2)
    expect(lists[1].findAll('.uid-transfer__item')).toHaveLength(2)
  })

  it('переносит вправо при клике на →', async () => {
    const wrapper = mount(UidTransfer, { props: { items, modelValue: [] } })
    const lists = wrapper.findAll('.uid-transfer__list')
    await lists[0].findAll('.uid-transfer__item')[0].trigger('click')
    const ops = wrapper.findAll('.uid-transfer__op')
    await ops[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a']])
  })

  it('переносит влево при клике на ←', async () => {
    const wrapper = mount(UidTransfer, { props: { items, modelValue: ['a', 'b'] } })
    const lists = wrapper.findAll('.uid-transfer__list')
    await lists[1].findAll('.uid-transfer__item')[0].trigger('click')
    const ops = wrapper.findAll('.uid-transfer__op')
    await ops[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b']])
  })

  it('пропускает disabled при выборе всех', async () => {
    const wrapper = mount(UidTransfer, { props: { items, modelValue: [] } })
    const headerCheck = wrapper.findAll('.uid-transfer__header .uid-transfer__check')[0]
    await headerCheck.trigger('click')
    const ops = wrapper.findAll('.uid-transfer__op')
    await ops[0].trigger('click')
    const next = wrapper.emitted('update:modelValue')?.[0]?.[0] as string[]
    expect(next).toEqual(['a', 'b', 'c'])
  })

  it('searchable фильтрует список', async () => {
    const wrapper = mount(UidTransfer, { props: { items, modelValue: [], searchable: true } })
    const inputs = wrapper.findAll('.uid-transfer__search-input')
    await inputs[0].setValue('B')
    const lists = wrapper.findAll('.uid-transfer__list')
    expect(lists[0].findAll('.uid-transfer__item')).toHaveLength(1)
  })

  it('disabled блокирует операции', async () => {
    const wrapper = mount(UidTransfer, { props: { items, disabled: true } })
    expect(wrapper.classes()).toContain('uid-transfer--disabled')
  })

  it('без выбранных элементов кнопка → disabled', () => {
    const wrapper = mount(UidTransfer, { props: { items, modelValue: [] } })
    const ops = wrapper.findAll('.uid-transfer__op')
    expect(ops[0].attributes('disabled')).toBeDefined()
  })

  it('эмитит change', async () => {
    const wrapper = mount(UidTransfer, { props: { items, modelValue: [] } })
    const lists = wrapper.findAll('.uid-transfer__list')
    await lists[0].findAll('.uid-transfer__item')[0].trigger('click')
    const ops = wrapper.findAll('.uid-transfer__op')
    await ops[0].trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('кастомные titles', () => {
    const wrapper = mount(UidTransfer, {
      props: { items, titles: ['Source', 'Target'] },
    })
    const titles = wrapper.findAll('.uid-transfer__title')
    expect(titles[0].text()).toContain('Source')
    expect(titles[1].text()).toContain('Target')
  })
})
