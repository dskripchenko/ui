<script setup lang="ts">
import './UidProgress.css'
import { computed } from 'vue'
import type { Tone } from '../../types/index.js'

export type UidProgressVariant = Tone | 'default'

export interface UidProgressProps {
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: UidProgressVariant
  label?: string
  showValue?: boolean
}

const props = withDefaults(defineProps<UidProgressProps>(), {
  value: undefined,
  max: 100,
  size: 'md',
  variant: 'default',
  label: undefined,
  showValue: false,
})

const percentage = computed<number | undefined>(() => {
  if (props.value === undefined) return undefined
  return Math.min(100, Math.max(0, (props.value / (props.max ?? 100)) * 100))
})

const isIndeterminate = computed(() => props.value === undefined)
const displayValue = computed(() =>
  percentage.value !== undefined ? `${Math.round(percentage.value)}%` : undefined,
)
</script>

<template>
  <div class="uid-progress-wrapper">
    <div
      v-if="label || (showValue && displayValue)"
      class="uid-progress-header"
    >
      <span
        v-if="label"
        class="uid-progress-label"
      >{{ label }}</span>
      <span
        v-if="showValue && displayValue"
        class="uid-progress-value"
      >{{ displayValue }}</span>
    </div>

    <div
      class="uid-progress"
      :class="[
        `uid-progress--${size}`,
        `uid-progress--${variant}`,
        isIndeterminate && 'uid-progress--indeterminate',
      ]"
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-valuenow="value"
      :aria-label="label"
    >
      <div
        v-if="!isIndeterminate"
        class="uid-progress__bar"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
