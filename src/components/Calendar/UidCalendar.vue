<script setup lang="ts">
import './UidCalendar.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import {
  type CalendarBand,
  type CalendarEvent,
  type CalendarRange,
  type CalendarView,
  addDays,
  bandLanes,
  daysBetween,
  eventsOn,
  formatTime,
  fromISO,
  isAllDay,
  isMultiDay,
  lastDay,
  layoutDay,
  minutes,
  moved,
  rangeOf,
  resized,
  startOfWeek,
  step,
  toISO,
} from './calendarModel'

export type { CalendarBand, CalendarEvent, CalendarEventVariant, CalendarRange, CalendarView } from './calendarModel'

/** `event-move`: a move gives the new date (and times); a resize gives the new `endTime` (time grid) or inclusive `endDate` (month, all-day row). */
export interface CalendarEventMove {
  event: CalendarEvent
  date: string
  endDate?: string
  time?: string
  endTime?: string
}

/** The payload of `slot-click`: an empty slot — a time in the day/week grid, a day in the all-day row. */
export interface CalendarSlot {
  date: string
  time?: string
}

export interface UidCalendarProps {
  events?: CalendarEvent[]
  min?: string
  max?: string
  compact?: boolean
  maxEventsPerDay?: number
  todayLabel?: string
  views?: CalendarView[]
  editable?: boolean
  /** Emit `slot-click` for clicks on empty slots. Defaults to `editable`. */
  selectable?: boolean
  hourHeight?: number
  scrollToHour?: number
  /** Classes for a day cell of the month grid by its `YYYY-MM-DD`: weekends, holidays, days off. */
  dayClass?: (iso: string) => CalendarDayClass
  /** Show the Today button between the arrows. */
  todayButton?: boolean
  /** Show the built-in header (title, views, arrows); off when the host draws its own toolbar and drives the exposed `go`, `goToday`, `setView`. */
  header?: boolean
  /** The first hour of the day and week grid. */
  startHour?: number
  /** The hour the day and week grid ends at (not shown as a row). */
  endHour?: number
  /** The corner over the hours in the day and week grid, e.g. the time zone. */
  gutterLabel?: string
  /** The caption of the all-day row; empty — none. */
  allDayLabel?: string
  /** Bars across whole days: over the day and week grid, and in the month cells. */
  bands?: CalendarBand[]
  /** The day heads of the day and week grid in one row — weekday, date, `day-extra` — instead of stacked. */
  headInline?: boolean
  /** A small month to pick a date from: dates only, no events or bands, one-letter weekdays. */
  mini?: boolean
}

/** What `dayClass` returns: anything Vue's `:class` takes, or nothing. */
export type CalendarDayClass = string | string[] | Record<string, boolean> | null | undefined

const props = withDefaults(defineProps<UidCalendarProps>(), {
  events: () => [],
  compact: false,
  maxEventsPerDay: 3,
  views: () => ['month'],
  editable: false,
  selectable: undefined,
  hourHeight: 48,
  scrollToHour: 8,
  dayClass: undefined,
  todayButton: true,
  header: true,
  startHour: 0,
  endHour: 24,
  gutterLabel: '',
  allDayLabel: undefined,
  bands: () => [],
  headInline: false,
  mini: false,
})

const emit = defineEmits<{
  'event-click': [event: CalendarEvent, element: HTMLElement]
  /** The pointer or the focus came to an event (its element), or left it (`null`): for a preview popover. */
  'event-hover': [event: CalendarEvent | null, element: HTMLElement | null]
  'date-click': [iso: string]
  change: [iso: string | null]
  range: [range: CalendarRange]
  'event-move': [move: CalendarEventMove]
  'slot-click': [slot: CalendarSlot]
}>()

defineSlots<{
  /** The header's title text. */
  title?: (props: { title: string; view: CalendarView; range: CalendarRange }) => unknown
  /** What an event shows: a block of the time grid, a chip of the month or the all-day row. */
  event?: (props: { event: CalendarEvent; view: CalendarView; short: boolean }) => unknown
  /** The content of a band over the time grid. */
  band?: (props: { band: CalendarBand }) => unknown
  /** Next to the date of a month cell, and at the end of a day head of the time grid. */
  'day-extra'?: (props: { iso: string }) => unknown
}>()

