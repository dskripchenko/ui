<script setup lang="ts">
import './UidContainer.css'

export interface UidContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
  as?: string
}

withDefaults(defineProps<UidContainerProps>(), {
  size: 'lg',
  padding: true,
  as: 'div',
})

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <component
    :is="as"
    class="uid-container"
    :class="[`uid-container--${size}`, { 'uid-container--padded': padding }]"
  >
    <slot />
  </component>
</template>
