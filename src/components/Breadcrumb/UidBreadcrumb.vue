<script setup lang="ts">
import './UidBreadcrumb.css'

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
