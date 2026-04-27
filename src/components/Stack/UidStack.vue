<script setup lang="ts">
import './UidStack.css'
import { computed } from 'vue'

export interface UidStackProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  gap?: string
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  as?: string
  inline?: boolean
}

const props = withDefaults(defineProps<UidStackProps>(), {
  direction: 'column',
  gap: 'var(--uid-space-4)',
  align: undefined,
  justify: undefined,
  wrap: false,
  as: 'div',
  inline: false,
})

defineSlots<{
  default(): unknown
}>()

const JUSTIFY_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
}

const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}

const style = computed(() => ({
  flexDirection: props.direction,
  gap: props.gap,
  alignItems: props.align ? ALIGN_MAP[props.align] : undefined,
  justifyContent: props.justify ? JUSTIFY_MAP[props.justify] : undefined,
  flexWrap: props.wrap ? 'wrap' : undefined,
}))
</script>

<template>
  <component
    :is="as"
    class="uid-stack"
    :class="{ 'uid-stack--inline': inline }"
    :style="style"
  >
    <slot />
  </component>
</template>
