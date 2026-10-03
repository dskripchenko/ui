<script setup lang="ts">
import './UidHeatmapMatrix.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import {
  heatmapColorAt,
  heatmapGradient,
  resolveHeatmapStops,
  type HeatmapColorScaleName,
} from './colorScales.js'

export interface HeatmapMatrixCell {
  row: string
  col: string
  rowIndex: number
  colIndex: number
  value: number | null
}

export type HeatmapMatrixColLabels = 'auto' | 'horizontal' | 'rotated'

export interface UidHeatmapMatrixProps {
  rows: string[]
  cols: string[]
  values: ReadonlyArray<ReadonlyArray<number | null | undefined>>
  colorScale?: HeatmapColorScaleName | (string & {}) | string[]
  min?: number
  max?: number
  formatValue?: (value: number) => string
  cellHeight?: number
  minCellWidth?: number
  gap?: number
  colLabels?: HeatmapMatrixColLabels
  showLegend?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<UidHeatmapMatrixProps>(), {
  colorScale: 'default',
  min: undefined,
  max: undefined,
  formatValue: undefined,
  cellHeight: 20,
  minCellWidth: 10,
  gap: 2,
  colLabels: 'auto',
  showLegend: true,
  ariaLabel: undefined,
})

defineSlots<{
  tooltip?(props: { cell: HeatmapMatrixCell; formatted: string }): unknown
}>()

const locale = useLocale()

const LABEL_FONT_PX = 11
const LABEL_MAX_PX = 96
const ROTATED_STEP_PX = 18
const SIN45 = Math.SQRT1_2

const rootRef = ref<HTMLElement | null>(null)
const rowHeaderRef = ref<HTMLElement[]>([])
const tooltipRef = ref<HTMLElement | null>(null)
const rootWidth = ref(0)
const rowLabelWidth = ref(0)

