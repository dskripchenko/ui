import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import UidHeatmapMatrix from './UidHeatmapMatrix.vue'
import UidLocaleProvider from '../LocaleProvider/UidLocaleProvider.vue'
import { en } from '../../locales/en.js'
import { heatmapColorAt, heatmapColorScales, resolveHeatmapStops } from './colorScales.js'

const rows = ['Mon', 'Tue', 'Wed']
const cols = ['May', 'Jun', 'Jul', 'Aug']
const values = [
  [1, 2, 3, 4],
  [0, 5, null, 8],
  [2, 2, 2, null],
]

function make(props: Record<string, unknown> = {}) {
  return mount(UidHeatmapMatrix, { props: { rows, cols, values, ...props }, attachTo: document.body })
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('UidHeatmapMatrix', () => {
  it('renders a grid with a column header per column and a cell per value', () => {
    const w = make()
    const grid = w.get('[role="grid"]')
    expect(grid.attributes('aria-label')).toBe('Тепловая карта: 3 строк × 4 столбцов')
    expect(w.findAll('[role="columnheader"]')).toHaveLength(cols.length + 1)
    expect(w.findAll('[role="rowheader"]').map(r => r.text())).toEqual(rows)
    expect(w.findAll('[role="gridcell"]')).toHaveLength(rows.length * cols.length)
  })

  it('labels every column', () => {
    const w = make()
    const labels = w.findAll('.uid-heatmap-matrix__col-label')
    expect(labels.map(l => l.text())).toEqual(cols)
    expect(labels.some(l => l.classes('uid-heatmap-matrix__col-label--hidden'))).toBe(false)
    expect(w.findAll('.uid-heatmap-matrix__col-header').map(h => h.attributes('aria-label'))).toEqual(cols)
  })

  it('draws null and missing values as empty outlined cells', () => {
    const w = make({ values: [[1, 2, 3, 4], [0, 5, null, 8], [2, 2, 2]] })
    const cells = w.findAll('[role="gridcell"]')
    expect(cells[6].classes()).toContain('uid-heatmap-matrix__cell--empty')
    expect(cells[6].attributes('style')).toBeUndefined()
    expect(cells[11].classes()).toContain('uid-heatmap-matrix__cell--empty')
    expect(cells[4].classes()).not.toContain('uid-heatmap-matrix__cell--empty')
    expect(cells[4].attributes('style')).toContain('background')
  })

  it('gives each cell an aria label of row × column: value', () => {
    const w = make({ formatValue: (v: number) => `$${v}` })
    const cells = w.findAll('[role="gridcell"]')
    expect(cells[0].attributes('aria-label')).toBe('Mon × May: $1')
    expect(cells[6].attributes('aria-label')).toBe('Tue × Jul: Нет данных')
  })

  it('shows a tooltip with row, column and formatted value on hover', async () => {
    const w = make({ formatValue: (v: number) => `${v} orders` })
    await w.findAll('[role="gridcell"]')[5].trigger('mouseenter')
    const tip = w.get('[role="tooltip"]')
    expect(tip.text()).toContain('Tue × Jun')
    expect(tip.text()).toContain('5 orders')
    await w.get('[role="grid"]').trigger('mouseleave')
    expect(w.find('[role="tooltip"]').exists()).toBe(false)
  })

  it('renders a custom tooltip through the slot', async () => {
    const w = mount(UidHeatmapMatrix, {
      props: { rows, cols, values },
      slots: { tooltip: ({ cell, formatted }: { cell: { row: string; colIndex: number }; formatted: string }) => h('em', `${cell.row}/${cell.colIndex}/${formatted}`) },
    })
    await w.findAll('[role="gridcell"]')[1].trigger('mouseenter')
    expect(w.get('[role="tooltip"] em').text()).toBe('Mon/1/2')
  })

  it('colours the minimum with the first stop and the maximum with the last', () => {
    const w = make({ colorScale: 'viridis' })
    const cells = w.findAll('[role="gridcell"]')
    expect(cells[4].attributes('style')).toContain('background: rgb(68, 1, 84)')
    expect(cells[7].attributes('style')).toContain('background: rgb(253, 231, 37)')
  })

  it('accepts custom stops', () => {
    const w = make({ colorScale: ['#000000', '#ffffff'] })
    const cells = w.findAll('[role="gridcell"]')
    expect(cells[4].attributes('style')).toContain('rgb(0, 0, 0)')
    expect(cells[7].attributes('style')).toContain('rgb(255, 255, 255)')
  })

  it('honours explicit min and max', () => {
    expect(heatmapColorAt(['#000', '#fff'], 0.5)).toBe('color-mix(in srgb, #fff 50.0%, #000)')
    const w = make({ colorScale: ['#000000', '#ffffff'], min: 0, max: 16 })
    expect(w.findAll('[role="gridcell"]')[7].attributes('style')).toContain('color-mix')
  })

  it('renders a min → max legend and a no-data key when there are nulls', () => {
    const w = make({ formatValue: (v: number) => `#${v}` })
    const legend = w.get('.uid-heatmap-matrix__legend')
    const ends = legend.findAll('.uid-heatmap-matrix__legend-value').map(v => v.text())
    expect(ends).toEqual(['#0', '#8'])
    expect(legend.text()).toContain('Нет данных')
    expect(make({ values: [[1, 2, 3, 4]], rows: ['A'] }).find('.uid-heatmap-matrix__legend-empty').exists()).toBe(false)
    expect(make({ showLegend: false }).find('.uid-heatmap-matrix__legend').exists()).toBe(false)
  })

  it('moves focus with the arrow keys using a roving tabindex', async () => {
    const w = make()
    const cells = () => w.findAll('[role="gridcell"]')
    expect(cells().filter(c => c.attributes('tabindex') === '0')).toHaveLength(1)
    ;(cells()[0].element as HTMLElement).focus()
    await cells()[0].trigger('focus')
    await w.get('[role="grid"]').trigger('keydown', { key: 'ArrowRight' })
    await w.get('[role="grid"]').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(cells()[5].attributes('tabindex')).toBe('0')
    expect(document.activeElement).toBe(cells()[5].element)
    await w.get('[role="grid"]').trigger('keydown', { key: 'End' })
    await nextTick()
    expect(cells()[7].attributes('tabindex')).toBe('0')
  })

  it('thins and rotates the column labels when they do not fit', async () => {
    let width = 0
    const observers: (() => void)[] = []
    vi.stubGlobal('ResizeObserver', class {
      constructor(cb: () => void) { observers.push(cb) }
      observe() {}
      disconnect() {}
    })
    const many = Array.from({ length: 24 }, (_, i) => `September ${i}`)
    const w = mount(UidHeatmapMatrix, {
      props: { rows: ['A'], cols: many, values: [many.map((_, i) => i)] },
      attachTo: document.body,
    })
    const root = w.element as HTMLElement
    root.getBoundingClientRect = () => ({ width } as DOMRect)
    width = 300
    observers.forEach(cb => cb())
    await nextTick()
    expect(w.classes()).toContain('uid-heatmap-matrix--labels-rotated')
    const hidden = w.findAll('.uid-heatmap-matrix__col-label--hidden')
    expect(hidden.length).toBeGreaterThan(0)
    expect(hidden.length).toBeLessThan(many.length)

    width = 4000
    observers.forEach(cb => cb())
    await nextTick()
    expect(w.classes()).toContain('uid-heatmap-matrix--labels-horizontal')
    expect(w.findAll('.uid-heatmap-matrix__col-label--hidden')).toHaveLength(0)
  })

  it('follows the locale', () => {
    const w = mount(UidLocaleProvider, {
      props: { locale: en },
      slots: { default: () => h(UidHeatmapMatrix, { rows, cols, values }) },
    })
    expect(w.get('[role="grid"]').attributes('aria-label')).toBe('Heatmap: 3 rows × 4 columns')
    expect(w.text()).toContain('No data')
    expect(w.findAll('[role="gridcell"]')[6].attributes('aria-label')).toBe('Tue × Jul: No data')
  })
})

describe('resolveHeatmapStops', () => {
  it('resolves names, lists and single colours', () => {
    expect(resolveHeatmapStops('viridis')).toEqual([...heatmapColorScales.viridis])
    expect(resolveHeatmapStops('Magma')).toEqual([...heatmapColorScales.magma])
    expect(resolveHeatmapStops(undefined)).toEqual([...heatmapColorScales.default])
    expect(resolveHeatmapStops('no-such-scale')).toEqual([...heatmapColorScales.default])
    expect(resolveHeatmapStops(['#111', '#222', '#333'])).toEqual(['#111', '#222', '#333'])
    expect(resolveHeatmapStops('#ff0000')).toEqual(['color-mix(in srgb, #ff0000 14%, var(--uid-color-bg))', '#ff0000'])
  })

  it('falls back to the default for an unknown name', () => {
    expect(resolveHeatmapStops('cividis')).toEqual([...heatmapColorScales.default])
  })

  it('ships the documented named scales', () => {
    for (const name of ['default', 'viridis', 'magma', 'blues', 'greens', 'reds'] as const) {
      expect(heatmapColorScales[name].length).toBeGreaterThan(1)
    }
  })
})
