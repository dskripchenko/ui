import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidCheckboxGroup from './UidCheckboxGroup.vue'
import type { CheckboxGroupOption } from './UidCheckboxGroup.vue'

const options: CheckboxGroupOption[] = [
  { value: 'read', label: 'Чтение' },
  { value: 'write', label: 'Запись' },
  { value: 'delete', label: 'Удаление', disabled: true },
  { value: 4, label: 'Числовое' },
]

describe('UidCheckboxGroup', () => {
  it('рендерит чекбокс на каждую опцию с role="group"', () => {
    const wrapper = mount(UidCheckboxGroup, { props: { options } })
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(4)
    expect(wrapper.findAll('.uid-checkbox__text').map(t => t.text())).toEqual(['Чтение', 'Запись', 'Удаление', 'Числовое'])
  })

  it('отмечает значения из v-model', () => {
    const wrapper = mount(UidCheckboxGroup, { props: { options, modelValue: ['write', 4] } })
    const inputs = wrapper.findAll<HTMLInputElement>('input')
    expect(inputs.map(i => i.element.checked)).toEqual([false, true, false, true])
  })

  it('добавляет значение в порядке опций и эмитит update:modelValue + change', async () => {
    const wrapper = mount(UidCheckboxGroup, { props: { options, modelValue: [4] } })
    await wrapper.findAll('input')[0].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['read', 4]])
    expect(wrapper.emitted('change')?.[0]).toEqual([['read', 4]])
  })

  it('снимает значение', async () => {
    const wrapper = mount(UidCheckboxGroup, { props: { options, modelValue: ['read', 'write'] } })
    await wrapper.findAll('input')[0].setValue(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['write']])
  })

  it('сохраняет значения, которых нет среди опций', async () => {
    const wrapper = mount(UidCheckboxGroup, { props: { options, modelValue: ['legacy'] } })
    await wrapper.findAll('input')[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['write', 'legacy']])
  })

  it('disabled опция и disabled группа блокируют чекбоксы', () => {
    const wrapper = mount(UidCheckboxGroup, { props: { options } })
    expect(wrapper.findAll('input')[2].attributes('disabled')).toBeDefined()
    const all = mount(UidCheckboxGroup, { props: { options, disabled: true } })
    expect(all.findAll('input').every(i => i.attributes('disabled') !== undefined)).toBe(true)
    expect(all.classes()).toContain('uid-checkbox-group--disabled')
  })

  it('label связывается через aria-labelledby, error — через aria-describedby', () => {
    const wrapper = mount(UidCheckboxGroup, { props: { options, label: 'Права', required: true, error: 'Выберите право' } })
    const legend = wrapper.find('.uid-checkbox-group__legend')
    expect(legend.text()).toContain('Права')
    expect(wrapper.attributes('aria-labelledby')).toBe(legend.attributes('id'))
    const hint = wrapper.find('.uid-checkbox-group__hint--error')
    expect(hint.text()).toBe('Выберите право')
    expect(wrapper.attributes('aria-describedby')).toBe(hint.attributes('id'))
    expect(wrapper.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('.uid-checkbox-group__required').exists()).toBe(true)
  })

  it('direction=horizontal применяет класс', () => {
    const wrapper = mount(UidCheckboxGroup, { props: { options, direction: 'horizontal' } })
    expect(wrapper.classes()).toContain('uid-checkbox-group--horizontal')
  })

  it('общий name у всех чекбоксов', () => {
    const wrapper = mount(UidCheckboxGroup, { props: { options, name: 'perms' } })
    expect(wrapper.findAll('input').every(i => i.attributes('name') === 'perms')).toBe(true)
  })
})
