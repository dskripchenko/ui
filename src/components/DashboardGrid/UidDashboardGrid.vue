<script setup lang="ts">
import './UidDashboardGrid.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import {
  clampItem,
  layoutHeight,
  moveItem,
  resizeItem,
  sameLayout,
  sortByPosition,
  type DashboardGridItem,
} from './dashboardGridMath.js'

/** Attributes and listeners for the host's drag-handle element: `v-bind="handle"`. Empty when not editing. */
export interface DashboardGridHandleBindings {
  onPointerdown?: (event: PointerEvent) => void
  onKeydown?: (event: KeyboardEvent) => void
  tabindex?: number
  role?: 'button'
  'aria-roledescription'?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-keyshortcuts'?: string
  'data-uid-grid-handle'?: string
}

export interface DashboardGridItemSlotProps {
  item: DashboardGridItem
  /** The grid is editable and not stacked: the handle and the corner grip work. */
  editing: boolean
  /** This item is being dragged or resized by the pointer. */
  dragging: boolean
  handle: DashboardGridHandleBindings
}

export interface UidDashboardGridProps {
  items: DashboardGridItem[]
  /** Default 12. */
  columns?: number
  /** Height of one row in px. Default 80. */
  rowHeight?: number
  /** Gap between cells in px. Default 16. */
  gap?: number
  /** Items can be moved and resized. Default false. */
  editable?: boolean
  /** Container width in px under which items stack in one column; editing is off then. Default 640. */
  stackBelow?: number
  /** Accessible name of the grid. */
  label?: string
  /** An item's name in announcements and handle labels; default "Item 3" by reading order. */
  itemLabel?: (item: DashboardGridItem) => string
}

const props = withDefaults(defineProps<UidDashboardGridProps>(), {
  columns: 12,
  rowHeight: 80,
  gap: 16,
  editable: false,
  stackBelow: 640,
  label: undefined,
  itemLabel: undefined,
})

const emit = defineEmits<{
  'update:items': [items: DashboardGridItem[]]
  change: [items: DashboardGridItem[]]
}>()

defineSlots<{
  item(props: DashboardGridItemSlotProps): unknown
  placeholder?(props: { w: number; h: number }): unknown
}>()

const locale = useLocale()
const t = computed(() => locale.value.dashboardGrid)
const hintId = `uid-dashboard-grid-hint-${useId()}`

const FALLBACK_WIDTH = 960

// ---------- sizing ----------

const rootRef = ref<HTMLElement | null>(null)
const width = ref(0)

function measure(): void {
  if (rootRef.value) width.value = Math.floor(rootRef.value.getBoundingClientRect().width)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(rootRef.value)
  }
})

const stacked = computed(() => width.value > 0 && width.value < props.stackBelow)
const editing = computed(() => props.editable && !stacked.value)

/** One column plus a gap, and one row plus a gap, in px. */
function steps(): { col: number; row: number } {
  measure()
  const w = width.value || FALLBACK_WIDTH
  return { col: (w + props.gap) / props.columns, row: props.rowHeight + props.gap }
}

// ---------- layout ----------

const layout = computed(() => props.items.map(item => clampItem(item, props.columns)))

function labelOf(item: DashboardGridItem): string {
  if (props.itemLabel) return props.itemLabel(item)
  const index = sortByPosition(layout.value).findIndex(i => i.id === item.id)
  return t.value.item(index + 1)
}

// ---------- pointer drag and resize ----------

interface Gesture {
  id: DashboardGridItem['id']
  kind: 'move' | 'resize'
  start: DashboardGridItem
  startX: number
  startY: number
  dx: number
  dy: number
  preview: DashboardGridItem[]
}

const gesture = ref<Gesture | null>(null)

/** Positions shown: the preview of a gesture in progress, else the items as given. */
const shown = computed(() => gesture.value?.preview ?? layout.value)
const target = computed(() => (gesture.value ? shown.value.find(i => i.id === gesture.value?.id) ?? null : null))
const rows = computed(() => layoutHeight(shown.value))

function startGesture(kind: Gesture['kind'], item: DashboardGridItem, event: PointerEvent): void {
  if (!editing.value || gesture.value || (event.pointerType === 'mouse' && event.button !== 0)) return
  event.preventDefault()
  const el = event.currentTarget as HTMLElement | null
  try {
    if (event.pointerId !== undefined) el?.setPointerCapture?.(event.pointerId)
  } catch {
    // Capture is an optimisation; the window listeners below still follow the pointer.
  }
  const start = layout.value.find(i => i.id === item.id) ?? item
  gesture.value = { id: item.id, kind, start, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, preview: layout.value }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', cancelGesture)
  window.addEventListener('keydown', onEscape, true)
}

