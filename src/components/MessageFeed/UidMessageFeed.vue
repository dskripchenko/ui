<script setup lang="ts" generic="T">
import './UidMessageFeed.css'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLocale } from '../../composables/useLocale.js'

export type UidMessageFeedKey = string | number

export interface UidMessageFeedProps<T> {
  /** The messages, oldest first. */
  items: T[]
  /** A stable key of a message. */
  itemKey: (item: T) => UidMessageFeedKey
  /** When a message was written; day dividers follow it. Without it there are no dividers. */
  itemDate?: (item: T) => Date | string | number | null | undefined
  /** Whether a message continues the previous one's group (same author, close in time). */
  continues?: (previous: T, item: T) => boolean
  /** Key of the first new message; the "new" divider goes before it. */
  newMarker?: UidMessageFeedKey | null
  /** Height assumed for a message not yet measured, in px. */
  estimatedItemHeight?: number
  /** How far beyond the viewport messages are rendered, in px. */
  overscan?: number
  /** There are older messages to load. */
  hasMoreBefore?: boolean
  /** There are newer messages to load (the feed was opened in the middle). */
  hasMoreAfter?: boolean
  loadingBefore?: boolean
  loadingAfter?: boolean
  /** Keeps the newest message in view while the reader is at the bottom. */
  followOutput?: boolean
  /** Distance from an edge, in px, at which more messages are asked for. */
  loadThreshold?: number
  /** Text of a day divider; "Today", "Yesterday" or the date by default. */
  dayLabel?: (date: Date) => string
  /** Text of the "new" divider; the locale's by default. */
  newLabel?: string
  /** Accessible name of the feed. */
  label?: string
}

const props = withDefaults(defineProps<UidMessageFeedProps<T>>(), {
  itemDate: undefined,
  continues: undefined,
  newMarker: null,
  estimatedItemHeight: 56,
  overscan: 600,
  hasMoreBefore: false,
  hasMoreAfter: false,
  loadingBefore: false,
  loadingAfter: false,
  followOutput: true,
  loadThreshold: 400,
  dayLabel: undefined,
  newLabel: undefined,
  label: undefined,
})

const emit = defineEmits<{
  /** The reader came near the top while older messages exist. */
  loadBefore: []
  /** The reader came near the bottom while newer messages exist. */
  loadAfter: []
  /** The reader reached or left the bottom. */
  atBottom: [value: boolean]
  /** Messages now in view, first and last. */
  visible: [range: { first: UidMessageFeedKey; last: UidMessageFeedKey } | null]
}>()

defineSlots<{
  item(props: { item: T; index: number; grouped: boolean }): unknown
  day?(props: { date: Date; label: string }): unknown
  new?(props: { label: string }): unknown
  before?(): unknown
  after?(): unknown
  empty?(): unknown
}>()

const locale = useLocale()

type Row =
  | { kind: 'day'; key: string; date: Date }
  | { kind: 'new'; key: string }
  | { kind: 'item'; key: string; item: T; index: number; grouped: boolean; id: UidMessageFeedKey }

const DIVIDER_HEIGHT = 36
const BOTTOM_SLACK = 8

function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

const rows = computed<Row[]>(() => {
  const out: Row[] = []
  let lastDay: string | null = null
  let previous: T | null = null
  props.items.forEach((item, index) => {
    const id = props.itemKey(item)
    let broken = previous === null
    const date = props.itemDate ? toDate(props.itemDate(item)) : null
    if (date !== null) {
      const day = dayKey(date)
      if (day !== lastDay) {
        out.push({ kind: 'day', key: `d:${day}`, date })
        lastDay = day
        broken = true
      }
    }
    if (props.newMarker !== null && props.newMarker !== undefined && id === props.newMarker && index > 0) {
      out.push({ kind: 'new', key: 'n' })
      broken = true
    }
    const grouped = !broken && previous !== null && props.continues !== undefined && props.continues(previous, item)
    out.push({ kind: 'item', key: `i:${String(id)}`, item, index, grouped, id })
    previous = item
  })
  return out
})

const rowIndex = computed(() => {
  const map = new Map<string, number>()
  rows.value.forEach((row, i) => map.set(row.key, i))
  return map
})

// Measured heights live outside reactivity; a counter tells the layout they changed.
const heights = new Map<string, number>()
const measured = ref(0)

function estimate(row: Row): number {
  return row.kind === 'item' ? props.estimatedItemHeight : DIVIDER_HEIGHT
}

const layout = computed(() => {
  void measured.value
  const list = rows.value
  const tops = new Float64Array(list.length + 1)
  for (let i = 0; i < list.length; i++) {
    tops[i + 1] = tops[i] + (heights.get(list[i].key) ?? estimate(list[i]))
  }
  return tops
})

