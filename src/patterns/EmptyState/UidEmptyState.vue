<script setup lang="ts">
import './UidEmptyState.css'
import { FolderOpen } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export interface UidEmptyStateProps {
  title?: string
  description?: string
}

withDefaults(defineProps<UidEmptyStateProps>(), {
  title: 'Ничего не найдено',
  description: undefined,
})

defineSlots<{
  illustration?(): unknown
  title?(): unknown
  description?(): unknown
  actions?(): unknown
}>()
</script>

<template>
  <div class="uid-pattern-empty-state">
    <div class="uid-pattern-empty-state__illustration">
      <slot name="illustration">
        <UidIcon
          :icon="FolderOpen"
          :size="48"
        />
      </slot>
    </div>

    <div class="uid-pattern-empty-state__content">
      <h2 class="uid-pattern-empty-state__title">
        <slot name="title">
          {{ title }}
        </slot>
      </h2>
      <p
        v-if="description || $slots.description"
        class="uid-pattern-empty-state__description"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </p>
    </div>

    <div
      v-if="$slots.actions"
      class="uid-pattern-empty-state__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
