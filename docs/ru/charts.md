# Графики

В библиотеке намеренно нет своего полноценного чартового движка. Вместо этого:

1. **SVG-примитивы** — `UidSparkline`, `UidProgressRing`, `UidGauge`, `UidHeatmap`, `UidHeatmapMatrix`. Без зависимостей, ~1 КБ каждый, покрывают большинство сценариев в дашбордах.
2. **Полные графики (Line/Bar/Pie/Area)** — паттерн «обёртка над библиотекой по выбору».

## Встроенные SVG-примитивы

| Компонент | Назначение | Пример |
|---|---|---|
| **`UidSparkline`** | Мини-график тренда (line/bar/area) | KPI-карточки, инлайн в тексте |
| **`UidProgressRing`** | Круговой прогресс с лейблом | % выполнения, рейтинг, индикаторы |
| **`UidGauge`** | Полукруг-циферблат с диапазонами | Spedometer, нагрузка CPU/диска |
| **`UidHeatmap`** | Календарный heatmap (GitHub-style) | Активность по дням, контрибьюшны |
| **`UidHeatmapMatrix`** | Матричный heatmap: строки × столбцы с подписями осей | Заказы по дням недели × месяцам, нагрузка по часам |

Все примитивы:
- Работают на чистом SVG, без `canvas` и без runtime-библиотек
- Принимают `color` (CSS-переменная или hex)
- Имеют `aria-*` атрибуты для скринридеров
- Тонируются через `tone` (`primary`/`success`/`warning`/`danger`/`info`)

## Матричный heatmap

`UidHeatmapMatrix` рисует ровно ту матрицу, что передали, — о датах он ничего не знает (это работа `UidHeatmap`).

```vue
<UidHeatmapMatrix
  :rows="['Mon', 'Tue', 'Wed']"
  :cols="['May', 'Jun', 'Jul']"
  :values="[[4, 8, 15], [16, 23, null], [42, 7, 9]]"
  color-scale="viridis"
  :format-value="(v) => `${v} orders`"
/>
```

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `rows`, `cols` | `string[]` | — | Подписи осей. Подписан каждый столбец; если подписи не помещаются, они поворачиваются на 45° и прореживаются (`colLabels`: `auto` / `horizontal` / `rotated`). |
| `values` | `(number \| null)[][]` | — | `values[row][col]`. `null` (или отсутствующая ячейка) — пустая ячейка с обводкой, «нет данных», в отличие от `0`. |
| `colorScale` | имя \| CSS-цвет \| `string[]` | `'default'` | Именованные шкалы: `default` (акцент, следует теме), `viridis`, `magma`, `plasma`, `inferno`, `blues`, `greens`, `reds`. Один CSS-цвет — шкала от его оттенка; список — свои опорные цвета, от меньшего к большему. |
| `min`, `max` | `number` | min/max данных | Домен цвета. |
| `formatValue` | `(v: number) => string` | `Intl.NumberFormat` локали | Для тултипа, aria-подписей и легенды. |
| `cellHeight`, `minCellWidth`, `gap` | `number` | `20`, `10`, `2` | Ячейки растягиваются по ширине контейнера; уже `minCellWidth` сетка прокручивается по горизонтали. |
| `showLegend` | `boolean` | `true` | Градиент min → max и ключ «нет данных», если есть `null`. |
| `ariaLabel` | `string` | сводка из локали | |

Слот `#tooltip="{ cell, formatted }"` заменяет содержимое тултипа. Семантика `role="grid"`: заголовки строк и столбцов, `aria-label` «строка × столбец: значение» на каждой ячейке, навигация стрелками (Home/End, Ctrl+Home/End, PageUp/PageDown). Экспортируются хелперы `heatmapColorScales`, `resolveHeatmapStops`, `heatmapColorAt`.

## Полные графики

Для Line/Bar/Pie/Area-графиков рекомендуем парные библиотеки. Не бандлим их в kit, чтобы не тащить лишних килобайтов в проекты, которым они не нужны.

### Пара с Chart.js

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
  labels: ['Янв', 'Фев', 'Мар', 'Апр'],
  datasets: [{
    label: 'Доход',
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

### Пара с ECharts

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
  xAxis: { type: 'category', data: ['Янв', 'Фев', 'Мар', 'Апр'] },
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

### Тёмная тема

Графиковые библиотеки не знают про наш `data-theme`. Подпишись на изменение темы и пересоздавай опции:

```ts
import { useTheme } from '@dskripchenko/ui'

const theme = useTheme()
const chartColors = computed(() => ({
  text: theme.value === 'dark' ? '#e5e7eb' : '#1f2937',
  grid: theme.value === 'dark' ? '#374151' : '#e5e7eb',
}))
```

## Когда что выбирать

- **Дельта/тренд в карточке** → `UidSparkline` встроенный
- **% выполнения, рейтинг, KPI-кольцо** → `UidProgressRing`
- **Speedometer, нагрузка с порогами** → `UidGauge` с `ranges`
- **Активность за период (год/месяцы)** → `UidHeatmap`
- **Матрица строки × столбцы (день недели × час, регион × квартал)** → `UidHeatmapMatrix`
- **Сравнение нескольких серий, оси, легенды, зум** → внешняя библиотека
- **Реалтайм-стрим (WebSocket)** → ECharts (лучшая производительность)
- **Простой статичный отчёт** → Chart.js (легче, проще API)
