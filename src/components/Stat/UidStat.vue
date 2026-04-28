<script setup lang="ts">
import './UidStat.css'
import { computed, type Component } from 'vue'
import { ArrowUp, ArrowDown } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export type StatTone = 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type StatVariant = 'card' | 'ghost'

export interface UidStatProps {
  title?: string
  value?: number | string
  prefix?: string
  suffix?: string
  trend?: number
  trendSuffix?: string
  precision?: number
  formatter?: (value: number | string) => string
  tone?: StatTone
  variant?: StatVariant
  icon?: Component
  loading?: boolean
  footer?: string
}

const props = withDefaults(defineProps<UidStatProps>(), {
  precision: 0,
  trendSuffix: '%',
  tone: 'primary',
  variant: 'card',
})

defineSlots<{
  default?(): unknown
  icon?(): unknown
  value?(): unknown
  trend?(): unknown
  footer?(): unknown
}>()

const formattedValue = computed(() => {
  if (props.value === undefined) return ''
  if (props.formatter) return props.formatter(props.value)
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('ru-RU', {
      minimumFractionDigits: props.precision,
      maximumFractionDigits: props.precision,
    })
  }
  return String(props.value)
})

const trendDirection = computed(() => {
  if (props.trend === undefined) return null
  if (props.trend > 0) return 'up'
  if (props.trend < 0) return 'down'
  return 'flat'
})

const trendIcon = computed(() => {
  if (trendDirection.value === 'up') return ArrowUp
  if (trendDirection.value === 'down') return ArrowDown
  return null
})

const formattedTrend = computed(() => {
  if (props.trend === undefined) return ''
  const abs = Math.abs(props.trend)
  return `${abs.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}${props.trendSuffix}`
})
</script>

<template>
  <div
    class="uid-stat"
    :class="[
      `uid-stat--${tone}`,
      variant === 'ghost' && 'uid-stat--ghost',
      loading && 'uid-stat--loading',
    ]"
  >
    <span
      v-if="icon || $slots.icon"
      class="uid-stat__icon"
      aria-hidden="true"
    >
      <slot name="icon">
        <UidIcon
          v-if="icon"
          :icon="icon"
          :size="20"
        />
      </slot>
    </span>

    <div class="uid-stat__body">
      <p
        v-if="title"
        class="uid-stat__title"
      >{{ title }}</p>

      <div class="uid-stat__value-row">
        <span class="uid-stat__value">
          <slot name="value">
            <span
              v-if="prefix"
              class="uid-stat__prefix"
            >{{ prefix }}</span>
            <span>{{ formattedValue }}</span>
            <span
              v-if="suffix"
              class="uid-stat__suffix"
            >{{ suffix }}</span>
          </slot>
        </span>

        <span
          v-if="trend !== undefined || $slots.trend"
          class="uid-stat__trend"
          :class="trendDirection && `uid-stat__trend--${trendDirection}`"
        >
          <slot name="trend">
            <UidIcon
              v-if="trendIcon"
              :icon="trendIcon"
              :size="12"
            />
            <span>{{ formattedTrend }}</span>
          </slot>
        </span>
      </div>

      <p
        v-if="footer || $slots.footer"
        class="uid-stat__footer"
      >
        <slot name="footer">{{ footer }}</slot>
      </p>
    </div>
  </div>
</template>
