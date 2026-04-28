import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidGauge from './UidGauge.vue'

describe('UidGauge', () => {
  it('рендерит SVG с полукруглой аркой', () => {
    const wrapper = mount(UidGauge, { props: { value: 50, size: 200 } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.uid-gauge__track').attributes('d')).toContain('A')
  })

  it('aria-valuenow совпадает со значением', () => {
    const wrapper = mount(UidGauge, { props: { value: 42, min: 0, max: 100 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('42')
  })

  it('clamp по min/max', () => {
    const wrapper = mount(UidGauge, { props: { value: 200, min: 0, max: 100 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('100')
  })

  it('отображает значение когда showValue', () => {
    const wrapper = mount(UidGauge, { props: { value: 65, showValue: true } })
    expect(wrapper.find('.uid-gauge__value').text()).toContain('65')
  })

  it('форматирует с precision', () => {
    const wrapper = mount(UidGauge, { props: { value: 42.5678, precision: 2 } })
    expect(wrapper.find('.uid-gauge__value').text()).toContain('42.57')
  })

  it('кастомный formatValue', () => {
    const wrapper = mount(UidGauge, {
      props: { value: 1500, max: 5000, formatValue: (v) => `${(v / 1000).toFixed(1)}k` },
    })
    expect(wrapper.find('.uid-gauge__value').text()).toContain('1.5k')
  })

  it('suffix отображается', () => {
    const wrapper = mount(UidGauge, { props: { value: 65, suffix: '%' } })
    expect(wrapper.find('.uid-gauge__suffix').text()).toBe('%')
  })

  it('label отображается', () => {
    const wrapper = mount(UidGauge, { props: { value: 65, label: 'Загрузка' } })
    expect(wrapper.find('.uid-gauge__label').text()).toBe('Загрузка')
  })

  it('showLimits показывает min/max', () => {
    const wrapper = mount(UidGauge, {
      props: { value: 50, min: 10, max: 90, showLimits: true },
    })
    const limits = wrapper.find('.uid-gauge__limits')
    expect(limits.text()).toContain('10')
    expect(limits.text()).toContain('90')
  })

  it('применяет tone-класс', () => {
    const wrapper = mount(UidGauge, { props: { tone: 'danger' } })
    expect(wrapper.classes()).toContain('uid-gauge--danger')
  })

  it('кастомный color через CSS-переменную', () => {
    const wrapper = mount(UidGauge, { props: { value: 50, color: '#abc' } })
    expect(wrapper.attributes('style')).toContain('--uid-gauge-color: #abc')
  })

  it('ranges рендерят дополнительные дуги', () => {
    const wrapper = mount(UidGauge, {
      props: {
        value: 30,
        ranges: [
          { from: 0, to: 33, color: '#22c55e' },
          { from: 33, to: 66, color: '#eab308' },
          { from: 66, to: 100, color: '#ef4444' },
        ],
      },
    })
    expect(wrapper.findAll('.uid-gauge__range')).toHaveLength(3)
    // Без ranges progress arc используется; с ranges — нет
    expect(wrapper.find('.uid-gauge__progress').exists()).toBe(false)
  })

  it('showNeedle добавляет стрелку', () => {
    const wrapper = mount(UidGauge, { props: { value: 50, showNeedle: true } })
    expect(wrapper.find('.uid-gauge__needle').exists()).toBe(true)
    expect(wrapper.find('.uid-gauge__needle-pivot').exists()).toBe(true)
  })

  it('needle поворачивается на основе value', () => {
    const wrapper = mount(UidGauge, {
      props: { value: 50, min: 0, max: 100, showNeedle: true },
    })
    const transform = wrapper.find('.uid-gauge__needle').attributes('transform')
    expect(transform).toContain('rotate(-90')
  })
})
