<script setup lang="ts">
import './UidIcon.css'
import { type Component } from 'vue'

export interface UidIconProps {
  icon: Component
  size?: number | string
  strokeWidth?: number
  label?: string
}

withDefaults(defineProps<UidIconProps>(), {
  size: 20,
  strokeWidth: 2,
})
</script>

<template>
  <component
    :is="icon"
    class="uid-icon"
    :width="size"
    :height="size"
    :stroke-width="strokeWidth"
    :aria-label="label"
    :aria-hidden="!label ? 'true' : undefined"
    role="img"
  />
</template>
