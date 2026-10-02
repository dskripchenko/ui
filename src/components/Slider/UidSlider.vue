<script setup lang="ts">
import './UidSlider.css'
import { computed, useId } from 'vue'

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
  /**
   * Accessible name for the slider handle, independent of the visible `label`
   * (e.g. when the visible caption lives elsewhere or is not descriptive enough).
   */
  ariaLabel?: string
  /** Id(s) of the element(s) that label the slider handle. Takes precedence over `ariaLabel`/`label`. */
  ariaLabelledby?: string
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
  ariaLabel: undefined,
  ariaLabelledby: undefined,
})

const inputId = useId()

const handleAriaLabel = computed(() =>
  props.ariaLabelledby ? undefined : (props.ariaLabel ?? props.label),
)

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
        :for="inputId"
      >{{ label }}</label>
      <span
        v-if="showValue"
        class="uid-slider__value"
        aria-live="polite"
      >{{ displayValue }}</span>
    </div>

    <input
      :id="inputId"
      v-model.number="model"
      class="uid-slider__input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="handleAriaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-valuetext="formatValue ? displayValue : undefined"
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
