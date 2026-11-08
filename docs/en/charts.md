# Charts

The kit ships its own SVG charts and no chart library:

1. **`UidChart`** — the built-in general chart: lines, areas, bars (grouped or stacked) and dots over a shared category axis, with reference lines, a tooltip, keyboard navigation and a hidden data table. Pure SVG, no dependencies.
2. **SVG primitives** — `UidSparkline`, `UidProgressRing`, `UidGauge`, `UidHeatmap`, `UidHeatmapMatrix`. No dependencies, ~1 KB each, cover most dashboard tiles.
3. **What `UidChart` does not draw** (pie, radar, maps, tens of thousands of points, zoom) — pair with the chart library of your choice.

## Built-in primitives

| Component | Purpose | Example |
|---|---|---|
| **`UidSparkline`** | Mini trend chart (line/bar/area) | KPI cards, inline in copy |
| **`UidProgressRing`** | Circular progress with label | % completion, rating, indicators |
| **`UidGauge`** | Semicircle dial with ranges | Speedometer, CPU/disk usage |
| **`UidHeatmap`** | Calendar heatmap (GitHub-style) | Activity by day, contributions |
| **`UidHeatmapMatrix`** | Matrix heatmap: rows × columns with axis labels | Orders by weekday × month, load by hour |
| **`UidChart`** | Line, area, bar, stacked and dot charts over categories | Burndown, velocity, trends, distributions over time |

All primitives:
- Pure SVG, no `canvas`, no runtime libs
- Accept a `color` (CSS variable or hex)
- Have proper `aria-*` attributes for screen readers
- Tone variants via `tone` (`primary`/`success`/`warning`/`danger`/`info`)

## Matrix heatmap

