<script setup lang="ts">
import './UidTimePicker.css'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { Clock } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'

export interface UidTimePickerProps {
  step?: number
  withSeconds?: boolean
  hour12?: boolean
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<UidTimePickerProps>(), {
  step: 5,
  withSeconds: false,
  hour12: false,
  disabled: false,
  clearable: true,
})

const locale = useLocale()
const placeholderText = computed(() => props.placeholder ?? locale.value.timePicker.placeholder)

const emit = defineEmits<{
  change: [value: string | null]
}>()

const model = defineModel<string | null>({ default: null })

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const hourColRef = ref<HTMLElement | null>(null)
const minuteColRef = ref<HTMLElement | null>(null)
const secondColRef = ref<HTMLElement | null>(null)

interface Parts {
  h: number
  m: number
  s: number
}

function parseTime(s: string | null): Parts {
  if (!s) return { h: 0, m: 0, s: 0 }
  const [hh = '0', mm = '0', ss = '0'] = s.split(':')
  return { h: Number(hh) || 0, m: Number(mm) || 0, s: Number(ss) || 0 }
}

function formatTime(p: Parts): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return props.withSeconds ? `${pad(p.h)}:${pad(p.m)}:${pad(p.s)}` : `${pad(p.h)}:${pad(p.m)}`
}

const draft = ref<Parts>(parseTime(model.value))

watch(() => model.value, (v) => { draft.value = parseTime(v) })

const hours = computed(() => {
  if (props.hour12) return Array.from({ length: 12 }, (_, i) => i + 1)
  return Array.from({ length: 24 }, (_, i) => i)
})

const minutes = computed(() =>
  Array.from({ length: Math.ceil(60 / props.step) }, (_, i) => i * props.step),
)

const seconds = computed(() =>
  Array.from({ length: Math.ceil(60 / props.step) }, (_, i) => i * props.step),
)

const displayValue = computed(() => {
  if (!model.value) return ''
  const p = parseTime(model.value)
  if (!props.hour12) return formatTime(p)
  const period = p.h >= 12 ? 'PM' : 'AM'
  const h12 = p.h % 12 || 12
  const pad = (n: number) => String(n).padStart(2, '0')
  return props.withSeconds
    ? `${pad(h12)}:${pad(p.m)}:${pad(p.s)} ${period}`
    : `${pad(h12)}:${pad(p.m)} ${period}`
})

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function open(): void {
  if (props.disabled) return
  draft.value = parseTime(model.value)
  isOpen.value = true
}

function close(): void {
  isOpen.value = false
}

function toggle(): void {
  if (isOpen.value) close(); else open()
}

function selectHour(h: number): void {
  draft.value = { ...draft.value, h }
}

function selectMinute(m: number): void {
  draft.value = { ...draft.value, m }
}

function selectSecond(s: number): void {
  draft.value = { ...draft.value, s }
}

function commit(): void {
  const v = formatTime(draft.value)
  model.value = v
  emit('change', v)
  close()
  triggerRef.value?.focus()
}

function setNow(): void {
  const now = new Date()
  const stepMs = props.step
  draft.value = {
    h: now.getHours(),
    m: Math.floor(now.getMinutes() / stepMs) * stepMs,
    s: props.withSeconds ? Math.floor(now.getSeconds() / stepMs) * stepMs : 0,
  }
}

function clearValue(e: MouseEvent): void {
  e.stopPropagation()
  model.value = null
  emit('change', null)
}

function onOutsideClick(e: PointerEvent): void {
  const target = e.target as Node
  if (!containerRef.value?.contains(target)) close()
}

function onTriggerKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
  else if (e.key === 'Escape') close()
}

function onColumnKeydown(e: KeyboardEvent, field: 'h' | 'm' | 's', list: number[]): void {
  const current = draft.value[field]
  const idx = list.indexOf(current)
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const next = list[Math.min(list.length - 1, idx + 1)]
    draft.value = { ...draft.value, [field]: next }
    focusCell(field, next)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const next = list[Math.max(0, idx - 1)]
    draft.value = { ...draft.value, [field]: next }
    focusCell(field, next)
  } else if (e.key === 'Home') {
    e.preventDefault()
    draft.value = { ...draft.value, [field]: list[0] }
    focusCell(field, list[0])
  } else if (e.key === 'End') {
    e.preventDefault()
    const last = list[list.length - 1]
    draft.value = { ...draft.value, [field]: last }
    focusCell(field, last)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    commit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
    triggerRef.value?.focus()
  }
}

