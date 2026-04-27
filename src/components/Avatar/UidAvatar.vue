<script setup lang="ts">
import './UidAvatar.css'
import { computed, ref } from 'vue'

export interface UidAvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
}

const props = withDefaults(defineProps<UidAvatarProps>(), {
  src: undefined,
  alt: undefined,
  name: undefined,
  size: 'md',
  shape: 'circle',
})

const imgError = ref(false)

const initials = computed<string>(() => {
  if (!props.name) return '?'
  const words = props.name.trim().split(/\s+/)
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
})

const colorIndex = computed<number>(() => {
  if (!props.name) return 0
  return props.name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % PALETTE.length
})

const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#22c55e', '#14b8a6', '#3b82f6', '#ef4444',
]

const bgColor = computed(() => PALETTE[colorIndex.value])

function onError(): void {
  imgError.value = true
}
</script>

<template>
  <span
    class="uid-avatar"
    :class="[`uid-avatar--${size}`, `uid-avatar--${shape}`]"
    :title="name"
    :aria-label="alt ?? name"
    role="img"
  >
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt ?? name"
      class="uid-avatar__img"
      @error="onError"
    >
    <span
      v-else
      class="uid-avatar__initials"
      :style="{ background: bgColor }"
      aria-hidden="true"
    >
      {{ initials }}
    </span>
  </span>
</template>
