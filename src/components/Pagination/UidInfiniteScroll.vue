<script setup lang="ts">
import './UidPagination.css'
import { ref, watch, onUnmounted } from 'vue'
import UidSpinner from '../Spinner/UidSpinner.vue'

export interface UidInfiniteScrollProps {
  loading?: boolean
  disabled?: boolean
  rootMargin?: string
}

const props = withDefaults(defineProps<UidInfiniteScrollProps>(), {
  loading: false,
  disabled: false,
  rootMargin: '200px',
})

const emit = defineEmits<{
  load: []
}>()

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function disconnect(): void {
  observer?.disconnect()
  observer = null
}

function connect(): void {
  if (!sentinelRef.value || props.disabled) return
  disconnect()
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !props.loading && !props.disabled) {
        emit('load')
      }
    },
    { rootMargin: props.rootMargin },
  )
  observer.observe(sentinelRef.value)
}

watch(sentinelRef, (el) => { if (el) connect() }, { immediate: true })

watch(() => props.disabled, (disabled) => {
  if (disabled) disconnect()
  else connect()
})

onUnmounted(disconnect)
</script>

<template>
  <div class="uid-infinite-scroll">
    <div
      v-if="loading"
      class="uid-infinite-scroll__loader"
    >
      <UidSpinner size="sm" />
    </div>
    <div
      ref="sentinelRef"
      class="uid-infinite-scroll__sentinel"
      aria-hidden="true"
    />
  </div>
</template>
