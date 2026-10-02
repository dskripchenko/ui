<script setup lang="ts">
import './UidSpinner.css'
import type { Size } from '../../types/index.js'
import { useLocale } from '../../composables/useLocale.js'


export interface UidSpinnerProps {
  size?: Size
  label?: string
}

withDefaults(defineProps<UidSpinnerProps>(), {
  size: 'md',
  label: undefined,
})

const uidLocale = useLocale()
</script>

<template>
  <span
    class="uid-spinner"
    :class="`uid-spinner--${size}`"
    role="status"
    :aria-label="label ?? uidLocale.common.loading"
  />
</template>
