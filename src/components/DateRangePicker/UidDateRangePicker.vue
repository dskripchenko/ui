<script setup lang="ts">
import './UidDateRangePicker.css'
import { computed, onUnmounted, ref, watch } from 'vue'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import { useFloatingPanel } from '../../composables/useFloatingPanel.js'

// Dates are 'YYYY-MM-DD'; with `withTime` they are 'YYYY-MM-DDTHH:mm' (local time).
export interface DateRange {
  start: string | null
  end: string | null
}

export interface DateRangePreset {
  label: string
  range: () => DateRange
}

export interface UidDateRangePickerProps {
  min?: string
  max?: string
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  format?: (date: Date) => string
  // Adds start/end time inputs; picked days default to 00:00 and 23:59.
  withTime?: boolean
  // Omitted: built-in last 7/30/90 days. `false` or `[]` hides the presets.
  presets?: DateRangePreset[] | false
}

const props = withDefaults(defineProps<UidDateRangePickerProps>(), {
  min: undefined,
  max: undefined,
  disabled: false,
  clearable: true,
  format: undefined,
  withTime: false,
  presets: undefined,
})

const locale = useLocale()
const placeholderText = computed(() => props.placeholder ?? locale.value.dateRangePicker.placeholder)

const emit = defineEmits<{
  change: [value: DateRange]
}>()

const model = defineModel<DateRange>({
  default: () => ({ start: null, end: null }),
})

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const { panelStyle, containsTarget } = useFloatingPanel(triggerRef, panelRef, isOpen)

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

const draftStart = ref<string | null>(null)
const hoverDate = ref<string | null>(null)

const MONTHS = computed(() => locale.value.datePicker.months)
const WEEKDAYS = computed(() => locale.value.datePicker.weekdaysShort)

const DEFAULT_START_TIME = '00:00'
const DEFAULT_END_TIME = '23:59'

function datePart(s: string): string {
  return s.slice(0, 10)
}

function timePart(s: string | null): string | null {
  if (!s || s.length < 16) return null
  return s.slice(11, 16)
}

function withTimeOf(date: string, time: string): string {
  return `${datePart(date)}T${time}`
}

function parseISO(s: string): Date {
  return new Date(`${datePart(s)}T${timePart(s) ?? '00:00'}:00`)
}

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDisplay(s: string): string {
  if (props.format) return props.format(parseISO(s))
  const d = parseISO(s)
  const date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
  const time = props.withTime ? timePart(s) : null
  return time ? `${date} ${time}` : date
}

const startDay = computed(() => (model.value.start ? datePart(model.value.start) : null))
const endDay = computed(() => (model.value.end ? datePart(model.value.end) : null))

const displayValue = computed(() => {
  if (!model.value.start && !model.value.end) return ''
  const s = model.value.start ? formatDisplay(model.value.start) : '...'
  const e = model.value.end ? formatDisplay(model.value.end) : '...'
  return `${s} — ${e}`
})

interface CalendarDay {
  date: Date
  iso: string
  current: boolean
  monthOffset: number
}

function buildMonth(year: number, month: number, monthOffset: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7

  const days: CalendarDay[] = []
  for (let i = startOffset; i > 0; i--) {
    const d = new Date(year, month, 1 - i)
    days.push({ date: d, iso: toISO(d), current: false, monthOffset })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    days.push({ date, iso: toISO(date), current: true, monthOffset })
  }
  let next = 1
  while (days.length < 42) {
    const d = new Date(year, month + 1, next++)
    days.push({ date: d, iso: toISO(d), current: false, monthOffset })
  }
  return days
}

const leftMonth = computed(() => buildMonth(viewYear.value, viewMonth.value, 0))
const rightMonth = computed(() => {
  const m = viewMonth.value === 11 ? 0 : viewMonth.value + 1
  const y = viewMonth.value === 11 ? viewYear.value + 1 : viewYear.value
  return buildMonth(y, m, 1)
})

const leftLabel = computed(() => `${MONTHS.value[viewMonth.value]} ${viewYear.value}`)
const rightLabel = computed(() => {
  const m = viewMonth.value === 11 ? 0 : viewMonth.value + 1
  const y = viewMonth.value === 11 ? viewYear.value + 1 : viewYear.value
  return `${MONTHS.value[m]} ${y}`
})

const todayISO = computed(() => toISO(today))

function isDisabled(iso: string): boolean {
  if (props.min && iso < datePart(props.min)) return true
  if (props.max && iso > datePart(props.max)) return true
  return false
}

function isInRange(iso: string): boolean {
  const start = draftStart.value ?? startDay.value
  const end = draftStart.value ? hoverDate.value : endDay.value
  if (!start || !end) return false
  const [a, b] = start <= end ? [start, end] : [end, start]
  return iso > a && iso < b
}