const total = computed(() => layout.value[rows.value.length])

const rootRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const viewport = ref(0)

// Short feeds sit at the bottom, next to the composer.
const lead = computed(() => Math.max(0, viewport.value - total.value))

/** The first row whose bottom is below `y` (content coordinates). */
function rowAt(y: number): number {
  const tops = layout.value
  let lo = 0
  let hi = rows.value.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (tops[mid + 1] <= y) lo = mid + 1
    else hi = mid
  }
  return Math.max(0, lo)
}

const range = computed(() => {
  if (rows.value.length === 0) return { start: 0, end: -1 }
  const from = scrollTop.value - lead.value - props.overscan
  const to = scrollTop.value - lead.value + viewport.value + props.overscan
  return { start: rowAt(Math.max(0, from)), end: rowAt(Math.max(0, to)) }
})

const visibleRows = computed(() => rows.value.slice(range.value.start, range.value.end + 1))
const offset = computed(() => lead.value + layout.value[range.value.start])

// Where the reader is: glued to the bottom, or holding a row at a distance from the viewport top.
const stuck = ref(true)
let anchor: { key: string; delta: number } | null = null
let lastVisible = ''

function captureAnchor(): void {
  if (rows.value.length === 0) {
    anchor = null
    return
  }
  const y = scrollTop.value - lead.value
  const i = rowAt(Math.max(0, y))
  anchor = { key: rows.value[i].key, delta: lead.value + layout.value[i] - scrollTop.value }
}

function distanceToBottom(el: HTMLElement): number {
  return el.scrollHeight - el.scrollTop - el.clientHeight
}

function setStuck(value: boolean): void {
  if (stuck.value !== value) {
    stuck.value = value
    emit('atBottom', value)
  }
}

function reportVisible(): void {
  const el = rootRef.value
  if (!el) return
  let first: UidMessageFeedKey | null = null
  let last: UidMessageFeedKey | null = null
  const top = el.scrollTop - lead.value
  const bottom = top + el.clientHeight
  const tops = layout.value
  for (let i = rowAt(Math.max(0, top)); i < rows.value.length && tops[i] < bottom; i++) {
    const row = rows.value[i]
    if (row.kind !== 'item') continue
    first ??= row.id
    last = row.id
  }
  const signature = first === null ? '' : `${String(first)}|${String(last)}`
  if (signature === lastVisible) return
  lastVisible = signature
  emit('visible', first === null || last === null ? null : { first, last })
}

function askForMore(): void {
  const el = rootRef.value
  if (!el) return
  if (props.hasMoreBefore && !props.loadingBefore && el.scrollTop < props.loadThreshold) emit('loadBefore')
  if (props.hasMoreAfter && !props.loadingAfter && distanceToBottom(el) < props.loadThreshold) emit('loadAfter')
}

/** Puts the reader back where they were after the content moved under them. */
function settle(): void {
  const el = rootRef.value
  if (!el) return
  if (stuck.value && props.followOutput && !props.hasMoreAfter) {
    el.scrollTop = el.scrollHeight
  } else if (anchor !== null) {
    const i = rowIndex.value.get(anchor.key)
    if (i !== undefined) el.scrollTop = lead.value + layout.value[i] - anchor.delta
  }
  scrollTop.value = el.scrollTop
  captureAnchor()
  reportVisible()
  askForMore()
}

function onScroll(): void {
  const el = rootRef.value
  if (!el) return
  scrollTop.value = el.scrollTop
  setStuck(distanceToBottom(el) <= BOTTOM_SLACK)
  captureAnchor()
  reportVisible()
  askForMore()
}

// Rows report their size; a change above the reader is absorbed by settle().
const rowObserver = typeof ResizeObserver === 'undefined'
  ? null
  : new ResizeObserver((entries) => {
    let changed = false
    for (const entry of entries) {
      const key = (entry.target as HTMLElement).dataset.key
      if (key === undefined) continue
      const size = entry.borderBoxSize?.[0]?.blockSize ?? (entry.target as HTMLElement).getBoundingClientRect().height
      if (size > 0 && heights.get(key) !== size) {
        heights.set(key, size)
        changed = true
      }
    }
    if (changed) measured.value++
  })

const viewportObserver = typeof ResizeObserver === 'undefined'
  ? null
  : new ResizeObserver(() => {
    if (rootRef.value) viewport.value = rootRef.value.clientHeight
  })

const observed = new Map<string, HTMLElement>()

