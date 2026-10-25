import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTooltip from './UidTooltip.vue'

describe('UidTooltip', () => {
  it('не показывает tooltip по умолчанию', () => {
    mount(UidTooltip, {
      props: { content: 'Подсказка' },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    expect(document.querySelector('.uid-tooltip')).toBeNull()
  })

  it('показывает tooltip при mouseenter', async () => {
    const wrapper = mount(UidTooltip, {
      props: { content: 'Подсказка' },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.uid-tooltip-anchor').trigger('mouseenter')
    await flushPromises()
    expect(document.querySelector('.uid-tooltip')).not.toBeNull()
    expect(document.querySelector('.uid-tooltip')?.textContent?.trim()).toBe('Подсказка')
    wrapper.unmount()
  })

  it('скрывает tooltip при mouseleave', async () => {
    const wrapper = mount(UidTooltip, {
      props: { content: 'Подсказка' },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.uid-tooltip-anchor').trigger('mouseenter')
    await flushPromises()
    await wrapper.find('.uid-tooltip-anchor').trigger('mouseleave')
    expect(document.querySelector('.uid-tooltip')).toBeNull()
    wrapper.unmount()
  })

  it('не показывает tooltip при disabled=true', async () => {
    const wrapper = mount(UidTooltip, {
      props: { content: 'Подсказка', disabled: true },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.uid-tooltip-anchor').trigger('mouseenter')
    await flushPromises()
    expect(document.querySelector('.uid-tooltip')).toBeNull()
    wrapper.unmount()
  })

  it('role="tooltip" присутствует', async () => {
    const wrapper = mount(UidTooltip, {
      props: { content: 'Подсказка' },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.uid-tooltip-anchor').trigger('mouseenter')
    await flushPromises()
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('ставит tooltip у описываемого элемента, а не у пустой обёртки с display: contents', async () => {
    const wrapper = mount(UidTooltip, {
      props: { content: 'Подсказка', placement: 'bottom' },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    const button = wrapper.find('button').element
    button.getBoundingClientRect = () => new DOMRect(300, 200, 80, 32)
    await wrapper.find('.uid-tooltip-anchor').trigger('mouseenter')
    await flushPromises()
    const tip = document.querySelector<HTMLElement>('.uid-tooltip')!
    // Under the button (200 + 32 + 8): the empty anchor would have put it at the top margin.
    expect(parseFloat(tip.style.top)).toBe(240)
    wrapper.unmount()
  })
})

