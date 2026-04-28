import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UidWatermark from './UidWatermark.vue'

describe('UidWatermark', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      measureText: () => ({ width: 100 }),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      set font(_v: string) {},
      get font() { return '' },
      set fillStyle(_v: string) {},
      get fillStyle() { return '' },
      set textAlign(_v: string) {},
      get textAlign() { return 'center' },
      set textBaseline(_v: string) {},
      get textBaseline() { return 'middle' },
    })
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,xxx')
  })

  it('рендерит default-слот', () => {
    const wrapper = mount(UidWatermark, {
      slots: { default: '<div class="ct">x</div>' },
    })
    expect(wrapper.find('.ct').exists()).toBe(true)
  })

  it('создаёт overlay', () => {
    const wrapper = mount(UidWatermark, {
      props: { content: 'CONFIDENTIAL' },
    })
    expect(wrapper.find('.uid-watermark__overlay').exists()).toBe(true)
  })

  it('применяет zIndex', () => {
    const wrapper = mount(UidWatermark, {
      props: { content: 'X', zIndex: 100 },
    })
    expect(wrapper.find('.uid-watermark__overlay').attributes('style')).toContain('--uid-watermark-z: 100')
  })

  it('overlay имеет aria-hidden', () => {
    const wrapper = mount(UidWatermark, { props: { content: 'X' } })
    expect(wrapper.find('.uid-watermark__overlay').attributes('aria-hidden')).toBe('true')
  })

  it('массив строк передаётся как multi-line', async () => {
    const wrapper = mount(UidWatermark, {
      props: { content: ['LINE 1', 'LINE 2'] },
    })
    await nextTick()
    expect(wrapper.find('.uid-watermark__overlay').attributes('style')).toContain('--uid-watermark-image: url(')
  })

  it('пустой content не создаёт background', async () => {
    const wrapper = mount(UidWatermark, { props: { content: '' } })
    await nextTick()
    expect(wrapper.find('.uid-watermark__overlay').attributes('style')).toContain('--uid-watermark-image: none')
  })
})
