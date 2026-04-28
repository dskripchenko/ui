<script setup lang="ts">
import './UidResult.css'
import { computed } from 'vue'
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import type { Component } from 'vue'

export type ResultStatus = 'success' | 'info' | 'warning' | 'error'

export interface UidResultProps {
  status?: ResultStatus
  title?: string
  description?: string
  compact?: boolean
}

const props = withDefaults(defineProps<UidResultProps>(), {
  status: 'success',
  compact: false,
})

defineSlots<{
  icon?(): unknown
  title?(): unknown
  description?(): unknown
  default?(): unknown
  actions?(): unknown
}>()

const STATUS_ICONS: Record<ResultStatus, Component> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

const resolvedIcon = computed(() => STATUS_ICONS[props.status])
</script>

<template>
  <div
    class="uid-pattern-result"
    :class="[
      `uid-pattern-result--${status}`,
      compact && 'uid-pattern-result--compact',
    ]"
    role="status"
  >
    <div
      class="uid-pattern-result__icon"
      aria-hidden="true"
    >
      <slot name="icon">
        <UidIcon
          :icon="resolvedIcon"
          :size="compact ? 32 : 40"
        />
      </slot>
    </div>

    <h2
      v-if="title || $slots.title"
      class="uid-pattern-result__title"
    >
      <slot name="title">{{ title }}</slot>
    </h2>

    <p
      v-if="description || $slots.description"
      class="uid-pattern-result__description"
    >
      <slot name="description">{{ description }}</slot>
    </p>

    <div
      v-if="$slots.default"
      class="uid-pattern-result__content"
    >
      <slot />
    </div>

    <div
      v-if="$slots.actions"
      class="uid-pattern-result__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
