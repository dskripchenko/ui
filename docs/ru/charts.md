# Графики

В библиотеке свои SVG-графики и никакой чартовой библиотеки:

1. **`UidChart`** — встроенный общий график: линии, области, столбцы (рядом или стопкой) и точки на общей оси категорий, опорные линии, тултип, навигация с клавиатуры и скрытая таблица данных. Чистый SVG, без зависимостей.
2. **SVG-примитивы** — `UidSparkline`, `UidProgressRing`, `UidGauge`, `UidHeatmap`, `UidHeatmapMatrix`. Без зависимостей, ~1 КБ каждый, покрывают большинство плиток в дашбордах.
3. **Чего `UidChart` не рисует** (круговые, радар, карты, десятки тысяч точек, зум) — паттерн «обёртка над библиотекой по выбору».

## Встроенные SVG-примитивы

| Компонент | Назначение | Пример |
|---|---|---|
| **`UidSparkline`** | Мини-график тренда (line/bar/area) | KPI-карточки, инлайн в тексте |
| **`UidProgressRing`** | Круговой прогресс с лейблом | % выполнения, рейтинг, индикаторы |
| **`UidGauge`** | Полукруг-циферблат с диапазонами | Spedometer, нагрузка CPU/диска |
| **`UidHeatmap`** | Календарный heatmap (GitHub-style) | Активность по дням, контрибьюшны |
| **`UidHeatmapMatrix`** | Матричный heatmap: строки × столбцы с подписями осей | Заказы по дням недели × месяцам, нагрузка по часам |
| **`UidChart`** | Линейные, областные, столбчатые, стопочные и точечные графики по категориям | Burndown, скорость команды, тренды, распределения во времени |

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

## UidChart

Один компонент для графиков по категориям: у каждой серии по одному значению на категорию, а тип серии определяет отметку. Типы можно смешивать — столбцы занимают полосу категории, линии и точки стоят в её центре.

```vue
<script setup lang="ts">
import { UidChart, type ChartSeries, type ChartReference } from '@dskripchenko/ui'

const days = ['Пн 3', 'Вт 4', 'Ср 5', 'Чт 6', 'Пт 7', 'Пн 10', 'Вт 11', 'Ср 12']
const series: ChartSeries[] = [
  { key: 'remaining', label: 'Осталось', data: [40, 38, 35, 41, 36, 30, null, null] },
  { key: 'ideal', label: 'Идеал', tone: 'neutral', dashed: true, data: [40, 34.3, 28.6, 22.9, 17.1, 11.4, 5.7, 0] },
  { key: 'added', label: 'Добавлено', type: 'dots', tone: 'warning', data: [null, null, null, 41, null, null, null, null] },
]
const references: ChartReference[] = [{ axis: 'x', value: 5, label: 'Сегодня', dashed: true }]
</script>

<template>
  <!-- Burndown: остаток работы, идеальная линия, добавления объёма и «сегодня». -->
  <UidChart
    :categories="days"
    :series="series"
    :references="references"
    :format-value="(v) => `${Math.round(v)} sp`"
    aria-label="Burndown"
  />
</template>
```

Столбцы рядом — серии `bar` без `stack` стоят бок о бок внутри категории:

```vue
<UidChart
  :categories="['Q1', 'Q2', 'Q3', 'Q4']"
  :series="[
    { key: 'plan', label: 'План', type: 'bar', tone: 'neutral', data: [34, 36, 30, 40] },
    { key: 'done', label: 'Факт', type: 'bar', tone: 'accent', data: [30, 37, 28, null] },
  ]"
/>
```

Столбцы стопкой — серии с одинаковым `stack` складываются (области складываются так же):

```vue
<UidChart
  :categories="['Янв', 'Фев', 'Мар']"
  :series="[
    { key: 'bugs', label: 'Ошибки', type: 'bar', stack: 'kind', data: [12, 9, 14] },
    { key: 'features', label: 'Фичи', type: 'bar', stack: 'kind', data: [20, 24, 18] },
  ]"
  legend="top"
/>
```

