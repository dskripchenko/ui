import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import UidCodeInput from './UidCodeInput.vue'
import { provideLocale } from '../../composables/useLocale.js'
import { en } from '../../locales/en.js'

const wrappers: VueWrapper[] = []
afterEach(() => {
  code.value = ''
  while (wrappers.length) wrappers.pop()!.unmount()
  document.body.innerHTML = ''
})

function setup(props: Record<string, unknown> = {}) {
  const w = mount(UidCodeInput, {
    props: {
      modelValue: '',
      'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }),
      ...props,
    },
    attachTo: document.body,
  })
  wrappers.push(w)
  return w
}

const cells = (w: VueWrapper) => w.findAll('input.uid-code-input__cell')
const values = (w: VueWrapper) => cells(w).map(c => (c.element as HTMLInputElement).value).join('|')
const cell = (w: VueWrapper, i: number) => cells(w)[i]!.element as HTMLInputElement
const focused = (w: VueWrapper) => cells(w).findIndex(c => c.element === document.activeElement)

function paste(el: Element, text: string): void {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & { clipboardData: unknown }
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } })
  el.dispatchEvent(event)
}

const code = ref('')
/** A parent holding the value in a ref; `english` provides the English locale. */
const Host = defineComponent({
  props: { english: Boolean, length: { type: Number, default: 6 } },
  setup(props) {
    if (props.english) provideLocale(en)
    return () => h(UidCodeInput, {
      length: props.length,
      modelValue: code.value,
      'onUpdate:modelValue': (v: string) => { code.value = v },
    })
  },
})

async function type(w: VueWrapper, i: number, key: string) {
  await cells(w)[i]!.trigger('keydown', { key })
}

