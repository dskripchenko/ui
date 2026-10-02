import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { Component } from 'vue'
import UidInput from '../components/Input/UidInput.vue'
import UidTextarea from '../components/Textarea/UidTextarea.vue'
import UidNumberInput from '../components/NumberInput/UidNumberInput.vue'
import UidCheckbox from '../components/Checkbox/UidCheckbox.vue'
import UidSwitch from '../components/Switch/UidSwitch.vue'
import UidRadio from '../components/Radio/UidRadio.vue'
import UidSlider from '../components/Slider/UidSlider.vue'
import UidTagsInput from '../components/TagsInput/UidTagsInput.vue'
import UidCombobox from '../components/Combobox/UidCombobox.vue'
import UidMention from '../components/Mention/UidMention.vue'
import UidPageSize from '../components/Pagination/UidPageSize.vue'

const cases: Array<[string, Component, Record<string, unknown>, string, string]> = [
  ['UidInput', UidInput, {}, 'input', 'uid-input-field'],
  ['UidTextarea', UidTextarea, {}, 'textarea', 'uid-textarea-field'],
  ['UidNumberInput', UidNumberInput, {}, 'input', 'uid-number-input'],
  ['UidCheckbox', UidCheckbox, {}, 'input', 'uid-checkbox'],
  ['UidSwitch', UidSwitch, {}, 'input', 'uid-switch'],
  ['UidRadio', UidRadio, { value: 'a' }, 'input', 'uid-radio'],
  ['UidSlider', UidSlider, {}, 'input', 'uid-slider'],
  ['UidTagsInput', UidTagsInput, {}, 'input', 'uid-tags-input'],
  ['UidCombobox', UidCombobox, { options: [] }, 'input', 'uid-combobox'],
  ['UidMention', UidMention, {}, 'textarea', 'uid-mention'],
  ['UidPageSize', UidPageSize, {}, 'select', 'uid-page-size'],
]

describe.each(cases)('%s: native attrs', (_name, Comp, props, tag, rootClass) => {
  it('puts unknown attributes on the native control, not the root', () => {
    const wrapper = mount(Comp, {
      props,
      attrs: { 'data-native': '1', 'title': 'hi', 'spellcheck': 'false' },
    })
    const control = wrapper.find(tag)
    expect(control.attributes('data-native')).toBe('1')
    expect(control.attributes('title')).toBe('hi')
    expect(control.attributes('spellcheck')).toBe('false')
    expect(wrapper.element.hasAttribute('data-native')).toBe(false)
    expect(wrapper.element.hasAttribute('title')).toBe(false)
  })

  it('keeps class and style on the root and off the control', () => {
    const wrapper = mount(Comp, {
      props,
      attrs: { class: 'custom-cls', style: 'margin-top: 7px' },
    })
    expect(wrapper.classes()).toContain('custom-cls')
    expect(wrapper.classes()).toContain(rootClass)
    expect((wrapper.element as HTMLElement).style.marginTop).toBe('7px')
    const control = wrapper.find(tag)
    expect(control.classes()).not.toContain('custom-cls')
    expect((control.element as HTMLElement).style.marginTop).toBe('')
  })

  it('keeps fallthrough event listeners working', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Comp, { props, attrs: { onClick } })
    await wrapper.find(tag).trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('native text-field attributes', () => {
  it('UidInput forwards list, maxlength, minlength, pattern, inputmode, name, spellcheck', () => {
    const wrapper = mount(UidInput, {
      attrs: { list: 'opts', maxlength: 6, minlength: 2, pattern: '[0-9]*', inputmode: 'numeric', spellcheck: 'false' },
      props: { name: 'code', autocomplete: 'one-time-code' },
    })
    const input = wrapper.find('input')
    expect(input.attributes('list')).toBe('opts')
    expect(input.attributes('maxlength')).toBe('6')
    expect(input.attributes('minlength')).toBe('2')
    expect(input.attributes('pattern')).toBe('[0-9]*')
    expect(input.attributes('inputmode')).toBe('numeric')
    expect(input.attributes('spellcheck')).toBe('false')
    expect(input.attributes('name')).toBe('code')
    expect(input.attributes('autocomplete')).toBe('one-time-code')
  })

  it('UidInput still emits v-model updates and listens to native input', async () => {
    const onInput = vi.fn()
    const wrapper = mount(UidInput, { attrs: { onInput } })
    await wrapper.find('input').setValue('abc')
    expect(onInput).toHaveBeenCalled()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['abc'])
  })

  it('UidTextarea forwards maxlength and spellcheck', () => {
    const wrapper = mount(UidTextarea, { attrs: { maxlength: 20, spellcheck: 'false' } })
    expect(wrapper.find('textarea').attributes('maxlength')).toBe('20')
    expect(wrapper.find('textarea').attributes('spellcheck')).toBe('false')
  })

  it('UidNumberInput lets inputmode be overridden and forwards autocomplete', () => {
    const wrapper = mount(UidNumberInput, { attrs: { inputmode: 'numeric', autocomplete: 'off' } })
    expect(wrapper.find('input').attributes('inputmode')).toBe('numeric')
    expect(wrapper.find('input').attributes('autocomplete')).toBe('off')
    expect(mount(UidNumberInput).find('input').attributes('inputmode')).toBe('decimal')
  })
})