function valueAt(r: number, c: number): number | null {
  const v = props.values[r]?.[c]
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

const matrix = computed<(number | null)[][]>(() =>
  props.rows.map((_, r) => props.cols.map((__, c) => valueAt(r, c))),
)

const domain = computed(() => {
  let lo = Infinity
  let hi = -Infinity
  for (const row of matrix.value) {
    for (const v of row) {
      if (v === null) continue
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
  }
  if (lo === Infinity) {
    lo = 0
    hi = 0
  }
  return {
    min: typeof props.min === 'number' ? props.min : lo,
    max: typeof props.max === 'number' ? props.max : hi,
  }
})

const hasNull = computed(() => matrix.value.some(row => row.some(v => v === null)))

const stops = computed(() => resolveHeatmapStops(props.colorScale))

function ratio(v: number): number {
  const { min, max } = domain.value
  if (max <= min) return v > min ? 1 : 0
  return (v - min) / (max - min)
}

function colorFor(v: number | null): string | undefined {
  if (v === null) return undefined
  return heatmapColorAt(stops.value, ratio(v))
}

function format(v: number): string {
  if (props.formatValue) return props.formatValue(v)
  return new Intl.NumberFormat(locale.value.code).format(v)
}

function formatted(v: number | null): string {
  return v === null ? locale.value.heatmap.noData : format(v)
}

function cellAt(r: number, c: number): HeatmapMatrixCell {
  return {
    row: props.rows[r] ?? '',
    col: props.cols[c] ?? '',
    rowIndex: r,
    colIndex: c,
    value: matrix.value[r]?.[c] ?? null,
  }
}

function cellText(r: number, c: number): string {
  const cell = cellAt(r, c)
  return `${cell.row} × ${cell.col}: ${formatted(cell.value)}`
}

function estimateWidth(text: string): number {
  return Math.min(LABEL_MAX_PX, text.length * LABEL_FONT_PX * 0.6)
}

const maxColLabelWidth = computed(() => props.cols.reduce((m, c) => Math.max(m, estimateWidth(c)), 0))

const labelLayout = computed<{ mode: 'horizontal' | 'rotated'; step: number; reserve: number }>(() => {
  const n = props.cols.length
  const width = rootWidth.value
  const fixed = props.colLabels
  if (n === 0 || width <= 0) return { mode: fixed === 'rotated' ? 'rotated' : 'horizontal', step: 1, reserve: 0 }
  const available = width - 4 - rowLabelWidth.value - props.gap * n
  const cellH = Math.max(props.minCellWidth, available / n)
  const labelW = maxColLabelWidth.value
  const stepH = Math.max(1, Math.ceil((labelW + 6) / cellH))
  const extent = (labelW + LABEL_FONT_PX) * SIN45
  const cellR = Math.max(props.minCellWidth, (available - extent) / Math.max(0.5, n - 0.5))
  const reserve = Math.max(0, Math.ceil(extent - cellR / 2))
  const stepR = Math.max(1, Math.ceil(ROTATED_STEP_PX / cellR))
  if (fixed === 'horizontal') return { mode: 'horizontal', step: stepH, reserve: 0 }
  if (fixed === 'rotated') return { mode: 'rotated', step: stepR, reserve }
  if (stepH === 1 || stepR >= stepH) return { mode: 'horizontal', step: stepH, reserve: 0 }
  return { mode: 'rotated', step: stepR, reserve }
})

function colLabelVisible(c: number): boolean {
  return c % labelLayout.value.step === 0
}

const headerHeight = computed(() => {
  if (labelLayout.value.mode === 'horizontal') return 18
  return Math.ceil((maxColLabelWidth.value + 14) * SIN45) + 6
})

const styleVars = computed(() => ({
  '--uid-heatmap-matrix-cols': String(props.cols.length),
  '--uid-heatmap-matrix-cell-height': `${props.cellHeight}px`,
  '--uid-heatmap-matrix-min-cell': `${props.minCellWidth}px`,
  '--uid-heatmap-matrix-gap': `${props.gap}px`,
  '--uid-heatmap-matrix-header-height': `${headerHeight.value}px`,
}))

const gridStyle = computed(() =>
  labelLayout.value.reserve > 0 ? { paddingInlineEnd: `${labelLayout.value.reserve}px` } : undefined,
)

const legendGradient = computed(() => heatmapGradient(stops.value))

const accessibleLabel = computed(() =>
  props.ariaLabel ?? locale.value.heatmap.matrixSummary(props.rows.length, props.cols.length),
)

const focusPos = ref<{ r: number; c: number }>({ r: 0, c: 0 })
const hoverPos = ref<{ r: number; c: number } | null>(null)
const focusInside = ref(false)

const activePos = computed(() => hoverPos.value ?? (focusInside.value ? focusPos.value : null))
const activeCell = computed(() => (activePos.value ? cellAt(activePos.value.r, activePos.value.c) : null))
const tooltipStyle = ref<Record<string, string>>({})

async function placeTooltip(): Promise<void> {
  const pos = activePos.value
  const root = rootRef.value
  if (!pos || !root) return
  const cell = root.querySelector<HTMLElement>(`[data-r="${pos.r}"][data-c="${pos.c}"]`)
  if (!cell) return
  const rootRect = root.getBoundingClientRect()
  const rect = cell.getBoundingClientRect()
  const cx = rect.left - rootRect.left + rect.width / 2
  const top = rect.top - rootRect.top
  tooltipStyle.value = { left: `${cx}px`, top: `${top}px` }
  await nextTick()
  const tip = tooltipRef.value
  if (!tip) return
  const half = tip.offsetWidth / 2
  const maxLeft = rootRect.width - half
  const left = Math.max(half, Math.min(maxLeft, cx))
  if (maxLeft >= half && left !== cx) tooltipStyle.value = { left: `${left}px`, top: `${top}px` }
}

watch(activePos, () => { void placeTooltip() })

function onEnter(r: number, c: number): void {
  hoverPos.value = { r, c }
}

function onLeaveGrid(): void {
  hoverPos.value = null
}

function onFocus(r: number, c: number): void {
  focusPos.value = { r, c }
  focusInside.value = true
}

function onBlur(e: FocusEvent): void {
  const next = e.relatedTarget as Node | null
  if (!next || !rootRef.value?.contains(next)) focusInside.value = false
}

function focusCell(r: number, c: number): void {
  const rows = props.rows.length
  const cols = props.cols.length
  if (rows === 0 || cols === 0) return
  const nr = Math.max(0, Math.min(rows - 1, r))
  const nc = Math.max(0, Math.min(cols - 1, c))
  focusPos.value = { r: nr, c: nc }
  hoverPos.value = null
  void nextTick(() => {
    rootRef.value?.querySelector<HTMLElement>(`[data-r="${nr}"][data-c="${nc}"]`)?.focus()
  })
}

function onKeydown(e: KeyboardEvent): void {
  const { r, c } = focusPos.value
  const last = { r: props.rows.length - 1, c: props.cols.length - 1 }
  const moves: Record<string, () => void> = {
    ArrowRight: () => focusCell(r, c + 1),
    ArrowLeft: () => focusCell(r, c - 1),
    ArrowDown: () => focusCell(r + 1, c),
    ArrowUp: () => focusCell(r - 1, c),
    Home: () => (e.ctrlKey ? focusCell(0, 0) : focusCell(r, 0)),
    End: () => (e.ctrlKey ? focusCell(last.r, last.c) : focusCell(r, last.c)),
    PageUp: () => focusCell(0, c),
    PageDown: () => focusCell(last.r, c),
    Escape: () => { hoverPos.value = null; focusInside.value = false },
  }
  const move = moves[e.key]
  if (!move) return
  e.preventDefault()
  move()
}

watch(
  () => [props.rows.length, props.cols.length],
  ([rows, cols]) => {
    const { r, c } = focusPos.value
    if (r >= rows || c >= cols) focusPos.value = { r: 0, c: 0 }
  },
)

function measure(): void {
  const root = rootRef.value
  if (!root) return
  rootWidth.value = root.getBoundingClientRect().width
  rowLabelWidth.value = rowHeaderRef.value.reduce((m, el) => Math.max(m, el.getBoundingClientRect().width), 0)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(rootRef.value)
  }
})