function onPointerMove(event: PointerEvent): void {
  const g = gesture.value
  if (!g) return
  const step = steps()
  const s = g.start
  g.dx = event.clientX - g.startX
  g.dy = event.clientY - g.startY
  if (g.kind === 'move') {
    const x = s.x + Math.round(g.dx / step.col)
    const y = s.y + Math.round(g.dy / step.row)
    g.preview = moveItem(layout.value, g.id, x, y, props.columns)
  } else {
    // Keep the live size within the item's limits, as the snapped one is.
    const min = clampItem({ ...s, w: 1, h: 1 }, props.columns)
    const maxW = Math.min(s.maxW ?? props.columns, props.columns - s.x)
    const maxH = s.maxH ?? Infinity
    g.dx = Math.min(Math.max(g.dx, (min.w - s.w) * step.col), (maxW - s.w) * step.col)
    g.dy = Math.min(Math.max(g.dy, (min.h - s.h) * step.row), (maxH - s.h) * step.row)
    g.preview = resizeItem(layout.value, g.id, s.w + Math.round(g.dx / step.col), s.h + Math.round(g.dy / step.row), props.columns)
  }
}

function endListeners(): void {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', cancelGesture)
  window.removeEventListener('keydown', onEscape, true)
}

function onPointerUp(): void {
  const g = gesture.value
  endListeners()
  gesture.value = null
  if (!g) return
  const item = g.preview.find(i => i.id === g.id)
  if (commit(g.preview) && item) announce(g.kind === 'move' ? movedText(item) : resizedText(item))
}

function cancelGesture(): void {
  const g = gesture.value
  endListeners()
  gesture.value = null
  if (g) announce(t.value.cancelled(labelOf(g.start)))
}

function onEscape(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  event.preventDefault()
  event.stopPropagation()
  cancelGesture()
}

onBeforeUnmount(() => {
  endListeners()
  resizeObserver?.disconnect()
  resizeObserver = null
})

// ---------- keyboard ----------

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

/** Moves one cell in a direction; when gravity undoes a one-row step down, steps further until the layout changes. */
function keyboardMove(item: DashboardGridItem, dx: number, dy: number): DashboardGridItem[] | null {
  const reach = dy === 0 ? 1 : layoutHeight(layout.value) + 1
  for (let n = 1; n <= reach; n++) {
    const next = moveItem(layout.value, item.id, item.x + dx * n, item.y + dy * n, props.columns)
    if (!sameLayout(next, layout.value)) return next
  }
  return null
}

function onKey(item: DashboardGridItem, event: KeyboardEvent, resize: boolean): void {
  const arrow = ARROWS[event.key]
  if (!arrow || event.altKey || event.ctrlKey || event.metaKey) return
  event.preventDefault()
  if (gesture.value) return
  const current = layout.value.find(i => i.id === item.id)
  if (!current) return
  const [dx, dy] = arrow
  const next = resize
    ? resizeItem(layout.value, item.id, current.w + dx, current.h + dy, props.columns)
    : keyboardMove(current, dx, dy)
  const moved = next?.find(i => i.id === item.id)
  if (!next || !moved || !commit(next)) return
  announce(resize ? resizedText(moved) : movedText(moved))
  const el = event.currentTarget as HTMLElement | null
  void nextTick(() => {
    if (el && document.activeElement !== el) (el.isConnected ? el : focusable(item, resize))?.focus()
  })
}

function focusable(item: DashboardGridItem, grip: boolean): HTMLElement | null {
  const selector = grip ? `[data-uid-grid-grip="${String(item.id)}"]` : `[data-uid-grid-handle="${String(item.id)}"]`
  return rootRef.value?.querySelector<HTMLElement>(selector) ?? null
}

// ---------- results ----------

function commit(next: DashboardGridItem[]): boolean {
  if (sameLayout(next, layout.value)) return false
  // Keep the host's own objects (and their extra fields), with new positions.
  const byId = new Map(next.map(i => [i.id, i]))
  const result = props.items.map((item) => {
    const n = byId.get(item.id)
    return n ? { ...item, x: n.x, y: n.y, w: n.w, h: n.h } : item
  })
  emit('update:items', result)
  emit('change', result)
  return true
}

const liveText = ref('')

function announce(text: string): void {
  liveText.value = text
}

