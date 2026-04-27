<script setup lang="ts">
import './UidBadge.css'
import type { Tone } from '../../types/index.js'

export type UidBadgeVariant = Tone | 'default'

export interface UidBadgeProps {
  variant?: UidBadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
}

withDefaults(defineProps<UidBadgeProps>(), {
  variant: 'default',
  size: 'md',
  dot: false,
})

defineSlots<{ default?(): unknown }>()
</script>

<template>
  <span
    class="uid-badge"
    :class="[`uid-badge--${variant}`, `uid-badge--${size}`, dot && 'uid-badge--dot']"
  >
    <slot v-if="!dot" />
  </span>
</template>
