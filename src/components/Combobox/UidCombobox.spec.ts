import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidCombobox from './UidCombobox.vue'

const options = [
  { value: 1, label: 'Vue' },
  { value: 2, label: 'React' },
  { value: 3, label: 'Svelte' },
  { value: 4, label: 'Angular', disabled: true },
]

describe('UidCombobox', () => {
  it('рендерит input с placeholder', () => {
    const wrapper = mount(UidCombobox, { props: { options, placeholder: 'Выбери' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Выбери')
  })

  it('открывает дропдаун при фокусе', async () => {
    const wrapper = mount(UidCombobox, { props: { options } })
    await wrapper.find('input').trigger('focus')
    expect(wrapper.find('.uid-combobox__dropdown').exists()).toBe(true)
  })

  it('фильтрует по введённому тексту', async () => {
    const wrapper = mount(UidCombobox, { props: { options } })
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').setValue('vu')
    expect(wrapper.findAll('.uid-combobox__option')).toHaveLength(1)
    expect(wrapper.find('.uid-combobox__option').text()).toContain('Vue')
  })

  it('выбирает опцию по клику', async () => {
    const wrapper = mount(UidCombobox, { props: { options } })
    await wrapper.find('input').trigger('focus')
    await wrapper.findAll('.uid-combobox__option')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    expect(wrapper.emitted('change')?.[0]).toEqual([1])
  })

  it('не выбирает disabled опцию', async () => {
    const wrapper = mount(UidCombobox, { props: { options } })
    await wrapper.find('input').trigger('focus')
    const opts = wrapper.findAll('.uid-combobox__option')
    await opts[3].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('очищает значение', async () => {
    const wrapper = mount(UidCombobox, { props: { options, modelValue: 1, clearable: true } })
    await wrapper.find('.uid-combobox__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('навигация по стрелкам и Enter', async () => {
    const wrapper = mount(UidCombobox, { props: { options } })
    const input = wrapper.find('input')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
  })

  it('показывает empty text при отсутствии совпадений', async () => {
    const wrapper = mount(UidCombobox, { props: { options } })
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').setValue('xxx')
    expect(wrapper.find('.uid-combobox__empty').exists()).toBe(true)
  })

  it('предлагает создать при allowCreate', async () => {
    const wrapper = mount(UidCombobox, { props: { options, allowCreate: true } })
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').setValue('Solid')
    expect(wrapper.find('.uid-combobox__create').exists()).toBe(true)
  })

  it('эмитит create по клику на «Создать»', async () => {
    const wrapper = mount(UidCombobox, { props: { options, allowCreate: true } })
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').setValue('Solid')
    await wrapper.find('.uid-combobox__create').trigger('click')
    expect(wrapper.emitted('create')?.[0]).toEqual(['Solid'])
  })

  it('применяет кастомный фильтр', async () => {
    const filter = (o: { value: string | number; label: string }, q: string): boolean =>
      o.label.startsWith(q)
    const wrapper = mount(UidCombobox, { props: { options, filter } })
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').setValue('S')
    expect(wrapper.findAll('.uid-combobox__option')).toHaveLength(1)
    expect(wrapper.find('.uid-combobox__option').text()).toContain('Svelte')
  })

  it('блокируется при disabled', async () => {
    const wrapper = mount(UidCombobox, { props: { options, disabled: true } })
    await wrapper.find('input').trigger('focus')
    expect(wrapper.find('.uid-combobox__dropdown').exists()).toBe(false)
  })

  it('закрывается на Escape', async () => {
    const wrapper = mount(UidCombobox, { props: { options } })
    const input = wrapper.find('input')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.uid-combobox__dropdown').exists()).toBe(false)
  })
})
