<script setup lang="ts">
import './UidHeatmap.css'
import { computed } from 'vue'
import { useLocale } from '../../composables/useLocale.js'

export interface HeatmapPoint {
  date: string
  value: number
}

export interface UidHeatmapProps {
  data: HeatmapPoint[]
  startDate?: string
  endDate?: string
  levels?: number
  color?: string
  emptyColor?: string
  cellSize?: number
  gap?: number
  showLegend?: boolean
  showWeekdays?: boolean
  showMonths?: boolean
  formatTooltip?: (point: HeatmapPoint | { date: string; value: 0 }) => string
  ariaLabel?: string
}

const props = withDefaults(defineProps<UidHeatmapProps>(), {
  levels: 5,
  cellSize: 12,
  gap: 3,
  showLegend: true,
  showWeekdays: true,
  showMonths: true,
})

const locale = useLocale()

function parseISO(s: string): Date {
  return new Date(`${s}T00:00:00`)
}

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeekMon(d: Date): Date {
  const day = d.getDay()
  const offset = (day + 6) % 7
  const start = new Date(d)
  start.setDate(d.getDate() - offset)
  return start
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(d.getDate() + n)
  return r
}

const today = new Date()

const endDate = computed(() => props.endDate ? parseISO(props.endDate) : today)
const startDate = computed(() => {
  if (props.startDate) return parseISO(props.startDate)
  const a = new Date(endDate.value)
  a.setFullYear(a.getFullYear() - 1)
  a.setDate(a.getDate() + 1)
  return a
})

const dataMap = computed(() => {
  const m = new Map<string, number>()
  for (const p of props.data) m.set(p.date, p.value)
  return m
})

const maxValue = computed(() => {
  let max = 0
  for (const p of props.data) {
    if (p.value > max) max = p.value
  }
  return max
})

function levelFor(value: number): number {
  if (value <= 0 || maxValue.value === 0) return 0
  const ratio = value / maxValue.value
  return Math.min(props.levels, Math.max(1, Math.ceil(ratio * props.levels)))
}

function colorForLevel(level: number): string {
  if (level === 0) return `var(--uid-heatmap-empty)`
  const opacity = 0.2 + (0.8 * (level - 1)) / Math.max(1, props.levels - 1)
  return `color-mix(in srgb, var(--uid-heatmap-color) ${(opacity * 100).toFixed(0)}%, transparent)`
}

interface Cell {
  date: string
  value: number
  level: number
  x: number
  y: number
}

const grid = computed<{ cells: Cell[]; weeks: number; monthLabels: { x: number; label: string }[] }>(() => {
  const start = startOfWeekMon(startDate.value)
  const end = endDate.value
  const cells: Cell[] = []
  const monthLabels: { x: number; label: string }[] = []
  let lastMonth = -1
  let week = 0
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const iso = toISO(d)
    const value = dataMap.value.get(iso) ?? 0
    const dayOfWeek = (d.getDay() + 6) % 7
    if (dayOfWeek === 0) week = Math.floor((d.getTime() - start.getTime()) / (7 * 86400000))
    if (dayOfWeek === 0 && d.getMonth() !== lastMonth && d >= startDate.value) {
      monthLabels.push({
        x: week * (props.cellSize + props.gap),
        label: locale.value.datePicker.months[d.getMonth()].slice(0, 3),
      })
      lastMonth = d.getMonth()
    }
    if (d < startDate.value) continue
    cells.push({
      date: iso,
      value,
      level: levelFor(value),
      x: week * (props.cellSize + props.gap),
      y: dayOfWeek * (props.cellSize + props.gap),
    })
  }
  const weeksCount = cells.length === 0
    ? 0
    : Math.ceil((cells[cells.length - 1].x + props.cellSize) / (props.cellSize + props.gap))
  return { cells, weeks: weeksCount, monthLabels }
})

const totalWidth = computed(() => grid.value.weeks * (props.cellSize + props.gap))
const totalHeight = computed(() => 7 * (props.cellSize + props.gap))

const styleVars = computed(() => ({
  ...(props.color ? { '--uid-heatmap-color': props.color } : {}),
  ...(props.emptyColor ? { '--uid-heatmap-empty': props.emptyColor } : {}),
  '--uid-heatmap-cell': `${props.cellSize}px`,
  '--uid-heatmap-gap': `${props.gap}px`,
}))

const legendLevels = computed(() => Array.from({ length: props.levels + 1 }, (_, i) => i))

function tooltipFor(cell: Cell): string {
  const point = { date: cell.date, value: cell.value }
  if (props.formatTooltip) return props.formatTooltip(point)
  return `${cell.date}: ${cell.value}`
}

const totalContributions = computed(() => {
  let sum = 0
  for (const p of props.data) sum += p.value
  return sum
})

const accessibleLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  return `Тепловая карта активности: ${totalContributions.value} событий`
})
</script>

<template>
  <div
    class="uid-heatmap"
    :style="styleVars"
    role="img"
    :aria-label="accessibleLabel"
  >
    <div class="uid-heatmap__chart">
      <div
        v-if="showWeekdays"
        class="uid-heatmap__weekdays"
        aria-hidden="true"
      >
        <span
          v-for="(wd, i) in locale.datePicker.weekdaysShort"
          :key="wd"
          class="uid-heatmap__weekday"
          :class="{ 'uid-heatmap__weekday--visible': i === 0 || i === 2 || i === 4 }"
        >
          {{ wd }}
        </span>
      </div>

      <div class="uid-heatmap__grid-wrapper">
        <div
          v-if="showMonths"
          class="uid-heatmap__months"
          :style="{ width: `${totalWidth}px` }"
          aria-hidden="true"
        >
          <span
            v-for="(m, i) in grid.monthLabels"
            :key="i"
            class="uid-heatmap__month"
            :style="{ left: `${m.x}px` }"
          >{{ m.label }}</span>
        </div>

        <svg
          class="uid-heatmap__svg"
          :width="totalWidth"
          :height="totalHeight"
          :viewBox="`0 0 ${totalWidth} ${totalHeight}`"
          aria-hidden="true"
        >
          <rect
            v-for="cell in grid.cells"
            :key="cell.date"
            class="uid-heatmap__cell"
            :x="cell.x"
            :y="cell.y"
            :width="cellSize"
            :height="cellSize"
            :fill="colorForLevel(cell.level)"
          >
            <title>{{ tooltipFor(cell) }}</title>
          </rect>
        </svg>
      </div>
    </div>

    <div
      v-if="showLegend"
      class="uid-heatmap__legend"
    >
      <span>Меньше</span>
      <span
        v-for="level in legendLevels"
        :key="level"
        class="uid-heatmap__legend-cell"
        :style="level === 0 ? undefined : { background: colorForLevel(level) }"
      />
      <span>Больше</span>
    </div>
  </div>
</template>
