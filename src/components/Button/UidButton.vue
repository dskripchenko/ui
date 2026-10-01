<script setup lang="ts">
import './UidButton.css'
import { computed, useAttrs, watchEffect, type Component } from 'vue'
import UidIcon from '../../icons/UidIcon.vue'

export type UidButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type UidButtonSize = 'sm' | 'md' | 'lg'
export type UidButtonIconPosition = 'start' | 'end'

export interface UidButtonProps {
  variant?: UidButtonVariant
  size?: UidButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  /** Icon component (e.g. from lucide-vue-next). Without default slot content the button becomes icon-only. */
  icon?: Component
  iconPosition?: UidButtonIconPosition
}

const props = withDefaults(defineProps<UidButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  icon: undefined,
  iconPosition: 'start',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const slots = defineSlots<{
  default?(): unknown
  prepend?(): unknown
  append?(): unknown
}>()

const attrs = useAttrs()

const iconSize = computed(() => (props.size === 'sm' ? 16 : 20))
const iconOnly = computed(() => !!props.icon && !slots.default)

watchEffect(() => {
  if (
    import.meta.env.DEV
    && iconOnly.value
    && !attrs['aria-label']
    && !attrs['aria-labelledby']
    && !attrs.title
  ) {
    console.warn('[UidButton] icon-only button requires an aria-label')
  }
})

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    class="uid-button"
    :class="[`uid-button--${variant}`, `uid-button--${size}`, { 'uid-button--icon-only': iconOnly }]"
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
    <UidIcon
      v-if="icon && iconPosition === 'start'"
      class="uid-button__icon"
      :icon="icon"
      :size="iconSize"
    />
    <slot />
    <UidIcon
      v-if="icon && iconPosition === 'end'"
      class="uid-button__icon"
      :icon="icon"
      :size="iconSize"
    />
    <span
      v-if="$slots.append"
      class="uid-button__append"
    >
      <slot name="append" />
    </span>
  </button>
</template>
