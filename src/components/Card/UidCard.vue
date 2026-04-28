<script setup lang="ts">
import './UidCard.css'

export interface UidCardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
}

const props = withDefaults(defineProps<UidCardProps>(), {
  padding: 'md',
  clickable: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent]
}>()

defineSlots<{
  media?(): unknown
  header?(): unknown
  default(): unknown
  footer?(): unknown
}>()

function onKeydown(e: KeyboardEvent): void {
  if (!props.clickable) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('click', e)
  }
}
</script>

<template>
  <div
    class="uid-card"
    :class="[`uid-card--pad-${padding}`, { 'uid-card--clickable': clickable }]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @keydown="onKeydown"
    @click="clickable && emit('click', $event)"
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
