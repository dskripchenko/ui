<script setup lang="ts">
import './UidAlert.css'
import { computed, type Component } from 'vue'
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import type { Tone } from '../../types/index.js'

const locale = useLocale()

export interface UidAlertProps {
  variant?: Tone
  title?: string
  dismissible?: boolean
  icon?: Component
  /**
   * `alert` for what just happened; `status` for a standing notice (a
   * banner on top of a page), which screen readers do not interrupt with.
   */
  role?: 'alert' | 'status'
}

const props = withDefaults(defineProps<UidAlertProps>(), {
  variant: 'info',
  dismissible: false,
  title: undefined,
  icon: undefined,
  role: 'alert',
})

const emit = defineEmits<{
  dismiss: []
}>()

defineSlots<{
  default(): unknown
  icon?(): unknown
  /** On the right of the text: a link or a button that goes with it. */
  action?(): unknown
}>()

const ICONS: Record<Tone, Component> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
}

const defaultIcon = computed<Component>(() => ICONS[props.variant ?? 'info'])
</script>

<template>
  <div
    class="uid-alert"
    :class="`uid-alert--${variant}`"
    :role="role"
  >
    <span class="uid-alert__icon">
      <slot name="icon">
        <UidIcon
          :icon="icon ?? defaultIcon"
          :size="18"
        />
      </slot>
    </span>

    <div class="uid-alert__content">
      <p
        v-if="title"
        class="uid-alert__title"
      >
        {{ title }}
      </p>
      <div class="uid-alert__body">
        <slot />
      </div>
    </div>

    <div
      v-if="$slots.action"
      class="uid-alert__action"
    >
      <slot name="action" />
    </div>

    <button
      v-if="dismissible"
      type="button"
      class="uid-alert__close"
      :aria-label="locale.common.close"
      @click="emit('dismiss')"
    >
      <UidIcon
        :icon="X"
        :size="16"
      />
    </button>
  </div>
</template>
