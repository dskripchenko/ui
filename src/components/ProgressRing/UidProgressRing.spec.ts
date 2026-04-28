import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidProgressRing from './UidProgressRing.vue'

describe('UidProgressRing', () => {
  it('рендерит SVG-кольцо', () => {
    const wrapper = mount(UidProgressRing, { props: { value: 50, size: 100 } })
    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('100')
    expect(svg.attributes('height')).toBe('100')
  })

  it('aria-valuenow совпадает с value', () => {
    const wrapper = mount(UidProgressRing, { props: { value: 42 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('42')
  })

  it('clamp value по max', () => {
    const wrapper = mount(UidProgressRing, { props: { value: 200, max: 100 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('100')
  })

  it('clamp value не уходит ниже 0', () => {
    const wrapper = mount(UidProgressRing, { props: { value: -10 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
  })

  it('label показывается с %', () => {
    const wrapper = mount(UidProgressRing, { props: { value: 75, showLabel: true } })
    expect(wrapper.find('.uid-progress-ring__label').text()).toBe('75%')
  })

  it('кастомный formatLabel', () => {
    const wrapper = mount(UidProgressRing, {
      props: {
        value: 750,
        max: 1000,
        showLabel: true,
        formatLabel: (v, max) => `${v}/${max}`,
      },
    })
    expect(wrapper.find('.uid-progress-ring__label').text()).toBe('750/1000')
  })

  it('применяет tone-класс', () => {
    const wrapper = mount(UidProgressRing, { props: { tone: 'success' } })
    expect(wrapper.classes()).toContain('uid-progress-ring--success')
  })

  it('кастомный color через CSS-переменную', () => {
    const wrapper = mount(UidProgressRing, { props: { value: 50, color: '#ff0000' } })
    expect(wrapper.attributes('style')).toContain('--uid-ring-color: #ff0000')
  })

  it('indeterminate скрывает aria-valuenow', () => {
    const wrapper = mount(UidProgressRing, { props: { indeterminate: true } })
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
  })

  it('indeterminate применяет класс анимации', () => {
    const wrapper = mount(UidProgressRing, { props: { indeterminate: true } })
    expect(wrapper.classes()).toContain('uid-progress-ring__indeterminate')
  })

  it('default-слот показывается вместо текста', () => {
    const wrapper = mount(UidProgressRing, {
      props: { value: 50 },
      slots: { default: '<span class="custom">CUSTOM</span>' },
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
  })

  it('stroke-dashoffset рассчитывается из value', () => {
    const wrapper = mount(UidProgressRing, {
      props: { value: 25, max: 100, size: 100, strokeWidth: 10 },
    })
    const r = (100 - 10) / 2
    const c = 2 * Math.PI * r
    const expected = c * 0.75
    const progress = wrapper.findAll('circle')[1]
    const offset = parseFloat(progress.attributes('stroke-dashoffset') ?? '0')
    expect(offset).toBeCloseTo(expected, 1)
  })
})
