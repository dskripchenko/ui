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
  gap: 'var(--uid-space-md)',
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

// The gaps are always written as the row-gap/column-gap longhands, and unset
// keys are left out. Vue writes an undefined style key as '' — and clearing a
// longhand of a `gap` shorthand that holds a var() drops the whole shorthand
// in the browser, so the grid used to lose its default gap.
const style = computed(() => {
  const split = Boolean(props.rowGap || props.colGap)
  const entries: Record<string, string | undefined> = {
    gridTemplateColumns: typeof props.cols === 'number'
      ? `repeat(${props.cols}, minmax(0, 1fr))`
      : props.cols,
    rowGap: split ? props.rowGap : props.gap,
    columnGap: split ? props.colGap : props.gap,
    alignItems: props.align ? PLACE_MAP[props.align] : undefined,
    justifyItems: props.justify ? PLACE_MAP[props.justify] : undefined,
  }
  return Object.fromEntries(Object.entries(entries).filter(([, v]) => v !== undefined && v !== ''))
})
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