function bindRow(key: string, el: unknown): void {
  const previous = observed.get(key)
  if (el instanceof HTMLElement) {
    if (previous === el) return
    if (previous) rowObserver?.unobserve(previous)
    observed.set(key, el)
    rowObserver?.observe(el)
  } else if (previous) {
    rowObserver?.unobserve(previous)
    observed.delete(key)
  }
}

// Messages that left the feed take their measurements with them.
watch(rows, (list) => {
  if (heights.size <= list.length * 2) return
  const keep = new Set(list.map(row => row.key))
  for (const key of heights.keys()) if (!keep.has(key)) heights.delete(key)
})

watch([rows, measured, viewport], settle, { flush: 'post' })

onMounted(() => {
  const el = rootRef.value
  if (!el) return
  viewport.value = el.clientHeight
  viewportObserver?.observe(el)
  settle()
})

onBeforeUnmount(() => {
  rowObserver?.disconnect()
  viewportObserver?.disconnect()
})

const atBottom = computed(() => stuck.value)

/** Scrolls to the newest message and keeps following new ones. */
function scrollToBottom(): void {
  anchor = null
  setStuck(true)
  settle()
}

/** Scrolls so the message is in view: at the top (with a margin) or in the middle. */
function scrollToKey(key: UidMessageFeedKey, align: 'start' | 'center' = 'start'): boolean {
  const el = rootRef.value
  const i = rowIndex.value.get(`i:${String(key)}`)
  if (!el || i === undefined) return false
  const row = rows.value[i]
  const height = heights.get(row.key) ?? estimate(row)
  const margin = align === 'center' ? Math.max(0, (el.clientHeight - height) / 2) : DIVIDER_HEIGHT
  anchor = { key: row.key, delta: margin }
  setStuck(false)
  settle()
  return true
}

defineExpose({ scrollToBottom, scrollToKey, atBottom })

const newText = computed(() => props.newLabel ?? locale.value.messageFeed.newMessages)

function formatDay(date: Date): string {
  if (props.dayLabel) return props.dayLabel(date)
  const today = new Date()
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  if (dayKey(date) === dayKey(today)) return locale.value.messageFeed.today
  if (dayKey(date) === dayKey(yesterday)) return locale.value.messageFeed.yesterday
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', weekday: 'long' }
  if (date.getFullYear() !== today.getFullYear()) options.year = 'numeric'
  return new Intl.DateTimeFormat(locale.value.code ?? 'en-US', options).format(date)
}

const isEmpty = computed(() => props.items.length === 0)
</script>

<template>
  <div
    ref="rootRef"
    class="uid-message-feed"
    role="feed"
    :aria-label="label"
    :aria-busy="loadingBefore || loadingAfter"
    @scroll.passive="onScroll"
  >
    <div
      v-if="$slots.before && loadingBefore"
      class="uid-message-feed__edge uid-message-feed__edge--before"
    >
      <slot name="before" />
    </div>
    <div
      v-if="isEmpty"
      class="uid-message-feed__empty"
    >
      <slot name="empty" />
    </div>
    <div
      v-else
      class="uid-message-feed__spacer"
      :style="{ height: `${lead + total}px` }"
    >
      <div
        class="uid-message-feed__content"
        :style="{ transform: `translateY(${offset}px)` }"
      >
        <div
          v-for="row in visibleRows"
          :key="row.key"
          :ref="(el) => bindRow(row.key, el)"
          :data-key="row.key"
          class="uid-message-feed__row"
          :role="row.kind === 'item' ? 'article' : 'separator'"
          :aria-posinset="row.kind === 'item' ? row.index + 1 : undefined"
          :aria-setsize="row.kind === 'item' ? (hasMoreBefore || hasMoreAfter ? -1 : items.length) : undefined"
        >
          <template v-if="row.kind === 'day'">
            <slot
              name="day"
              :date="row.date"
              :label="formatDay(row.date)"
            >
              <div class="uid-message-feed__day">
                <span class="uid-message-feed__day-label">{{ formatDay(row.date) }}</span>
              </div>
            </slot>
          </template>
          <template v-else-if="row.kind === 'new'">
            <slot
              name="new"
              :label="newText"
            >
              <div class="uid-message-feed__new">
                <span class="uid-message-feed__new-label">{{ newText }}</span>
              </div>
            </slot>
          </template>
          <slot
            v-else
            name="item"
            :item="row.item"
            :index="row.index"
            :grouped="row.grouped"
          />
        </div>
      </div>
    </div>
    <div
      v-if="$slots.after && loadingAfter"
      class="uid-message-feed__edge uid-message-feed__edge--after"
    >
      <slot name="after" />
    </div>
  </div>
</template>
