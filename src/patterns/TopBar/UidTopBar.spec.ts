import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTopBar from './UidTopBar.vue'

describe('UidTopBar', () => {
  it('показывает поле поиска, колокольчик со счётчиком, тему и язык', () => {
    const wrapper = mount(UidTopBar, { props: { searchLabel: 'Поиск…', notifications: 140, theme: 'dark', locale: 'ru' } })
    expect(wrapper.find('[data-test=open-palette]').text()).toContain('Поиск…')
    // The visible text is part of the accessible name (WCAG 2.5.3); the name stays when a phone hides the text.
    expect(wrapper.find('[data-test=open-palette]').attributes('aria-label')).toBe('Поиск… ⌘K')
    expect(wrapper.find('.uid-notification-badge__count').text()).toBe('99+')
    expect(wrapper.find('[data-test=theme]').attributes('aria-label')).toBe('Light theme')
    expect(wrapper.find('[data-test=locale]').text()).toBe('RU')
  })

  it('прячет то, чему передан null', () => {
    const wrapper = mount(UidTopBar, { props: { searchLabel: null } })
    expect(wrapper.find('[data-test=open-palette]').exists()).toBe(false)
    expect(wrapper.find('[data-test=bell]').exists()).toBe(false)
    expect(wrapper.find('[data-test=theme]').exists()).toBe(false)
    expect(wrapper.find('[data-test=locale]').exists()).toBe(false)
  })

  it('сообщает о нажатиях и ставит слоты', async () => {
    const wrapper = mount(UidTopBar, {
      props: { notifications: 0, theme: 'light', locale: 'en' },
      slots: { crumbs: '<span class="c">Docs</span>', user: '<span class="u">A</span>' },
    })
    await wrapper.find('[data-test=toggle-sidebar]').trigger('click')
    await wrapper.find('[data-test=open-palette]').trigger('click')
    await wrapper.find('[data-test=bell]').trigger('click')
    await wrapper.find('[data-test=theme]').trigger('click')
    await wrapper.find('[data-test=locale]').trigger('click')
    expect(Object.keys(wrapper.emitted())).toEqual(expect.arrayContaining(['toggle', 'search', 'notifications', 'theme', 'locale']))
    expect(wrapper.find('.c').exists()).toBe(true)
    expect(wrapper.find('.u').exists()).toBe(true)
  })
})
