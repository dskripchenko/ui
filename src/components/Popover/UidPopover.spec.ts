import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidPopover from './UidPopover.vue'

describe('UidPopover', () => {
  it('не показывает содержимое по умолчанию', () => {
    mount(UidPopover, {
      slots: {
        trigger: '<button>Триггер</button>',
        default: '<p class="content">Содержимое</p>',
      },
      attachTo: document.body,
    })
    expect(document.querySelector('.uid-popover')).toBeNull()
  })

  it('показывает содержимое при клике на триггер', async () => {
    const wrapper = mount(UidPopover, {
      slots: {
        trigger: '<button>Триггер</button>',
        default: '<p class="content">Содержимое</p>',
      },
      attachTo: document.body,
    })
    await wrapper.find('.uid-popover-trigger').trigger('click')
    await flushPromises()
    expect(document.querySelector('.uid-popover')).not.toBeNull()
    wrapper.unmount()
  })

  it('скрывает содержимое при повторном клике (toggle)', async () => {
    const wrapper = mount(UidPopover, {
      slots: {
        trigger: '<button>Триггер</button>',
        default: '<p>Содержимое</p>',
      },
      attachTo: document.body,
    })
    await wrapper.find('.uid-popover-trigger').trigger('click')
    await flushPromises()
    await wrapper.find('.uid-popover-trigger').trigger('click')
    expect(document.querySelector('.uid-popover')).toBeNull()
    wrapper.unmount()
  })

  it('закрывается по нажатию Escape', async () => {
    const wrapper = mount(UidPopover, {
      slots: {
        trigger: '<button>Триггер</button>',
        default: '<p>Содержимое</p>',
      },
      attachTo: document.body,
    })
    await wrapper.find('.uid-popover-trigger').trigger('click')
    await flushPromises()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(document.querySelector('.uid-popover')).toBeNull()
    wrapper.unmount()
  })

  it('рендерит slot trigger', () => {
    const wrapper = mount(UidPopover, {
      slots: {
        trigger: '<button class="custom-trigger">Открыть</button>',
        default: '<p>Контент</p>',
      },
      attachTo: document.body,
    })
    expect(wrapper.find('.custom-trigger').exists()).toBe(true)
    wrapper.unmount()
  })
})