const model = defineModel<string | null>({ default: null })
const view = defineModel<CalendarView>('view', { default: 'month' })
const anchorModel = defineModel<string | null>('anchor', { default: null })
const locale = useLocale()

const todayISO = toISO(new Date())
const anchor = computed<string>({
  get: () => anchorModel.value ?? localAnchor.value,
  set: (v) => {
    localAnchor.value = v
    anchorModel.value = v
  },
})
const localAnchor = ref<string>(anchorModel.value ?? model.value ?? todayISO)

const range = computed(() => rangeOf(view.value, anchor.value))
watch(range, (r) => emit('range', r), { immediate: true })

const months = computed(() => locale.value.datePicker.months)
const L = computed(() => locale.value.calendar)

function dayTitle(iso: string): string {
  const d = fromISO(iso)
  return `${d.getDate()} ${L.value.monthsGenitive[d.getMonth()]}`
}

const title = computed(() => {
  const a = fromISO(anchor.value)
  switch (view.value) {
    case 'day':
      return `${L.value.weekdaysLong[(a.getDay() + 6) % 7]}, ${dayTitle(anchor.value)} ${a.getFullYear()}`
    case 'week': {
      const s = fromISO(range.value.start)
      const e = fromISO(range.value.end)
      const left = s.getMonth() === e.getMonth() ? String(s.getDate()) : dayTitle(range.value.start)
      return `${left} – ${dayTitle(range.value.end)} ${e.getFullYear()}`
    }
    case 'year':
      return String(a.getFullYear())
    default:
      return `${months.value[a.getMonth()]} ${a.getFullYear()}`
  }
})
const todayBtnLabel = computed(() => props.todayLabel ?? L.value.today)
const prevLabel = computed(() => (view.value === 'month' || view.value === 'agenda' ? locale.value.datePicker.prevMonth : L.value.views[view.value]))
const nextLabel = computed(() => (view.value === 'month' || view.value === 'agenda' ? locale.value.datePicker.nextMonth : L.value.views[view.value]))

function go(dir: 1 | -1): void {
  anchor.value = step(view.value, anchor.value, dir)
}

function goToday(): void {
  anchor.value = todayISO
}

function setView(v: CalendarView): void {
  view.value = v
}

function openDay(iso: string): void {
  anchor.value = iso
  if (props.views.includes('day')) view.value = 'day'
}

function isDisabled(iso: string): boolean {
  if (props.min && iso < props.min) return true
  if (props.max && iso > props.max) return true
  return false
}

function selectDay(iso: string): void {
  if (isDisabled(iso)) return
  model.value = iso
  emit('date-click', iso)
  emit('change', iso)
}

/** Year view: open the day first (anchor, view), then select it as in the month, so `date-click` sees the new view. */
function pickYearDay(iso: string): void {
  openDay(iso)
  selectDay(iso)
}

const isSelectable = computed(() => props.selectable ?? props.editable)

/** Whether an event can be dragged and resized: the calendar is editable and the event does not opt out. */
function canEdit(e: CalendarEvent): boolean {
  return props.editable && real(e).editable !== false
}

/** A month chip or an all-day-row chip on the event's last day gets the end handle. */
function hasEndHandle(e: CalendarEvent, iso: string): boolean {
  return canEdit(e) && (isAllDay(e) || isMultiDay(e)) && iso === lastDay(e)
}

const drag = ref<null | {
  event: CalendarEvent
  mode: 'move' | 'resize'
  grid: boolean
  x: number
  y: number
  grab: number
  active: boolean
  preview: Omit<CalendarEventMove, 'event'>
}>(null)
let suppressClick = false

const shown = computed<CalendarEvent[]>(() => {
  const d = drag.value
  if (!d || !d.active) return props.events
  return props.events.map((e) => (e === d.event ? { ...e, ...d.preview } : e))
})
const origin = computed(() => {
  const map = new Map<CalendarEvent, CalendarEvent>()
  shown.value.forEach((e, i) => map.set(e, props.events[i]))
  return map
})
const real = (e: CalendarEvent): CalendarEvent => origin.value.get(e) ?? e

function onEventClick(e: MouseEvent | KeyboardEvent, evt: CalendarEvent): void {
  e.stopPropagation()
  if (suppressClick) return
  emit('event-click', real(evt), e.currentTarget as HTMLElement)
}