`UidHeatmapMatrix` draws exactly the matrix you pass — it knows nothing about dates (that is `UidHeatmap`'s job).

```vue
<UidHeatmapMatrix
  :rows="['Mon', 'Tue', 'Wed']"
  :cols="['May', 'Jun', 'Jul']"
  :values="[[4, 8, 15], [16, 23, null], [42, 7, 9]]"
  color-scale="viridis"
  :format-value="(v) => `${v} orders`"
/>
```

| Prop | Type | Default | |
|---|---|---|---|
| `rows`, `cols` | `string[]` | — | Axis labels. Every column is labelled; when the labels do not fit they are rotated 45° and thinned (`colLabels`: `auto` / `horizontal` / `rotated`). |
| `values` | `(number \| null)[][]` | — | `values[row][col]`. `null` (or a missing cell) is drawn as an empty outlined cell — "no data", unlike `0`. |
| `colorScale` | name \| CSS colour \| `string[]` | `'default'` | Named scales: `default` (the accent, follows the theme), `viridis`, `magma`, `plasma`, `inferno`, `blues`, `greens`, `reds`. One CSS colour ramps up from its tint; a list is custom stops, low → high. |
| `min`, `max` | `number` | data min/max | The colour domain. |
| `formatValue` | `(v: number) => string` | `Intl.NumberFormat` of the locale | Used in the tooltip, aria labels and the legend. |
| `cellHeight`, `minCellWidth`, `gap` | `number` | `20`, `10`, `2` | Cells stretch to the container width; below `minCellWidth` the grid scrolls horizontally. |
| `showLegend` | `boolean` | `true` | The min → max gradient, plus a "no data" key when there are nulls. |
| `ariaLabel` | `string` | locale summary | |

The `#tooltip="{ cell, formatted }"` slot replaces the tooltip content. The grid has `role="grid"` semantics: row/column headers, an `aria-label` of "row × column: value" on every cell and arrow-key navigation (Home/End, Ctrl+Home/End, PageUp/PageDown). Exported helpers: `heatmapColorScales`, `resolveHeatmapStops`, `heatmapColorAt`.

## UidChart

One component for category charts: every series has one value per category, and the series type decides the mark. Mix types freely — bars use the category band, lines and dots use the band centre.

```vue
<script setup lang="ts">
import { UidChart, type ChartSeries, type ChartReference } from '@dskripchenko/ui'

const days = ['Mon 3', 'Tue 4', 'Wed 5', 'Thu 6', 'Fri 7', 'Mon 10', 'Tue 11', 'Wed 12']
const series: ChartSeries[] = [
  { key: 'remaining', label: 'Remaining', data: [40, 38, 35, 41, 36, 30, null, null] },
  { key: 'ideal', label: 'Ideal', tone: 'neutral', dashed: true, data: [40, 34.3, 28.6, 22.9, 17.1, 11.4, 5.7, 0] },
  { key: 'added', label: 'Scope added', type: 'dots', tone: 'warning', data: [null, null, null, 41, null, null, null, null] },
]
const references: ChartReference[] = [{ axis: 'x', value: 5, label: 'Today', dashed: true }]
</script>

<template>
  <!-- A burndown: remaining work, the ideal line, scope additions and today. -->
  <UidChart
    :categories="days"
    :series="series"
    :references="references"
    :format-value="(v) => `${Math.round(v)} pt`"
    aria-label="Burndown"
  />
</template>
```

Grouped bars — bar series without `stack` stand side by side within a category:

```vue
<UidChart
  :categories="['Q1', 'Q2', 'Q3', 'Q4']"
  :series="[
    { key: 'plan', label: 'Planned', type: 'bar', tone: 'neutral', data: [34, 36, 30, 40] },
    { key: 'done', label: 'Completed', type: 'bar', tone: 'accent', data: [30, 37, 28, null] },
  ]"
/>
```

Stacked bars — series with the same `stack` id pile up (areas stack the same way):

```vue
<UidChart
  :categories="['Jan', 'Feb', 'Mar']"
  :series="[
    { key: 'bugs', label: 'Bugs', type: 'bar', stack: 'kind', data: [12, 9, 14] },
    { key: 'features', label: 'Features', type: 'bar', stack: 'kind', data: [20, 24, 18] },
  ]"
  legend="top"
/>
```

### Props

| Prop | Type | Default | |
|---|---|---|---|
| `categories` | `string[]` | — | The x axis, evenly spaced. |
| `series` | `ChartSeries[]` | — | See below. |
| `references` | `ChartReference[]` | `[]` | Vertical and horizontal reference lines. y references are included in the automatic y range. |
| `height` | `number` | `240` | Height in px. The width follows the container (`ResizeObserver`); 600 px when it cannot be measured. |
| `yMin` | `number` | `min(0, data min)` | |
| `yMax` | `number` | a nice max of the data | Stacks are summed. |
| `yTicks` | `number` | `4` | Approximate number of intervals; ticks are "nice" numbers (1, 2, 2.5, 5 × 10ⁿ). |
| `formatValue` | `(v: number) => string` | `Intl.NumberFormat` of the locale | Y ticks, tooltip and the data table. |
| `formatCategory` | `(category: string, index: number) => string` | the category | X labels, tooltip title and the data table. |
| `legend` | `boolean \| 'top' \| 'bottom'` | `'bottom'` for 2+ legend series, else hidden | `true` is `'bottom'`. |
| `grid` | `boolean` | `true` | Horizontal grid lines. |
| `tooltip` | `boolean` | `true` | |
| `xLabels` | `'auto' \| 'all' \| 'none'` | `'auto'` | `auto` thins the labels so they never collide. |
| `ariaLabel` | `string` | locale summary ("Chart: 2 series, 10 points") | |

Event `hover(index: number | null)` — the active category changes (pointer or keyboard). Slot `#tooltip="{ index, category, items }"` replaces the tooltip content; each item is `{ series, value, formatted, color }`.

### Series and references

```ts
interface ChartSeries {
  key: string
  label: string
  type?: 'line' | 'area' | 'bar' | 'dots'   // default 'line'
  data: (number | null)[]                   // one value per category; null = no value
  color?: string                            // any CSS colour; wins over tone and the palette
  tone?: 'accent' | 'info' | 'warning' | 'danger' | 'success' | 'neutral'
  dashed?: boolean                          // line / area: dashed stroke (plans, ideal lines)
  stack?: string                            // bar / area series with the same id stack
  legend?: boolean                          // default true
}

interface ChartReference {
  axis: 'x' | 'y'
  value: number      // y: a value; x: a category index, fractions allowed (3.5 = between 3 and 4)
  label?: string     // x: at the top; y: at the right end
  tone?: ChartTone
  color?: string
  dashed?: boolean
}
```

`null` is "no value": a gap in a line or area, no bar, no dot; the tooltip and the table show "—". A lone value between gaps is drawn as a small point.

### Colours

Series without `color` or `tone` take palette slots in the order of the `series` array: `--uid-chart-1` … `--uid-chart-6`. The slot belongs to the series' position, so hiding another series never repaints it. More than six such series repeat the palette — fold the tail into "Other" instead. Tones map to the theme: `accent`, `info`, `warning`, `danger`, `success` to `--uid-accent`, `--uid-info`, … and `neutral` to `--uid-chart-neutral` (plans, baselines). The palette has separate light and dark values (`:root[data-theme='dark']`) and can be overridden like any token. `--uid-chart-surface` (default `--uid-color-surface`) is the colour of the gaps between stacked bars and the ring around dots: set it to the background the chart sits on.

Marks: 2 px lines with round joins, `4 4` dashes, areas at 15 % opacity, 8 px dots with a 2 px ring, bars with a 4 px rounded data end and 2 px gaps. Text always uses the text colours, never a series colour.

### Accessibility

- The root is `role="figure"` with the `ariaLabel` (or the locale summary); the SVG is `aria-hidden`.
- A visually hidden `<table>` holds the data: categories as rows, series as columns, formatted values.
- The plot is focusable: ←/→ move the active category, Home/End jump to the ends, Esc hides the tooltip. The active values are also announced through a polite live region.
- The legend is text with a colour key whose shape follows the mark (line, dashed line, dot, square), so identity never relies on colour alone.

The pure helper `niceTicks(min, max, count)` → `{ min, max, ticks }` is exported for axes of your own.

## Pie, radar, maps and big data

For what `UidChart` does not draw — pie and donut charts, radar, maps, zoom and brushing, tens of thousands of points or real-time streams — pair with a dedicated library. We don't bundle one to keep weight down for projects that don't need it.

### Pairing with Chart.js

```bash
pnpm add chart.js vue-chartjs
```

```vue
<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
import { UidCard } from '@dskripchenko/ui'

Chart.register(...registerables)

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [{
    label: 'Revenue',
    data: [120, 190, 180, 240],
    borderColor: 'var(--uid-color-primary)',
    tension: 0.3,
  }],
}
</script>

<template>
  <UidCard>
    <Line :data="data" :options="{ responsive: true, maintainAspectRatio: false }" />
  </UidCard>
</template>
```

### Pairing with ECharts

```bash
pnpm add echarts vue-echarts
```

```vue
<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const option = {
  xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [120, 190, 180, 240], smooth: true }],
}
</script>

<template>
  <UidCard>
    <VChart :option="option" style="height: 320px" />
  </UidCard>
</template>
```

### Dark theme

Chart libraries don't know about our `data-theme`. Subscribe to theme changes and rebuild options:

```ts
import { useTheme } from '@dskripchenko/ui'

const theme = useTheme()
const chartColors = computed(() => ({
  text: theme.value === 'dark' ? '#e5e7eb' : '#1f2937',
  grid: theme.value === 'dark' ? '#374151' : '#e5e7eb',
}))
```

## When to use what

- **KPI delta/trend in a card** → `UidSparkline` built-in
- **% completion, rating, KPI ring** → `UidProgressRing`
- **Speedometer, threshold-based load** → `UidGauge` with `ranges`
- **Activity over time (year/months)** → `UidHeatmap`
- **A rows × columns matrix (weekday × hour, region × quarter)** → `UidHeatmapMatrix`
- **Trends, plan vs. fact, burndown, stacked distributions over categories** → `UidChart`
- **Pie, radar, maps, zoom, huge series** → external library
- **Real-time stream (WebSocket)** → ECharts (best perf)
- **Plain static report** → Chart.js (lighter, simpler API)
