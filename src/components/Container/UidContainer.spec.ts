import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidContainer from './UidContainer.vue'

describe('UidContainer', () => {
  it('рендерит div по умолчанию', () => {
    const wrapper = mount(UidContainer, { slots: { default: 'x' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('применяет пользовательский тег через as', () => {
    const wrapper = mount(UidContainer, { props: { as: 'main' }, slots: { default: 'x' } })
    expect(wrapper.element.tagName).toBe('MAIN')
  })

  it('применяет size класс', () => {
    expect(mount(UidContainer, { props: { size: 'sm' }, slots: { default: 'x' } }).classes())
      .toContain('uid-container--sm')
    expect(mount(UidContainer, { props: { size: 'xl' }, slots: { default: 'x' } }).classes())
      .toContain('uid-container--xl')
  })

  it('применяет padded класс при padding=true', () => {
    const wrapper = mount(UidContainer, { props: { padding: true }, slots: { default: 'x' } })
    expect(wrapper.classes()).toContain('uid-container--padded')
  })

  it('не применяет padded класс при padding=false', () => {
    const wrapper = mount(UidContainer, { props: { padding: false }, slots: { default: 'x' } })
    expect(wrapper.classes()).not.toContain('uid-container--padded')
  })

  it('рендерит slot-контент', () => {
    const wrapper = mount(UidContainer, { slots: { default: '<p class="inner">Текст</p>' } })
    expect(wrapper.find('.inner').exists()).toBe(true)
  })
})
