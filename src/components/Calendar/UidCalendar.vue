<script setup lang="ts">
import './UidCalendar.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import {
  type CalendarEvent,
  type CalendarRange,
  type CalendarView,
  addDays,
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
  startOfWeek,
  step,
  toISO,
} from './calendarModel'

export type { CalendarEvent, CalendarRange, CalendarView } from './calendarModel'

export interface CalendarEventMove {
  event: CalendarEvent
  date: string
  endDate?: string
  time?: string
  endTime?: string
}

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
  hourHeight?: number
  scrollToHour?: number
}

const props = withDefaults(defineProps<UidCalendarProps>(), {
  events: () => [],
  compact: false,
  maxEventsPerDay: 3,
  views: () => ['month'],
  editable: false,
  hourHeight: 48,
  scrollToHour: 8,
})

const emit = defineEmits<{
  'event-click': [event: CalendarEvent]
  'date-click': [iso: string]
  change: [iso: string | null]
  range: [range: CalendarRange]
  'event-move': [move: CalendarEventMove]
  'slot-click': [slot: CalendarSlot]
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

function onEventClick(e: MouseEvent, evt: CalendarEvent): void {
  e.stopPropagation()
  if (suppressClick) return
  emit('event-click', real(evt))
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
    'uid-calendar__event--draggable': props.editable,
  }
}

const gridDays = computed<string[]>(() => {
  if (view.value === 'day') return [anchor.value]
  const start = startOfWeek(anchor.value)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
})
const hours = Array.from({ length: 24 }, (_, h) => h)
const hourPx = computed(() => props.hourHeight)

const allDayRow = computed(() => gridDays.value.map((iso) => eventsOn(shown.value, iso).filter((e) => isAllDay(e) || isMultiDay(e))))
const blocks = computed(() => gridDays.value.map((iso) => layoutDay(shown.value, iso)))

const nowMinutes = ref(new Date().getHours() * 60 + new Date().getMinutes())
let clock: ReturnType<typeof setInterval> | undefined
const body = ref<HTMLElement | null>(null)

function scrollGrid(): void {
  if (body.value) body.value.scrollTop = Math.max(0, props.scrollToHour * hourPx.value - 12)
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
  return ((clientY - rect.top) / hourPx.value) * 60
}

function onSlotClick(e: MouseEvent, iso: string): void {
  if (!props.editable || suppressClick) return
  const min = Math.max(0, Math.min(23 * 60 + 30, Math.floor(minuteAt(e.currentTarget as HTMLElement, e.clientY) / 30) * 30))
  emit('slot-click', { date: iso, time: formatTime(min) })
}

function onAllDayClick(iso: string): void {
  if (!props.editable || suppressClick) return
  emit('slot-click', { date: iso })
}

