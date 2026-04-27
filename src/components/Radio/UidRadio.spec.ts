import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidRadio from './UidRadio.vue'
import UidRadioGroup from './UidRadioGroup.vue'

describe('UidRadio', () => {
  it('рендерит label', () => {
    const wrapper = mount(UidRadio, { props: { value: 'a', label: 'Вариант A' } })
    expect(wrapper.find('.uid-radio__text').text()).toBe('Вариант A')
  })

  it('отображает кружок', () => {
    const wrapper = mount(UidRadio, { props: { value: 'a' } })
    expect(wrapper.find('.uid-radio__circle').exists()).toBe(true)
  })

  it('checked при совпадении modelValue и value', () => {
    const wrapper = mount(UidRadio, { props: { value: 'a', modelValue: 'a' } })
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('не checked при несовпадении', () => {
    const wrapper = mount(UidRadio, { props: { value: 'a', modelValue: 'b' } })
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(false)
  })

  it('применяет disabled', () => {
    const wrapper = mount(UidRadio, { props: { value: 'a', disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('uid-radio--disabled')
  })

  it('эмитит update:modelValue при change', async () => {
    const wrapper = mount(UidRadio, { props: { value: 'a', modelValue: 'b' } })
    await wrapper.find('input').trigger('change')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a'])
  })
})

describe('UidRadioGroup', () => {
  it('рендерит legend при наличии label', () => {
    const wrapper = mount(UidRadioGroup, {
      props: { label: 'Группа', modelValue: undefined },
      slots: { default: '' },
    })
    expect(wrapper.find('.uid-radio-group__legend').text()).toContain('Группа')
  })

  it('показывает * при required=true', () => {
    const wrapper = mount(UidRadioGroup, {
      props: { label: 'Группа', required: true, modelValue: undefined },
      slots: { default: '' },
    })
    expect(wrapper.find('.uid-radio-group__required').exists()).toBe(true)
  })

  it('показывает ошибку и добавляет error-класс', () => {
    const wrapper = mount(UidRadioGroup, {
      props: { error: 'Выберите вариант', modelValue: undefined },
      slots: { default: '' },
    })
    expect(wrapper.find('.uid-radio-group__hint--error').text()).toBe('Выберите вариант')
    expect(wrapper.classes()).toContain('uid-radio-group--error')
  })

  it('применяет disabled-класс', () => {
    const wrapper = mount(UidRadioGroup, {
      props: { disabled: true, modelValue: undefined },
      slots: { default: '' },
    })
    expect(wrapper.classes()).toContain('uid-radio-group--disabled')
  })

  it('role="radiogroup" присутствует', () => {
    const wrapper = mount(UidRadioGroup, {
      props: { modelValue: undefined },
      slots: { default: '' },
    })
    expect(wrapper.attributes('role')).toBe('radiogroup')
  })

  it('передаёт контекст дочерним UidRadio', async () => {
    const wrapper = mount(UidRadioGroup, {
      props: { modelValue: 'a', label: 'Тест' },
      slots: {
        default: `
          <UidRadio value="a" label="A" />
          <UidRadio value="b" label="B" />
        `,
      },
      global: { components: { UidRadio } },
    })
    const inputs = wrapper.findAll('input[type=radio]')
    expect((inputs[0].element as HTMLInputElement).checked).toBe(true)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(false)
  })
})