function onEventHover(e: Event | null, evt: CalendarEvent | null): void {
  if (drag.value?.active) return
  emit('event-hover', evt === null ? null : real(evt), evt === null || e === null ? null : (e.currentTarget as HTMLElement))
}

function variantClass(e: CalendarEvent, prefix: string): Record<string, boolean> {
  return e.variant ? { [`${prefix}--${e.variant}`]: true, [`${prefix}--variant`]: true } : {}
}

function timeLabel(e: CalendarEvent): string {
  if (isAllDay(e)) return ''
  return e.endTime ? `${e.time}–${e.endTime}` : (e.time ?? '')
}

interface Day {
  date: Date
  iso: string
  current: boolean
  events: CalendarEvent[]
}

const days = computed<Day[]>(() => {
  const month = anchor.value.slice(0, 7)
  const out: Day[] = []
  for (let i = 0; i < 42; i++) {
    const iso = addDays(range.value.start, i)
    out.push({ date: fromISO(iso), iso, current: iso.startsWith(month), events: eventsOn(shown.value, iso) })
  }
  return out
})

function chipClass(e: CalendarEvent, iso: string): Record<string, boolean> {
  return {
    'uid-calendar__event--timed': !isAllDay(e) && !isMultiDay(e),
    'uid-calendar__event--from-prev': isMultiDay(e) && iso !== e.date,
    'uid-calendar__event--to-next': isMultiDay(e) && iso !== lastDay(e),
    'uid-calendar__event--dragging': !!drag.value?.active && real(e) === drag.value.event,
    'uid-calendar__event--draggable': canEdit(e),
    'uid-calendar__event--resizable': hasEndHandle(e, iso),
    ...variantClass(e, 'uid-calendar__event'),
  }
}

const gridDays = computed<string[]>(() => {
  if (view.value === 'day') return [anchor.value]
  const start = startOfWeek(anchor.value)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
})
const firstHour = computed(() => Math.max(0, Math.min(23, Math.floor(props.startHour))))
const lastHour = computed(() => Math.max(firstHour.value + 1, Math.min(24, Math.ceil(props.endHour))))
const hours = computed(() => Array.from({ length: lastHour.value - firstHour.value }, (_, i) => firstHour.value + i))
/** The grid's first and last minute of the day. */
const gridFrom = computed(() => firstHour.value * 60)
const gridTo = computed(() => lastHour.value * 60)
const hourPx = computed(() => props.hourHeight)

const allDayRow = computed(() => gridDays.value.map((iso) => eventsOn(shown.value, iso).filter((e) => isAllDay(e) || isMultiDay(e))))
const blocks = computed(() => gridDays.value.map((iso) => layoutDay(shown.value, iso)
  .filter((b) => b.end > gridFrom.value && b.start < gridTo.value)
  .map((b) => ({ ...b, start: Math.max(b.start, gridFrom.value), end: Math.min(b.end, gridTo.value) }))))

/** Bands over the day and week grid: their columns and lanes in the days shown. */
const gridBands = computed(() => {
  const first = gridDays.value[0]
  const last = gridDays.value[gridDays.value.length - 1]
  return bandLanes(props.bands.filter((b) => b.end >= first && b.start <= last)).map(({ band, lane }) => ({
    band,
    lane,
    from: Math.max(0, daysBetween(first, band.start)),
    to: Math.min(gridDays.value.length - 1, daysBetween(first, band.end)),
  }))
})
const gridBandLanes = computed(() => gridBands.value.reduce((n, b) => Math.max(n, b.lane + 1), 0))

/** Bands in the month: the lanes of each week, so a band keeps its height across the week. */
const monthBands = computed(() => {
  const weeks: { band: CalendarBand; lane: number }[][] = []
  for (let w = 0; w < 6; w++) {
    const first = addDays(range.value.start, w * 7)
    const last = addDays(first, 6)
    weeks.push(bandLanes(props.bands.filter((b) => b.end >= first && b.start <= last)))
  }
  return weeks
})

