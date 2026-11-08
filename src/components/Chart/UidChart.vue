<script setup lang="ts">
import './UidChart.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import {
  areaPath,
  barPath,
  estimateTextWidth,
  linePath,
  niceTicks,
  segments,
  type ChartPoint,
} from './chartMath.js'

export type ChartSeriesType = 'line' | 'area' | 'bar' | 'dots'
export type ChartTone = 'accent' | 'info' | 'warning' | 'danger' | 'success' | 'neutral'

export interface ChartSeries {
  key: string
  label: string
  /** Default `'line'`. */
  type?: ChartSeriesType
  /** One value per category; `null` is "no value": a gap in a line, no bar, no dot. */
  data: (number | null)[]
  /** Any CSS colour; wins over `tone` and the palette slot. */
  color?: string
  /** A semantic colour instead of the next palette slot. */
  tone?: ChartTone
  /** line / area: a dashed stroke (plans, ideal lines). */
  dashed?: boolean
  /** bar / area series with the same stack id stack on each other. */
  stack?: string
  /** Default `true`: shown in the legend. */
  legend?: boolean
}

export interface ChartReference {
  axis: 'x' | 'y'
  /** y: a value; x: a category index (fractions allowed: 3.5 is between categories 3 and 4). */
  value: number
  label?: string
  tone?: ChartTone
  color?: string
  dashed?: boolean
}

export interface ChartTooltipItem {
  series: ChartSeries
  value: number | null
  formatted: string
  color: string
}

export interface ChartTooltipContext {
  index: number
  category: string
  items: ChartTooltipItem[]
}

export type ChartLegendPosition = 'top' | 'bottom'

export interface UidChartProps {
  categories: string[]
  series: ChartSeries[]
  references?: ChartReference[]
  /** Height in px; the width follows the container. */
  height?: number
  yMin?: number
  yMax?: number
  /** Approximate number of y ticks. */
  yTicks?: number
  formatValue?: (value: number) => string
  formatCategory?: (category: string, index: number) => string
  legend?: boolean | ChartLegendPosition
  grid?: boolean
  tooltip?: boolean
  xLabels?: 'auto' | 'all' | 'none'
  ariaLabel?: string
}

const props = withDefaults(defineProps<UidChartProps>(), {
  references: () => [],
  height: 240,
  yMin: undefined,
  yMax: undefined,
  yTicks: 4,
  formatValue: undefined,
  formatCategory: undefined,
  legend: undefined,
  grid: true,
  tooltip: true,
  xLabels: 'auto',
  ariaLabel: undefined,
})

const emit = defineEmits<{
  hover: [index: number | null]
}>()

defineSlots<{
  tooltip?(props: ChartTooltipContext): unknown
}>()

const locale = useLocale()
const uid = useId()

const FALLBACK_WIDTH = 600
const FONT_PX = 11
const BAR_GAP = 2
const STACK_GAP = 2
const BAR_RADIUS = 4
const MAX_BAR = 48
const PALETTE_SIZE = 6

const TONES: Record<ChartTone, string> = {
  accent: 'var(--uid-accent)',
  info: 'var(--uid-info)',
  warning: 'var(--uid-warning)',
  danger: 'var(--uid-danger)',
  success: 'var(--uid-success)',
  neutral: 'var(--uid-chart-neutral)',
}

// ---------- data ----------

function clean(v: number | null | undefined): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

const n = computed(() => props.categories.length)

interface ResolvedSeries {
  def: ChartSeries
  index: number
  type: ChartSeriesType
  color: string
  values: (number | null)[]
}

const resolved = computed<ResolvedSeries[]>(() => {
  let slot = 0
  return props.series.map((def, index) => {
    let color: string
    if (def.color) color = def.color
    else if (def.tone) color = TONES[def.tone] ?? TONES.neutral
    else color = `var(--uid-chart-${(slot++ % PALETTE_SIZE) + 1})`
    return {
      def,
      index,
      type: def.type ?? 'line',
      color,
      values: props.categories.map((_, i) => clean(def.data[i])),
    }
  })
})

