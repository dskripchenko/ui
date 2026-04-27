<script setup lang="ts">
import './UidCard.css'

export interface UidCardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
}

withDefaults(defineProps<UidCardProps>(), {
  padding: 'md',
  clickable: false,
})

defineSlots<{
  media?(): unknown
  header?(): unknown
  default(): unknown
  footer?(): unknown
}>()
</script>

<template>
  <div
    class="uid-card"
    :class="[`uid-card--pad-${padding}`, { 'uid-card--clickable': clickable }]"
  >
    <div
      v-if="$slots.media"
      class="uid-card__media"
    >
      <slot name="media" />
    </div>
    <div
      v-if="$slots.header"
      class="uid-card__header"
    >
      <slot name="header" />
    </div>
    <div class="uid-card__body">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="uid-card__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
