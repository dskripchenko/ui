import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UidBackTop from './UidBackTop.vue'

describe('UidBackTop', () => {
  let scrollY = 0

  beforeEach(() => {
    scrollY = 0
    Object.defineProperty(window, 'scrollY', {
      get: () => scrollY,
      configurable: true,
    })
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('скрыта до достижения порога', () => {
    const wrapper = mount(UidBackTop, { attachTo: document.body })
    expect(wrapper.find('button').isVisible()).toBe(false)
    wrapper.unmount()
  })

  it('показывается при скролле выше порога', async () => {
    const wrapper = mount(UidBackTop, {
      props: { visibleAfter: 100 },
      attachTo: document.body,
    })
    scrollY = 200
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('button').isVisible()).toBe(true)
    wrapper.unmount()
  })

  it('эмитит click и вызывает scrollTo', async () => {
    const wrapper = mount(UidBackTop, {
      props: { visibleAfter: 0 },
      attachTo: document.body,
    })
    scrollY = 500
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    wrapper.unmount()
  })

  it('smooth=false использует auto behavior', async () => {
    const wrapper = mount(UidBackTop, {
      props: { visibleAfter: 0, smooth: false },
      attachTo: document.body,
    })
    scrollY = 500
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    await wrapper.find('button').trigger('click')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    wrapper.unmount()
  })

  it('применяет ariaLabel', () => {
    const wrapper = mount(UidBackTop, {
      props: { ariaLabel: 'Вверх' },
      attachTo: document.body,
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Вверх')
    wrapper.unmount()
  })

  it('рендерит default-слот', () => {
    const wrapper = mount(UidBackTop, {
      slots: { default: '<span class="custom">↑</span>' },
      attachTo: document.body,
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
    wrapper.unmount()
  })
})
