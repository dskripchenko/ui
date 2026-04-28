<script setup lang="ts">
import './UidGauge.css'
import { computed } from 'vue'

export type GaugeTone = 'primary' | 'success' | 'warning' | 'danger' | 'info'

export interface GaugeRange {
  from: number
  to: number
  color?: string
}

export interface UidGaugeProps {
  value?: number
  min?: number
  max?: number
  size?: number
  strokeWidth?: number
  ranges?: GaugeRange[]
  tone?: GaugeTone
  color?: string
  showValue?: boolean
  showLimits?: boolean
  showNeedle?: boolean
  label?: string
  suffix?: string
  precision?: number
  formatValue?: (value: number) => string
}

const props = withDefaults(defineProps<UidGaugeProps>(), {
  value: 0,
  min: 0,
  max: 100,
  size: 200,
  strokeWidth: 14,
  tone: 'primary',
  showValue: true,
  showLimits: false,
  showNeedle: false,
  precision: 0,
})

const PADDING = 4
const radius = computed(() => (props.size - props.strokeWidth) / 2 - PADDING)
const centerX = computed(() => props.size / 2)
const centerY = computed(() => props.size / 2)
const halfHeight = computed(() => props.size / 2 + props.strokeWidth / 2 + PADDING)

const arcLength = computed(() => Math.PI * radius.value)

const clampedValue = computed(() => Math.max(props.min, Math.min(props.max, props.value)))
const fraction = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return 0
  return (clampedValue.value - props.min) / range
})

const arcPath = computed(() => {
  const r = radius.value
  const cx = centerX.value
  const cy = centerY.value
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
})

const progressOffset = computed(() => arcLength.value * (1 - fraction.value))

function rangeToDashes(range: GaugeRange): { dasharray: string; dashoffset: number } {
  const total = props.max - props.min
  const a = Math.max(props.min, Math.min(props.max, range.from))
  const b = Math.max(props.min, Math.min(props.max, range.to))
  const startFrac = (a - props.min) / total
  const endFrac = (b - props.min) / total
  const startLen = arcLength.value * startFrac
  const segLen = arcLength.value * Math.max(0, endFrac - startFrac)
  return {
    dasharray: `${segLen} ${arcLength.value}`,
    dashoffset: -startLen,
  }
}

const needleAngle = computed(() => -180 + fraction.value * 180)

const formattedValue = computed(() => {
  if (props.formatValue) return props.formatValue(clampedValue.value)
  return clampedValue.value.toFixed(props.precision)
})

const styleVars = computed(() => ({
  ...(props.color ? { '--uid-gauge-color': props.color } : {}),
  '--uid-gauge-value-size': `${Math.max(14, props.size * 0.13)}px`,
}))
</script>

<template>
  <div
    class="uid-gauge"
    :class="tone !== 'primary' && `uid-gauge--${tone}`"
    :style="styleVars"
    role="meter"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="clampedValue"
    :aria-label="label"
  >
    <svg
      class="uid-gauge__svg"
      :width="size"
      :height="halfHeight"
      :viewBox="`0 0 ${size} ${halfHeight}`"
      aria-hidden="true"
    >
      <path
        class="uid-gauge__track"
        :d="arcPath"
        :stroke-width="strokeWidth"
      />

      <template v-if="ranges && ranges.length">
        <path
          v-for="(r, i) in ranges"
          :key="i"
          class="uid-gauge__range"
          :d="arcPath"
          :stroke="r.color || 'var(--uid-color-primary-subtle)'"
          :stroke-width="strokeWidth"
          :stroke-dasharray="rangeToDashes(r).dasharray"
          :stroke-dashoffset="rangeToDashes(r).dashoffset"
        />
      </template>

      <path
        v-if="!ranges || ranges.length === 0"
        class="uid-gauge__progress"
        :d="arcPath"
        :stroke-width="strokeWidth"
        :stroke-dasharray="arcLength"
        :stroke-dashoffset="progressOffset"
      />

      <g v-if="showNeedle">
        <line
          class="uid-gauge__needle"
          :x1="centerX"
          :y1="centerY"
          :x2="centerX + radius - strokeWidth"
          :y2="centerY"
          :transform="`rotate(${needleAngle} ${centerX} ${centerY})`"
        />
        <circle
          class="uid-gauge__needle-pivot"
          :cx="centerX"
          :cy="centerY"
          r="4"
        />
      </g>
    </svg>

    <div
      v-if="showValue || label"
      class="uid-gauge__content"
    >
      <div
        v-if="showValue"
        class="uid-gauge__value"
      >
        <span>{{ formattedValue }}</span>
        <span
          v-if="suffix"
          class="uid-gauge__suffix"
        >{{ suffix }}</span>
      </div>
      <div
        v-if="label"
        class="uid-gauge__label"
      >{{ label }}</div>
    </div>

    <div
      v-if="showLimits"
      class="uid-gauge__limits"
    >
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>