const isEmpty = computed(() => n.value === 0 || resolved.value.every(s => s.values.every(v => v === null)))

function stackKey(s: ResolvedSeries): string | null {
  if (!s.def.stack || (s.type !== 'bar' && s.type !== 'area')) return null
  return `${s.type}:${s.def.stack}`
}

/** Per series and category: [from, to] in data units (stacks included). */
const extents = computed<([number, number] | null)[][]>(() => {
  const pos = new Map<string, number[]>()
  const neg = new Map<string, number[]>()
  return resolved.value.map(s => {
    const key = stackKey(s)
    return s.values.map((v, i) => {
      if (v === null) return null
      if (!key) return [0, v] as [number, number]
      if (s.type === 'area') {
        // Areas stack on the signed running total.
        const acc = pos.get(key) ?? []
        const from = acc[i] ?? 0
        acc[i] = from + v
        pos.set(key, acc)
        return [from, from + v] as [number, number]
      }
      const bucket = v >= 0 ? pos : neg
      const acc = bucket.get(key) ?? []
      const from = acc[i] ?? 0
      acc[i] = from + v
      bucket.set(key, acc)
      return [from, from + v] as [number, number]
    })
  })
})

const dataRange = computed(() => {
  let lo = 0
  let hi = -Infinity
  for (const row of extents.value) {
    for (const e of row) {
      if (!e) continue
      lo = Math.min(lo, e[1])
      hi = Math.max(hi, e[1])
    }
  }
  for (const r of props.references) {
    if (r.axis === 'y' && Number.isFinite(r.value)) {
      lo = Math.min(lo, r.value)
      hi = Math.max(hi, r.value)
    }
  }
  if (hi === -Infinity) hi = 0
  return { lo, hi }
})

const yScaleInfo = computed(() => {
  const count = props.yTicks
  const auto = niceTicks(dataRange.value.lo, dataRange.value.hi, count)
  let min = typeof props.yMin === 'number' ? props.yMin : auto.min
  let max = typeof props.yMax === 'number' ? props.yMax : auto.max
  if (max <= min) max = min + 1
  if (typeof props.yMin !== 'number' && typeof props.yMax !== 'number') return { min, max, ticks: auto.ticks }
  const eps = (max - min) * 1e-9
  const ticks = niceTicks(min, max, count).ticks.filter(t => t >= min - eps && t <= max + eps)
  if (min > max) [min, max] = [max, min]
  return { min, max, ticks }
})

// ---------- formatting ----------

const numberFormat = computed(() => new Intl.NumberFormat(locale.value.code))

function formatNumber(v: number): string {
  return props.formatValue ? props.formatValue(v) : numberFormat.value.format(v)
}

function formatOrDash(v: number | null): string {
  return v === null ? '—' : formatNumber(v)
}

function categoryText(i: number): string {
  const c = props.categories[i] ?? ''
  return props.formatCategory ? props.formatCategory(c, i) : c
}

// ---------- layout ----------

const rootRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const measuredWidth = ref(0)

const width = computed(() => (measuredWidth.value > 0 ? measuredWidth.value : FALLBACK_WIDTH))

const tickLabels = computed(() => yScaleInfo.value.ticks.map(t => formatNumber(t)))

const hasTopLabels = computed(() => props.references.some(r => r.axis === 'x' && r.label))

const pad = computed(() => {
  const yAxis = Math.max(16, ...tickLabels.value.map(t => estimateTextWidth(t, FONT_PX))) + 8
  return {
    top: hasTopLabels.value ? 18 : 8,
    right: 8,
    bottom: props.xLabels === 'none' ? 4 : 22,
    left: Math.ceil(yAxis),
  }
})

const plot = computed(() => {
  const p = pad.value
  const w = Math.max(1, width.value - p.left - p.right)
  const h = Math.max(1, props.height - p.top - p.bottom)
  return { left: p.left, top: p.top, width: w, height: h, right: p.left + w, bottom: p.top + h }
})