function bandsOnDay(iso: string, week: number): ({ band: CalendarBand; label: boolean; fromPrev: boolean; toNext: boolean } | null)[] {
  const list = monthBands.value[week] ?? []
  const lanes = list.reduce((n, b) => Math.max(n, b.lane + 1), 0)
  const out: ({ band: CalendarBand; label: boolean; fromPrev: boolean; toNext: boolean } | null)[] = Array.from({ length: lanes }, () => null)
  const monday = fromISO(iso).getDay() === 1
  for (const { band, lane } of list) {
    if (band.start <= iso && band.end >= iso) {
      out[lane] = { band, label: iso === band.start || monday, fromPrev: iso !== band.start && !monday, toNext: iso !== band.end && fromISO(iso).getDay() !== 0 }
    }
  }
  return out
}

const nowMinutes = ref(new Date().getHours() * 60 + new Date().getMinutes())
let clock: ReturnType<typeof setInterval> | undefined
const body = ref<HTMLElement | null>(null)

function scrollGrid(): void {
  if (body.value) body.value.scrollTop = Math.max(0, (props.scrollToHour - firstHour.value) * hourPx.value - 12)
}
watch(view, (v) => {
  if (v === 'day' || v === 'week') nextTick(scrollGrid)
})
onMounted(() => {
  scrollGrid()
  clock = setInterval(() => {
    const n = new Date()
    nowMinutes.value = n.getHours() * 60 + n.getMinutes()
  }, 60000)
})
onBeforeUnmount(() => {
  clearInterval(clock)
  stopDrag()
})

function snap(min: number, to = 15): number {
  return Math.round(min / to) * to
}

function minuteAt(column: HTMLElement, clientY: number): number {
  const rect = column.getBoundingClientRect()
  return ((clientY - rect.top) / hourPx.value) * 60 + gridFrom.value
}

function onSlotClick(e: MouseEvent, iso: string): void {
  if (!isSelectable.value || suppressClick) return
  const min = Math.max(gridFrom.value, Math.min(gridTo.value - 30, Math.floor(minuteAt(e.currentTarget as HTMLElement, e.clientY) / 30) * 30))
  emit('slot-click', { date: iso, time: formatTime(min) })
}

function onAllDayClick(iso: string): void {
  if (!isSelectable.value || suppressClick) return
  emit('slot-click', { date: iso })
}

function startDrag(e: PointerEvent, evt: CalendarEvent, mode: 'move' | 'resize', grid: boolean): void {
  if (!canEdit(evt) || e.button !== 0) return
  e.stopPropagation()
  const event = real(evt)
  let grab = 0
  if (grid && mode === 'move') {
    const column = (e.currentTarget as HTMLElement).closest<HTMLElement>('.uid-calendar__col')
    if (column) grab = minuteAt(column, e.clientY) - (minutes(event.time) ?? 0)
  }
  drag.value = { event, mode, grid, x: e.clientX, y: e.clientY, grab, active: false, preview: { date: event.date } }
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
  window.addEventListener('keydown', onDragKey)
}

