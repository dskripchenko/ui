<script setup lang="ts">
import './UidDatePicker.css'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'

export interface UidDatePickerProps {
  min?: string
  max?: string
  disabled?: boolean
  placeholder?: string
  format?: (date: Date) => string
}

const props = withDefaults(defineProps<UidDatePickerProps>(), {
  min: undefined,
  max: undefined,
  disabled: false,
  format: undefined,
})

const locale = useLocale()
const placeholderText = computed(() => props.placeholder ?? locale.value.datePicker.placeholder)
const months = computed(() => locale.value.datePicker.months)
const weekdays = computed(() => locale.value.datePicker.weekdaysShort)

const model = defineModel<string | null>({ default: null })

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const focusedISO = ref<string | null>(null)

const today = new Date()

const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

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

const displayValue = computed(() => model.value ? formatDisplay(model.value) : '')

interface CalendarDay {
  date: Date
  iso: string
  current: boolean
}

const calendarDays = computed((): CalendarDay[] => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7

  const days: CalendarDay[] = []

  for (let i = startOffset; i > 0; i--) {
    const d = new Date(viewYear.value, viewMonth.value, 1 - i)
    days.push({ date: d, iso: toISO(d), current: false })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(viewYear.value, viewMonth.value, d)
    days.push({ date, iso: toISO(date), current: true })
  }

  let next = 1
  while (days.length < 42) {
    const d = new Date(viewYear.value, viewMonth.value + 1, next++)
    days.push({ date: d, iso: toISO(d), current: false })
  }

  return days
})

const todayISO = computed(() => toISO(today))

function isDisabled(iso: string): boolean {
  if (props.min && iso < props.min) return true
  if (props.max && iso > props.max) return true
  return false
}

function open() {
  if (props.disabled) return
  if (model.value) {
    const d = parseISO(model.value)
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth()
    focusedISO.value = model.value
  } else {
    viewYear.value = today.getFullYear()
    viewMonth.value = today.getMonth()
    focusedISO.value = toISO(today)
  }
  isOpen.value = true
  nextTick(focusActiveDay)
}

function focusActiveDay(): void {
  const iso = focusedISO.value
  if (!iso || !gridRef.value) return
  const btn = gridRef.value.querySelector<HTMLElement>(`[data-iso="${iso}"]`)
  btn?.focus()
}

function moveFocus(days: number): void {
  if (!focusedISO.value) return
  const d = parseISO(focusedISO.value)
  d.setDate(d.getDate() + days)
  focusedISO.value = toISO(d)
  if (d.getFullYear() !== viewYear.value || d.getMonth() !== viewMonth.value) {
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth()
  }
  nextTick(focusActiveDay)
}

function onGridKeydown(e: KeyboardEvent): void {
  switch (e.key) {
    case 'ArrowLeft':  e.preventDefault(); moveFocus(-1); break
    case 'ArrowRight': e.preventDefault(); moveFocus(1); break
    case 'ArrowUp':    e.preventDefault(); moveFocus(-7); break
    case 'ArrowDown':  e.preventDefault(); moveFocus(7); break
    case 'Home':       e.preventDefault(); moveFocus(-((parseISO(focusedISO.value!).getDay() + 6) % 7)); break
    case 'End':        e.preventDefault(); moveFocus(6 - ((parseISO(focusedISO.value!).getDay() + 6) % 7)); break
    case 'PageUp':     e.preventDefault(); moveFocus(-30); break
    case 'PageDown':   e.preventDefault(); moveFocus(30); break
    case 'Enter':
    case ' ':
      if (focusedISO.value) {
        e.preventDefault()
        const day = calendarDays.value.find(d => d.iso === focusedISO.value)
        if (day) selectDay(day)
      }
      break
    case 'Escape':
      e.preventDefault()
      close()
      triggerRef.value?.focus()
      break
  }
}

function close() {
  isOpen.value = false
}

function toggle() {
  if (isOpen.value) close(); else open()
}

function selectDay(day: CalendarDay) {
  if (isDisabled(day.iso)) return
  model.value = day.iso
  close()
  triggerRef.value?.focus()
}

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

function clearValue(e: MouseEvent) {
  e.stopPropagation()
  model.value = null
}

function onOutsideClick(e: PointerEvent) {
  const target = e.target as Node
  if (!containerRef.value?.contains(target)) close()
}

watch(isOpen, (val) => {
  if (val) document.addEventListener('pointerdown', onOutsideClick)
  else document.removeEventListener('pointerdown', onOutsideClick)
})

function onTriggerKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
  else if (e.key === 'Escape') close()
}

onUnmounted(() => document.removeEventListener('pointerdown', onOutsideClick))
</script>

<template>
  <div
    ref="containerRef"
    class="uid-datepicker"
    :class="{ 'uid-datepicker--open': isOpen, 'uid-datepicker--disabled': disabled }"
  >
    <div
      ref="triggerRef"
      class="uid-datepicker__trigger"
      role="combobox"
      tabindex="0"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :aria-label="placeholderText"
      :aria-disabled="disabled"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span
        class="uid-datepicker__value"
        :class="{ 'uid-datepicker__value--placeholder': !model }"
      >
        {{ model ? displayValue : placeholderText }}
      </span>
      <div class="uid-datepicker__suffix">
        <button
          v-if="model"
          type="button"
          class="uid-datepicker__clear"
          :aria-label="locale.common.clear"
          @click="clearValue"
        >
          ×
        </button>
        <UidIcon
          :icon="ChevronDown"
          :size="16"
          class="uid-datepicker__chevron"
          :class="{ 'uid-datepicker__chevron--open': isOpen }"
          aria-hidden="true"
        />
      </div>
    </div>

    <Transition name="uid-datepicker-panel">
      <div
        v-if="isOpen"
        class="uid-datepicker__panel"
        role="dialog"
        aria-label="Выбор даты"
      >
        <div class="uid-datepicker__nav">
          <button
            type="button"
            class="uid-datepicker__nav-btn"
            :aria-label="locale.datePicker.prevMonth"
            @click="prevMonth"
          >
            <UidIcon
              :icon="ChevronLeft"
              :size="16"
            />
          </button>
          <span class="uid-datepicker__month-label">
            {{ months[viewMonth] }} {{ viewYear }}
          </span>
          <button
            type="button"
            class="uid-datepicker__nav-btn"
            :aria-label="locale.datePicker.nextMonth"
            @click="nextMonth"
          >
            <UidIcon
              :icon="ChevronRight"
              :size="16"
            />
          </button>
        </div>

        <div
          ref="gridRef"
          class="uid-datepicker__grid"
          @keydown="onGridKeydown"
        >
          <span
            v-for="wd in weekdays"
            :key="wd"
            class="uid-datepicker__weekday"
          >{{ wd }}</span>

          <button
            v-for="day in calendarDays"
            :key="day.iso"
            type="button"
            class="uid-datepicker__day"
            :class="{
              'uid-datepicker__day--other': !day.current,
              'uid-datepicker__day--today': day.iso === todayISO,
              'uid-datepicker__day--selected': day.iso === model,
              'uid-datepicker__day--disabled': isDisabled(day.iso),
            }"
            :data-iso="day.iso"
            :tabindex="day.iso === focusedISO ? 0 : -1"
            :disabled="isDisabled(day.iso)"
            :aria-current="day.iso === todayISO ? 'date' : undefined"
            :aria-selected="day.iso === model"
            @click="selectDay(day)"
          >
            {{ day.date.getDate() }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
