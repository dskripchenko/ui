<script setup lang="ts">
import './UidProgressRing.css'
import { computed } from 'vue'

export type RingTone = 'primary' | 'success' | 'warning' | 'danger' | 'info'

export interface UidProgressRingProps {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  tone?: RingTone
  showLabel?: boolean
  indeterminate?: boolean
  formatLabel?: (value: number, max: number) => string
}

const props = withDefaults(defineProps<UidProgressRingProps>(), {
  value: 0,
  max: 100,
  size: 80,
  strokeWidth: 8,
  tone: 'primary',
  showLabel: false,
  indeterminate: false,
})

defineSlots<{
  default?(): unknown
}>()

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const center = computed(() => props.size / 2)

const clampedValue = computed(() => Math.max(0, Math.min(props.max, props.value)))
const percent = computed(() => (clampedValue.value / props.max) * 100)
const offset = computed(() =>
  props.indeterminate
    ? circumference.value * 0.7
    : circumference.value * (1 - clampedValue.value / props.max),
)

const labelText = computed(() => {
  if (props.formatLabel) return props.formatLabel(clampedValue.value, props.max)
  return `${Math.round(percent.value)}%`
})

const styleVars = computed(() => ({
  ...(props.color ? { '--uid-ring-color': props.color } : {}),
  ...(props.trackColor ? { '--uid-ring-track': props.trackColor } : {}),
  '--uid-ring-label-size': `${Math.max(10, props.size * 0.18)}px`,
}))
</script>

<template>
  <div
    class="uid-progress-ring"
    :class="[
      tone !== 'primary' && `uid-progress-ring--${tone}`,
      indeterminate && 'uid-progress-ring__indeterminate',
    ]"
    :style="styleVars"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="indeterminate ? undefined : clampedValue"
  >
    <svg
      class="uid-progress-ring__svg"
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      aria-hidden="true"
    >
      <circle
        class="uid-progress-ring__track"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
      />
      <circle
        class="uid-progress-ring__progress"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
      />
    </svg>
    <div
      v-if="showLabel || $slots.default"
      class="uid-progress-ring__label"
    >
      <slot>{{ labelText }}</slot>
    </div>
  </div>
</template>
