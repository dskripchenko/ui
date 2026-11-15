<script setup lang="ts">
import './UidBadge.css'
import type { Tone } from '../../types/index.js'

export type UidBadgeVariant = Tone | 'default' | 'accent'

export interface UidBadgeProps {
  variant?: UidBadgeVariant
  size?: 'sm' | 'md'
  /** Only a dot, no text. */
  dot?: boolean
  /** A dot of the tone before the text — a status that reads as one. */
  marker?: boolean
}

withDefaults(defineProps<UidBadgeProps>(), {
  variant: 'default',
  size: 'md',
  dot: false,
  marker: false,
})

defineSlots<{ default?(): unknown }>()
</script>

<template>
  <span
    class="uid-badge"
    :class="[`uid-badge--${variant}`, `uid-badge--${size}`, dot && 'uid-badge--dot']"
  >
    <template v-if="!dot">
      <span
        v-if="marker"
        class="uid-badge__marker"
        aria-hidden="true"
      />
      <slot />
    </template>
  </span>
</template>