function focusCell(field: 'h' | 'm' | 's', value: number): void {
  const refMap = { h: hourColRef, m: minuteColRef, s: secondColRef }
  const col = refMap[field].value
  if (!col) return
  nextTick(() => {
    const list = field === 'h' ? hours.value : field === 'm' ? minutes.value : seconds.value
    const idx = list.indexOf(value)
    const cell = col.querySelectorAll<HTMLElement>('.uid-timepicker__cell')[idx]
    cell?.focus()
    if (cell) {
      const offset = cell.offsetTop - col.clientHeight / 2 + cell.clientHeight / 2
      col.scrollTop = offset
    }
  })
}

function scrollToSelected(): void {
  nextTick(() => {
    const scroll = (col: HTMLElement | null, value: number, list: number[]) => {
      if (!col) return
      const idx = list.indexOf(value)
      if (idx < 0) return
      const cell = col.querySelectorAll<HTMLElement>('.uid-timepicker__cell')[idx]
      if (cell) col.scrollTop = cell.offsetTop - col.clientHeight / 2 + cell.clientHeight / 2
    }
    scroll(hourColRef.value, draft.value.h, hours.value)
    scroll(minuteColRef.value, draft.value.m, minutes.value)
    if (props.withSeconds) scroll(secondColRef.value, draft.value.s, seconds.value)
  })
}

watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('pointerdown', onOutsideClick)
    scrollToSelected()
  } else {
    document.removeEventListener('pointerdown', onOutsideClick)
  }
})

onUnmounted(() => document.removeEventListener('pointerdown', onOutsideClick))
</script>

<template>
  <div
    ref="containerRef"
    class="uid-timepicker"
    :class="{ 'uid-timepicker--open': isOpen, 'uid-timepicker--disabled': disabled }"
  >
    <div
      ref="triggerRef"
      class="uid-timepicker__trigger"
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
        :icon="Clock"
        :size="16"
        class="uid-timepicker__icon"
        aria-hidden="true"
      />
      <span
        class="uid-timepicker__value"
        :class="{ 'uid-timepicker__value--placeholder': !model }"
      >
        {{ model ? displayValue : placeholderText }}
      </span>
      <button
        v-if="clearable && model"
        type="button"
        class="uid-timepicker__clear"
        :aria-label="locale.common.clear"
        @click="clearValue"
      >
        ×
      </button>
    </div>

    <Transition name="uid-timepicker-panel">
      <div
        v-if="isOpen"
        class="uid-timepicker__panel"
        role="dialog"
        aria-label="Выбор времени"
      >
        <div class="uid-timepicker__columns">
          <div
            ref="hourColRef"
            class="uid-timepicker__column"
            role="listbox"
            aria-label="Часы"
            @keydown="onColumnKeydown($event, 'h', hours)"
          >
            <button
              v-for="h in hours"
              :key="h"
              type="button"
              class="uid-timepicker__cell"
              :class="{ 'uid-timepicker__cell--selected': draft.h === h }"
              role="option"
              :aria-selected="draft.h === h"
              :tabindex="draft.h === h ? 0 : -1"
              @click="selectHour(h)"
            >
              {{ pad(h) }}
            </button>
          </div>
          <div
            ref="minuteColRef"
            class="uid-timepicker__column"
            role="listbox"
            aria-label="Минуты"
            @keydown="onColumnKeydown($event, 'm', minutes)"
          >
            <button
              v-for="m in minutes"
              :key="m"
              type="button"
              class="uid-timepicker__cell"
              :class="{ 'uid-timepicker__cell--selected': draft.m === m }"
              role="option"
              :aria-selected="draft.m === m"
              :tabindex="draft.m === m ? 0 : -1"
              @click="selectMinute(m)"
            >
              {{ pad(m) }}
            </button>
          </div>
          <div
            v-if="withSeconds"
            ref="secondColRef"
            class="uid-timepicker__column"
            role="listbox"
            aria-label="Секунды"
            @keydown="onColumnKeydown($event, 's', seconds)"
          >
            <button
              v-for="s in seconds"
              :key="s"
              type="button"
              class="uid-timepicker__cell"
              :class="{ 'uid-timepicker__cell--selected': draft.s === s }"
              role="option"
              :aria-selected="draft.s === s"
              :tabindex="draft.s === s ? 0 : -1"
              @click="selectSecond(s)"
            >
              {{ pad(s) }}
            </button>
          </div>
        </div>

        <div class="uid-timepicker__footer">
          <button
            type="button"
            class="uid-timepicker__btn"
            @click="setNow"
          >
            {{ locale.timePicker.now }}
          </button>
          <button
            type="button"
            class="uid-timepicker__btn uid-timepicker__btn--primary"
            @click="commit"
          >
            {{ locale.timePicker.confirm }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