describe('UidCodeInput', () => {
  it('renders length cells in a labelled group', () => {
    const w = setup()
    expect(cells(w)).toHaveLength(6)
    const group = w.get('.uid-code-input')
    expect(group.attributes('role')).toBe('group')
    expect(group.attributes('aria-label')).toBe('Код подтверждения')
    expect(cells(w)[1]!.attributes('aria-label')).toBe('Символ 2 из 6')
    expect(setup({ length: 4 }).findAll('input')).toHaveLength(4)
  })

  it('first cell carries autocomplete one-time-code, numeric inputmode', () => {
    const w = setup()
    expect(cells(w)[0]!.attributes('autocomplete')).toBe('one-time-code')
    expect(cells(w)[1]!.attributes('autocomplete')).toBe('off')
    for (const c of cells(w)) expect(c.attributes('inputmode')).toBe('numeric')
    expect(setup({ mode: 'alphanumeric' }).get('input').attributes('inputmode')).toBe('text')
  })

  it('typing fills the cell and moves focus to the next one', async () => {
    const w = setup()
    cell(w, 0).focus()
    await type(w, 0, '1')
    expect(w.props('modelValue')).toBe('1')
    expect(focused(w)).toBe(1)
    await type(w, 1, '2')
    await type(w, 2, '3')
    expect(values(w)).toBe('1|2|3|||')
    expect(focused(w)).toBe(3)
  })

  it('takes input events from virtual keyboards too', async () => {
    const w = setup()
    await cells(w)[0]!.setValue('7')
    expect(w.props('modelValue')).toBe('7')
    expect(focused(w)).toBe(1)
  })

  it('typing into a filled cell replaces it', async () => {
    const w = setup({ modelValue: '123456' })
    await type(w, 2, '9')
    expect(w.props('modelValue')).toBe('129456')
    expect(focused(w)).toBe(3)
  })

  it('rejects letters in numeric mode', async () => {
    const w = setup()
    cell(w, 0).focus()
    await type(w, 0, 'a')
    await cells(w)[0]!.setValue('b')
    expect(w.props('modelValue')).toBe('')
    expect(values(w)).toBe('|||||')
    expect(focused(w)).toBe(0)
  })

  it('takes letters and digits in alphanumeric mode, uppercased', async () => {
    const w = setup({ mode: 'alphanumeric', length: 4 })
    await type(w, 0, 'a')
    await type(w, 1, '7')
    await type(w, 2, '-')
    expect(w.props('modelValue')).toBe('A7')
    paste(cells(w)[0]!.element, 'ab-12')
    await nextTick()
    expect(w.props('modelValue')).toBe('AB12')
  })

  it('Backspace clears the cell, and on an empty cell clears the previous one and moves there', async () => {
    const w = setup({ modelValue: '123' })
    cell(w, 2).focus()
    await type(w, 2, 'Backspace')
    expect(w.props('modelValue')).toBe('12')
    expect(focused(w)).toBe(2)
    await type(w, 2, 'Backspace')
    expect(w.props('modelValue')).toBe('1')
    expect(focused(w)).toBe(1)
    cell(w, 0).focus()
    await type(w, 0, 'Backspace')
    await type(w, 0, 'Backspace')
    expect(w.props('modelValue')).toBe('')
    expect(focused(w)).toBe(0)
  })

  it('arrows, Home and End move between cells', async () => {
    const w = setup()
    cell(w, 2).focus()
    await type(w, 2, 'ArrowRight')
    expect(focused(w)).toBe(3)
    await type(w, 3, 'ArrowLeft')
    await type(w, 2, 'ArrowLeft')
    expect(focused(w)).toBe(1)
    await type(w, 1, 'End')
    expect(focused(w)).toBe(5)
    await type(w, 5, 'ArrowRight')
    expect(focused(w)).toBe(5)
    await type(w, 5, 'Home')
    expect(focused(w)).toBe(0)
    await type(w, 0, 'ArrowLeft')
    expect(focused(w)).toBe(0)
  })

  it.each(['123 456', '12-34-56', '123456'])('pasting "%s" anywhere spreads it from the first cell', async (text) => {
    const w = setup()
    paste(cells(w)[3]!.element, text)
    await nextTick()
    expect(w.props('modelValue')).toBe('123456')
    expect(values(w)).toBe('1|2|3|4|5|6')
    expect(w.emitted('complete')).toEqual([['123456']])
  })

  it('a shorter paste fills from the first cell and focuses the next empty one', async () => {
    const w = setup({ modelValue: '999999' })
    paste(cells(w)[0]!.element, '12')
    await nextTick()
    expect(values(w)).toBe('1|2||||')
    expect(focused(w)).toBe(2)
  })

  it('a whole code put into one cell by autofill is spread over the cells', async () => {
    const w = setup()
    await cells(w)[0]!.setValue('654321')
    expect(w.props('modelValue')).toBe('654321')
    expect(values(w)).toBe('6|5|4|3|2|1')
  })

  it('emits complete once when all cells are filled', async () => {
    const w = setup()
    for (let i = 0; i < 6; i++) await type(w, i, String(i + 1))
    expect(w.emitted('complete')).toEqual([['123456']])
    // Re-focusing or moving does not fire it again.
    await type(w, 5, 'Home')
    expect(w.emitted('complete')).toHaveLength(1)
    // A changed complete code fires again; an incomplete one does not.
    await type(w, 0, 'Backspace')
    expect(w.emitted('complete')).toHaveLength(1)
    await type(w, 0, '9')
    expect(w.emitted('complete')).toEqual([['123456'], ['923456']])
  })

  it('follows v-model from outside without emitting complete', async () => {
    const w = setup()
    await w.setProps({ modelValue: '4821' })
    expect(values(w)).toBe('4|8|2|1||')
    await w.setProps({ modelValue: '12a3456789' })
    expect(values(w)).toBe('1|2|3|4|5|6')
    await w.setProps({ modelValue: '' })
    expect(values(w)).toBe('|||||')
    expect(w.emitted('complete')).toBeUndefined()
  })

  it('works with v-model in a parent', async () => {
    const w = mount(Host, { attachTo: document.body })
    wrappers.push(w)
    await w.findAll('input')[0]!.trigger('keydown', { key: '5' })
    expect(code.value).toBe('5')
    code.value = '000000'
    await nextTick()
    expect(w.findAll('input').map(i => (i.element as HTMLInputElement).value).join('')).toBe('000000')
  })

  it('invalid sets aria-invalid on every cell and the error class', () => {
    const w = setup({ invalid: true })
    expect(w.classes()).toContain('uid-code-input--invalid')
    for (const c of cells(w)) expect(c.attributes('aria-invalid')).toBe('true')
    expect(setup().get('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('disabled disables every cell and ignores keys', async () => {
    const w = setup({ disabled: true })
    for (const c of cells(w)) expect(c.attributes('disabled')).toBeDefined()
    await type(w, 0, '1')
    expect(w.props('modelValue')).toBe('')
  })

  it('name puts the whole value into a hidden input', async () => {
    const w = setup({ name: 'code', modelValue: '12' })
    const hidden = w.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('code')
    expect((hidden.element as HTMLInputElement).value).toBe('12')
    for (const c of cells(w)) expect(c.attributes('name')).toBeUndefined()
    await type(w, 2, '3')
    expect((hidden.element as HTMLInputElement).value).toBe('123')
    expect(setup().find('input[type="hidden"]').exists()).toBe(false)
  })

  it('size and label', () => {
    const w = setup({ size: 'lg', label: 'Code from the app' })
    expect(w.classes()).toContain('uid-code-input--lg')
    expect(w.attributes('aria-label')).toBe('Code from the app')
    expect(setup().classes()).toContain('uid-code-input--md')
  })

  it('autofocus focuses the first empty cell', async () => {
    const w = setup({ autofocus: true, modelValue: '12' })
    await nextTick()
    expect(focused(w)).toBe(2)
  })

  it('exposes focus() and clear()', async () => {
    const w = setup({ modelValue: '123' })
    const api = w.vm as unknown as { focus(): void; clear(): void }
    api.focus()
    expect(focused(w)).toBe(3)
    api.clear()
    await nextTick()
    expect(w.props('modelValue')).toBe('')
    expect(values(w)).toBe('|||||')
  })

  it('selects the content of a focused cell', async () => {
    const w = setup({ modelValue: '123456' })
    const el = cells(w)[2]!.element as HTMLInputElement
    el.focus()
    await cells(w)[2]!.trigger('focus')
    expect(el.selectionStart).toBe(0)
    expect(el.selectionEnd).toBe(1)
  })

  it('takes English captions from the locale', () => {
    const w = mount(Host, { props: { english: true, length: 4 } })
    wrappers.push(w)
    expect(w.get('[role="group"]').attributes('aria-label')).toBe('Verification code')
    expect(w.findAll('input')[3]!.attributes('aria-label')).toBe('Character 4 of 4')
  })
})