function movedText(item: DashboardGridItem): string {
  return t.value.moved(labelOf(item), item.x + 1, item.y + 1)
}

function resizedText(item: DashboardGridItem): string {
  return t.value.resized(labelOf(item), item.w, item.h)
}

// ---------- rendering ----------

const KEYS = 'ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown'

function handleOf(item: DashboardGridItem): DashboardGridHandleBindings {
  if (!editing.value) return {}
  const at = shown.value.find(i => i.id === item.id) ?? item
  return {
    onPointerdown: (event: PointerEvent) => startGesture('move', item, event),
    onKeydown: (event: KeyboardEvent) => onKey(item, event, event.shiftKey),
    tabindex: 0,
    role: 'button',
    'aria-roledescription': t.value.handleRole,
    'aria-label': t.value.handle(labelOf(item), at.x + 1, at.y + 1, at.w, at.h),
    'aria-describedby': hintId,
    'aria-keyshortcuts': KEYS,
    'data-uid-grid-handle': String(item.id),
  }
}

function gripLabel(item: DashboardGridItem): string {
  const at = shown.value.find(i => i.id === item.id) ?? item
  return t.value.resize(labelOf(item), at.w, at.h)
}

/** Items in the order rendered: as given on the grid (moves keep their DOM nodes), by reading order when stacked. */
const rendered = computed(() => (stacked.value ? sortByPosition(layout.value) : layout.value))

function cellVars(item: DashboardGridItem): Record<string, string> {
  return {
    '--uid-dashboard-grid-x': String(item.x),
    '--uid-dashboard-grid-y': String(item.y),
    '--uid-dashboard-grid-w': String(item.w),
    '--uid-dashboard-grid-h': String(item.h),
  }
}

function itemStyle(item: DashboardGridItem): Record<string, string> {
  if (stacked.value) return { '--uid-dashboard-grid-h': String(item.h) }
  const g = gesture.value
  if (g && g.id === item.id) {
    const base = cellVars(g.start)
    if (g.kind === 'move') return { ...base, transform: `translate(${g.dx}px, ${g.dy}px)` }
    return { ...base, '--uid-dashboard-grid-dw': `${g.dx}px`, '--uid-dashboard-grid-dh': `${g.dy}px` }
  }
  return cellVars(shown.value.find(i => i.id === item.id) ?? item)
}

const rootStyle = computed(() => ({
  '--uid-dashboard-grid-columns': String(props.columns),
  '--uid-dashboard-grid-row': `${props.rowHeight}px`,
  '--uid-dashboard-grid-gap': `${props.gap}px`,
  '--uid-dashboard-grid-rows': String(rows.value),
}))
</script>

<template>
  <div
    ref="rootRef"
    class="uid-dashboard-grid"
    :class="{
      'uid-dashboard-grid--stacked': stacked,
      'uid-dashboard-grid--editing': editing,
      'uid-dashboard-grid--active': gesture !== null,
    }"
    role="group"
    :aria-label="label ?? t.label"
    :style="rootStyle"
  >
    <div
      v-if="target && !stacked"
      class="uid-dashboard-grid__placeholder"
      :style="cellVars(target)"
      aria-hidden="true"
    >
      <slot
        name="placeholder"
        :w="target.w"
        :h="target.h"
      >
        {{ t.dropHere(target.w, target.h) }}
      </slot>
    </div>

    <div
      v-for="item in rendered"
      :key="item.id"
      class="uid-dashboard-grid__item"
      :class="{
        'uid-dashboard-grid__item--dragging': gesture?.id === item.id,
        'uid-dashboard-grid__item--resizing': gesture?.id === item.id && gesture.kind === 'resize',
      }"
      :data-id="String(item.id)"
      :style="itemStyle(item)"
    >
      <slot
        name="item"
        :item="props.items.find(i => i.id === item.id) ?? item"
        :editing="editing"
        :dragging="gesture?.id === item.id"
        :handle="handleOf(item)"
      />
      <span
        v-if="editing"
        class="uid-dashboard-grid__grip"
        role="button"
        tabindex="0"
        :aria-label="gripLabel(item)"
        :aria-describedby="hintId"
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
        :data-uid-grid-grip="String(item.id)"
        @pointerdown="startGesture('resize', item, $event)"
        @keydown="onKey(item, $event, true)"
      />
    </div>

    <span
      :id="hintId"
      class="uid-dashboard-grid__sr"
    >{{ t.hint }}</span>
    <span
      class="uid-dashboard-grid__sr"
      aria-live="polite"
    >{{ liveText }}</span>
  </div>
</template>
