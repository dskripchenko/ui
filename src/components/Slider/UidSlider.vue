<script setup lang="ts">
import './UidSlider.css'
import { computed } from 'vue'

export interface UidSliderMark {
  value: number
  label?: string
}

export type UidSliderMarks = number[] | Record<number, string> | UidSliderMark[]

export interface UidSliderProps {
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: string
  showValue?: boolean
  formatValue?: (val: number) => string
  marks?: UidSliderMarks
}

const props = withDefaults(defineProps<UidSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  label: undefined,
  showValue: false,
  formatValue: undefined,
  marks: undefined,
})

const model = defineModel<number>({ default: 0 })

const fillPercent = computed(() =>
  ((model.value - props.min) / (props.max - props.min)) * 100,
)

const range = computed(() => props.max - props.min)

const normalizedMarks = computed(() => {
  const raw = props.marks
  if (!raw || range.value <= 0) return []
  const list: UidSliderMark[] = Array.isArray(raw)
    ? raw.map((m) => (typeof m === 'number' ? { value: m } : m))
    : Object.keys(raw).map((k) => ({ value: Number(k), label: raw[Number(k)] }))
  return list
    .filter((m) => Number.isFinite(m.value) && m.value >= props.min && m.value <= props.max)
    .sort((a, b) => a.value - b.value)
    .map((m) => ({
      value: m.value,
      label: m.label ?? (props.formatValue ? props.formatValue(m.value) : String(m.value)),
      percent: ((m.value - props.min) / range.value) * 100,
    }))
})

function selectMark(value: number): void {
  if (props.disabled || model.value === value) return
  model.value = value
}

const displayValue = computed(() =>
  props.formatValue ? props.formatValue(model.value) : String(model.value),
)
</script>

<template>
  <div
    class="uid-slider"
    :class="{ 'uid-slider--disabled': disabled, 'uid-slider--marked': normalizedMarks.length > 0 }"
  >
    <div
      v-if="label || showValue"
      class="uid-slider__header"
    >
      <label
        v-if="label"
        class="uid-slider__label"
      >{{ label }}</label>
      <span
        v-if="showValue"
        class="uid-slider__value"
        aria-live="polite"
      >{{ displayValue }}</span>
    </div>

    <input
      v-model.number="model"
      class="uid-slider__input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="model"
      :style="{ '--_fill': `${fillPercent}%` }"
    >

    <div
      v-if="normalizedMarks.length"
      class="uid-slider__marks"
    >
      <button
        v-for="mark in normalizedMarks"
        :key="mark.value"
        type="button"
        class="uid-slider__mark"
        :class="{ 'uid-slider__mark--active': mark.value <= model }"
        :style="{ '--_pos': mark.percent / 100 }"
        :disabled="disabled"
        tabindex="-1"
        @click="selectMark(mark.value)"
      >
        <span
          class="uid-slider__mark-tick"
          aria-hidden="true"
        />
        <span class="uid-slider__mark-label">{{ mark.label }}</span>
      </button>
    </div>
  </div>
</template>