function isStart(iso: string): boolean {
  const start = draftStart.value ?? startDay.value
  if (!start) return false
  if (draftStart.value && hoverDate.value) {
    return iso === (start <= hoverDate.value ? start : hoverDate.value)
  }
  return iso === start
}

function isEnd(iso: string): boolean {
  if (draftStart.value && hoverDate.value) {
    const start = draftStart.value
    return iso === (start <= hoverDate.value ? hoverDate.value : start)
  }
  return iso === endDay.value
}

function open(): void {
  if (props.disabled) return
  draftStart.value = null
  hoverDate.value = null
  if (model.value.start) {
    const d = parseISO(model.value.start)
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth()
  }
  isOpen.value = true
}

function close(): void {
  isOpen.value = false
  draftStart.value = null
  hoverDate.value = null
}

function toggle(): void {
  if (isOpen.value) close(); else open()
}

function selectDay(day: CalendarDay): void {
  if (isDisabled(day.iso) || !day.current) return
  if (!draftStart.value) {
    draftStart.value = day.iso
    return
  }
  const [start, end] = draftStart.value <= day.iso
    ? [draftStart.value, day.iso]
    : [day.iso, draftStart.value]
  if (props.withTime) {
    commit({
      start: withTimeOf(start, timePart(model.value.start) ?? DEFAULT_START_TIME),
      end: withTimeOf(end, timePart(model.value.end) ?? DEFAULT_END_TIME),
    })
    draftStart.value = null
    hoverDate.value = null
    return
  }
  commit({ start, end })
  close()
  triggerRef.value?.focus()
}

function commit(next: DateRange): void {
  model.value = next
  emit('change', next)
}

function onTimeInput(edge: 'start' | 'end', e: Event): void {
  const value = (e.target as HTMLInputElement).value
  const current = model.value[edge]
  if (!current || !/^\d{2}:\d{2}/.test(value)) return
  commit({ ...model.value, [edge]: withTimeOf(current, value.slice(0, 5)) })
}

function onDayHover(iso: string): void {
  if (draftStart.value) hoverDate.value = iso
}

function prevMonth(): void {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

function nextMonth(): void {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

function clearValue(e: MouseEvent): void {
  e.stopPropagation()
  const next: DateRange = { start: null, end: null }
  model.value = next
  emit('change', next)
}

function lastDays(days: number): DateRange {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days + 1)
  return { start: toISO(start), end: toISO(end) }
}

const presetList = computed<DateRangePreset[]>(() => {
  if (props.presets === false) return []
  if (props.presets) return props.presets
  return [7, 30, 90].map((days) => ({
    label: locale.value.dateRangePicker.presetLast(days),
    range: () => lastDays(days),
  }))
})

function selectPreset(preset: DateRangePreset): void {
  const range = preset.range()
  const next: DateRange = props.withTime
    ? {
        start: range.start && !timePart(range.start) ? withTimeOf(range.start, DEFAULT_START_TIME) : range.start,
        end: range.end && !timePart(range.end) ? withTimeOf(range.end, DEFAULT_END_TIME) : range.end,
      }
    : range
  commit(next)
  close()
}

function onOutsideClick(e: PointerEvent): void {
  const target = e.target as Node
  if (!containerRef.value?.contains(target) && !containsTarget(target)) close()
}

watch(isOpen, (val) => {
  if (val) document.addEventListener('pointerdown', onOutsideClick)
  else document.removeEventListener('pointerdown', onOutsideClick)
})

function onTriggerKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
  else if (e.key === 'Escape' && isOpen.value) { e.stopPropagation(); close() }
}

onUnmounted(() => document.removeEventListener('pointerdown', onOutsideClick))
</script>