const band = computed(() => plot.value.width / Math.max(1, n.value))

function xCenter(i: number): number {
  return plot.value.left + (i + 0.5) * band.value
}

function yPos(v: number): number {
  const { min, max } = yScaleInfo.value
  return plot.value.top + ((max - v) / (max - min)) * plot.value.height
}

const baseValue = computed(() => Math.min(yScaleInfo.value.max, Math.max(yScaleInfo.value.min, 0)))
const baseY = computed(() => yPos(baseValue.value))

function r2(v: number): number {
  return Math.round(v * 100) / 100
}

const gridLines = computed(() =>
  yScaleInfo.value.ticks.map((t, i) => ({ y: r2(yPos(t)), label: tickLabels.value[i] ?? '' })),
)

const xLabelItems = computed(() => {
  if (props.xLabels === 'none') return []
  const texts = props.categories.map((_, i) => categoryText(i))
  const widest = texts.reduce((m, t) => Math.max(m, estimateTextWidth(t, FONT_PX)), 0)
  const step = props.xLabels === 'all' ? 1 : Math.max(1, Math.ceil((widest + 8) / band.value))
  const items: { x: number; text: string; index: number }[] = []
  for (let i = 0; i < texts.length; i += step) {
    const text = texts[i] ?? ''
    const half = estimateTextWidth(text, FONT_PX) / 2
    const x = Math.min(width.value - half, Math.max(half, xCenter(i)))
    items.push({ x: r2(x), text, index: i })
  }
  return items
})

// ---------- marks ----------

interface BarMark {
  key: string
  series: number
  index: number
  d: string
  x: number
  y: number
  width: number
  height: number
  color: string
}

const bars = computed<BarMark[]>(() => {
  const barSeries = resolved.value.filter(s => s.type === 'bar')
  if (barSeries.length === 0) return []
  const groups: string[] = []
  const groupOf = new Map<number, number>()
  for (const s of barSeries) {
    const g = stackKey(s) ?? `solo:${s.index}`
    if (!groups.includes(g)) groups.push(g)
    groupOf.set(s.index, groups.indexOf(g))
  }
  const count = groups.length
  const inner = band.value * (n.value > 1 || count > 1 ? 0.8 : 0.6)
  const barW = Math.max(1, Math.min(MAX_BAR, (inner - BAR_GAP * (count - 1)) / count))
  const groupW = barW * count + BAR_GAP * (count - 1)

  // The data end of each stack per category: the outermost segment gets the rounding.
  const outer = new Map<string, number>()
  for (const s of barSeries) {
    s.values.forEach((v, i) => {
      if (v === null || v === 0) return
      outer.set(`${groupOf.get(s.index)}:${i}:${v > 0 ? '+' : '-'}`, s.index)
    })
  }

  const marks: BarMark[] = []
  for (const s of barSeries) {
    const g = groupOf.get(s.index) ?? 0
    const ext = extents.value[s.index] ?? []
    s.values.forEach((v, i) => {
      const e = ext[i]
      if (v === null || !e || v === 0) return
      const x = xCenter(i) - groupW / 2 + g * (barW + BAR_GAP)
      let from = yPos(e[0])
      const to = yPos(e[1])
      // A surface gap between stacked segments: trim the end touching the previous one.
      if (e[0] !== 0) from += to < from ? -STACK_GAP : STACK_GAP
      if ((to < from) !== (yPos(e[1]) < yPos(e[0]))) return
      const isOuter = outer.get(`${g}:${i}:${v > 0 ? '+' : '-'}`) === s.index
      marks.push({
        key: `${s.def.key}-${i}`,
        series: s.index,
        index: i,
        d: barPath(x, barW, from, to, isOuter ? BAR_RADIUS : 0),
        x: r2(x),
        y: r2(Math.min(from, to)),
        width: r2(barW),
        height: r2(Math.abs(from - to)),
        color: s.color,
      })
    })
  }
  return marks
})