function startDrag(e: PointerEvent, evt: CalendarEvent, mode: 'move' | 'resize', grid: boolean): void {
  if (!props.editable || e.button !== 0) return
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
    d.preview = moved(d.event, iso)
    return
  }
  const column = target?.closest<HTMLElement>('.uid-calendar__col')
  const from = minutes(d.event.time) ?? 0
  const to = minutes(d.event.endTime) ?? from + 60
  if (d.mode === 'resize') {
    const end = Math.max(from + 15, Math.min(24 * 60, snap(column ? minuteAt(column, e.clientY) : to)))
    d.preview = { date: d.event.date, time: d.event.time, endTime: formatTime(end) }
    return
  }
  if (!column) {
    d.preview = moved(d.event, iso)
    return
  }
  const start = Math.max(0, Math.min(24 * 60 - (to - from), snap(minuteAt(column, e.clientY) - d.grab)))
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
    top: `${(b.start / 60) * hourPx.value}px`,
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
    :class="[`uid-calendar--${view}`, { 'uid-calendar--compact': compact, 'uid-calendar--editable': editable }]"
  >
    <div class="uid-calendar__header">
      <span class="uid-calendar__title">{{ title }}</span>
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
        >{{ wd }}</span>
      </div>
      <div class="uid-calendar__grid">
        <div
          v-for="day in days"
          :key="day.iso"
          class="uid-calendar__day"
          :class="{
            'uid-calendar__day--other': !day.current,
            'uid-calendar__day--today': day.iso === todayISO,
            'uid-calendar__day--selected': day.iso === model,
            'uid-calendar__day--disabled': isDisabled(day.iso),
          }"
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
          <span class="uid-calendar__date">{{ day.date.getDate() }}</span>
          <div class="uid-calendar__events">
            <button
              v-for="(evt, i) in day.events.slice(0, maxEventsPerDay)"
              :key="evt.id ?? `${day.iso}-${i}`"
              type="button"
              class="uid-calendar__event"
              :class="chipClass(evt, day.iso)"
              :style="evt.color ? { '--uid-event-color': evt.color } : undefined"
              :title="timeLabel(evt) ? `${timeLabel(evt)} ${evt.title}` : evt.title"
              @click="onEventClick($event, evt)"
              @pointerdown="startDrag($event, evt, 'move', false)"
            >
              <span
                v-if="!isAllDay(evt) && day.iso === evt.date"
                class="uid-calendar__event-time"
              >{{ evt.time }}</span>
              <span class="uid-calendar__event-label">{{ !isMultiDay(evt) || day.iso === evt.date || day.date.getDay() === 1 ? evt.title : '\u00a0' }}</span>
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
        <span class="uid-calendar__gutter" />
        <button
          v-for="iso in gridDays"
          :key="iso"
          type="button"
          class="uid-calendar__tg-day"
          :class="{ 'uid-calendar__tg-day--today': iso === todayISO }"
          @click="view === 'week' ? openDay(iso) : selectDay(iso)"
        >
          <span class="uid-calendar__tg-weekday">{{ locale.datePicker.weekdaysShort[(fromISO(iso).getDay() + 6) % 7] }}</span>
          <span class="uid-calendar__tg-date">{{ fromISO(iso).getDate() }}</span>
        </button>
      </div>
      <div class="uid-calendar__allday">
        <span class="uid-calendar__gutter uid-calendar__gutter-label">{{ L.allDay }}</span>
        <div
          v-for="(list, i) in allDayRow"
          :key="gridDays[i]"
          class="uid-calendar__allday-cell"
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
            @click="onEventClick($event, evt)"
            @pointerdown="startDrag($event, evt, 'move', false)"
          >
            <span class="uid-calendar__event-label">{{ evt.title }}</span>
          </button>
        </div>
      </div>
      <div
        ref="body"
        class="uid-calendar__tg-body"
      >
        <div class="uid-calendar__tg-inner">
          <div class="uid-calendar__gutter uid-calendar__hours">
            <span
              v-for="h in hours"
              :key="h"
              class="uid-calendar__hour"
            >{{ h === 0 ? '' : formatTime(h * 60) }}</span>
          </div>
          <div
            v-for="(iso, i) in gridDays"
            :key="iso"
            class="uid-calendar__col"
            :class="{ 'uid-calendar__col--today': iso === todayISO }"
            :data-date="iso"
            @click="onSlotClick($event, iso)"
          >
            <div
              v-if="iso === todayISO"
              class="uid-calendar__now"
              :style="{ top: `${(nowMinutes / 60) * hourPx}px` }"
            />
            <div
              v-for="(b, j) in blocks[i]"
              :key="b.event.id ?? `${iso}-${j}`"
              class="uid-calendar__block"
              :class="{
                'uid-calendar__block--dragging': !!drag?.active && real(b.event) === drag.event,
                'uid-calendar__block--short': b.end - b.start < 45,
              }"
              :style="blockStyle(b)"
              role="button"
              tabindex="0"
              :title="`${timeLabel(b.event)} ${b.event.title}`"
              @click="onEventClick($event, b.event)"
              @keydown.enter.prevent="emit('event-click', real(b.event))"
              @pointerdown="startDrag($event, b.event, 'move', true)"
            >
              <span class="uid-calendar__block-time">{{ timeLabel(b.event) }}</span>
              <span class="uid-calendar__block-title">{{ b.event.title }}</span>
              <span
                v-if="editable"
                class="uid-calendar__resize"
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
            @click="openDay(c.iso); selectDay(c.iso)"
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
