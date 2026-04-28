<script setup lang="ts">
import './UidCalendar.css'
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'

export interface CalendarEvent {
  id?: string | number
  date: string
  title: string
  color?: string
}

export interface UidCalendarProps {
  events?: CalendarEvent[]
  min?: string
  max?: string
  compact?: boolean
  maxEventsPerDay?: number
  todayLabel?: string
}

const props = withDefaults(defineProps<UidCalendarProps>(), {
  events: () => [],
  compact: false,
  maxEventsPerDay: 3,
})

const emit = defineEmits<{
  'event-click': [event: CalendarEvent]
  'date-click': [iso: string]
  change: [iso: string | null]
}>()

const model = defineModel<string | null>({ default: null })
const locale = useLocale()

const today = new Date()
const todayISO = computeISO(today)

const viewYear = ref(model.value ? parseISO(model.value).getFullYear() : today.getFullYear())
const viewMonth = ref(model.value ? parseISO(model.value).getMonth() : today.getMonth())

function parseISO(s: string): Date { return new Date(`${s}T00:00:00`) }
function computeISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const monthLabel = computed(() => `${locale.value.datePicker.months[viewMonth.value]} ${viewYear.value}`)
const todayBtnLabel = computed(() => props.todayLabel ?? 'Сегодня')

interface Day {
  date: Date
  iso: string
  current: boolean
  events: CalendarEvent[]
}

const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>()
  for (const e of props.events) {
    const list = map.get(e.date) ?? []
    list.push(e)
    map.set(e.date, list)
  }
  return map
})

const days = computed<Day[]>(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const result: Day[] = []
  for (let i = startOffset; i > 0; i--) {
    const d = new Date(viewYear.value, viewMonth.value, 1 - i)
    const iso = computeISO(d)
    result.push({ date: d, iso, current: false, events: eventsByDate.value.get(iso) ?? [] })
  }
  for (let dn = 1; dn <= lastDay.getDate(); dn++) {
    const d = new Date(viewYear.value, viewMonth.value, dn)
    const iso = computeISO(d)
    result.push({ date: d, iso, current: true, events: eventsByDate.value.get(iso) ?? [] })
  }
  let n = 1
  while (result.length < 42) {
    const d = new Date(viewYear.value, viewMonth.value + 1, n++)
    const iso = computeISO(d)
    result.push({ date: d, iso, current: false, events: eventsByDate.value.get(iso) ?? [] })
  }
  return result
})

function isDisabled(iso: string): boolean {
  if (props.min && iso < props.min) return true
  if (props.max && iso > props.max) return true
  return false
}

function prevMonth(): void {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

function nextMonth(): void {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

function goToday(): void {
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth()
}

function selectDay(day: Day): void {
  if (isDisabled(day.iso)) return
  model.value = day.iso
  emit('date-click', day.iso)
  emit('change', day.iso)
}

function onEventClick(e: MouseEvent, evt: CalendarEvent): void {
  e.stopPropagation()
  emit('event-click', evt)
}
</script>

<template>
  <div
    class="uid-calendar"
    :class="{ 'uid-calendar--compact': compact }"
  >
    <div class="uid-calendar__header">
      <span class="uid-calendar__title">{{ monthLabel }}</span>
      <div class="uid-calendar__nav">
        <button
          type="button"
          class="uid-calendar__btn uid-calendar__btn--icon"
          :aria-label="locale.datePicker.prevMonth"
          @click="prevMonth"
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
          :aria-label="locale.datePicker.nextMonth"
          @click="nextMonth"
        >
          <UidIcon
            :icon="ChevronRight"
            :size="14"
          />
        </button>
      </div>
    </div>

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
        :tabindex="!isDisabled(day.iso) ? 0 : -1"
        role="button"
        :aria-current="day.iso === todayISO ? 'date' : undefined"
        :aria-selected="day.iso === model"
        :aria-label="day.iso"
        @click="selectDay(day)"
        @keydown.enter.prevent="selectDay(day)"
        @keydown.space.prevent="selectDay(day)"
      >
        <span class="uid-calendar__date">{{ day.date.getDate() }}</span>
        <div class="uid-calendar__events">
          <button
            v-for="(evt, i) in day.events.slice(0, maxEventsPerDay)"
            :key="evt.id ?? `${day.iso}-${i}`"
            type="button"
            class="uid-calendar__event"
            :style="evt.color ? { '--uid-event-color': evt.color } : undefined"
            :title="evt.title"
            @click="onEventClick($event, evt)"
          >
            <span class="uid-calendar__event-label">{{ evt.title }}</span>
          </button>
          <span
            v-if="day.events.length > maxEventsPerDay"
            class="uid-calendar__more"
          >+{{ day.events.length - maxEventsPerDay }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
