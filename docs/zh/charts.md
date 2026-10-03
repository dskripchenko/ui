# 图表

组件库刻意不内置完整图表引擎。取而代之的是：

1. **SVG 原语** — `UidSparkline`、`UidProgressRing`、`UidGauge`、`UidHeatmap`、`UidHeatmapMatrix`。无依赖，每个 ~1 KB，覆盖大多数 dashboard 场景。
2. **完整图表(Line/Bar/Pie/Area)** — 推荐模式：与你选择的图表库配对。

## 内置原语

| 组件 | 用途 | 示例 |
|---|---|---|
| **`UidSparkline`** | 趋势迷你图(line/bar/area) | KPI 卡片、文中内联 |
| **`UidProgressRing`** | 圆形进度，带标签 | 完成率、评分、指标 |
| **`UidGauge`** | 半圆刻度盘，带阈值区段 | 速度计、CPU/磁盘占用 |
| **`UidHeatmap`** | 日历 heatmap(GitHub 风格) | 按日活跃度、贡献 |
| **`UidHeatmapMatrix`** | 矩阵 heatmap:行 × 列,带坐标轴标签 | 按星期 × 月份的订单、按小时的负载 |

所有原语：
- 纯 SVG，无 `canvas`，无运行时库
- 接受 `color`(CSS 变量或 hex)
- 拥有合适的 `aria-*` 属性供屏幕阅读器使用
- 通过 `tone`(`primary`/`success`/`warning`/`danger`/`info`)着色

## 矩阵 heatmap

`UidHeatmapMatrix` 只绘制传入的矩阵——它不处理日期(那是 `UidHeatmap` 的工作)。

```vue
<UidHeatmapMatrix
  :rows="['Mon', 'Tue', 'Wed']"
  :cols="['May', 'Jun', 'Jul']"
  :values="[[4, 8, 15], [16, 23, null], [42, 7, 9]]"
  color-scale="viridis"
  :format-value="(v) => `${v} orders`"
/>
```

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `rows`、`cols` | `string[]` | — | 坐标轴标签。每一列都有标签;放不下时旋转 45° 并抽稀(`colLabels`:`auto` / `horizontal` / `rotated`)。 |
| `values` | `(number \| null)[][]` | — | `values[row][col]`。`null`(或缺失的单元格)绘制为带描边的空单元格——表示"无数据",与 `0` 不同。 |
| `colorScale` | 名称 \| CSS 颜色 \| `string[]` | `'default'` | 内置色阶:`default`(主题强调色,随主题变化)、`viridis`、`magma`、`plasma`、`inferno`、`blues`、`greens`、`reds`。单个 CSS 颜色从其浅色渐变;数组为自定义色标,从低到高。 |
| `min`、`max` | `number` | 数据的最小/最大值 | 颜色映射的取值范围。 |
| `formatValue` | `(v: number) => string` | 当前 locale 的 `Intl.NumberFormat` | 用于 tooltip、aria 标签和图例。 |
| `cellHeight`、`minCellWidth`、`gap` | `number` | `20`、`10`、`2` | 单元格随容器宽度拉伸;小于 `minCellWidth` 时网格横向滚动。 |
| `showLegend` | `boolean` | `true` | 最小 → 最大渐变图例;存在 `null` 时附加"无数据"标记。 |
| `ariaLabel` | `string` | locale 中的摘要 | |

`#tooltip="{ cell, formatted }"` 插槽可替换 tooltip 内容。网格使用 `role="grid"` 语义:行/列表头、每个单元格带"行 × 列:值"的 `aria-label`,支持方向键导航(Home/End、Ctrl+Home/End、PageUp/PageDown)。导出的辅助函数:`heatmapColorScales`、`resolveHeatmapStops`、`heatmapColorAt`。

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
- **行 × 列矩阵(星期 × 小时、地区 × 季度)** → `UidHeatmapMatrix`
- **多系列、坐标轴、图例、缩放** → 外部库
- **实时流(WebSocket)** → ECharts(性能最佳)
- **简单静态报表** → Chart.js(更轻、API 更简单)
