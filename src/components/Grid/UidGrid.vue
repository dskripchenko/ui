<script setup lang="ts">
import './UidGrid.css'
import { computed } from 'vue'

export interface UidGridProps {
  cols?: number | string
  gap?: string
  rowGap?: string
  colGap?: string
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'stretch'
  as?: string
}

const props = withDefaults(defineProps<UidGridProps>(), {
  cols: 12,
  gap: 'var(--uid-space-4)',
  rowGap: undefined,
  colGap: undefined,
  align: undefined,
  justify: undefined,
  as: 'div',
})

defineSlots<{
  default(): unknown
}>()

const PLACE_MAP: Record<string, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
}

const style = computed(() => ({
  gridTemplateColumns: typeof props.cols === 'number'
    ? `repeat(${props.cols}, minmax(0, 1fr))`
    : props.cols,
  gap: props.rowGap || props.colGap ? undefined : props.gap,
  rowGap: props.rowGap,
  columnGap: props.colGap,
  alignItems: props.align ? PLACE_MAP[props.align] : undefined,
  justifyItems: props.justify ? PLACE_MAP[props.justify] : undefined,
}))
</script>

<template>
  <component
    :is="as"
    class="uid-grid"
    :style="style"
  >
    <slot />
  </component>
</template>
