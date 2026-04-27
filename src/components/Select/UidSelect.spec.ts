import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSelect from './UidSelect.vue'
import type { SelectOption } from './UidSelect.vue'

const options: SelectOption[] = [
  { value: 'ru', label: 'Россия' },
  { value: 'us', label: 'США' },
  { value: 'de', label: 'Германия', group: 'Европа' },
  { value: 'fr', label: 'Франция', group: 'Европа' },
  { value: 'jp', label: 'Япония', disabled: true },
]

describe('UidSelect', () => {
  it('рендерит placeholder по умолчанию', () => {
    const wrapper = mount(UidSelect, { props: { options } })
    expect(wrapper.find('.uid-select__value').text()).toBe('Выберите...')
    expect(wrapper.find('.uid-select__value').classes()).toContain('uid-select__value--placeholder')
  })

  it('показывает label выбранного значения', () => {
    const wrapper = mount(UidSelect, { props: { options, modelValue: 'ru' } })
    expect(wrapper.find('.uid-select__value').text()).toBe('Россия')
  })

  it('открывает dropdown при клике', async () => {
    const wrapper = mount(UidSelect, { props: { options } })
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(wrapper.find('.uid-select__dropdown').exists()).toBe(true)
  })

  it('закрывает dropdown повторным кликом', async () => {
    const wrapper = mount(UidSelect, { props: { options } })
    await wrapper.find('.uid-select__trigger').trigger('click')
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(wrapper.find('.uid-select__dropdown').exists()).toBe(false)
  })

  it('рендерит все опции', async () => {
    const wrapper = mount(UidSelect, { props: { options } })
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(wrapper.findAll('.uid-select__option')).toHaveLength(5)
  })

  it('выбирает опцию при клике', async () => {
    const wrapper = mount(UidSelect, { props: { options } })
    await wrapper.find('.uid-select__trigger').trigger('click')
    await wrapper.findAll('.uid-select__option')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['us'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['us'])
  })

  it('не выбирает disabled опцию', async () => {
    const wrapper = mount(UidSelect, { props: { options } })
    await wrapper.find('.uid-select__trigger').trigger('click')
    const disabled = wrapper.findAll('.uid-select__option').find(o =>
      o.classes().includes('uid-select__option--disabled'),
    )!
    await disabled.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('рендерит group labels', async () => {
    const wrapper = mount(UidSelect, { props: { options } })
    await wrapper.find('.uid-select__trigger').trigger('click')
    const labels = wrapper.findAll('.uid-select__group-label')
    expect(labels.some(l => l.text() === 'Европа')).toBe(true)
  })

  it('фильтрует при searchable=true', async () => {
    const wrapper = mount(UidSelect, { props: { options, searchable: true } })
    await wrapper.find('.uid-select__trigger').trigger('click')
    await wrapper.find('.uid-select__search-input').setValue('фра')
    expect(wrapper.findAll('.uid-select__option')).toHaveLength(1)
    expect(wrapper.find('.uid-select__option').text()).toContain('Франция')
  })

  it('показывает empty когда ничего не найдено', async () => {
    const wrapper = mount(UidSelect, { props: { options, searchable: true } })
    await wrapper.find('.uid-select__trigger').trigger('click')
    await wrapper.find('.uid-select__search-input').setValue('zzz')
    expect(wrapper.find('.uid-select__empty').exists()).toBe(true)
  })

  it('рендерит кнопку clear когда clearable и есть значение', () => {
    const wrapper = mount(UidSelect, { props: { options, modelValue: 'ru', clearable: true } })
    expect(wrapper.find('.uid-select__clear').exists()).toBe(true)
  })

  it('очищает значение при клике на clear', async () => {
    const wrapper = mount(UidSelect, { props: { options, modelValue: 'ru', clearable: true } })
    await wrapper.find('.uid-select__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('не открывается при disabled=true', async () => {
    const wrapper = mount(UidSelect, { props: { options, disabled: true } })
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(wrapper.find('.uid-select__dropdown').exists()).toBe(false)
  })

  it('применяет size класс', () => {
    const wrapper = mount(UidSelect, { props: { options, size: 'sm' } })
    expect(wrapper.classes()).toContain('uid-select--sm')
  })
})
