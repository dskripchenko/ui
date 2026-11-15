import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { Plus } from 'lucide-vue-next'
import UidButton from './UidButton.vue'

describe('UidButton', () => {
  it('рендерит с классами по умолчанию', () => {
    const wrapper = mount(UidButton, { slots: { default: 'OK' } })
    expect(wrapper.classes()).toContain('uid-button')
    expect(wrapper.classes()).toContain('uid-button--primary')
    expect(wrapper.classes()).toContain('uid-button--md')
  })

  it('применяет variant и size классы', () => {
    const wrapper = mount(UidButton, {
      props: { variant: 'danger', size: 'lg' },
      slots: { default: 'Удалить' },
    })
    expect(wrapper.classes()).toContain('uid-button--danger')
    expect(wrapper.classes()).toContain('uid-button--lg')
  })

  it('эмитит click при нажатии', async () => {
    const wrapper = mount(UidButton, { slots: { default: 'OK' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('не эмитит click при disabled', async () => {
    const wrapper = mount(UidButton, { props: { disabled: true }, slots: { default: 'OK' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('не эмитит click при loading', async () => {
    const wrapper = mount(UidButton, { props: { loading: true }, slots: { default: 'OK' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('выставляет атрибут disabled при disabled=true', () => {
    const wrapper = mount(UidButton, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('выставляет data-loading при loading=true', () => {
    const wrapper = mount(UidButton, { props: { loading: true } })
    expect(wrapper.attributes('data-loading')).toBe('true')
  })

  it('рендерит slot prepend', () => {
    const wrapper = mount(UidButton, {
      slots: { default: 'Текст', prepend: '<span class="icon" />' },
    })
    expect(wrapper.find('.uid-button__prepend').exists()).toBe(true)
  })

  it('рендерит slot append', () => {
    const wrapper = mount(UidButton, {
      slots: { default: 'Текст', append: '<span class="icon" />' },
    })
    expect(wrapper.find('.uid-button__append').exists()).toBe(true)
  })

  it('прокидывает prop type на нативный button', () => {
    const wrapper = mount(UidButton, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('рендерит иконку из пропа icon в начале по умолчанию', () => {
    const wrapper = mount(UidButton, { props: { icon: Plus }, slots: { default: 'Добавить' } })
    const icon = wrapper.find('.uid-button__icon')
    expect(icon.exists()).toBe(true)
    expect(icon.attributes('width')).toBe('20')
    expect(wrapper.element.firstElementChild?.classList.contains('uid-button__icon')).toBe(true)
    expect(wrapper.classes()).not.toContain('uid-button--icon-only')
  })

  it('iconPosition=end рендерит иконку после текста', () => {
    const wrapper = mount(UidButton, {
      props: { icon: Plus, iconPosition: 'end' },
      slots: { default: 'Далее' },
    })
    expect(wrapper.element.lastElementChild?.classList.contains('uid-button__icon')).toBe(true)
  })

  it('размер иконки 16 для size=sm', () => {
    const wrapper = mount(UidButton, { props: { icon: Plus, size: 'sm' }, slots: { default: 'OK' } })
    expect(wrapper.find('.uid-button__icon').attributes('width')).toBe('16')
  })

  it('icon без слота включает icon-only режим', () => {
    const wrapper = mount(UidButton, {
      props: { icon: Plus },
      attrs: { 'aria-label': 'Добавить' },
    })
    expect(wrapper.classes()).toContain('uid-button--icon-only')
    expect(wrapper.attributes('aria-label')).toBe('Добавить')
  })

  it('предупреждает об отсутствии aria-label в icon-only режиме', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(UidButton, { props: { icon: Plus } })
    expect(warn).toHaveBeenCalled()
    warn.mockClear()
    mount(UidButton, { props: { icon: Plus }, attrs: { 'aria-label': 'Добавить' } })
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('слот prepend работает вместе с icon', () => {
    const wrapper = mount(UidButton, {
      props: { icon: Plus },
      slots: { default: 'Текст', prepend: '<span class="icon" />' },
    })
    expect(wrapper.find('.uid-button__prepend').exists()).toBe(true)
    expect(wrapper.find('.uid-button__icon').exists()).toBe(true)
  })

  it('with href renders a link that looks like the button', () => {
    const wrapper = mount(UidButton, { props: { href: '/docs', external: true }, slots: { default: 'Docs' } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/docs')
    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.attributes('rel')).toBe('noopener noreferrer')
    expect(wrapper.attributes('type')).toBeUndefined()
    expect(wrapper.classes()).toContain('uid-button--primary')
  })

  it('with to renders the registered RouterLink, and an <a> without a router', () => {
    const RouterLink = { name: 'RouterLink', props: ['to'], template: '<a :data-to="to"><slot /></a>' }
    const routed = mount(UidButton, { props: { to: '/runs' }, slots: { default: 'Runs' }, global: { components: { RouterLink } } })
    expect(routed.attributes('data-to')).toBe('/runs')
    const plain = mount(UidButton, { props: { to: '/runs' }, slots: { default: 'Runs' } })
    expect(plain.element.tagName).toBe('A')
    expect(plain.attributes('href')).toBe('/runs')
  })

  it('a disabled link loses its target, leaves the tab order and swallows the click', async () => {
    const wrapper = mount(UidButton, { props: { href: '/docs', disabled: true }, slots: { default: 'Docs' } })
    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBe('-1')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
