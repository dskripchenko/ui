# 图表

组件库自带 SVG 图表，不依赖任何图表库：

1. **`UidChart`** — 内置的通用图表：在共享的类别轴上绘制折线、面积、柱形(并列或堆叠)和散点，支持参考线、tooltip、键盘导航和隐藏的数据表。纯 SVG，无依赖。
2. **SVG 原语** — `UidSparkline`、`UidProgressRing`、`UidGauge`、`UidHeatmap`、`UidHeatmapMatrix`。无依赖，每个 ~1 KB，覆盖大多数 dashboard 卡片。
3. **`UidChart` 不绘制的图表**(饼图、雷达图、地图、数万个数据点、缩放) — 与你选择的图表库配对。

## 内置原语

| 组件 | 用途 | 示例 |
|---|---|---|
| **`UidSparkline`** | 趋势迷你图(line/bar/area) | KPI 卡片、文中内联 |
| **`UidProgressRing`** | 圆形进度，带标签 | 完成率、评分、指标 |
| **`UidGauge`** | 半圆刻度盘，带阈值区段 | 速度计、CPU/磁盘占用 |
| **`UidHeatmap`** | 日历 heatmap(GitHub 风格) | 按日活跃度、贡献 |
| **`UidHeatmapMatrix`** | 矩阵 heatmap:行 × 列,带坐标轴标签 | 按星期 × 月份的订单、按小时的负载 |
| **`UidChart`** | 基于类别的折线图、面积图、柱形图、堆叠图和散点图 | 燃尽图、速率图、趋势、随时间的分布 |

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

## UidChart

一个组件覆盖所有类别图表：每个系列在每个类别上有一个值，系列类型决定标记形状。类型可以自由混合 — 柱形占用类别带，折线和散点位于带的中心。

```vue
<script setup lang="ts">
import { UidChart, type ChartSeries, type ChartReference } from '@dskripchenko/ui'

const days = ['周一 3', '周二 4', '周三 5', '周四 6', '周五 7', '周一 10', '周二 11', '周三 12']
const series: ChartSeries[] = [
  { key: 'remaining', label: '剩余', data: [40, 38, 35, 41, 36, 30, null, null] },
  { key: 'ideal', label: '理想', tone: 'neutral', dashed: true, data: [40, 34.3, 28.6, 22.9, 17.1, 11.4, 5.7, 0] },
  { key: 'added', label: '新增范围', type: 'dots', tone: 'warning', data: [null, null, null, 41, null, null, null, null] },
]
const references: ChartReference[] = [{ axis: 'x', value: 5, label: '今天', dashed: true }]
</script>

<template>
  <!-- 燃尽图：剩余工作量、理想线、范围新增和今天。 -->
  <UidChart
    :categories="days"
    :series="series"
    :references="references"
    :format-value="(v) => `${Math.round(v)} 点`"
    aria-label="燃尽图"
  />
</template>
```

并列柱形 — 没有 `stack` 的柱形系列在同一类别内并排显示：

```vue
<UidChart
  :categories="['Q1', 'Q2', 'Q3', 'Q4']"
  :series="[
    { key: 'plan', label: '计划', type: 'bar', tone: 'neutral', data: [34, 36, 30, 40] },
    { key: 'done', label: '完成', type: 'bar', tone: 'accent', data: [30, 37, 28, null] },
  ]"
/>
```

堆叠柱形 — `stack` id 相同的系列会叠在一起(面积图同理)：

```vue
<UidChart
  :categories="['1 月', '2 月', '3 月']"
  :series="[
    { key: 'bugs', label: '缺陷', type: 'bar', stack: 'kind', data: [12, 9, 14] },
    { key: 'features', label: '功能', type: 'bar', stack: 'kind', data: [20, 24, 18] },
  ]"
  legend="top"
/>
```

### Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `categories` | `string[]` | — | x 轴，等间距排列。 |
| `series` | `ChartSeries[]` | — | 见下文。 |
| `references` | `ChartReference[]` | `[]` | 垂直和水平参考线。y 参考线计入自动 y 范围。 |
| `height` | `number` | `240` | 高度(px)。宽度跟随容器(`ResizeObserver`)；无法测量时为 600 px。 |
| `yMin` | `number` | `min(0, 数据最小值)` | |
| `yMax` | `number` | 数据的"整齐"最大值 | 堆叠会求和。 |
| `yTicks` | `number` | `4` | 大致的区间数；刻度为"整齐"的数(1、2、2.5、5 × 10ⁿ)。 |
| `formatValue` | `(v: number) => string` | 当前 locale 的 `Intl.NumberFormat` | 用于 y 刻度、tooltip 和数据表。 |
| `formatCategory` | `(category: string, index: number) => string` | 类别本身 | 用于 x 标签、tooltip 标题和数据表。 |
| `legend` | `boolean \| 'top' \| 'bottom'` | 图例系列 ≥ 2 时为 `'bottom'`，否则隐藏 | `true` 等同于 `'bottom'`。 |
| `grid` | `boolean` | `true` | 水平网格线。 |
| `tooltip` | `boolean` | `true` | |
| `xLabels` | `'auto' \| 'all' \| 'none'` | `'auto'` | `auto` 会抽稀标签，保证互不重叠。 |
| `ariaLabel` | `string` | locale 中的摘要("Chart: 2 series, 10 points") | |

事件 `hover(index: number | null)` — 活动类别变化时触发(指针或键盘)。插槽 `#tooltip="{ index, category, items }"` 可替换 tooltip 内容；每一项为 `{ series, value, formatted, color }`。

### 系列与参考线

```ts
interface ChartSeries {
  key: string
  label: string
  type?: 'line' | 'area' | 'bar' | 'dots'   // 默认 'line'
  data: (number | null)[]                   // 每个类别一个值；null = 无值
  color?: string                            // 任意 CSS 颜色；优先于 tone 和调色板
  tone?: 'accent' | 'info' | 'warning' | 'danger' | 'success' | 'neutral'
  dashed?: boolean                          // line / area：虚线(计划线、理想线)
  stack?: string                            // id 相同的 bar / area 系列会堆叠
  legend?: boolean                          // 默认 true
}

interface ChartReference {
  axis: 'x' | 'y'
  value: number      // y：数值；x：类别索引，可为小数(3.5 = 位于 3 和 4 之间)
  label?: string     // x：显示在顶部；y：显示在右端
  tone?: ChartTone
  color?: string
  dashed?: boolean
}
```

`null` 表示"无值"：折线或面积中断，没有柱形，没有散点；tooltip 和数据表显示"—"。两段空缺之间的单个值会画成一个小圆点。

### 颜色

没有 `color` 或 `tone` 的系列按 `series` 数组的顺序占用调色板槽位：`--uid-chart-1` … `--uid-chart-6`。槽位属于系列的位置，因此隐藏其他系列不会让它变色。超过六个这样的系列会重复调色板 — 建议把尾部合并为"其他"。tone 取自主题：`accent`、`info`、`warning`、`danger`、`success` 对应 `--uid-accent`、`--uid-info`……，`neutral` 对应 `--uid-chart-neutral`(计划、基准线)。调色板在浅色和深色主题(`:root[data-theme='dark']`)下各有取值，可像任何 token 一样覆盖。`--uid-chart-surface`(默认 `--uid-color-surface`)是堆叠柱形之间缝隙和散点外圈的颜色：请设为图表所在的背景色。

标记：2 px 圆角连接的线条，`4 4` 虚线，15 % 不透明度的面积(堆叠面积为 70 % 的色带，顶部 1 px 边线)，带 2 px 外圈的 8 px 散点，数据端 4 px 圆角、间隔 2 px 的柱形。文字始终使用文本颜色，从不使用系列颜色。

### 无障碍

- 根元素为 `role="figure"`，带 `ariaLabel`(或 locale 摘要)；SVG 设为 `aria-hidden`。
- 视觉隐藏的 `<table>` 保存数据：类别为行，系列为列，值已格式化。
- 绘图区可获得焦点：←/→ 移动活动类别，Home/End 跳到两端，Esc 隐藏 tooltip。活动值还会通过 polite 的 live region 播报。
- 图例是带颜色键的文字，键的形状与标记一致(线、虚线、圆点、方块)，因此识别从不只依赖颜色。

纯函数 `niceTicks(min, max, count)` → `{ min, max, ticks }` 已导出，可用于自定义坐标轴。

## 饼图、雷达图、地图和大数据

对于 `UidChart` 不绘制的内容 — 饼图和环形图、雷达图、地图、缩放和刷选、数万个数据点或实时流 — 请与专门的图表库配对。我们不内置图表库，以免给不需要它的项目增加体积。

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
- **趋势、计划与实际、燃尽图、按类别的堆叠分布** → `UidChart`
- **饼图、雷达图、地图、缩放、超大系列** → 外部库
- **实时流(WebSocket)** → ECharts(性能最佳)
- **简单静态报表** → Chart.js(更轻、API 更简单)
