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
  /** Next to the title: an action on the group, such as "add". */
  action?(): unknown
}>()
</script>

<template>
  <div class="uid-sidebar-group">
    <div
      v-if="title && $slots.action"
      class="uid-sidebar-group__head"
    >
      <p class="uid-sidebar-group__title">
        {{ title }}
      </p>
      <span class="uid-sidebar-group__action">
        <slot name="action" />
      </span>
    </div>
    <p
      v-else-if="title"
      class="uid-sidebar-group__title"
    >
      {{ title }}
    </p>
    <slot />
  </div>
</template>
