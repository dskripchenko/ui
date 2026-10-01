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

  describe('searchable', () => {
    async function openSearch(props: Record<string, unknown> = {}) {
      const wrapper = mount(UidCascader, { props: { options, searchable: true, ...props } })
      await wrapper.find('.uid-cascader__trigger').trigger('click')
      return wrapper
    }

    it('рендерит поле поиска в дропдауне', async () => {
      const wrapper = await openSearch()
      expect(wrapper.find('.uid-cascader__search-input').exists()).toBe(true)
      expect(wrapper.findAll('.uid-cascader__column').length).toBeGreaterThan(0)
    })

    it('ищет по всем уровням и показывает полный путь листьев', async () => {
      const wrapper = await openSearch()
      await wrapper.find('.uid-cascader__search-input').setValue('моск')
      const results = wrapper.findAll('.uid-cascader__result')
      expect(results).toHaveLength(2)
      expect(results[0].text()).toContain('Россия')
      expect(results[0].text()).toContain('Москва')
      expect(results[0].text()).toContain('Тверской')
      expect(wrapper.find('.uid-cascader__column').exists()).toBe(false)
    })

    it('подсвечивает совпадение', async () => {
      const wrapper = await openSearch()
      await wrapper.find('.uid-cascader__search-input').setValue('арб')
      expect(wrapper.find('.uid-cascader__highlight').text()).toBe('Арб')
    })

    it('клик по результату коммитит путь и закрывает', async () => {
      const wrapper = await openSearch()
      await wrapper.find('.uid-cascader__search-input').setValue('нью')
      await wrapper.find('.uid-cascader__result').trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['us', 'ny']])
      const change = wrapper.emitted('change')?.[0]
      expect((change?.[1] as CascaderOption[]).map(o => o.label)).toEqual(['США', 'Нью-Йорк'])
      expect(wrapper.find('.uid-cascader__dropdown').exists()).toBe(false)
    })

    it('клавиатура: ArrowDown + Enter выбирает следующий результат', async () => {
      const wrapper = await openSearch()
      const input = wrapper.find('.uid-cascader__search-input')
      await input.setValue('моск')
      await input.trigger('keydown', { key: 'ArrowDown' })
      expect(wrapper.findAll('.uid-cascader__result')[1].classes()).toContain('uid-cascader__result--active')
      expect(input.attributes('aria-activedescendant')).toBe(wrapper.findAll('.uid-cascader__result')[1].attributes('id'))
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['ru', 'msk', 'arbat']])
    })

    it('пропускает disabled-ветки', async () => {
      const opts: CascaderOption[] = [
        { value: 'a', label: 'Alpha', disabled: true, children: [{ value: 'a1', label: 'Alpha one' }] },
        { value: 'b', label: 'Beta', children: [{ value: 'b1', label: 'Alpha two' }] },
      ]
      const wrapper = await openSearch({ options: opts })
      await wrapper.find('.uid-cascader__search-input').setValue('alpha')
      const results = wrapper.findAll('.uid-cascader__result')
      expect(results).toHaveLength(1)
      expect(results[0].text()).toContain('Beta')
    })

    it('показывает пустое состояние', async () => {
      const wrapper = await openSearch()
      await wrapper.find('.uid-cascader__search-input').setValue('zzz')
      expect(wrapper.find('.uid-cascader__empty').exists()).toBe(true)
    })

    it('с changeOnSelect в результатах есть промежуточные узлы', async () => {
      const wrapper = await openSearch({ changeOnSelect: true })
      await wrapper.find('.uid-cascader__search-input').setValue('моск')
      const results = wrapper.findAll('.uid-cascader__result')
      expect(results).toHaveLength(3)
      await results[0].trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['ru', 'msk']])
    })

    it('Escape закрывает дропдаун', async () => {
      const wrapper = await openSearch()
      await wrapper.find('.uid-cascader__search-input').trigger('keydown', { key: 'Escape' })
      expect(wrapper.find('.uid-cascader__dropdown').exists()).toBe(false)
    })
  })

  describe('changeOnSelect', () => {
    it('клик по промежуточному уровню коммитит частичный путь и не закрывает', async () => {
      const wrapper = mount(UidCascader, { props: { options, changeOnSelect: true } })
      await wrapper.find('.uid-cascader__trigger').trigger('click')
      await wrapper.findAll('.uid-cascader__option')[0].trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['ru']])
      expect(wrapper.emitted('change')?.[0]?.[0]).toEqual(['ru'])
      expect(wrapper.find('.uid-cascader__dropdown').exists()).toBe(true)
      expect(wrapper.findAll('.uid-cascader__column')).toHaveLength(2)
    })

    it('без changeOnSelect промежуточный уровень не коммитится', async () => {
      const wrapper = mount(UidCascader, { props: { options } })
      await wrapper.find('.uid-cascader__trigger').trigger('click')
      await wrapper.findAll('.uid-cascader__option')[0].trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('hover-раскрытие не коммитит значение', async () => {
      const wrapper = mount(UidCascader, {
        props: { options, changeOnSelect: true, expandTrigger: 'hover' },
      })
      await wrapper.find('.uid-cascader__trigger').trigger('click')
      await wrapper.findAll('.uid-cascader__option')[0].trigger('mouseenter')
      expect(wrapper.findAll('.uid-cascader__column')).toHaveLength(2)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('опции с детьми имеют aria-haspopup/aria-expanded', async () => {
      const wrapper = mount(UidCascader, { props: { options } })
      await wrapper.find('.uid-cascader__trigger').trigger('click')
      const first = wrapper.findAll('.uid-cascader__option')[0]
      expect(first.attributes('aria-haspopup')).toBe('true')
      expect(first.attributes('aria-expanded')).toBe('false')
    })
  })
})
