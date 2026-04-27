import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidStack from './UidStack.vue'

describe('UidStack', () => {
  it('рендерит div по умолчанию', () => {
    const wrapper = mount(UidStack, { slots: { default: '<span>A</span>' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('применяет пользовательский тег через as', () => {
    const wrapper = mount(UidStack, { props: { as: 'section' }, slots: { default: 'x' } })
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('устанавливает flex-direction через inline-стиль', () => {
    const wrapper = mount(UidStack, {
      props: { direction: 'row' },
      slots: { default: 'x' },
    })
    expect(wrapper.element.style.flexDirection).toBe('row')
  })

  it('устанавливает gap через inline-стиль', () => {
    const wrapper = mount(UidStack, {
      props: { gap: '8px' },
      slots: { default: 'x' },
    })
    expect(wrapper.element.style.gap).toBe('8px')
  })

  it('устанавливает justify-content при justify=between', () => {
    const wrapper = mount(UidStack, {
      props: { justify: 'between' },
      slots: { default: 'x' },
    })
    expect(wrapper.element.style.justifyContent).toBe('space-between')
  })

  it('устанавливает align-items при align=center', () => {
    const wrapper = mount(UidStack, {
      props: { align: 'center' },
      slots: { default: 'x' },
    })
    expect(wrapper.element.style.alignItems).toBe('center')
  })

  it('применяет inline класс', () => {
    const wrapper = mount(UidStack, {
      props: { inline: true },
      slots: { default: 'x' },
    })
    expect(wrapper.classes()).toContain('uid-stack--inline')
  })

  it('рендерит slot-контент', () => {
    const wrapper = mount(UidStack, { slots: { default: '<p class="child">Текст</p>' } })
    expect(wrapper.find('.child').exists()).toBe(true)
  })
})
