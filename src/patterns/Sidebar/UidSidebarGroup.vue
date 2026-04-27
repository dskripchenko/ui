<script setup lang="ts">
export interface UidSidebarGroupProps {
  title?: string
  collapsible?: boolean
}

withDefaults(defineProps<UidSidebarGroupProps>(), {
  title: undefined,
  collapsible: false,
})

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="uid-sidebar-group">
    <p
      v-if="title"
      class="uid-sidebar-group__title"
    >
      {{ title }}
    </p>
    <slot />
  </div>
</template>
