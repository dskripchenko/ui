<script setup lang="ts">
import './UidLabel.css'

export interface UidLabelProps {
  for?: string
  required?: boolean
  disabled?: boolean
}

withDefaults(defineProps<UidLabelProps>(), {
  for: undefined,
  required: false,
  disabled: false,
})

defineSlots<{ default(): unknown }>()
</script>

<template>
  <label
    class="uid-label"
    :class="disabled && 'uid-label--disabled'"
    :for="$props.for"
  >
    <slot />
    <span
      v-if="required"
      class="uid-label__required"
      aria-hidden="true"
    >*</span>
  </label>
</template>
