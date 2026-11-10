import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import UidChart from './UidChart.vue'
import type { ChartSeries } from './UidChart.vue'
import { barPath, linePath, niceTicks } from './chartMath.js'

const categories = ['S1', 'S2', 'S3', 'S4', 'S5']

function make(props: Record<string, unknown> = {}) {
  return mount(UidChart, {
    props: { categories, series: [], ...props },
    attachTo: document.body,
  })
}

function last<T>(list: T[]): T {
  return list[list.length - 1] as T
}

function num(v: string | undefined): number {
  return Number(v)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('niceTicks', () => {
  it('rounds the range out to nice steps', () => {
    expect(niceTicks(0, 37, 4)).toEqual({ min: 0, max: 40, ticks: [0, 10, 20, 30, 40] })
    expect(niceTicks(0, 1, 4).ticks).toEqual([0, 0.25, 0.5, 0.75, 1])
    // The step closest to the requested count wins, the tighter range on a tie.
    expect(niceTicks(0, 41, 4)).toEqual({ min: 0, max: 50, ticks: [0, 10, 20, 30, 40, 50] })
    expect(niceTicks(3, 1234, 4).ticks).toEqual([0, 250, 500, 750, 1000, 1250])
    expect(niceTicks(-12, 47, 5)).toEqual({ min: -20, max: 60, ticks: [-20, 0, 20, 40, 60] })
  })

  it('has no float noise', () => {
    const { ticks } = niceTicks(0, 0.3, 3)
    expect(ticks).toEqual([0, 0.1, 0.2, 0.3])
  })

  it('handles a flat or empty range', () => {
    expect(niceTicks(0, 0, 4)).toEqual({ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] })
    expect(niceTicks(5, 5, 4).min).toBe(0)
    expect(niceTicks(5, 5, 4).max).toBeGreaterThanOrEqual(5)
    expect(niceTicks(Number.NaN, Number.NaN).ticks.length).toBeGreaterThan(1)
  })

  it('accepts a reversed range', () => {
    expect(niceTicks(100, 0, 2)).toEqual({ min: 0, max: 100, ticks: [0, 50, 100] })
  })
})

describe('chart paths', () => {
  it('breaks a line at null', () => {
    expect(linePath([{ x: 0, y: 0 }, { x: 1, y: 1 }, null, { x: 3, y: 3 }, { x: 4, y: 4 }])).toBe('M0 0L1 1M3 3L4 4')
  })

  it('rounds only the data end of a bar', () => {
    expect(barPath(0, 10, 100, 50, 4)).toBe('M0 100V54Q0 50 4 50H6Q10 50 10 54V100Z')
    expect(barPath(0, 10, 100, 50, 0)).toBe('M0 100V50H10V100Z')
  })
})

