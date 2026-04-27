import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidDivider from './UidDivider.vue'

describe('UidDivider', () => {
  it('рендерит горизонтальный разделитель по умолчанию', () => {
    const wrapper = mount(UidDivider)
    expect(wrapper.classes()).toContain('uid-divider--horizontal')
  })

  it('применяет orientation класс', () => {
    const wrapper = mount(UidDivider, { props: { orientation: 'vertical' } })
    expect(wrapper.classes()).toContain('uid-divider--vertical')
  })

  it('рендерит label для горизонтального', () => {
    const wrapper = mount(UidDivider, { props: { label: 'или' } })
    expect(wrapper.find('.uid-divider__label').text()).toBe('или')
  })

  it('не рендерит label для вертикального', () => {
    const wrapper = mount(UidDivider, {
      props: { label: 'или', orientation: 'vertical' },
    })
    expect(wrapper.find('.uid-divider__label').exists()).toBe(false)
  })

  it('role="separator" присутствует', () => {
    const wrapper = mount(UidDivider)
    expect(wrapper.attributes('role')).toBe('separator')
  })
})
