<script setup lang="ts">
import './UidDivider.css'

export interface UidDividerProps {
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<UidDividerProps>(), {
  label: undefined,
  orientation: 'horizontal',
})
</script>

<template>
  <div
    class="uid-divider"
    :class="`uid-divider--${orientation}`"
    role="separator"
  >
    <span
      v-if="label && orientation === 'horizontal'"
      class="uid-divider__label"
    >
      {{ label }}
    </span>
  </div>
</template>
