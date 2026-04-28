import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UidCarousel from './UidCarousel.vue'

const items = ['a', 'b', 'c', 'd']

describe('UidCarousel', () => {
  it('рендерит все slides', () => {
    const wrapper = mount(UidCarousel, {
      props: { items },
      slots: { default: '<div class="slide">x</div>' },
    })
    expect(wrapper.findAll('.uid-carousel__slide')).toHaveLength(4)
  })

  it('применяет начальный transform', () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 1 },
      slots: { default: '<div />' },
    })
    expect(wrapper.find('.uid-carousel__track').attributes('style')).toContain('translateX(-100%)')
  })

  it('vertical использует translateY', () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 1, direction: 'vertical' },
      slots: { default: '<div />' },
    })
    expect(wrapper.find('.uid-carousel__track').attributes('style')).toContain('translateY(-100%)')
  })

  it('next переключает на следующий', async () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 0 },
      slots: { default: '<div />' },
    })
    const buttons = wrapper.findAll('.uid-carousel__arrow')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
  })

  it('prev переключает на предыдущий', async () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 2 },
      slots: { default: '<div />' },
    })
    const buttons = wrapper.findAll('.uid-carousel__arrow')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
  })

  it('loop оборачивает на 0 после последнего', async () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 3, loop: true },
      slots: { default: '<div />' },
    })
    const next = wrapper.findAll('.uid-carousel__arrow')[1]
    await next.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
  })

  it('без loop ограничен последним', async () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 3, loop: false },
      slots: { default: '<div />' },
    })
    const next = wrapper.findAll('.uid-carousel__arrow')[1]
    expect(next.attributes('disabled')).toBeDefined()
  })

  it('индикаторы переключают слайд', async () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 0 },
      slots: { default: '<div />' },
    })
    const indicators = wrapper.findAll('.uid-carousel__indicator')
    await indicators[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
  })

  it('активный индикатор подсвечен', () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 1 },
      slots: { default: '<div />' },
    })
    const indicators = wrapper.findAll('.uid-carousel__indicator')
    expect(indicators[1].classes()).toContain('uid-carousel__indicator--active')
  })

  it('ArrowRight переключает', async () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 0 },
      slots: { default: '<div />' },
    })
    await wrapper.find('.uid-carousel').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
  })

  it('Home переходит на первый', async () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 2 },
      slots: { default: '<div />' },
    })
    await wrapper.find('.uid-carousel').trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
  })

  it('End переходит на последний', async () => {
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 0 },
      slots: { default: '<div />' },
    })
    await wrapper.find('.uid-carousel').trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
  })

  it('autoplay переключает по таймеру', async () => {
    vi.useFakeTimers()
    const wrapper = mount(UidCarousel, {
      props: { items, modelValue: 0, autoplay: 100, pauseOnHover: false },
      slots: { default: '<div />' },
    })
    vi.advanceTimersByTime(100)
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    vi.useRealTimers()
  })

  it('скрывает arrows при showArrows=false', () => {
    const wrapper = mount(UidCarousel, {
      props: { items, showArrows: false },
      slots: { default: '<div />' },
    })
    expect(wrapper.find('.uid-carousel__arrow').exists()).toBe(false)
  })

  it('скрывает индикаторы при showIndicators=false', () => {
    const wrapper = mount(UidCarousel, {
      props: { items, showIndicators: false },
      slots: { default: '<div />' },
    })
    expect(wrapper.find('.uid-carousel__indicators').exists()).toBe(false)
  })

  it('один элемент скрывает arrows и индикаторы', () => {
    const wrapper = mount(UidCarousel, {
      props: { items: ['a'] },
      slots: { default: '<div />' },
    })
    expect(wrapper.find('.uid-carousel__arrow').exists()).toBe(false)
    expect(wrapper.find('.uid-carousel__indicators').exists()).toBe(false)
  })
})