<template>
  <div
    ref="containerRef"
    class="uid-daterange"
    :class="{ 'uid-daterange--open': isOpen, 'uid-daterange--disabled': disabled }"
  >
    <div
      ref="triggerRef"
      class="uid-daterange__trigger"
      role="combobox"
      tabindex="0"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :aria-label="placeholderText"
      :aria-disabled="disabled"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <UidIcon
        :icon="Calendar"
        :size="16"
        class="uid-daterange__icon"
        aria-hidden="true"
      />
      <span
        class="uid-daterange__value"
        :class="{ 'uid-daterange__value--placeholder': !model.start && !model.end }"
      >
        {{ displayValue || placeholderText }}
      </span>
      <button
        v-if="clearable && (model.start || model.end)"
        type="button"
        class="uid-daterange__clear"
        :aria-label="locale.common.clear"
        @click="clearValue"
      >
        ×
      </button>
    </div>

    <Teleport to="body">
      <Transition name="uid-daterange-panel">
        <div
          v-if="isOpen"
          ref="panelRef"
          class="uid-daterange__panel"
          :style="panelStyle"
          role="dialog"
          aria-label="Выбор диапазона дат"
        >
          <div class="uid-daterange__months">
            <div class="uid-daterange__month">
              <div class="uid-daterange__nav">
                <button
                  type="button"
                  class="uid-daterange__nav-btn uid-daterange__nav-btn--prev"
                  :aria-label="locale.datePicker.prevMonth"
                  @click="prevMonth"
                >
                  <UidIcon
                    :icon="ChevronLeft"
                    :size="16"
                  />
                </button>
                <span class="uid-daterange__month-label">{{ leftLabel }}</span>
                <button
                  type="button"
                  class="uid-daterange__nav-btn uid-daterange__nav-btn--next"
                  :aria-label="locale.datePicker.nextMonth"
                  @click="nextMonth"
                >
                  <UidIcon
                    :icon="ChevronRight"
                    :size="16"
                  />
                </button>
              </div>
              <div class="uid-daterange__grid">
                <span
                  v-for="wd in WEEKDAYS"
                  :key="wd"
                  class="uid-daterange__weekday"
                >{{ wd }}</span>
                <button
                  v-for="day in leftMonth"
                  :key="day.iso"
                  type="button"
                  class="uid-daterange__day"
                  :class="{
                    'uid-daterange__day--other': !day.current,
                    'uid-daterange__day--today': day.iso === todayISO,
                    'uid-daterange__day--start': isStart(day.iso),
                    'uid-daterange__day--end': isEnd(day.iso),
                    'uid-daterange__day--in-range': isInRange(day.iso),
                    'uid-daterange__day--disabled': isDisabled(day.iso),
                  }"
                  :disabled="isDisabled(day.iso) || !day.current"
                  @click="selectDay(day)"
                  @mouseenter="onDayHover(day.iso)"
                >
                  {{ day.date.getDate() }}
                </button>
              </div>
            </div>

            <div class="uid-daterange__month">
              <div class="uid-daterange__nav">
                <button
                  type="button"
                  class="uid-daterange__nav-btn uid-daterange__nav-btn--prev"
                  :aria-label="locale.datePicker.prevMonth"
                  @click="prevMonth"
                >
                  <UidIcon
                    :icon="ChevronLeft"
                    :size="16"
                  />
                </button>
                <span class="uid-daterange__month-label">{{ rightLabel }}</span>
                <button
                  type="button"
                  class="uid-daterange__nav-btn uid-daterange__nav-btn--next"
                  :aria-label="locale.datePicker.nextMonth"
                  @click="nextMonth"
                >
                  <UidIcon
                    :icon="ChevronRight"
                    :size="16"
                  />
                </button>
              </div>
              <div class="uid-daterange__grid">
                <span
                  v-for="wd in WEEKDAYS"
                  :key="wd"
                  class="uid-daterange__weekday"
                >{{ wd }}</span>
                <button
                  v-for="day in rightMonth"
                  :key="day.iso"
                  type="button"
                  class="uid-daterange__day"
                  :class="{
                    'uid-daterange__day--other': !day.current,
                    'uid-daterange__day--today': day.iso === todayISO,
                    'uid-daterange__day--start': isStart(day.iso),
                    'uid-daterange__day--end': isEnd(day.iso),
                    'uid-daterange__day--in-range': isInRange(day.iso),
                    'uid-daterange__day--disabled': isDisabled(day.iso),
                  }"
                  :disabled="isDisabled(day.iso) || !day.current"
                  @click="selectDay(day)"
                  @mouseenter="onDayHover(day.iso)"
                >
                  {{ day.date.getDate() }}
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="withTime"
            class="uid-daterange__times"
          >
            <label class="uid-daterange__time-field">
              <span class="uid-daterange__time-label">{{ locale.dateRangePicker.startTime ?? 'Start time' }}</span>
              <input
                type="time"
                class="uid-daterange__time uid-daterange__time--start"
                :value="timePart(model.start) ?? ''"
                :disabled="!model.start"
                @change="onTimeInput('start', $event)"
              >
            </label>
            <label class="uid-daterange__time-field">
              <span class="uid-daterange__time-label">{{ locale.dateRangePicker.endTime ?? 'End time' }}</span>
              <input
                type="time"
                class="uid-daterange__time uid-daterange__time--end"
                :value="timePart(model.end) ?? ''"
                :disabled="!model.end"
                @change="onTimeInput('end', $event)"
              >
            </label>
          </div>

          <div
            v-if="presetList.length"
            class="uid-daterange__footer"
          >
            <button
              v-for="preset in presetList"
              :key="preset.label"
              type="button"
              class="uid-daterange__btn"
              @click="selectPreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
