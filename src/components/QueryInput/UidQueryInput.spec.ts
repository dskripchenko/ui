import { mount, config } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import UidQueryInput from './UidQueryInput.vue'
import type { UidCodeToken } from '../Code/index.js'

beforeAll(() => { config.global.stubs.teleport = true })
afterAll(() => { delete config.global.stubs.teleport })

// Words: a field before "=", a value after it.
const tokenize = (text: string): UidCodeToken[] =>
  text.split(/(\s+|=)/).filter(Boolean).map((part, i, all) => ({
    type: part === '=' ? 'operator' : all[i + 1]?.trim() === '' && all[i + 2] === '=' ? 'property' : 'plain',
    text: part,
  }))

describe('UidQueryInput', () => {
  it('draws the text as tokens under a transparent field', () => {
    const wrapper = mount(UidQueryInput, { props: { modelValue: 'status = done', tokenize } })
    const mirror = wrapper.find('.uid-query-input__mirror')
    expect(mirror.text()).toBe('status = done')
    expect(mirror.find('.uid-query-input__tok--property').text()).toBe('status')
    expect(mirror.find('.uid-query-input__tok--operator').text()).toBe('=')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('status = done')
  })

  it('underlines the error and says why', () => {
    const wrapper = mount(UidQueryInput, { props: { modelValue: 'colour = red', tokenize, error: { position: 0, length: 6, message: 'No such field' } } })
    expect(wrapper.find('.uid-query-input__error').text()).toBe('colour')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('input').attributes('title')).toBe('No such field')
    expect(wrapper.classes()).toContain('uid-query-input--invalid')
  })

  it('offers words at the caret and puts the chosen one in place of the typed part', async () => {
    const suggest = (text: string, caret: number) => {
      const start = text.lastIndexOf(' ', caret - 1) + 1
      return { from: start, to: caret, options: [{ value: 'status', hint: 'field' }, { value: 'assignee' }] }
    }
    const wrapper = mount(UidQueryInput, { props: { modelValue: '', suggest }, attachTo: document.body })
    const input = wrapper.find('input')
    const el = input.element as HTMLInputElement
    el.focus()
    el.value = 'st'
    el.setSelectionRange(2, 2)
    await input.trigger('input')
    await nextTick()
    expect(wrapper.findAll('.uid-query-input__option')).toHaveLength(2)

    await input.trigger('keydown', { key: 'Enter' })
    const updates = wrapper.emitted('update:modelValue') ?? []
    expect(updates[updates.length - 1]).toEqual(['status '])
    expect(wrapper.emitted('submit')).toBeUndefined()
    wrapper.unmount()
  })

  it('submits on Enter when nothing is offered', async () => {
    const wrapper = mount(UidQueryInput, { props: { modelValue: 'status = done' } })
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')).toEqual([['status = done']])
  })

  it('shows its prefix and suffix', () => {
    const wrapper = mount(UidQueryInput, { props: { prefix: 'QL' }, slots: { suffix: '✓ 12' } })
    expect(wrapper.find('.uid-query-input__prefix').text()).toBe('QL')
    expect(wrapper.find('.uid-query-input__suffix').text()).toBe('✓ 12')
  })
})
