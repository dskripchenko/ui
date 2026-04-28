<script setup lang="ts">
import './UidAffix.css'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

export interface UidAffixProps {
  offsetTop?: number
  offsetBottom?: number
}

const props = defineProps<UidAffixProps>()

const emit = defineEmits<{
  change: [affixed: boolean]
}>()

defineSlots<{
  default?(): unknown
}>()

const rootRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)
const affixed = ref(false)

const direction = computed<'top' | 'bottom'>(() =>
  props.offsetBottom !== undefined ? 'bottom' : 'top',
)

const offset = computed(() =>
  direction.value === 'bottom' ? props.offsetBottom ?? 0 : props.offsetTop ?? 0,
)

const offsetStyle = computed(() => ({
  '--uid-affix-offset': `${offset.value}px`,
}))

let observer: IntersectionObserver | null = null

watch(affixed, (val) => emit('change', val))

onMounted(() => {
  if (!sentinelRef.value) return
  const rootMargin = direction.value === 'top'
    ? `-${offset.value + 1}px 0px 0px 0px`
    : `0px 0px -${offset.value + 1}px 0px`

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      affixed.value = !entry.isIntersecting
    },
    { threshold: [0, 1], rootMargin },
  )
  observer.observe(sentinelRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="rootRef"
    class="uid-affix"
    :class="[
      `uid-affix--${direction}`,
      affixed && 'uid-affix--affixed',
    ]"
    :style="offsetStyle"
  >
    <div
      ref="sentinelRef"
      class="uid-affix__sentinel"
      aria-hidden="true"
    />
    <div class="uid-affix__content">
      <slot />
    </div>
  </div>
</template>
