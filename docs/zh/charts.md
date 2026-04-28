# 图表

组件库刻意不内置完整图表引擎。取而代之的是：

1. **SVG 原语** — `UidSparkline`、`UidProgressRing`、`UidGauge`、`UidHeatmap`。无依赖，每个 ~1 KB，覆盖大多数 dashboard 场景。
2. **完整图表(Line/Bar/Pie/Area)** — 推荐模式：与你选择的图表库配对。

## 内置原语

| 组件 | 用途 | 示例 |
|---|---|---|
| **`UidSparkline`** | 趋势迷你图(line/bar/area) | KPI 卡片、文中内联 |
| **`UidProgressRing`** | 圆形进度，带标签 | 完成率、评分、指标 |
| **`UidGauge`** | 半圆刻度盘，带阈值区段 | 速度计、CPU/磁盘占用 |
| **`UidHeatmap`** | 日历 heatmap(GitHub 风格) | 按日活跃度、贡献 |

所有原语：
- 纯 SVG，无 `canvas`，无运行时库
- 接受 `color`(CSS 变量或 hex)
- 拥有合适的 `aria-*` 属性供屏幕阅读器使用
- 通过 `tone`(`primary`/`success`/`warning`/`danger`/`info`)着色

## 完整图表

Line/Bar/Pie/Area 等完整图表，与专门的库配对。我们不打包它们，以减少不需要图表的项目的体积负担。

### 与 Chart.js 配对

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
  labels: ['1月', '2月', '3月', '4月'],
  datasets: [{
    label: '收入',
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

### 与 ECharts 配对

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
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月'] },
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

### 深色主题

图表库不知道我们的 `data-theme`。订阅主题变化并重建配置：

```ts
import { useTheme } from '@dskripchenko/ui'

const theme = useTheme()
const chartColors = computed(() => ({
  text: theme.value === 'dark' ? '#e5e7eb' : '#1f2937',
  grid: theme.value === 'dark' ? '#374151' : '#e5e7eb',
}))
```

## 何时用什么

- **卡片中的 KPI delta/趋势** → 内置 `UidSparkline`
- **完成率、评分、KPI 圆环** → `UidProgressRing`
- **速度计、阈值负载** → 带 `ranges` 的 `UidGauge`
- **某段时间(年/月)的活跃度** → `UidHeatmap`
- **多系列、坐标轴、图例、缩放** → 外部库
- **实时流(WebSocket)** → ECharts(性能最佳)
- **简单静态报表** → Chart.js(更轻、API 更简单)