function onDragMove(e: PointerEvent): void {
  const d = drag.value
  if (!d) return
  if (!d.active && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return
  d.active = true
  const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
  const cell = target?.closest<HTMLElement>('[data-date]')
  const iso = cell?.dataset.date
  if (!iso) return
  if (!d.grid) {
    d.preview = d.mode === 'resize' ? resized(d.event, iso) : moved(d.event, iso)
    return
  }
  const column = target?.closest<HTMLElement>('.uid-calendar__col')
  const from = minutes(d.event.time) ?? 0
  const to = minutes(d.event.endTime) ?? from + 60
  if (d.mode === 'resize') {
    const end = Math.max(from + 15, Math.min(gridTo.value, snap(column ? minuteAt(column, e.clientY) : to)))
    d.preview = { date: d.event.date, time: d.event.time, endTime: formatTime(end) }
    return
  }
  if (!column) {
    d.preview = moved(d.event, iso)
    return
  }
  const start = Math.max(gridFrom.value, Math.min(gridTo.value - (to - from), snap(minuteAt(column, e.clientY) - d.grab)))
  d.preview = moved(d.event, iso, formatTime(start))
}

function onDragEnd(): void {
  const d = drag.value
  stopDrag()
  if (!d || !d.active) return
  suppressClick = true
  setTimeout(() => { suppressClick = false }, 0)
  const p = d.preview
  const same = p.date === d.event.date && (p.endDate ?? d.event.date) === lastDay(d.event)
    && (p.time ?? d.event.time) === d.event.time && (p.endTime ?? d.event.endTime) === d.event.endTime
  if (!same) emit('event-move', { event: d.event, ...p })
}

function onDragKey(e: KeyboardEvent): void {
  if (e.key !== 'Escape') return
  stopDrag()
}

function stopDrag(): void {
  drag.value = null
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('keydown', onDragKey)
}

function blockStyle(b: { start: number; end: number; col: number; cols: number; event: CalendarEvent }): Record<string, string> {
  const style: Record<string, string> = {
    top: `${((b.start - gridFrom.value) / 60) * hourPx.value}px`,
    height: `${Math.max(18, ((b.end - b.start) / 60) * hourPx.value - 2)}px`,
    left: `calc(${(b.col / b.cols) * 100}% + 2px)`,
    width: `calc(${100 / b.cols}% - 4px)`,
  }
  if (b.event.color) style['--uid-event-color'] = b.event.color
  return style
}

const yearMonths = computed(() => {
  const y = anchor.value.slice(0, 4)
  return Array.from({ length: 12 }, (_, m) => {
    const first = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const start = startOfWeek(first)
    const cells = Array.from({ length: 42 }, (_, i) => {
      const iso = addDays(start, i)
      return { iso, day: fromISO(iso).getDate(), current: iso.startsWith(first.slice(0, 7)) }
    })
    return { first, name: months.value[m], cells }
  })
})
const busyDays = computed(() => {
  const set = new Set<string>()
  const { start, end } = range.value
  for (const e of props.events) {
    const from = e.date < start ? start : e.date
    const to = lastDay(e) > end ? end : lastDay(e)
    for (let i = 0, n = daysBetween(from, to); i <= n && i < 400; i++) set.add(addDays(from, i))
  }
  return set
})

function openMonth(first: string): void {
  anchor.value = first
  if (props.views.includes('month')) view.value = 'month'
}

const agenda = computed(() => {
  const out: { iso: string; label: string; events: CalendarEvent[] }[] = []
  const { start, end } = range.value
  for (let iso = start; iso <= end; iso = addDays(iso, 1)) {
    const list = eventsOn(shown.value, iso)
    if (list.length === 0) continue
    const d = fromISO(iso)
    out.push({ iso, label: `${L.value.weekdaysLong[(d.getDay() + 6) % 7]}, ${dayTitle(iso)}`, events: list })
  }
  return out
})

defineExpose({ go, goToday, setView })
</script>

<template>
  <div
    class="uid-calendar"
    :class="[`uid-calendar--${view}`, { 'uid-calendar--mini': mini, 'uid-calendar--head-inline': headInline, 'uid-calendar--compact': compact, 'uid-calendar--editable': editable, 'uid-calendar--selectable': isSelectable }]"
  >
    <div
      v-if="header"
      class="uid-calendar__header"
    >
      <span class="uid-calendar__title"><slot
        name="title"
        :title="title"
        :view="view"
        :range="range"
      >{{ title }}</slot></span>
      <div class="uid-calendar__tools">
        <div
          v-if="views.length > 1"
          class="uid-calendar__views"
          role="group"
        >
          <button
            v-for="v in views"
            :key="v"
            type="button"
            class="uid-calendar__btn uid-calendar__view"
            :class="{ 'uid-calendar__view--active': v === view }"
            :aria-pressed="v === view"
            @click="setView(v)"
          >
            {{ L.views[v] }}
          </button>
        </div>
        <div class="uid-calendar__nav">
          <button
            type="button"
            class="uid-calendar__btn uid-calendar__btn--icon"
            :aria-label="prevLabel"
            @click="go(-1)"
          >
            <UidIcon
              :icon="ChevronLeft"
              :size="14"
            />
          </button>
          <button
            v-if="todayButton"
            type="button"
            class="uid-calendar__btn"
            @click="goToday"
          >
            {{ todayBtnLabel }}
          </button>
          <button
            type="button"
            class="uid-calendar__btn uid-calendar__btn--icon"
            :aria-label="nextLabel"
            @click="go(1)"
          >
            <UidIcon
              :icon="ChevronRight"
              :size="14"
            />
          </button>
        </div>
      </div>
    </div>

    <template v-if="view === 'month'">
      <div class="uid-calendar__weekdays">
        <span
          v-for="wd in locale.datePicker.weekdaysShort"
          :key="wd"
          class="uid-calendar__weekday"
        >{{ mini ? wd.slice(0, 1) : wd }}</span>
      </div>
      <div class="uid-calendar__grid">
        <div
          v-for="day in days"
          :key="day.iso"
          class="uid-calendar__day"
          :class="[{
            'uid-calendar__day--other': !day.current,
            'uid-calendar__day--today': day.iso === todayISO,
            'uid-calendar__day--selected': day.iso === model,
            'uid-calendar__day--disabled': isDisabled(day.iso),
          }, dayClass?.(day.iso)]"
          :data-date="day.iso"
          :tabindex="!isDisabled(day.iso) ? 0 : -1"
          role="button"
          :aria-current="day.iso === todayISO ? 'date' : undefined"
          :aria-selected="day.iso === model"
          :aria-label="day.iso"
          @click="selectDay(day.iso)"
          @keydown.enter.prevent="selectDay(day.iso)"
          @keydown.space.prevent="selectDay(day.iso)"
        >
          <span
            v-if="$slots['day-extra']"
            class="uid-calendar__day-head"
          >
            <span class="uid-calendar__date">{{ day.date.getDate() }}</span>
            <slot
              name="day-extra"
              :iso="day.iso"
            />
          </span>
          <span
            v-else
            class="uid-calendar__date"
          >{{ day.date.getDate() }}</span>
          <div
            v-if="bands.length && !mini"
            class="uid-calendar__day-bands"
          >
            <template
              v-for="(piece, k) in bandsOnDay(day.iso, Math.floor(days.indexOf(day) / 7))"
              :key="k"
            >
              <span
                v-if="piece"
                class="uid-calendar__band"
                :class="[`uid-calendar__band--${piece.band.tone ?? 'neutral'}`, { 'uid-calendar__band--from-prev': piece.fromPrev, 'uid-calendar__band--to-next': piece.toNext }]"
                :title="piece.band.label"
              >{{ piece.label ? piece.band.label : '\u00a0' }}</span>
              <span
                v-else
                class="uid-calendar__band uid-calendar__band--gap"
                aria-hidden="true"
              />
            </template>
          </div>
          <div
            v-if="!mini"
            class="uid-calendar__events"
          >
            <button
              v-for="(evt, i) in day.events.slice(0, maxEventsPerDay)"
              :key="evt.id ?? `${day.iso}-${i}`"
              type="button"
              class="uid-calendar__event"
              :class="chipClass(evt, day.iso)"
              :style="evt.color ? { '--uid-event-color': evt.color } : undefined"
              :title="timeLabel(evt) ? `${timeLabel(evt)} ${evt.title}` : evt.title"
              :aria-label="evt.label"
              @click="onEventClick($event, evt)"
              @pointerdown="startDrag($event, evt, 'move', false)"
              @mouseenter="onEventHover($event, evt)"
              @mouseleave="onEventHover(null, null)"
              @focus="onEventHover($event, evt)"
              @blur="onEventHover(null, null)"
            >
              <slot
                name="event"
                :event="real(evt)"
                :view="'month'"
                :short="true"
              >
                <span
                  v-if="!isAllDay(evt) && day.iso === evt.date"
                  class="uid-calendar__event-time"
                >{{ evt.time }}</span>
                <span class="uid-calendar__event-label">{{ !isMultiDay(evt) || day.iso === evt.date || day.date.getDay() === 1 ? evt.title : '\u00a0' }}</span>
              </slot>
              <span
                v-if="hasEndHandle(evt, day.iso)"
                class="uid-calendar__resize uid-calendar__resize--end"
                :title="L.resize"
                :aria-label="L.resize"
                @pointerdown="startDrag($event, evt, 'resize', false)"
                @click.stop
              />
            </button>
            <button
              v-if="day.events.length > maxEventsPerDay"
              type="button"
              class="uid-calendar__more"
              @click.stop="openDay(day.iso)"
            >
              {{ L.more(day.events.length - maxEventsPerDay) }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <div
      v-else-if="view === 'week' || view === 'day'"
      class="uid-calendar__tg"
      :style="{ '--uid-cal-hour-h': `${hourPx}px` }"
    >
      <div class="uid-calendar__tg-head">
        <span class="uid-calendar__gutter uid-calendar__gutter-label uid-calendar__gutter-corner">{{ gutterLabel }}</span>
        <button
          v-for="iso in gridDays"
          :key="iso"
          type="button"
          class="uid-calendar__tg-day"
          :class="[{ 'uid-calendar__tg-day--today': iso === todayISO }, dayClass?.(iso)]"
          @click="view === 'week' ? openDay(iso) : selectDay(iso)"
        >
          <span class="uid-calendar__tg-weekday">{{ view === 'day' && headInline ? L.weekdaysLong[(fromISO(iso).getDay() + 6) % 7] : locale.datePicker.weekdaysShort[(fromISO(iso).getDay() + 6) % 7] }}</span>
          <span class="uid-calendar__tg-date">{{ fromISO(iso).getDate() }}</span>
          <span
            v-if="$slots['day-extra']"
            class="uid-calendar__tg-extra"
          ><slot
            name="day-extra"
            :iso="iso"
          /></span>
        </button>
      </div>
      <div
        class="uid-calendar__allday"
        :style="{ '--uid-cal-band-lanes': gridBandLanes }"
      >
        <span
          class="uid-calendar__gutter uid-calendar__gutter-label"
          :style="{ gridRow: `1 / ${gridBandLanes + 2}` }"
        >{{ allDayLabel ?? L.allDay }}</span>
        <span
          v-for="b in gridBands"
          :key="b.band.id ?? `${b.band.start}-${b.band.label}`"
          class="uid-calendar__band uid-calendar__band--grid"
          :class="[`uid-calendar__band--${b.band.tone ?? 'neutral'}`, { 'uid-calendar__band--from-prev': b.band.start < gridDays[0], 'uid-calendar__band--to-next': b.band.end > gridDays[gridDays.length - 1] }]"
          :style="{ gridColumn: `${b.from + 2} / ${b.to + 3}`, gridRow: b.lane + 1 }"
          :title="b.band.label"
        ><slot
          name="band"
          :band="b.band"
        >{{ b.band.label }}</slot></span>
        <div
          v-for="(list, i) in allDayRow"
          :key="gridDays[i]"
          class="uid-calendar__allday-cell"
          :class="dayClass?.(gridDays[i])"
          :style="{ gridRow: gridBandLanes + 1, gridColumn: i + 2 }"
          :data-date="gridDays[i]"
          @click="onAllDayClick(gridDays[i])"
        >
          <button
            v-for="(evt, j) in list"
            :key="evt.id ?? `${gridDays[i]}-a${j}`"
            type="button"
            class="uid-calendar__event"
            :class="chipClass(evt, gridDays[i])"
            :style="evt.color ? { '--uid-event-color': evt.color } : undefined"
            :title="evt.title"
            :aria-label="evt.label"
            @click="onEventClick($event, evt)"
            @pointerdown="startDrag($event, evt, 'move', false)"
            @mouseenter="onEventHover($event, evt)"
            @mouseleave="onEventHover(null, null)"
            @focus="onEventHover($event, evt)"
            @blur="onEventHover(null, null)"
          >
            <slot
              name="event"
              :event="real(evt)"
              :view="view"
              :short="true"
            >
              <span class="uid-calendar__event-label">{{ evt.title }}</span>
            </slot>
            <span
              v-if="hasEndHandle(evt, gridDays[i])"
              class="uid-calendar__resize uid-calendar__resize--end"
              :title="L.resize"
              :aria-label="L.resize"
              @pointerdown="startDrag($event, evt, 'resize', false)"
              @click.stop
            />
          </button>
        </div>
      </div>
      <div
        ref="body"
        class="uid-calendar__tg-body"
      >
        <div
          class="uid-calendar__tg-inner"
          :style="{ '--uid-cal-hours': lastHour - firstHour }"
        >
          <div class="uid-calendar__gutter uid-calendar__hours">
            <span
              v-for="h in hours"
              :key="h"
              class="uid-calendar__hour"
            >{{ h === firstHour ? '' : formatTime(h * 60) }}</span>
          </div>
          <div
            v-for="(iso, i) in gridDays"
            :key="iso"
            class="uid-calendar__col"
            :class="[{ 'uid-calendar__col--today': iso === todayISO }, dayClass?.(iso)]"
            :data-date="iso"
            @click="onSlotClick($event, iso)"
          >
            <div
              v-if="iso === todayISO && nowMinutes >= gridFrom && nowMinutes <= gridTo"
              class="uid-calendar__now"
              :style="{ top: `${((nowMinutes - gridFrom) / 60) * hourPx}px` }"
            />
            <div
              v-for="(b, j) in blocks[i]"
              :key="b.event.id ?? `${iso}-${j}`"
              class="uid-calendar__block"
              :class="{
                'uid-calendar__block--dragging': !!drag?.active && real(b.event) === drag.event,
                'uid-calendar__block--short': ((b.end - b.start) / 60) * hourPx < 36,
                'uid-calendar__block--draggable': canEdit(b.event),
                ...variantClass(b.event, 'uid-calendar__block'),
              }"
              :style="blockStyle(b)"
              role="button"
              tabindex="0"
              :title="`${timeLabel(b.event)} ${b.event.title}`"
              :aria-label="b.event.label"
              @click="onEventClick($event, b.event)"
              @keydown.enter.prevent="onEventClick($event, b.event)"
              @pointerdown="startDrag($event, b.event, 'move', true)"
              @mouseenter="onEventHover($event, b.event)"
              @mouseleave="onEventHover(null, null)"
              @focus="onEventHover($event, b.event)"
              @blur="onEventHover(null, null)"
            >
              <slot
                name="event"
                :event="real(b.event)"
                :view="view"
                :short="((b.end - b.start) / 60) * hourPx < 36"
              >
                <span class="uid-calendar__block-time">{{ timeLabel(b.event) }}</span>
                <span class="uid-calendar__block-title">{{ b.event.title }}</span>
              </slot>
              <span
                v-if="canEdit(b.event)"
                class="uid-calendar__resize"
                :title="L.resize"
                :aria-label="L.resize"
                @pointerdown="startDrag($event, b.event, 'resize', true)"
                @click.stop
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="view === 'year'"
      class="uid-calendar__year"
    >
      <div
        v-for="m in yearMonths"
        :key="m.first"
        class="uid-calendar__mini"
      >
        <button
          type="button"
          class="uid-calendar__mini-title"
          @click="openMonth(m.first)"
        >
          {{ m.name }}
        </button>
        <div class="uid-calendar__mini-grid">
          <span
            v-for="wd in locale.datePicker.weekdaysShort"
            :key="wd"
            class="uid-calendar__mini-wd"
          >{{ wd.slice(0, 1) }}</span>
          <button
            v-for="c in m.cells"
            :key="c.iso"
            type="button"
            class="uid-calendar__mini-day"
            :class="{
              'uid-calendar__mini-day--other': !c.current,
              'uid-calendar__mini-day--today': c.current && c.iso === todayISO,
              'uid-calendar__mini-day--busy': c.current && busyDays.has(c.iso),
            }"
            :tabindex="c.current ? 0 : -1"
            :aria-label="c.iso"
            :disabled="!c.current"
            @click="pickYearDay(c.iso)"
          >
            {{ c.day }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="uid-calendar__agenda"
    >
      <p
        v-if="agenda.length === 0"
        class="uid-calendar__empty"
      >
        {{ L.noEvents }}
      </p>
      <section
        v-for="d in agenda"
        :key="d.iso"
        class="uid-calendar__agenda-day"
        :class="{ 'uid-calendar__agenda-day--today': d.iso === todayISO }"
      >
        <h4 class="uid-calendar__agenda-date">
          {{ d.label }}
        </h4>
        <button
          v-for="(evt, i) in d.events"
          :key="evt.id ?? `${d.iso}-${i}`"
          type="button"
          class="uid-calendar__agenda-item"
          :style="evt.color ? { '--uid-event-color': evt.color } : undefined"
          @click="onEventClick($event, evt)"
        >
          <span class="uid-calendar__agenda-time">{{ isAllDay(evt) || (isMultiDay(evt) && d.iso !== evt.date) ? L.allDay : timeLabel(evt) }}</span>
          <span class="uid-calendar__agenda-dot" />
          <span class="uid-calendar__agenda-title">{{ evt.title }}</span>
        </button>
      </section>
    </div>
  </div>
</template>
