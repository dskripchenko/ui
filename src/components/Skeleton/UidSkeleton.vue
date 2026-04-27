<script setup lang="ts">
import './UidSkeleton.css'

export interface UidSkeletonProps {
  width?: string
  height?: string
  rounded?: boolean | 'full'
  lines?: number
}

withDefaults(defineProps<UidSkeletonProps>(), {
  width: '100%',
  height: '1em',
  rounded: false,
  lines: 1,
})
</script>

<template>
  <div
    v-if="lines > 1"
    class="uid-skeleton-lines"
    aria-hidden="true"
  >
    <span
      v-for="i in lines"
      :key="i"
      class="uid-skeleton"
      :class="[
        rounded === true && 'uid-skeleton--rounded',
        rounded === 'full' && 'uid-skeleton--full',
      ]"
      :style="{
        width: i === lines ? '60%' : width,
        height,
      }"
    />
  </div>
  <span
    v-else
    class="uid-skeleton"
    :class="[
      rounded === true && 'uid-skeleton--rounded',
      rounded === 'full' && 'uid-skeleton--full',
    ]"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>
