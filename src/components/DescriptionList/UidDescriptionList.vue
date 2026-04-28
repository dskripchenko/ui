<script setup lang="ts">
import './UidDescriptionList.css'
import { computed, provide } from 'vue'
import { descriptionListKey } from './context.js'
import type { Size } from '../../types/index.js'

export interface UidDescriptionListProps {
  title?: string
  direction?: 'horizontal' | 'vertical'
  columns?: number
  bordered?: boolean
  size?: Size
  labelWidth?: string
}

const props = withDefaults(defineProps<UidDescriptionListProps>(), {
  direction: 'horizontal',
  columns: 1,
  bordered: false,
  size: 'md',
  labelWidth: undefined,
})

defineSlots<{
  default?(): unknown
  title?(): unknown
}>()

provide(descriptionListKey, {
  direction: computed(() => props.direction),
  bordered: computed(() => props.bordered),
})

const gridStyle = computed(() => ({
  '--uid-desc-cols': props.columns,
  ...(props.labelWidth ? { '--uid-desc-label-width': props.labelWidth } : {}),
}))
</script>

<template>
  <div
    class="uid-description-list"
    :class="[
      `uid-description-list--${direction}`,
      `uid-description-list--${size}`,
      bordered && 'uid-description-list--bordered',
    ]"
  >
    <h3
      v-if="title || $slots.title"
      class="uid-description-list__title"
    >
      <slot name="title">{{ title }}</slot>
    </h3>
    <dl
      class="uid-description-list__grid"
      :style="gridStyle"
    >
      <slot />
    </dl>
  </div>
</template>
