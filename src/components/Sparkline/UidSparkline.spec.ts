import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSparkline from './UidSparkline.vue'

describe('UidSparkline', () => {
  it('рендерит SVG с правильными размерами', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 2, 3], width: 200, height: 50 },
    })
    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('200')
    expect(svg.attributes('height')).toBe('50')
  })

  it('line: рендерит path', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 5, 3, 8, 2] },
    })
    const path = wrapper.find('.uid-sparkline__line')
    expect(path.exists()).toBe(true)
    expect(path.attributes('d')).toMatch(/^M /)
  })

  it('area: рендерит area-path', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 2, 3], type: 'area' },
    })
    expect(wrapper.find('.uid-sparkline__area').exists()).toBe(true)
    expect(wrapper.find('.uid-sparkline__line').exists()).toBe(true)
  })

  it('bar: рендерит rect для каждой точки', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 2, 3, 4], type: 'bar' },
    })
    expect(wrapper.findAll('.uid-sparkline__bar')).toHaveLength(4)
    expect(wrapper.find('.uid-sparkline__line').exists()).toBe(false)
  })

  it('bar: красит отрицательные значения', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, -2, 3], type: 'bar' },
    })
    const bars = wrapper.findAll('.uid-sparkline__bar')
    expect(bars[1].classes()).toContain('uid-sparkline__bar--negative')
    expect(bars[0].classes()).not.toContain('uid-sparkline__bar--negative')
  })

  it('showDots: рендерит точки на каждой позиции', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 2, 3], showDots: true },
    })
    expect(wrapper.findAll('.uid-sparkline__dot')).toHaveLength(3)
  })

  it('showLast: рендерит точку только на последней', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 2, 3], showLast: true },
    })
    expect(wrapper.findAll('.uid-sparkline__dot')).toHaveLength(1)
  })

  it('showZero: рендерит zero-line при пересечении 0', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [-2, 1, -1, 3], showZero: true },
    })
    expect(wrapper.find('.uid-sparkline__zero').exists()).toBe(true)
  })

  it('showZero не рендерит линию если все одного знака', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 2, 3], showZero: true },
    })
    expect(wrapper.find('.uid-sparkline__zero').exists()).toBe(false)
  })

  it('smooth path использует C-команды', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 5, 2, 8, 3], smooth: true },
    })
    expect(wrapper.find('.uid-sparkline__line').attributes('d')).toContain('C ')
  })

  it('кастомный color применяется через CSS-переменную', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 2], color: '#ef4444' },
    })
    expect(wrapper.attributes('style')).toContain('--uid-sparkline-color: #ef4444')
  })

  it('aria-label по умолчанию описывает тренд', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [10, 20, 30] },
    })
    expect(wrapper.attributes('aria-label')).toContain('10')
    expect(wrapper.attributes('aria-label')).toContain('30')
  })

  it('кастомный aria-label', () => {
    const wrapper = mount(UidSparkline, {
      props: { data: [1, 2], ariaLabel: 'Доход за неделю' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Доход за неделю')
  })

  it('пустой массив рендерит SVG без ошибок', () => {
    const wrapper = mount(UidSparkline, { props: { data: [] } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
