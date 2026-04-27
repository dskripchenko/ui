<script setup lang="ts">
import './UidButton.css'

export type UidButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type UidButtonSize = 'sm' | 'md' | 'lg'

export interface UidButtonProps {
  variant?: UidButtonVariant
  size?: UidButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<UidButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

defineSlots<{
  default(): unknown
  prepend?(): unknown
  append?(): unknown
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    class="uid-button"
    :class="[`uid-button--${variant}`, `uid-button--${size}`]"
    :type="type"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading ? 'true' : undefined"
    :data-loading="loading ? 'true' : undefined"
    @click="handleClick"
  >
    <span
      v-if="$slots.prepend"
      class="uid-button__prepend"
    >
      <slot name="prepend" />
    </span>
    <slot />
    <span
      v-if="$slots.append"
      class="uid-button__append"
    >
      <slot name="append" />
    </span>
  </button>
</template>
