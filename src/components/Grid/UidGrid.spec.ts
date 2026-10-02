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
    expect(wrapper.element.style.rowGap).toBe('16px')
    expect(wrapper.element.style.columnGap).toBe('16px')
  })

  it('keeps the default var() gap: no unset gap keys reach the style', () => {
    const wrapper = mount(UidGrid, { slots: { default: 'x' } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('row-gap: var(--uid-space-md)')
    expect(style).toContain('column-gap: var(--uid-space-md)')
    expect(style).not.toMatch(/(^|;)\s*gap:/)
  })

  it('a row or column gap replaces the shared gap on both axes', () => {
    const wrapper = mount(UidGrid, { props: { gap: '16px', colGap: '8px' }, slots: { default: 'x' } })
    expect(wrapper.element.style.columnGap).toBe('8px')
    expect(wrapper.element.style.rowGap).toBe('')
  })

  it('рендерит slot-контент', () => {
    const wrapper = mount(UidGrid, { slots: { default: '<div class="cell">x</div>' } })
    expect(wrapper.find('.cell').exists()).toBe(true)
  })
})
