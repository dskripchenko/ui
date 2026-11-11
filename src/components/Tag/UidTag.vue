<script setup lang="ts">
import './UidTag.css'
import { X } from 'lucide-vue-next'
import type { Component } from 'vue'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import type { Tone } from '../../types/index.js'

const locale = useLocale()

export type UidTagVariant = Tone | 'default'

export interface UidTagProps {
  variant?: UidTagVariant
  size?: 'sm' | 'md'
  dismissible?: boolean
  /** An icon before the text, in the tag's colour. */
  icon?: Component
}

withDefaults(defineProps<UidTagProps>(), {
  variant: 'default',
  size: 'md',
  dismissible: false,
  icon: undefined,
})

const emit = defineEmits<{
  dismiss: []
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <span
    class="uid-tag"
    :class="[`uid-tag--${variant}`, `uid-tag--${size}`]"
  >
    <UidIcon
      v-if="icon"
      class="uid-tag__icon"
      :icon="icon"
      :size="size === 'sm' ? 11 : 12"
    />
    <slot />
    <button
      v-if="dismissible"
      type="button"
      class="uid-tag__dismiss"
      :aria-label="locale.common.clear"
      @click.stop="emit('dismiss')"
    >
      <UidIcon
        :icon="X"
        :size="10"
      />
    </button>
  </span>
</template>
