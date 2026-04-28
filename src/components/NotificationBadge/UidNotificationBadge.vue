<script setup lang="ts">
import './UidNotificationBadge.css'
import { computed } from 'vue'

export type BadgePlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
export type BadgeTone = 'danger' | 'primary' | 'success' | 'warning' | 'info'

export interface UidNotificationBadgeProps {
  count?: number
  max?: number
  dot?: boolean
  showZero?: boolean
  placement?: BadgePlacement
  tone?: BadgeTone
  offset?: [number, number]
}

const props = withDefaults(defineProps<UidNotificationBadgeProps>(), {
  count: 0,
  max: 99,
  dot: false,
  showZero: false,
  placement: 'top-right',
  tone: 'danger',
})

defineSlots<{
  default?(): unknown
}>()

const visible = computed(() => {
  if (props.dot) return props.count > 0 || props.showZero
  if (props.count > 0) return true
  return props.showZero
})

const displayCount = computed(() => {
  if (props.count > props.max) return `${props.max}+`
  return String(props.count)
})

const offsetStyle = computed(() => {
  if (!props.offset) return undefined
  return {
    '--uid-notif-badge-offset-x': `${props.offset[0]}px`,
    '--uid-notif-badge-offset-y': `${props.offset[1]}px`,
  }
})
</script>

<template>
  <span
    class="uid-notification-badge"
    :class="[
      `uid-notification-badge--${placement}`,
      tone !== 'danger' && `uid-notification-badge--${tone}`,
    ]"
    :style="offsetStyle"
  >
    <slot />
    <span
      v-if="visible && dot"
      class="uid-notification-badge__dot"
      role="status"
      aria-hidden="true"
    />
    <span
      v-else-if="visible"
      class="uid-notification-badge__count"
      role="status"
      :aria-label="`${count}`"
    >
      {{ displayCount }}
    </span>
  </span>
</template>
