import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidCascader from './UidCascader.vue'
import type { CascaderOption } from './UidCascader.vue'

const options: CascaderOption[] = [
  {
    value: 'ru',
    label: 'Россия',
    children: [
      {
        value: 'msk',
        label: 'Москва',
        children: [
          { value: 'tverskoy', label: 'Тверской' },
          { value: 'arbat', label: 'Арбат' },
        ],
      },
      {
        value: 'spb',
        label: 'Санкт-Петербург',
        children: [
          { value: 'central', label: 'Центральный' },
        ],
      },
    ],
  },
  {
    value: 'us',
    label: 'США',
    children: [
      { value: 'ny', label: 'Нью-Йорк' },
    ],
  },
]

describe('UidCascader', () => {
  it('показывает плейсхолдер без значения', () => {
    const wrapper = mount(UidCascader, { props: { options, placeholder: 'Выбери' } })
    expect(wrapper.find('.uid-cascader__placeholder').text()).toBe('Выбери')
  })

  it('показывает путь выбранного значения', () => {
    const wrapper = mount(UidCascader, {
      props: { options, modelValue: ['ru', 'msk', 'tverskoy'] },
    })
    expect(wrapper.find('.uid-cascader__value').text()).toContain('Россия')
    expect(wrapper.find('.uid-cascader__value').text()).toContain('Москва')
    expect(wrapper.find('.uid-cascader__value').text()).toContain('Тверской')
  })

  it('открывает дропдаун по клику', async () => {
    const wrapper = mount(UidCascader, { props: { options } })
    await wrapper.find('.uid-cascader__trigger').trigger('click')
    expect(wrapper.find('.uid-cascader__dropdown').exists()).toBe(true)
  })

  it('кликает по опции с детьми → раскрывается следующая колонка', async () => {
    const wrapper = mount(UidCascader, { props: { options } })
    await wrapper.find('.uid-cascader__trigger').trigger('click')
    await wrapper.findAll('.uid-cascader__option')[0].trigger('click')
    expect(wrapper.findAll('.uid-cascader__column')).toHaveLength(2)
  })

  it('выбор листа коммитит модель и закрывает', async () => {
    const wrapper = mount(UidCascader, { props: { options } })
    await wrapper.find('.uid-cascader__trigger').trigger('click')
    const cols = wrapper.findAll('.uid-cascader__column')
    await cols[0].findAll('.uid-cascader__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    const cols2 = wrapper.findAll('.uid-cascader__column')
    await cols2[1].findAll('.uid-cascader__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    const cols3 = wrapper.findAll('.uid-cascader__column')
    await cols3[2].findAll('.uid-cascader__option')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['ru', 'msk', 'tverskoy'])
    expect(wrapper.find('.uid-cascader__dropdown').exists()).toBe(false)
  })

  it('эмитит change с values и path', async () => {
    const wrapper = mount(UidCascader, { props: { options } })
    await wrapper.find('.uid-cascader__trigger').trigger('click')
    const cols = wrapper.findAll('.uid-cascader__column')
    await cols[0].findAll('.uid-cascader__option')[1].trigger('click')
    await wrapper.vm.$nextTick()
    const cols2 = wrapper.findAll('.uid-cascader__column')
    await cols2[1].findAll('.uid-cascader__option')[0].trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
    const evt = wrapper.emitted('change')?.at(-1)
    expect(evt?.[0]).toEqual(['us', 'ny'])
  })

  it('очистка сбрасывает значение', async () => {
    const wrapper = mount(UidCascader, {
      props: { options, modelValue: ['ru', 'msk', 'tverskoy'] },
    })
    await wrapper.find('.uid-cascader__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])
  })

  it('disabled блокирует открытие', async () => {
    const wrapper = mount(UidCascader, { props: { options, disabled: true } })
    await wrapper.find('.uid-cascader__trigger').trigger('click')
    expect(wrapper.find('.uid-cascader__dropdown').exists()).toBe(false)
  })

  it('not-clickable disabled опция не выбирается', async () => {
    const opts: CascaderOption[] = [
      { value: 'a', label: 'A', disabled: true },
    ]
    const wrapper = mount(UidCascader, { props: { options: opts } })
    await wrapper.find('.uid-cascader__trigger').trigger('click')
    await wrapper.findAll('.uid-cascader__option')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('кастомный separator', () => {
    const wrapper = mount(UidCascader, {
      props: { options, modelValue: ['ru', 'msk'], separator: ' › ' },
    })
    expect(wrapper.find('.uid-cascader__value').text()).toContain('›')
  })
})