interface LineMark {
  key: string
  series: number
  d: string
  area: string
  color: string
  dashed: boolean
  singles: ChartPoint[]
}

function topPoints(s: ResolvedSeries): (ChartPoint | null)[] {
  const ext = extents.value[s.index] ?? []
  return s.values.map((v, i) => {
    const e = ext[i]
    return v === null || !e ? null : { x: r2(xCenter(i)), y: r2(yPos(e[1])) }
  })
}

const lines = computed<LineMark[]>(() =>
  resolved.value
    .filter(s => s.type === 'line' || s.type === 'area')
    .map(s => {
      const top = topPoints(s)
      let area = ''
      if (s.type === 'area') {
        const ext = extents.value[s.index] ?? []
        const base = s.values.map((v, i) => {
          const e = ext[i]
          return v === null || !e ? null : { x: r2(xCenter(i)), y: r2(e[0] === 0 ? baseY.value : yPos(e[0])) }
        })
        area = areaPath(top, base)
      }
      return {
        key: s.def.key,
        series: s.index,
        d: linePath(top),
        area,
        color: s.color,
        dashed: !!s.def.dashed,
        singles: segments(top).filter(run => run.length === 1).map(run => run[0] as ChartPoint),
      }
    }),
)

const dots = computed(() =>
  resolved.value
    .filter(s => s.type === 'dots')
    .flatMap(s =>
      topPoints(s).flatMap((p, i) => (p ? [{ key: `${s.def.key}-${i}`, series: s.index, index: i, ...p, color: s.color }] : [])),
    ),
)

const referenceMarks = computed(() =>
  props.references
    .filter(r => Number.isFinite(r.value))
    .map((r, i) => {
      const color = r.color ?? (r.tone ? TONES[r.tone] : 'var(--uid-chart-reference)')
      if (r.axis === 'x') {
        const x = r2(plot.value.left + (r.value + 0.5) * band.value)
        const half = r.label ? estimateTextWidth(r.label, FONT_PX) / 2 : 0
        const lx = Math.min(width.value - half, Math.max(half, x))
        return { key: `x-${i}`, axis: 'x' as const, x1: x, x2: x, y1: plot.value.top, y2: plot.value.bottom, color, dashed: !!r.dashed, label: r.label, lx: r2(lx), ly: plot.value.top - 6, anchor: 'middle' }
      }
      const y = r2(yPos(r.value))
      return { key: `y-${i}`, axis: 'y' as const, x1: plot.value.left, x2: plot.value.right, y1: y, y2: y, color, dashed: !!r.dashed, label: r.label, lx: plot.value.right - 4, ly: y - 5, anchor: 'end' }
    }),
)

const hasBars = computed(() => resolved.value.some(s => s.type === 'bar'))

// ---------- legend ----------

const legendItems = computed(() => resolved.value.filter(s => s.def.legend !== false))

const legendPosition = computed<ChartLegendPosition | null>(() => {
  const l = props.legend
  if (l === false) return null
  if (l === 'top' || l === 'bottom') return l
  if (l === true) return 'bottom'
  return legendItems.value.length >= 2 ? 'bottom' : null
})

function keyShape(s: ResolvedSeries): 'line' | 'dot' | 'square' {
  if (s.type === 'line') return 'line'
  if (s.type === 'dots') return 'dot'
  return 'square'
}

// ---------- hover ----------

const activeIndex = ref<number | null>(null)
const tooltipFlip = ref(false)
const tooltipLeft = ref(0)

const activeContext = computed<ChartTooltipContext | null>(() => {
  const i = activeIndex.value
  if (i === null || isEmpty.value) return null
  return {
    index: i,
    category: props.categories[i] ?? '',
    items: resolved.value.map(s => {
      const value = s.values[i] ?? null
      return { series: s.def, value, formatted: formatOrDash(value), color: s.color }
    }),
  }
})

const activeX = computed(() => (activeIndex.value === null ? 0 : r2(xCenter(activeIndex.value))))

