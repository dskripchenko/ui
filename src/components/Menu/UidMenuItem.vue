<script setup lang="ts">
import { inject } from 'vue'
import { MENU_CLOSE_KEY } from './context.js'
import type { Component } from 'vue'

export interface UidMenuItemProps {
  icon?: Component
  disabled?: boolean
  variant?: 'default' | 'danger'
}

const props = withDefaults(defineProps<UidMenuItemProps>(), {
  icon: undefined,
  disabled: false,
  variant: 'default',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

defineSlots<{
  default(): unknown
}>()

const close = inject(MENU_CLOSE_KEY, () => {})

function handleClick(event: MouseEvent): void {
  if (props.disabled) return
  emit('click', event)
  close()
}
</script>

<template>
  <button
    type="button"
    class="uid-menu-item"
    :class="[
      `uid-menu-item--${variant}`,
      { 'uid-menu-item--disabled': disabled },
    ]"
    role="menuitem"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
