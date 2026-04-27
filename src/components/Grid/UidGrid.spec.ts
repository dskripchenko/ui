import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidGrid from './UidGrid.vue'

describe('UidGrid', () => {
  it('рендерит div по умолчанию', () => {
    const wrapper = mount(UidGrid, { slots: { default: 'x' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('применяет пользовательский тег через as', () => {
    const wrapper = mount(UidGrid, { props: { as: 'ul' }, slots: { default: 'x' } })
    expect(wrapper.element.tagName).toBe('UL')
  })

  it('генерирует repeat(N, 1fr) для числового cols', () => {
    const wrapper = mount(UidGrid, { props: { cols: 3 }, slots: { default: 'x' } })
    expect(wrapper.element.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))')
  })

  it('принимает строковый cols', () => {
    const wrapper = mount(UidGrid, {
      props: { cols: '200px 1fr' },
      slots: { default: 'x' },
    })
    expect(wrapper.element.style.gridTemplateColumns).toBe('200px 1fr')
  })

  it('устанавливает gap', () => {
    const wrapper = mount(UidGrid, { props: { gap: '16px' }, slots: { default: 'x' } })
    expect(wrapper.element.style.gap).toBe('16px')
  })

  it('рендерит slot-контент', () => {
    const wrapper = mount(UidGrid, { slots: { default: '<div class="cell">x</div>' } })
    expect(wrapper.find('.cell').exists()).toBe(true)
  })
})
