import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import UidMention from './UidMention.vue'

const options = [
  { value: 'alice', label: 'Alice', hint: 'Designer' },
  { value: 'bob', label: 'Bob', hint: 'Developer' },
  { value: 'charlie', label: 'Charlie', hint: 'PM' },
]

describe('UidMention', () => {
  it('рендерит textarea', () => {
    const wrapper = mount(UidMention, { props: { options } })
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('применяет label', () => {
    const wrapper = mount(UidMention, { props: { options, label: 'Сообщение' } })
    expect(wrapper.find('.uid-mention__label').text()).toBe('Сообщение')
  })

  it('открывает дропдаун при @', async () => {
    const wrapper = mount(UidMention, { props: { options, modelValue: '' }, attachTo: document.body })
    const ta = wrapper.find('textarea')
    const el = ta.element as HTMLTextAreaElement
    el.value = '@'
    el.selectionStart = 1
    await ta.trigger('input')
    expect(wrapper.find('.uid-mention__dropdown').exists()).toBe(true)
    wrapper.unmount()
  })

  it('фильтрует опции по запросу', async () => {
    const wrapper = mount(UidMention, { props: { options }, attachTo: document.body })
    const ta = wrapper.find('textarea')
    const el = ta.element as HTMLTextAreaElement
    el.value = '@al'
    el.selectionStart = 3
    await ta.trigger('input')
    const opts = wrapper.findAll('.uid-mention__option')
    expect(opts).toHaveLength(1)
    expect(opts[0].text()).toContain('Alice')
    wrapper.unmount()
  })

  it('вставляет mention при выборе', async () => {
    const wrapper = mount(UidMention, { props: { options, modelValue: 'Hi @' }, attachTo: document.body })
    const ta = wrapper.find('textarea')
    const el = ta.element as HTMLTextAreaElement
    el.value = 'Hi @'
    el.selectionStart = 4
    await ta.trigger('input')
    await wrapper.findAll('.uid-mention__option')[0].trigger('mousedown')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('Hi @alice ')
    wrapper.unmount()
  })

  it('эмитит select', async () => {
    const wrapper = mount(UidMention, { props: { options, modelValue: '@' }, attachTo: document.body })
    const ta = wrapper.find('textarea')
    const el = ta.element as HTMLTextAreaElement
    el.value = '@'
    el.selectionStart = 1
    await ta.trigger('input')
    await wrapper.findAll('.uid-mention__option')[0].trigger('mousedown')
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(options[0])
    expect(wrapper.emitted('select')?.[0]?.[1]).toBe('@')
    wrapper.unmount()
  })

  it('навигация ArrowDown/ArrowUp', async () => {
    const wrapper = mount(UidMention, { props: { options, modelValue: '@' }, attachTo: document.body })
    const ta = wrapper.find('textarea')
    const el = ta.element as HTMLTextAreaElement
    el.value = '@'
    el.selectionStart = 1
    await ta.trigger('input')
    await ta.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    const opts = wrapper.findAll('.uid-mention__option')
    expect(opts[1].classes()).toContain('uid-mention__option--active')
    await ta.trigger('keydown', { key: 'ArrowUp' })
    await nextTick()
    expect(wrapper.findAll('.uid-mention__option')[0].classes()).toContain('uid-mention__option--active')
    wrapper.unmount()
  })

  it('Enter выбирает активную опцию', async () => {
    const wrapper = mount(UidMention, { props: { options, modelValue: '@' }, attachTo: document.body })
    const ta = wrapper.find('textarea')
    const el = ta.element as HTMLTextAreaElement
    el.value = '@'
    el.selectionStart = 1
    await ta.trigger('input')
    await ta.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toBeTruthy()
    wrapper.unmount()
  })

  it('Escape закрывает дропдаун', async () => {
    const wrapper = mount(UidMention, { props: { options, modelValue: '@' }, attachTo: document.body })
    const ta = wrapper.find('textarea')
    const el = ta.element as HTMLTextAreaElement
    el.value = '@'
    el.selectionStart = 1
    await ta.trigger('input')
    expect(wrapper.find('.uid-mention__dropdown').exists()).toBe(true)
    await ta.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.uid-mention__dropdown').exists()).toBe(false)
    wrapper.unmount()
  })

  it('кастомный prefix', async () => {
    const wrapper = mount(UidMention, {
      props: { options, prefix: '#', modelValue: '' },
      attachTo: document.body,
    })
    const ta = wrapper.find('textarea')
    const el = ta.element as HTMLTextAreaElement
    el.value = '#'
    el.selectionStart = 1
    await ta.trigger('input')
    expect(wrapper.find('.uid-mention__dropdown').exists()).toBe(true)
    wrapper.unmount()
  })

  it('disabled блокирует ввод', () => {
    const wrapper = mount(UidMention, { props: { options, disabled: true } })
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('uid-mention--disabled')
  })

  it('не открывается без @', async () => {
    const wrapper = mount(UidMention, { props: { options, modelValue: '' }, attachTo: document.body })
    const ta = wrapper.find('textarea')
    const el = ta.element as HTMLTextAreaElement
    el.value = 'hello world'
    el.selectionStart = 11
    await ta.trigger('input')
    expect(wrapper.find('.uid-mention__dropdown').exists()).toBe(false)
    wrapper.unmount()
  })
})