watch(() => props.rows, () => { void nextTick(measure) })

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div
    ref="rootRef"
    class="uid-heatmap-matrix"
    :class="`uid-heatmap-matrix--labels-${labelLayout.mode}`"
    :style="styleVars"
  >
    <div class="uid-heatmap-matrix__scroll">
      <div
        class="uid-heatmap-matrix__grid"
        role="grid"
        :style="gridStyle"
        :aria-label="accessibleLabel"
        :aria-rowcount="rows.length + 1"
        :aria-colcount="cols.length + 1"
        @mouseleave="onLeaveGrid"
        @keydown="onKeydown"
      >
        <div
          class="uid-heatmap-matrix__row uid-heatmap-matrix__row--head"
          role="row"
          aria-rowindex="1"
        >
          <div
            class="uid-heatmap-matrix__corner"
            role="columnheader"
            aria-colindex="1"
          />
          <div
            v-for="(col, c) in cols"
            :key="`h-${c}`"
            class="uid-heatmap-matrix__col-header"
            role="columnheader"
            :aria-colindex="c + 2"
            :aria-label="col"
          >
            <span
              class="uid-heatmap-matrix__col-label"
              :class="{ 'uid-heatmap-matrix__col-label--hidden': !colLabelVisible(c) }"
              :title="col"
              aria-hidden="true"
            >{{ col }}</span>
          </div>
        </div>

        <div
          v-for="(row, r) in rows"
          :key="`r-${r}`"
          class="uid-heatmap-matrix__row"
          role="row"
          :aria-rowindex="r + 2"
        >
          <div
            ref="rowHeaderRef"
            class="uid-heatmap-matrix__row-header"
            role="rowheader"
            aria-colindex="1"
            :title="row"
          >
            {{ row }}
          </div>
          <div
            v-for="(col, c) in cols"
            :key="`c-${r}-${c}`"
            class="uid-heatmap-matrix__cell"
            :class="{
              'uid-heatmap-matrix__cell--empty': matrix[r][c] === null,
              'uid-heatmap-matrix__cell--active': activePos && activePos.r === r && activePos.c === c,
            }"
            role="gridcell"
            :aria-colindex="c + 2"
            :aria-label="cellText(r, c)"
            :tabindex="focusPos.r === r && focusPos.c === c ? 0 : -1"
            :data-r="r"
            :data-c="c"
            :style="matrix[r][c] === null ? undefined : { background: colorFor(matrix[r][c]) }"
            @mouseenter="onEnter(r, c)"
            @focus="onFocus(r, c)"
            @blur="onBlur"
          />
        </div>
      </div>
    </div>

    <div
      v-if="activeCell"
      ref="tooltipRef"
      class="uid-heatmap-matrix__tooltip"
      role="tooltip"
      :style="tooltipStyle"
    >
      <slot
        name="tooltip"
        :cell="activeCell"
        :formatted="formatted(activeCell.value)"
      >
        <span class="uid-heatmap-matrix__tooltip-label">{{ activeCell.row }} × {{ activeCell.col }}</span>
        <strong class="uid-heatmap-matrix__tooltip-value">{{ formatted(activeCell.value) }}</strong>
      </slot>
    </div>

    <div
      v-if="showLegend && rows.length > 0 && cols.length > 0"
      class="uid-heatmap-matrix__legend"
      aria-hidden="true"
    >
      <span class="uid-heatmap-matrix__legend-value">{{ format(domain.min) }}</span>
      <span
        class="uid-heatmap-matrix__legend-bar"
        :style="{ background: legendGradient }"
      />
      <span class="uid-heatmap-matrix__legend-value">{{ format(domain.max) }}</span>
      <span
        v-if="hasNull"
        class="uid-heatmap-matrix__legend-empty"
      >
        <span class="uid-heatmap-matrix__legend-swatch" />
        {{ locale.heatmap.noData }}
      </span>
    </div>
  </div>
</template>
