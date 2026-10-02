<script setup lang="ts">
import './UidBreadcrumb.css'
import { onUpdated, provide, ref } from 'vue'
import { BREADCRUMB_KEY } from './context.js'

export interface UidBreadcrumbProps {
  label?: string
  separator?: string
}

withDefaults(defineProps<UidBreadcrumbProps>(), {
  label: 'Навигация',
  separator: '/',
})

defineSlots<{
  default(): unknown
}>()

// Items work out whether they are the last crumb from the DOM; re-check after
// every update of the list (crumbs added, removed or reordered).
const tick = ref(0)
provide(BREADCRUMB_KEY, { tick })
onUpdated(() => { tick.value++ })
</script>

<template>
  <nav
    class="uid-breadcrumb"
    :aria-label="label"
  >
    <ol
      class="uid-breadcrumb__list"
      :style="{ '--uid-breadcrumb-sep': `'${separator}'` }"
    >
      <slot />
    </ol>
  </nav>
</template>
