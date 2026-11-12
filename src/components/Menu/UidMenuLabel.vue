<script setup lang="ts">
defineSlots<{
  default(): unknown
}>()
</script>

<!-- A group's title inside a menu: not an item, skipped by the keyboard. -->
<template>
  <div
    class="uid-menu-label"
    role="presentation"
  >
    <slot />
  </div>
</template>
