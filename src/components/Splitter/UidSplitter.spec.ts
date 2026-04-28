import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSplitter from './UidSplitter.vue'

describe('UidSplitter', () => {
  it('рендерит две панели', () => {
    const wrapper = mount(UidSplitter, {
      slots: { start: '<div class="a">A</div>', end: '<div class="b">B</div>' },
    })
    expect(wrapper.find('.a').exists()).toBe(true)
    expect(wrapper.find('.b').exists()).toBe(true)
  })

  it('применяет direction-класс', () => {
    const h = mount(UidSplitter)
    expect(h.classes()).toContain('uid-splitter--horizontal')
    const v = mount(UidSplitter, { props: { direction: 'vertical' } })
    expect(v.classes()).toContain('uid-splitter--vertical')
  })

  it('применяет начальный размер', () => {
    const wrapper = mount(UidSplitter, { props: { modelValue: 30 } })
    expect(wrapper.find('.uid-splitter__pane--start').attributes('style')).toContain('width: 30%')
  })

  it('применяет height для vertical', () => {
    const wrapper = mount(UidSplitter, {
      props: { direction: 'vertical', modelValue: 25 },
    })
    expect(wrapper.find('.uid-splitter__pane--start').attributes('style')).toContain('height: 25%')
  })

  it('ArrowRight увеличивает', async () => {
    const wrapper = mount(UidSplitter, { props: { modelValue: 50, step: 10 } })
    await wrapper.find('.uid-splitter__handle').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([60])
  })

  it('ArrowLeft уменьшает', async () => {
    const wrapper = mount(UidSplitter, { props: { modelValue: 50, step: 10 } })
    await wrapper.find('.uid-splitter__handle').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([40])
  })

  it('vertical: ArrowDown увеличивает', async () => {
    const wrapper = mount(UidSplitter, {
      props: { direction: 'vertical', modelValue: 50, step: 10 },
    })
    await wrapper.find('.uid-splitter__handle').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([60])
  })

  it('Home переключает на min', async () => {
    const wrapper = mount(UidSplitter, { props: { modelValue: 50, min: 20 } })
    await wrapper.find('.uid-splitter__handle').trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([20])
  })

  it('End переключает на max', async () => {
    const wrapper = mount(UidSplitter, { props: { modelValue: 50, max: 80 } })
    await wrapper.find('.uid-splitter__handle').trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([80])
  })

  it('clamp по min/max при keydown', async () => {
    const wrapper = mount(UidSplitter, {
      props: { modelValue: 90, min: 10, max: 90, step: 10 },
    })
    await wrapper.find('.uid-splitter__handle').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('disabled блокирует клавиши', async () => {
    const wrapper = mount(UidSplitter, { props: { disabled: true } })
    await wrapper.find('.uid-splitter__handle').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('эмитит change', async () => {
    const wrapper = mount(UidSplitter, { props: { modelValue: 50 } })
    await wrapper.find('.uid-splitter__handle').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('aria-valuenow отражает значение', () => {
    const wrapper = mount(UidSplitter, { props: { modelValue: 33 } })
    expect(wrapper.find('.uid-splitter__handle').attributes('aria-valuenow')).toBe('33')
  })

  it('aria-orientation соответствует direction', () => {
    const h = mount(UidSplitter)
    expect(h.find('.uid-splitter__handle').attributes('aria-orientation')).toBe('vertical')
    const v = mount(UidSplitter, { props: { direction: 'vertical' } })
    expect(v.find('.uid-splitter__handle').attributes('aria-orientation')).toBe('horizontal')
  })
})
