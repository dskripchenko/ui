<script setup lang="ts">
import './UidTag.css'
import { X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import type { Tone } from '../../types/index.js'

export type UidTagVariant = Tone | 'default'

export interface UidTagProps {
  variant?: UidTagVariant
  size?: 'sm' | 'md'
  dismissible?: boolean
}

withDefaults(defineProps<UidTagProps>(), {
  variant: 'default',
  size: 'md',
  dismissible: false,
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
    <slot />
    <button
      v-if="dismissible"
      type="button"
      class="uid-tag__dismiss"
      aria-label="Удалить"
      @click.stop="emit('dismiss')"
    >
      <UidIcon
        :icon="X"
        :size="10"
      />
    </button>
  </span>
</template>
