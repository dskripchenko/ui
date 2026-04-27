import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidModal from './UidModal.vue'

describe('UidModal', () => {
  it('не рендерит содержимое при modelValue=false', () => {
    const wrapper = mount(UidModal, {
      props: { modelValue: false },
      attachTo: document.body,
    })
    expect(wrapper.find('.uid-modal').exists()).toBe(false)
  })

  it('рендерит содержимое при modelValue=true', async () => {
    const wrapper = mount(UidModal, {
      props: { modelValue: true },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.querySelector('.uid-modal')).not.toBeNull()
    wrapper.unmount()
  })

  it('рендерит title', async () => {
    const wrapper = mount(UidModal, {
      props: { modelValue: true, title: 'Заголовок' },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.querySelector('.uid-modal__title')?.textContent?.trim()).toBe('Заголовок')
    wrapper.unmount()
  })

  it('рендерит slot-контент', async () => {
    const wrapper = mount(UidModal, {
      props: { modelValue: true },
      slots: { default: '<p class="test-content">Содержимое</p>' },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.querySelector('.test-content')).not.toBeNull()
    wrapper.unmount()
  })

  it('эмитит close при нажатии кнопки закрытия', async () => {
    const wrapper = mount(UidModal, {
      props: { modelValue: true },
      attachTo: document.body,
    })
    await flushPromises()
    const closeBtn = document.querySelector<HTMLElement>('.uid-modal__close')
    closeBtn?.click()
    await flushPromises()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('применяет size класс', async () => {
    const wrapper = mount(UidModal, {
      props: { modelValue: true, size: 'lg' },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.querySelector('.uid-modal')?.classList.contains('uid-modal--lg')).toBe(true)
    wrapper.unmount()
  })

  it('не рендерит кнопку закрытия при hideClose=true', async () => {
    const wrapper = mount(UidModal, {
      props: { modelValue: true, hideClose: true },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.querySelector('.uid-modal__close')).toBeNull()
    wrapper.unmount()
  })

  it('role="dialog" и aria-modal присутствуют', async () => {
    const wrapper = mount(UidModal, {
      props: { modelValue: true },
      attachTo: document.body,
    })
    await flushPromises()
    const dialog = document.querySelector('.uid-modal')
    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    wrapper.unmount()
  })
})