### Props

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `categories` | `string[]` | — | Ось x, категории на равном шаге. |
| `series` | `ChartSeries[]` | — | См. ниже. |
| `references` | `ChartReference[]` | `[]` | Вертикальные и горизонтальные опорные линии. Опорные линии по y входят в автоматический диапазон оси. |
| `height` | `number` | `240` | Высота в px. Ширина следует за контейнером (`ResizeObserver`); 600 px, если её не измерить. |
| `yMin` | `number` | `min(0, минимум данных)` | |
| `yMax` | `number` | «круглый» максимум данных | Стопки суммируются. |
| `yTicks` | `number` | `4` | Примерное число интервалов; деления — «круглые» числа (1, 2, 2,5, 5 × 10ⁿ). |
| `formatValue` | `(v: number) => string` | `Intl.NumberFormat` локали | Деления y, тултип и таблица данных. |
| `formatCategory` | `(category: string, index: number) => string` | сама категория | Подписи x, заголовок тултипа и таблица данных. |
| `legend` | `boolean \| 'top' \| 'bottom'` | `'bottom'` при 2+ сериях в легенде, иначе скрыта | `true` — это `'bottom'`. |
| `grid` | `boolean` | `true` | Горизонтальные линии сетки. |
| `tooltip` | `boolean` | `true` | |
| `xLabels` | `'auto' \| 'all' \| 'none'` | `'auto'` | `auto` прореживает подписи, чтобы они не наезжали друг на друга. |
| `ariaLabel` | `string` | сводка из локали («График: рядов — 2, точек — 10») | |

Событие `hover(index: number | null)` — сменилась активная категория (указателем или с клавиатуры). Слот `#tooltip="{ index, category, items }"` заменяет содержимое тултипа; каждый элемент — `{ series, value, formatted, color }`.

### Серии и опорные линии

```ts
interface ChartSeries {
  key: string
  label: string
  type?: 'line' | 'area' | 'bar' | 'dots'   // по умолчанию 'line'
  data: (number | null)[]                   // по значению на категорию; null — нет значения
  color?: string                            // любой CSS-цвет; важнее tone и палитры
  tone?: 'accent' | 'info' | 'warning' | 'danger' | 'success' | 'neutral'
  dashed?: boolean                          // line / area: пунктир (планы, идеальные линии)
  stack?: string                            // серии bar / area с одним id складываются
  legend?: boolean                          // по умолчанию true
}

interface ChartReference {
  axis: 'x' | 'y'
  value: number      // y: значение; x: индекс категории, дробный допустим (3.5 — между 3 и 4)
  label?: string     // x: сверху; y: у правого края
  tone?: ChartTone
  color?: string
  dashed?: boolean
}
```

`null` — «нет значения»: разрыв линии или области, нет столбца, нет точки; тултип и таблица показывают «—». Одиночное значение между разрывами рисуется маленькой точкой.

### Цвета

Серии без `color` и `tone` занимают слоты палитры в порядке массива `series`: `--uid-chart-1` … `--uid-chart-6`. Слот принадлежит позиции серии, поэтому скрытие другой серии её не перекрашивает. Больше шести таких серий повторяют палитру — лучше сверните хвост в «Прочее». Тона берутся из темы: `accent`, `info`, `warning`, `danger`, `success` — это `--uid-accent`, `--uid-info`, …, а `neutral` — `--uid-chart-neutral` (планы, базовые линии). У палитры свои значения для светлой и тёмной темы (`:root[data-theme='dark']`), её можно переопределить, как любой токен. `--uid-chart-surface` (по умолчанию `--uid-color-surface`) — цвет зазоров между сегментами стопки и обводки точек: задайте ему фон, на котором стоит график.

Отметки: линии 2 px со скруглёнными стыками, пунктир `4 4`, области с прозрачностью 15 %, точки 8 px с обводкой 2 px, столбцы со скруглением 4 px на конце данных и зазорами 2 px. Текст всегда в цветах текста, никогда в цвете серии.

### Доступность

- Корень — `role="figure"` с `ariaLabel` (или сводкой из локали); SVG скрыт через `aria-hidden`.
- Данные лежат в визуально скрытой `<table>`: категории — строки, серии — столбцы, значения отформатированы.
- Область графика фокусируется: ←/→ двигают активную категорию, Home/End — к краям, Esc прячет тултип. Активные значения также озвучиваются через вежливую live-область.
- Легенда — текст с цветовым ключом, форма которого повторяет отметку (линия, пунктир, точка, квадрат), так что серия не опознаётся одним цветом.

Чистый хелпер `niceTicks(min, max, count)` → `{ min, max, ticks }` экспортируется для собственных осей.

## Круговые, радар, карты и большие данные

Для того, чего `UidChart` не рисует, — круговых и кольцевых диаграмм, радара, карт, зума и выделения диапазона, десятков тысяч точек или реалтайм-стримов — рекомендуем парные библиотеки. Не бандлим их в kit, чтобы не тащить лишних килобайтов в проекты, которым они не нужны.

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
- **Тренды, план и факт, burndown, распределения стопкой по категориям** → `UidChart`
- **Круговые, радар, карты, зум, огромные серии** → внешняя библиотека
- **Реалтайм-стрим (WebSocket)** → ECharts (лучшая производительность)
- **Простой статичный отчёт** → Chart.js (легче, проще API)
