import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidDrawer from './UidDrawer.vue'

describe('UidDrawer', () => {
  it('не рендерит содержимое при modelValue=false', () => {
    const wrapper = mount(UidDrawer, {
      props: { modelValue: false },
      attachTo: document.body,
    })
    expect(wrapper.find('.uid-drawer').exists()).toBe(false)
  })

  it('рендерит содержимое при modelValue=true', async () => {
    const wrapper = mount(UidDrawer, {
      props: { modelValue: true },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.querySelector('.uid-drawer')).not.toBeNull()
    wrapper.unmount()
  })

  it('рендерит title', async () => {
    const wrapper = mount(UidDrawer, {
      props: { modelValue: true, title: 'Панель' },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.querySelector('.uid-drawer__title')?.textContent?.trim()).toBe('Панель')
    wrapper.unmount()
  })

  it('применяет side класс', async () => {
    const wrapper = mount(UidDrawer, {
      props: { modelValue: true, side: 'left' },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.querySelector('.uid-drawer')?.classList.contains('uid-drawer--left')).toBe(true)
    wrapper.unmount()
  })

  it('эмитит close при нажатии кнопки закрытия', async () => {
    const wrapper = mount(UidDrawer, {
      props: { modelValue: true },
      attachTo: document.body,
    })
    await flushPromises()
    document.querySelector<HTMLElement>('.uid-drawer__close')?.click()
    await flushPromises()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('role="dialog" и aria-modal присутствуют', async () => {
    const wrapper = mount(UidDrawer, {
      props: { modelValue: true },
      attachTo: document.body,
    })
    await flushPromises()
    const panel = document.querySelector('.uid-drawer')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    wrapper.unmount()
  })
})
