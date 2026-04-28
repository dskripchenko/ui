<script setup lang="ts">
import './UidDateRangePicker.css'
import { computed, onUnmounted, ref, watch } from 'vue'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'

export interface DateRange {
  start: string | null
  end: string | null
}

export interface UidDateRangePickerProps {
  min?: string
  max?: string
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  format?: (date: Date) => string
}

const props = withDefaults(defineProps<UidDateRangePickerProps>(), {
  min: undefined,
  max: undefined,
  disabled: false,
  clearable: true,
  format: undefined,
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

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

const draftStart = ref<string | null>(null)
const hoverDate = ref<string | null>(null)

const MONTHS = computed(() => locale.value.datePicker.months)
const WEEKDAYS = computed(() => locale.value.datePicker.weekdaysShort)

function parseISO(s: string): Date {
  return new Date(s + 'T00:00:00')
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
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

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
  if (props.min && iso < props.min) return true
  if (props.max && iso > props.max) return true
  return false
}

function isInRange(iso: string): boolean {
  const start = draftStart.value ?? model.value.start
  const end = draftStart.value ? hoverDate.value : model.value.end
  if (!start || !end) return false
  const [a, b] = start <= end ? [start, end] : [end, start]
  return iso > a && iso < b
}

function isStart(iso: string): boolean {
  const start = draftStart.value ?? model.value.start
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
  return iso === model.value.end
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
  const next: DateRange = { start, end }
  model.value = next
  emit('change', next)
  close()
  triggerRef.value?.focus()
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

function selectPreset(days: number): void {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days + 1)
  const next: DateRange = { start: toISO(start), end: toISO(end) }
  model.value = next
  emit('change', next)
  close()
}

function onOutsideClick(e: PointerEvent): void {
  const target = e.target as Node
  if (!containerRef.value?.contains(target)) close()
}

watch(isOpen, (val) => {
  if (val) document.addEventListener('pointerdown', onOutsideClick)
  else document.removeEventListener('pointerdown', onOutsideClick)
})

function onTriggerKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
  else if (e.key === 'Escape') close()
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

    <Transition name="uid-daterange-panel">
      <div
        v-if="isOpen"
        class="uid-daterange__panel"
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

        <div class="uid-daterange__footer">
          <button
            type="button"
            class="uid-daterange__btn"
            @click="selectPreset(7)"
          >
            {{ locale.dateRangePicker.presetLast(7) }}
          </button>
          <button
            type="button"
            class="uid-daterange__btn"
            @click="selectPreset(30)"
          >
            {{ locale.dateRangePicker.presetLast(30) }}
          </button>
          <button
            type="button"
            class="uid-daterange__btn"
            @click="selectPreset(90)"
          >
            {{ locale.dateRangePicker.presetLast(90) }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
