import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidLink from './UidLink.vue'

describe('UidLink', () => {
  it('рендерит тег <a> по умолчанию', () => {
    const wrapper = mount(UidLink, {
      props: { href: '/about' },
      slots: { default: 'О нас' },
    })
    expect(wrapper.element.tagName).toBe('A')
  })

  it('устанавливает href', () => {
    const wrapper = mount(UidLink, {
      props: { href: '/about' },
      slots: { default: 'О нас' },
    })
    expect(wrapper.attributes('href')).toBe('/about')
  })

  it('external добавляет target="_blank" и rel', () => {
    const wrapper = mount(UidLink, {
      props: { href: 'https://example.com', external: true },
      slots: { default: 'Сайт' },
    })
    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.attributes('rel')).toBe('noopener noreferrer')
  })

  it('disabled убирает href и добавляет aria-disabled', () => {
    const wrapper = mount(UidLink, {
      props: { href: '/about', disabled: true },
      slots: { default: 'О нас' },
    })
    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('применяет uid-link--disabled класс', () => {
    const wrapper = mount(UidLink, {
      props: { disabled: true },
      slots: { default: 'Ссылка' },
    })
    expect(wrapper.classes()).toContain('uid-link--disabled')
  })

  it('prop as переопределяет тег', () => {
    const wrapper = mount(UidLink, {
      props: { as: 'button' },
      slots: { default: 'Кнопка-ссылка' },
    })
    expect(wrapper.element.tagName).toBe('BUTTON')
  })
})
