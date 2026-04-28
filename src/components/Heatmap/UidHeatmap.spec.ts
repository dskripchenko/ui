import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidHeatmap from './UidHeatmap.vue'

describe('UidHeatmap', () => {
  it('рендерит SVG-сетку', () => {
    const wrapper = mount(UidHeatmap, {
      props: {
        data: [{ date: '2026-04-15', value: 5 }],
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.findAll('.uid-heatmap__cell').length).toBeGreaterThan(0)
  })

  it('рендерит rect на каждый день диапазона', () => {
    const wrapper = mount(UidHeatmap, {
      props: {
        data: [],
        startDate: '2026-04-01',
        endDate: '2026-04-07',
      },
    })
    expect(wrapper.findAll('.uid-heatmap__cell')).toHaveLength(7)
  })

  it('применяет уровни цвета по value', () => {
    const wrapper = mount(UidHeatmap, {
      props: {
        data: [
          { date: '2026-04-01', value: 0 },
          { date: '2026-04-02', value: 1 },
          { date: '2026-04-03', value: 5 },
          { date: '2026-04-04', value: 10 },
        ],
        startDate: '2026-04-01',
        endDate: '2026-04-04',
        levels: 4,
      },
    })
    const cells = wrapper.findAll('.uid-heatmap__cell')
    const colors = cells.map(c => c.attributes('fill'))
    expect(new Set(colors).size).toBeGreaterThan(1)
  })

  it('кастомный color через CSS-переменную', () => {
    const wrapper = mount(UidHeatmap, {
      props: {
        data: [],
        startDate: '2026-04-01',
        endDate: '2026-04-07',
        color: '#22c55e',
      },
    })
    expect(wrapper.attributes('style')).toContain('--uid-heatmap-color: #22c55e')
  })

  it('legend рендерит уровни + 1 пустой', () => {
    const wrapper = mount(UidHeatmap, {
      props: {
        data: [],
        startDate: '2026-04-01',
        endDate: '2026-04-07',
        levels: 4,
        showLegend: true,
      },
    })
    expect(wrapper.findAll('.uid-heatmap__legend-cell')).toHaveLength(5)
  })

  it('скрывает legend при showLegend=false', () => {
    const wrapper = mount(UidHeatmap, {
      props: { data: [], startDate: '2026-04-01', endDate: '2026-04-07', showLegend: false },
    })
    expect(wrapper.find('.uid-heatmap__legend').exists()).toBe(false)
  })

  it('tooltip через title', () => {
    const wrapper = mount(UidHeatmap, {
      props: {
        data: [{ date: '2026-04-15', value: 5 }],
        startDate: '2026-04-15',
        endDate: '2026-04-15',
      },
    })
    expect(wrapper.find('title').text()).toContain('2026-04-15')
    expect(wrapper.find('title').text()).toContain('5')
  })

  it('кастомный formatTooltip', () => {
    const wrapper = mount(UidHeatmap, {
      props: {
        data: [{ date: '2026-04-15', value: 5 }],
        startDate: '2026-04-15',
        endDate: '2026-04-15',
        formatTooltip: (p) => `Активность ${p.value} в ${p.date}`,
      },
    })
    expect(wrapper.find('title').text()).toBe('Активность 5 в 2026-04-15')
  })

  it('aria-label автоматически суммирует events', () => {
    const wrapper = mount(UidHeatmap, {
      props: {
        data: [
          { date: '2026-04-01', value: 3 },
          { date: '2026-04-02', value: 7 },
        ],
        startDate: '2026-04-01',
        endDate: '2026-04-07',
      },
    })
    expect(wrapper.attributes('aria-label')).toContain('10')
  })

  it('кастомный aria-label', () => {
    const wrapper = mount(UidHeatmap, {
      props: {
        data: [],
        startDate: '2026-04-01',
        endDate: '2026-04-07',
        ariaLabel: 'Календарь активности',
      },
    })
    expect(wrapper.attributes('aria-label')).toBe('Календарь активности')
  })

  it('skipped weekdays при showWeekdays=false', () => {
    const wrapper = mount(UidHeatmap, {
      props: { data: [], startDate: '2026-04-01', endDate: '2026-04-07', showWeekdays: false },
    })
    expect(wrapper.find('.uid-heatmap__weekdays').exists()).toBe(false)
  })

  it('skipped months при showMonths=false', () => {
    const wrapper = mount(UidHeatmap, {
      props: { data: [], startDate: '2026-04-01', endDate: '2026-04-07', showMonths: false },
    })
    expect(wrapper.find('.uid-heatmap__months').exists()).toBe(false)
  })
})
