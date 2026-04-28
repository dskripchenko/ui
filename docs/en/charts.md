# Charts

The kit deliberately ships no full chart engine. Instead:

1. **SVG primitives** — `UidSparkline`, `UidProgressRing`, `UidGauge`, `UidHeatmap`. No dependencies, ~1 KB each, cover most dashboard scenarios.
2. **Full charts (Line/Bar/Pie/Area)** — recommended pattern: pair with the chart library of your choice.

## Built-in primitives

| Component | Purpose | Example |
|---|---|---|
| **`UidSparkline`** | Mini trend chart (line/bar/area) | KPI cards, inline in copy |
| **`UidProgressRing`** | Circular progress with label | % completion, rating, indicators |
| **`UidGauge`** | Semicircle dial with ranges | Speedometer, CPU/disk usage |
| **`UidHeatmap`** | Calendar heatmap (GitHub-style) | Activity by day, contributions |

All primitives:
- Pure SVG, no `canvas`, no runtime libs
- Accept a `color` (CSS variable or hex)
- Have proper `aria-*` attributes for screen readers
- Tone variants via `tone` (`primary`/`success`/`warning`/`danger`/`info`)

## Full charts

For Line/Bar/Pie/Area charts, pair with a dedicated library. We don't bundle one to keep weight down for projects that don't need it.

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
- **Multi-series, axes, legends, zoom** → external library
- **Real-time stream (WebSocket)** → ECharts (best perf)
- **Plain static report** → Chart.js (lighter, simpler API)
