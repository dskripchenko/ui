<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import type { Tone } from '../../types/index.js'

export interface UidToastProps {
  id: number
  message: string
  variant?: Tone
  title?: string
}

const props = withDefaults(defineProps<UidToastProps>(), {
  variant: 'info',
  title: undefined,
})

const emit = defineEmits<{
  dismiss: [id: number]
}>()

const ICONS: Record<Tone, Component> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
}

const currentIcon = computed<Component>(() => ICONS[props.variant ?? 'info'])
</script>

<template>
  <div
    class="uid-toast"
    :class="`uid-toast--${variant}`"
    role="alert"
    aria-live="polite"
    aria-atomic="true"
  >
    <span class="uid-toast__icon">
      <UidIcon
        :icon="currentIcon"
        :size="18"
      />
    </span>

    <div class="uid-toast__content">
      <p
        v-if="title"
        class="uid-toast__title"
      >
        {{ title }}
      </p>
      <p class="uid-toast__message">
        {{ message }}
      </p>
    </div>

    <button
      type="button"
      class="uid-toast__close"
      aria-label="Закрыть"
      @click="emit('dismiss', id)"
    >
      <UidIcon
        :icon="X"
        :size="14"
      />
    </button>
  </div>
</template>