const activePoints = computed(() => {
  const i = activeIndex.value
  if (i === null) return []
  return resolved.value
    .filter(s => s.type === 'line' || s.type === 'area')
    .flatMap(s => {
      const e = extents.value[s.index]?.[i]
      return s.values[i] === null || !e ? [] : [{ key: s.def.key, x: activeX.value, y: r2(yPos(e[1])), color: s.color }]
    })
})

const liveText = computed(() => {
  const ctx = activeContext.value
  if (!ctx) return ''
  return `${categoryText(ctx.index)}: ${ctx.items.map(it => `${it.series.label} ${it.formatted}`).join(', ')}`
})

// Lines: beside the crosshair; bars: beside the highlighted band, so the tooltip never covers the hovered marks.
const tooltipOffset = computed(() => Math.round(hasBars.value ? band.value / 2 + 6 : 12))

async function placeTooltip(): Promise<void> {
  const x = activeX.value
  tooltipLeft.value = x
  tooltipFlip.value = false
  await nextTick()
  const tip = tooltipRef.value
  if (!tip) return
  const w = tip.offsetWidth
  const off = tooltipOffset.value
  if (x + off + w > width.value && x - off - w >= 0) tooltipFlip.value = true
}

watch(activeIndex, (i, prev) => {
  if (i !== prev) emit('hover', i)
  if (i !== null) void placeTooltip()
})

function indexAt(clientX: number): number | null {
  const el = rootRef.value?.querySelector<HTMLElement>('.uid-chart__plot')
  if (!el || n.value === 0) return null
  const rect = el.getBoundingClientRect()
  const scale = rect.width > 0 ? width.value / rect.width : 1
  const x = (clientX - rect.left) * scale
  if (x < plot.value.left || x > plot.value.right) return null
  return Math.max(0, Math.min(n.value - 1, Math.floor((x - plot.value.left) / band.value)))
}

function onPointerMove(e: PointerEvent | MouseEvent): void {
  if (isEmpty.value) return
  activeIndex.value = indexAt(e.clientX)
}

function onPointerLeave(): void {
  activeIndex.value = null
}

function onKeydown(e: KeyboardEvent): void {
  const last = n.value - 1
  if (last < 0 || isEmpty.value) return
  const cur = activeIndex.value
  const moves: Record<string, () => number | null> = {
    ArrowRight: () => (cur === null ? 0 : Math.min(last, cur + 1)),
    ArrowLeft: () => (cur === null ? last : Math.max(0, cur - 1)),
    Home: () => 0,
    End: () => last,
    Escape: () => null,
  }
  const move = moves[e.key]
  if (!move) return
  e.preventDefault()
  activeIndex.value = move()
}

function onBlur(): void {
  activeIndex.value = null
}

watch(n, count => {
  if (activeIndex.value !== null && activeIndex.value >= count) activeIndex.value = null
})

// ---------- accessibility ----------

const pointCount = computed(() => resolved.value.reduce((sum, s) => sum + s.values.filter(v => v !== null).length, 0))

const accessibleLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  if (isEmpty.value) return locale.value.chart.noData
  return locale.value.chart.summary(resolved.value.length, pointCount.value)
})

// ---------- sizing ----------