describe('UidChart', () => {
  it('renders one path per line series, with gaps at null', () => {
    const w = make({
      series: [
        { key: 'a', label: 'A', data: [5, 4, null, 2, 1] },
        { key: 'b', label: 'B', data: [5, 4, 3, 2, 1] },
      ],
    })
    const lines = w.findAll('.uid-chart__line')
    expect(lines).toHaveLength(2)
    expect(lines[0]!.attributes('d')!.match(/M/g)).toHaveLength(2)
    expect(lines[1]!.attributes('d')!.match(/M/g)).toHaveLength(1)
  })

  it('dashes a dashed series', () => {
    const w = make({
      series: [
        { key: 'a', label: 'A', data: [5, 4, 3, 2, 1] },
        { key: 'ideal', label: 'Ideal', data: [5, 4, 3, 2, 1], dashed: true },
      ],
    })
    const lines = w.findAll('.uid-chart__line')
    expect(lines[0]!.attributes('stroke-dasharray')).toBeUndefined()
    expect(lines[1]!.attributes('stroke-dasharray')).toBe('4 4')
  })

  it('takes palette slots in series order; color and tone skip the slot', () => {
    const w = make({
      series: [
        { key: 'a', label: 'A', data: [1, 2, 3, 4, 5] },
        { key: 'b', label: 'B', data: [1, 2, 3, 4, 5], tone: 'neutral' },
        { key: 'c', label: 'C', data: [1, 2, 3, 4, 5], color: 'red' },
        { key: 'd', label: 'D', data: [1, 2, 3, 4, 5] },
      ],
    })
    const styles = w.findAll('.uid-chart__line').map(l => l.attributes('style'))
    expect(styles[0]).toContain('var(--uid-chart-1)')
    expect(styles[1]).toContain('var(--uid-chart-neutral)')
    expect(styles[2]).toContain('red')
    expect(styles[3]).toContain('var(--uid-chart-2)')
  })

  it('stacks bars with the same stack id: the top segment ends at the sum', () => {
    const w = make({
      categories: ['A', 'B'],
      yMax: 100,
      series: [
        { key: 'x', label: 'X', type: 'bar', stack: 's', data: [30, 10] },
        { key: 'y', label: 'Y', type: 'bar', stack: 's', data: [50, 20] },
      ],
    })
    const bars = w.findAll('.uid-chart__bar')
    expect(bars).toHaveLength(4)
    const bottom = bars.find(b => b.attributes('data-series') === '0' && b.attributes('data-index') === '0')!
    const top = bars.find(b => b.attributes('data-series') === '1' && b.attributes('data-index') === '0')!
    // Both segments share one column.
    expect(top.attributes('data-x')).toBe(bottom.attributes('data-x'))
    // The plot spans 0..100: y of the stack top is the y of 80, the bottom segment ends at 30.
    const base = num(bottom.attributes('data-y')) + num(bottom.attributes('data-height'))
    const plotH = base - num(last(w.findAll('.uid-chart__grid line')).attributes('y1'))
    const yOf = (v: number) => base - (v / 100) * plotH
    expect(num(top.attributes('data-y'))).toBeCloseTo(yOf(80), 1)
    expect(num(bottom.attributes('data-y'))).toBeCloseTo(yOf(30), 1)
    // A 2px surface gap between the segments.
    expect(num(top.attributes('data-y')) + num(top.attributes('data-height'))).toBeCloseTo(yOf(30) - 2, 1)
  })

  it('groups non-stacked bar series side by side within a category', () => {
    const w = make({
      categories: ['A', 'B'],
      series: [
        { key: 'plan', label: 'Plan', type: 'bar', tone: 'neutral', data: [10, 12] },
        { key: 'fact', label: 'Fact', type: 'bar', tone: 'accent', data: [8, 13] },
      ],
    })
    const bars = w.findAll('.uid-chart__bar')
    const plan = bars.find(b => b.attributes('data-series') === '0' && b.attributes('data-index') === '0')!
    const fact = bars.find(b => b.attributes('data-series') === '1' && b.attributes('data-index') === '0')!
    const gap = num(fact.attributes('data-x')) - (num(plan.attributes('data-x')) + num(plan.attributes('data-width')))
    expect(gap).toBeCloseTo(2, 1)
    expect(fact.attributes('style')).toContain('var(--uid-accent)')
    expect(plan.attributes('style')).toContain('var(--uid-chart-neutral)')
  })

  it('draws no bar for null', () => {
    const w = make({ series: [{ key: 'a', label: 'A', type: 'bar', data: [1, null, 3, null, 5] }] })
    expect(w.findAll('.uid-chart__bar')).toHaveLength(3)
  })

  it('draws dots with a ring', () => {
    const w = make({ series: [{ key: 'a', label: 'A', type: 'dots', data: [null, 2, null, 4, null] }] })
    const dots = w.findAll('.uid-chart__dot')
    expect(dots).toHaveLength(2)
    expect(num(dots[0]!.attributes('r'))).toBeGreaterThanOrEqual(4)
  })

  it('places references: x on a category position, y on a value', () => {
    const w = make({
      yMax: 100,
      series: [{ key: 'a', label: 'A', data: [10, 20, 30, 40, 50] }],
      references: [
        { axis: 'x', value: 2, label: 'Today' },
        { axis: 'x', value: 2.5 },
        { axis: 'y', value: 50, label: 'Goal', dashed: true },
      ],
    })
    const refs = w.findAll('.uid-chart__reference')
    expect(refs).toHaveLength(3)
    const width = 600
    const grid = w.findAll('.uid-chart__grid line')
    const left = num(grid[0]!.attributes('x1'))
    const right = num(grid[0]!.attributes('x2'))
    const band = (right - left) / 5
    expect(right).toBeLessThanOrEqual(width)
    const x0 = refs[0]!.get('line')
    expect(num(x0.attributes('x1'))).toBeCloseTo(left + 2.5 * band, 1)
    expect(num(refs[1]!.get('line').attributes('x1'))).toBeCloseTo(left + 3 * band, 1)
    expect(refs[0]!.text()).toBe('Today')
    // y = 50 sits halfway between the 0 and 100 grid lines.
    const yTop = num(last(grid).attributes('y1'))
    const yBottom = num(grid[0]!.attributes('y1'))
    const y = refs[2]!.get('line')
    expect(num(y.attributes('y1'))).toBeCloseTo((yTop + yBottom) / 2, 1)
    expect(y.attributes('stroke-dasharray')).toBe('4 4')
    expect(refs[2]!.text()).toBe('Goal')
  })

  it('shows the legend for two or more series, hides it for one', () => {
    const one = make({ series: [{ key: 'a', label: 'A', data: [1, 2, 3, 4, 5] }] })
    expect(one.find('.uid-chart__legend').exists()).toBe(false)

    const two = make({
      series: [
        { key: 'a', label: 'A', data: [1, 2, 3, 4, 5] },
        { key: 'b', label: 'B', type: 'bar', data: [1, 2, 3, 4, 5] },
      ],
    })
    const legend = two.get('.uid-chart__legend--bottom')
    expect(legend.findAll('li').map(li => li.text())).toEqual(['A', 'B'])
    expect(legend.find('.uid-chart__key--line').exists()).toBe(true)
    expect(legend.find('.uid-chart__key--square').exists()).toBe(true)

    const hiddenOne = make({
      series: [
        { key: 'a', label: 'A', data: [1, 2, 3, 4, 5] },
        { key: 'b', label: 'B', data: [1, 2, 3, 4, 5], legend: false },
      ],
    })
    expect(hiddenOne.find('.uid-chart__legend').exists()).toBe(false)

    const forced = make({ legend: 'top', series: [{ key: 'a', label: 'A', data: [1, 2, 3, 4, 5], dashed: true }] })
    expect(forced.find('.uid-chart__legend--top .uid-chart__key--dashed').exists()).toBe(true)

    const off = make({
      legend: false,
      series: [
        { key: 'a', label: 'A', data: [1, 2, 3, 4, 5] },
        { key: 'b', label: 'B', data: [1, 2, 3, 4, 5] },
      ],
    })
    expect(off.find('.uid-chart__legend').exists()).toBe(false)
  })

  it('shows a tooltip on ArrowRight with formatted values and a dash for null', async () => {
    const series: ChartSeries[] = [
      { key: 'rem', label: 'Remaining', data: [40, 32, 25, null, 10] },
      { key: 'ideal', label: 'Ideal', data: [40, 30, 20, 10, 0], dashed: true },
    ]
    const w = make({ series, formatValue: (v: number) => `${v} pt` })
    const plot = w.get('.uid-chart__plot')
    expect(plot.attributes('tabindex')).toBe('0')
    expect(w.find('[role="tooltip"]').exists()).toBe(false)

    await plot.trigger('keydown', { key: 'ArrowRight' })
    let tip = w.get('[role="tooltip"]')
    expect(tip.text()).toContain('S1')
    expect(tip.text()).toContain('Remaining')
    expect(tip.text()).toContain('40 pt')

    await plot.trigger('keydown', { key: 'End' })
    await plot.trigger('keydown', { key: 'ArrowLeft' })
    tip = w.get('[role="tooltip"]')
    expect(tip.text()).toContain('S4')
    expect(tip.text()).toContain('—')
    expect(tip.text()).toContain('10 pt')

    await plot.trigger('keydown', { key: 'Escape' })
    expect(w.find('[role="tooltip"]').exists()).toBe(false)
    expect(w.emitted('hover')).toEqual([[0], [4], [3], [null]])
  })

  it('renders a custom tooltip through the slot', async () => {
    const w = mount(UidChart, {
      props: { categories, series: [{ key: 'a', label: 'A', data: [1, 2, 3, 4, 5] }] },
      slots: {
        tooltip: ({ index, category, items }: { index: number; category: string; items: { formatted: string }[] }) =>
          h('em', `${index}/${category}/${items.map(i => i.formatted).join(',')}`),
      },
    })
    await w.get('.uid-chart__plot').trigger('keydown', { key: 'Home' })
    expect(w.get('[role="tooltip"] em').text()).toBe('0/S1/1')
  })

  it('keeps the data in a hidden table', () => {
    const w = make({
      formatCategory: (c: string) => `Sprint ${c}`,
      series: [
        { key: 'plan', label: 'Plan', type: 'bar', data: [10, 12, 9, 11, 10] },
        { key: 'fact', label: 'Fact', type: 'bar', data: [8, null, 9, 12, 10] },
      ],
    })
    const table = w.get('table.uid-chart__table')
    expect(table.findAll('thead th').map(t => t.text())).toEqual(['Категория', 'Plan', 'Fact'])
    const rows = table.findAll('tbody tr')
    expect(rows).toHaveLength(5)
    expect(rows[1]!.findAll('th, td').map(c => c.text())).toEqual(['Sprint S2', '12', '—'])
  })

  it('labels the figure and hides the svg from assistive tech', () => {
    const w = make({ series: [{ key: 'a', label: 'A', data: [1, 2, null, 4, 5] }] })
    expect(w.get('.uid-chart').attributes('role')).toBe('figure')
    expect(w.get('.uid-chart').attributes('aria-label')).toBe('График: рядов — 1, точек — 4')
    expect(w.get('svg').attributes('aria-hidden')).toBe('true')
    expect(make({ ariaLabel: 'Burndown', series: [{ key: 'a', label: 'A', data: [1] }] }).get('.uid-chart').attributes('aria-label')).toBe('Burndown')
  })

  it('thins x labels when they do not fit, and keeps them all on request', () => {
    const many = Array.from({ length: 60 }, (_, i) => `Week ${i + 1}`)
    const series = [{ key: 'a', label: 'A', data: many.map((_, i) => i) }]
    const auto = make({ categories: many, series })
    const autoCount = auto.findAll('.uid-chart__x-axis text').length
    expect(autoCount).toBeGreaterThan(1)
    expect(autoCount).toBeLessThan(60)
    expect(make({ categories: many, series, xLabels: 'all' }).findAll('.uid-chart__x-axis text')).toHaveLength(60)
    expect(make({ categories: many, series, xLabels: 'none' }).findAll('.uid-chart__x-axis text')).toHaveLength(0)
  })

  it('formats y ticks with formatValue', () => {
    const w = make({ series: [{ key: 'a', label: 'A', data: [0, 10, 20, 30, 37] }], formatValue: (v: number) => `${v}h` })
    expect(w.findAll('.uid-chart__y-axis text').map(t => t.text())).toEqual(['0h', '10h', '20h', '30h', '40h'])
  })

  it('shows an empty state with no categories or only nulls', () => {
    const none = make({ categories: [], series: [{ key: 'a', label: 'A', data: [] }] })
    expect(none.find('svg').exists()).toBe(false)
    expect(none.get('.uid-chart__empty').text()).toBe('Нет данных')
    expect(none.get('.uid-chart').attributes('aria-label')).toBe('Нет данных')

    const nulls = make({ series: [{ key: 'a', label: 'A', data: [null, null, null, null, null] }] })
    expect(nulls.find('.uid-chart__empty').exists()).toBe(true)
    expect(nulls.find('table').exists()).toBe(false)
  })

  it('fills an area and stacks areas on each other', () => {
    const w = make({
      yMax: 20,
      series: [
        { key: 'a', label: 'A', type: 'area', stack: 's', data: [5, 5, 5, 5, 5] },
        { key: 'b', label: 'B', type: 'area', stack: 's', data: [5, 5, 5, 5, 5] },
      ],
    })
    expect(w.findAll('.uid-chart__area')).toHaveLength(2)
    const grid = w.findAll('.uid-chart__grid line')
    const yBottom = num(grid[0]!.attributes('y1'))
    const yTop = num(last(grid).attributes('y1'))
    const second = w.findAll('.uid-chart__line')[1]!.attributes('d')!
    const firstY = Number(second.split(' ')[1]!.replace(/[^\d.].*$/, ''))
    expect(firstY).toBeCloseTo(yBottom - (yBottom - yTop) / 2, 1)
  })

  it('draws stacked areas as solid bands and a lone area as a light fill', () => {
    const stacked = make({
      series: [
        { key: 'a', label: 'A', type: 'area', stack: 's', data: [5, 5, 5, 5, 5] },
        { key: 'b', label: 'B', type: 'area', stack: 's', data: [5, 5, 5, 5, 5] },
      ],
    })
    expect(stacked.findAll('.uid-chart__area--stacked')).toHaveLength(2)
    expect(stacked.findAll('.uid-chart__line--edge')).toHaveLength(2)

    const lone = make({ series: [{ key: 'a', label: 'A', type: 'area', data: [5, 5, 5, 5, 5] }] })
    expect(lone.find('.uid-chart__area--stacked').exists()).toBe(false)
    expect(lone.find('.uid-chart__line--edge').exists()).toBe(false)
  })

  it('takes a stroke width per line series, 2 px by default', () => {
    const w = make({
      series: [
        { key: 'a', label: 'A', data: [1, 2, 3, 4, 5], width: 3 },
        { key: 'b', label: 'B', type: 'area', data: [1, 2, 3, 4, 5] },
      ],
    })
    const lines = w.findAll('.uid-chart__line')
    expect(lines[0]!.attributes('style')).toContain('stroke-width: 3px')
    expect(lines[1]!.attributes('style') ?? '').not.toContain('stroke-width')
  })

  it('shades category ranges behind the grid, from the left edge of from to the right edge of to', () => {
    const w = make({
      series: [{ key: 'a', label: 'A', data: [1, 2, 3, 4, 5] }],
      bands: [
        { from: 1, to: 2, label: 'Sprint' },
        { from: 4, to: 4, label: 'Sprint' },
        { from: 3, to: 3, tone: 'warning', label: 'Freeze' },
        { from: 0, to: 0 },
      ],
    })
    const grid = w.findAll('.uid-chart__grid line')
    const left = num(grid[0]!.attributes('x1'))
    const band = (num(grid[0]!.attributes('x2')) - left) / 5
    const regions = w.findAll('.uid-chart__region')
    expect(regions).toHaveLength(4)
    expect(num(regions[0]!.attributes('x'))).toBeCloseTo(left + band, 1)
    expect(num(regions[0]!.attributes('width'))).toBeCloseTo(2 * band, 1)
    expect(num(regions[1]!.attributes('width'))).toBeCloseTo(band, 1)
    expect(regions[0]!.classes()).toContain('uid-chart__region--neutral')
    expect(regions[0]!.attributes('style')).toContain('var(--uid-chart-neutral)')
    expect(regions[2]!.classes()).not.toContain('uid-chart__region--neutral')
    expect(regions[2]!.attributes('style')).toContain('var(--uid-warning)')
    // Behind the grid: the regions come first in the SVG.
    const svg = w.get('svg').element
    const order = [...svg.children].map(el => el.getAttribute('class'))
    expect(order.indexOf('uid-chart__regions')).toBeLessThan(order.indexOf('uid-chart__grid'))
    // Legend: series first, then one entry per band label.
    const legend = w.get('.uid-chart__legend')
    expect(legend.findAll('li').map(li => li.text())).toEqual(['A', 'Sprint', 'Freeze'])
    expect(legend.findAll('.uid-chart__key--band')).toHaveLength(2)
  })

  it('clamps a band to the categories and skips one outside', () => {
    const w = make({
      series: [{ key: 'a', label: 'A', data: [1, 2, 3, 4, 5] }],
      bands: [{ from: 3, to: 9 }, { from: 7, to: 9 }],
    })
    const grid = w.findAll('.uid-chart__grid line')
    const right = num(grid[0]!.attributes('x2'))
    const regions = w.findAll('.uid-chart__region')
    expect(regions).toHaveLength(1)
    expect(num(regions[0]!.attributes('x')) + num(regions[0]!.attributes('width'))).toBeCloseTo(right, 1)
  })

  it('draws a sparkline without axes', () => {
    const w = make({ axes: false, grid: false, height: 50, series: [{ key: 'a', label: 'A', data: [1, 3, 2, 5, 4] }] })
    expect(w.findAll('.uid-chart__tick')).toHaveLength(0)
    expect(w.find('.uid-chart__axis').exists()).toBe(false)
    expect(w.find('.uid-chart__grid').exists()).toBe(false)
    const d = w.get('.uid-chart__line').attributes('d')!
    // The first point sits half a band in from the 2 px padding.
    const x0 = Number(d.slice(1).split(' ')[0])
    expect(x0).toBeCloseTo(2 + (600 - 4) / 10, 1)

    const withGrid = make({ axes: false, series: [{ key: 'a', label: 'A', data: [1, 3, 2, 5, 4] }] })
    expect(withGrid.find('.uid-chart__grid').exists()).toBe(true)
    expect(num(withGrid.get('.uid-chart__grid line').attributes('x1'))).toBe(2)
  })

  it('draws an x reference label as a pill kept inside the chart', () => {
    const w = make({
      series: [{ key: 'a', label: 'A', data: [1, 2, 3, 4, 5] }],
      references: [
        { axis: 'x', value: 2, label: 'Today', pill: true, tone: 'danger' },
        { axis: 'x', value: 4, label: 'A long release label', pill: true },
        { axis: 'x', value: 1, label: 'Plain' },
      ],
    })
    const pills = w.findAll('.uid-chart__pill')
    expect(pills).toHaveLength(2)
    expect(pills[0]!.attributes('style')).toContain('var(--uid-danger)')
    const line = w.findAll('.uid-chart__reference')[0]!.get('line')
    const px = num(pills[0]!.attributes('x'))
    const pw = num(pills[0]!.attributes('width'))
    expect(px + pw / 2).toBeCloseTo(num(line.attributes('x1')), 1)
    expect(num(pills[0]!.attributes('y')) + num(pills[0]!.attributes('height'))).toBeLessThanOrEqual(num(line.attributes('y1')))
    // The last one would overflow the right edge: shifted inside.
    expect(num(pills[1]!.attributes('x')) + num(pills[1]!.attributes('width'))).toBeLessThanOrEqual(600)
    expect(w.findAll('.uid-chart__pill-label').map(t => t.text())).toEqual(['Today', 'A long release label'])
    expect(w.findAll('.uid-chart__reference-label').map(t => t.text())).toEqual(['Plain'])
  })
})
