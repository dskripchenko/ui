<script setup lang="ts">
import './UidSpinner.css'
import type { Size } from '../../types/index.js'

export interface UidSpinnerProps {
  size?: Size
  label?: string
}

withDefaults(defineProps<UidSpinnerProps>(), {
  size: 'md',
  label: 'Загрузка...',
})
</script>

<template>
  <span
    class="uid-spinner"
    :class="`uid-spinner--${size}`"
    role="status"
    :aria-label="label"
  />
</template>