function measure(): void {
  const root = rootRef.value
  if (!root) return
  measuredWidth.value = Math.floor(root.getBoundingClientRect().width)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(rootRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

const clipId = `uid-chart-clip-${uid}`
const tooltipId = `uid-chart-tip-${uid}`
</script>

<template>
  <div
    ref="rootRef"
    class="uid-chart"
    role="figure"
    :aria-label="accessibleLabel"
  >
    <ul
      v-if="legendPosition === 'top' && !isEmpty"
      class="uid-chart__legend uid-chart__legend--top"
    >
      <li
        v-for="s in legendItems"
        :key="s.def.key"
        class="uid-chart__legend-item"
      >
        <span
          class="uid-chart__key"
          :class="[`uid-chart__key--${keyShape(s)}`, { 'uid-chart__key--dashed': s.def.dashed }]"
          :style="{ '--uid-chart-key-color': s.color }"
          aria-hidden="true"
        />
        {{ s.def.label }}
      </li>
    </ul>

    <div
      v-if="isEmpty"
      class="uid-chart__empty"
      :style="{ height: `${height}px` }"
    >
      {{ locale.chart.noData }}
    </div>

    <div
      v-else
      class="uid-chart__plot"
      :tabindex="0"
      role="group"
      :aria-label="accessibleLabel"
      :aria-describedby="activeContext && tooltip ? tooltipId : undefined"
      @pointermove="onPointerMove"
      @mousemove="onPointerMove"
      @pointerleave="onPointerLeave"
      @mouseleave="onPointerLeave"
      @keydown="onKeydown"
      @blur="onBlur"
    >
      <svg
        class="uid-chart__svg"
        :width="width"
        :height="height"
        :viewBox="`0 0 ${width} ${height}`"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath :id="clipId">
            <rect
              :x="plot.left"
              :y="plot.top - 6"
              :width="plot.width"
              :height="plot.height + 12"
            />
          </clipPath>
        </defs>

        <g
          v-if="grid"
          class="uid-chart__grid"
        >
          <line
            v-for="(g, i) in gridLines"
            :key="`g-${i}`"
            :x1="plot.left"
            :x2="plot.right"
            :y1="g.y"
            :y2="g.y"
          />
        </g>

        <g class="uid-chart__y-axis">
          <text
            v-for="(g, i) in gridLines"
            :key="`yl-${i}`"
            class="uid-chart__tick"
            :x="plot.left - 6"
            :y="g.y"
            text-anchor="end"
            dominant-baseline="middle"
          >{{ g.label }}</text>
        </g>

        <rect
          v-if="activeIndex !== null && hasBars"
          class="uid-chart__band"
          :x="plot.left + activeIndex * band"
          :y="plot.top"
          :width="band"
          :height="plot.height"
        />

        <g :clip-path="`url(#${clipId})`">
          <path
            v-for="b in bars"
            :key="b.key"
            class="uid-chart__bar"
            :d="b.d"
            :data-series="b.series"
            :data-index="b.index"
            :data-x="b.x"
            :data-y="b.y"
            :data-width="b.width"
            :data-height="b.height"
            :style="{ fill: b.color }"
          />

          <template
            v-for="l in lines"
            :key="`a-${l.key}`"
          >
            <path
              v-if="l.area"
              class="uid-chart__area"
              :d="l.area"
              :data-series="l.series"
              :style="{ fill: l.color }"
            />
          </template>
        </g>

        <line
          class="uid-chart__axis"
          :x1="plot.left"
          :x2="plot.right"
          :y1="r2(baseY)"
          :y2="r2(baseY)"
        />

        <g :clip-path="`url(#${clipId})`">
          <template
            v-for="l in lines"
            :key="`l-${l.key}`"
          >
            <path
              class="uid-chart__line"
              :class="{ 'uid-chart__line--dashed': l.dashed }"
              :d="l.d"
              :data-series="l.series"
              :stroke-dasharray="l.dashed ? '4 4' : undefined"
              :style="{ stroke: l.color }"
            />
            <circle
              v-for="(p, i) in l.singles"
              :key="`s-${l.key}-${i}`"
              class="uid-chart__single"
              :cx="p.x"
              :cy="p.y"
              r="2.5"
              :style="{ fill: l.color }"
            />
          </template>
        </g>

        <g
          v-for="r in referenceMarks"
          :key="r.key"
          class="uid-chart__reference"
          :data-axis="r.axis"
        >
          <line
            :x1="r.x1"
            :x2="r.x2"
            :y1="r.y1"
            :y2="r.y2"
            :stroke-dasharray="r.dashed ? '4 4' : undefined"
            :style="{ stroke: r.color }"
          />
          <text
            v-if="r.label"
            class="uid-chart__reference-label"
            :x="r.lx"
            :y="r.ly"
            :text-anchor="r.anchor"
          >{{ r.label }}</text>
        </g>

        <line
          v-if="activeIndex !== null && !hasBars"
          class="uid-chart__crosshair"
          :x1="activeX"
          :x2="activeX"
          :y1="plot.top"
          :y2="plot.bottom"
        />

        <g :clip-path="`url(#${clipId})`">
          <circle
            v-for="d in dots"
            :key="d.key"
            class="uid-chart__dot"
            :class="{ 'uid-chart__dot--active': d.index === activeIndex }"
            :data-series="d.series"
            :data-index="d.index"
            :cx="d.x"
            :cy="d.y"
            r="5"
            :style="{ fill: d.color }"
          />
          <circle
            v-for="p in activePoints"
            :key="`ap-${p.key}`"
            class="uid-chart__dot uid-chart__dot--active"
            :cx="p.x"
            :cy="p.y"
            r="5"
            :style="{ fill: p.color }"
          />
        </g>

        <g class="uid-chart__x-axis">
          <text
            v-for="t in xLabelItems"
            :key="`xl-${t.index}`"
            class="uid-chart__tick"
            :x="t.x"
            :y="plot.bottom + 15"
            text-anchor="middle"
          >{{ t.text }}</text>
        </g>
      </svg>

      <div
        v-if="tooltip && activeContext"
        :id="tooltipId"
        ref="tooltipRef"
        class="uid-chart__tooltip"
        :class="{ 'uid-chart__tooltip--flip': tooltipFlip }"
        role="tooltip"
        :style="{ left: `${tooltipLeft}px`, top: `${plot.top}px`, '--uid-chart-tip-offset': `${tooltipOffset}px` }"
      >
        <slot
          name="tooltip"
          v-bind="activeContext"
        >
          <div class="uid-chart__tooltip-title">
            {{ categoryText(activeContext.index) }}
          </div>
          <div
            v-for="(it, k) in activeContext.items"
            :key="it.series.key"
            class="uid-chart__tooltip-row"
          >
            <span
              class="uid-chart__key"
              :class="[`uid-chart__key--${resolved[k] ? keyShape(resolved[k]) : 'square'}`, { 'uid-chart__key--dashed': it.series.dashed }]"
              :style="{ '--uid-chart-key-color': it.color }"
              aria-hidden="true"
            />
            <span class="uid-chart__tooltip-label">{{ it.series.label }}</span>
            <span class="uid-chart__tooltip-value">{{ it.formatted }}</span>
          </div>
        </slot>
      </div>
    </div>

    <ul
      v-if="legendPosition === 'bottom' && !isEmpty"
      class="uid-chart__legend uid-chart__legend--bottom"
    >
      <li
        v-for="s in legendItems"
        :key="s.def.key"
        class="uid-chart__legend-item"
      >
        <span
          class="uid-chart__key"
          :class="[`uid-chart__key--${keyShape(s)}`, { 'uid-chart__key--dashed': s.def.dashed }]"
          :style="{ '--uid-chart-key-color': s.color }"
          aria-hidden="true"
        />
        {{ s.def.label }}
      </li>
    </ul>

    <div
      v-if="!isEmpty"
      class="uid-chart__sr"
    >
      <table class="uid-chart__table">
        <thead>
          <tr>
            <th scope="col">
              {{ locale.chart.category }}
            </th>
            <th
              v-for="s in resolved"
              :key="s.def.key"
              scope="col"
            >
              {{ s.def.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(_, i) in categories"
            :key="`row-${i}`"
          >
            <th scope="row">
              {{ categoryText(i) }}
            </th>
            <td
              v-for="s in resolved"
              :key="s.def.key"
            >
              {{ formatOrDash(s.values[i] ?? null) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <span
      class="uid-chart__live"
      aria-live="polite"
    >{{ liveText }}</span>
  </div>
</template>
