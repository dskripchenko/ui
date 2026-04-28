import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTagsInput from './UidTagsInput.vue'

describe('UidTagsInput', () => {
  it('рендерит чипы', () => {
    const wrapper = mount(UidTagsInput, {
      props: { modelValue: ['vue', 'react', 'svelte'] },
    })
    expect(wrapper.findAll('.uid-tags-input__chip')).toHaveLength(3)
  })

  it('добавляет чип по Enter', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: [] } })
    const input = wrapper.find('input')
    await input.setValue('vue')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['vue']])
  })

  it('добавляет чип по запятой', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: [] } })
    const input = wrapper.find('input')
    const el = input.element as HTMLInputElement
    el.value = 'vue,'
    await input.trigger('input')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['vue']])
  })

  it('эмитит add', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: [] } })
    const input = wrapper.find('input')
    await input.setValue('vue')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('add')?.[0]).toEqual(['vue'])
  })

  it('удаляет чип по клику на ×', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: ['vue', 'react'] } })
    await wrapper.findAll('.uid-tags-input__chip-remove')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['react']])
    expect(wrapper.emitted('remove')?.[0]).toEqual(['vue', 0])
  })

  it('удаляет последний чип по Backspace при пустом инпуте', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: ['vue', 'react'] } })
    await wrapper.find('input').trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['vue']])
  })

  it('игнорирует дубликаты при unique=true', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: ['vue'], unique: true } })
    const input = wrapper.find('input')
    await input.setValue('vue')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('допускает дубликаты при unique=false', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: ['vue'], unique: false } })
    const input = wrapper.find('input')
    await input.setValue('vue')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['vue', 'vue']])
  })

  it('останавливается на max', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: ['a', 'b'], max: 2 } })
    const input = wrapper.find('input')
    await input.setValue('c')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('применяет validate', async () => {
    const validate = (v: string): boolean => v.includes('@')
    const wrapper = mount(UidTagsInput, { props: { modelValue: [], validate } })
    const input = wrapper.find('input')
    await input.setValue('not-email')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await input.setValue('a@b.com')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a@b.com']])
  })

  it('игнорирует пустую строку', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: [] } })
    const input = wrapper.find('input')
    await input.setValue('   ')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('блокируется при disabled', () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: ['a'], disabled: true } })
    expect(wrapper.classes()).toContain('uid-tags-input--disabled')
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('показывает label', () => {
    const wrapper = mount(UidTagsInput, { props: { label: 'Теги' } })
    expect(wrapper.find('.uid-tags-input__label').text()).toContain('Теги')
  })

  it('показывает ошибку', () => {
    const wrapper = mount(UidTagsInput, { props: { error: 'Ошибка' } })
    expect(wrapper.find('.uid-tags-input__hint--error').text()).toBe('Ошибка')
    expect(wrapper.classes()).toContain('uid-tags-input--error')
  })

  it('коммитит на blur', async () => {
    const wrapper = mount(UidTagsInput, { props: { modelValue: [] } })
    const input = wrapper.find('input')
    await input.setValue('vue')
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['vue']])
  })
})
