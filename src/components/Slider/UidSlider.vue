<script setup lang="ts">
import './UidSlider.css'
import { computed } from 'vue'

export interface UidSliderProps {
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: string
  showValue?: boolean
  formatValue?: (val: number) => string
}

const props = withDefaults(defineProps<UidSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  label: undefined,
  showValue: false,
  formatValue: undefined,
})

const model = defineModel<number>({ default: 0 })

const fillPercent = computed(() =>
  ((model.value - props.min) / (props.max - props.min)) * 100,
)

const displayValue = computed(() =>
  props.formatValue ? props.formatValue(model.value) : String(model.value),
)
</script>

<template>
  <div
    class="uid-slider"
    :class="{ 'uid-slider--disabled': disabled }"
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
  </div>
</template>
