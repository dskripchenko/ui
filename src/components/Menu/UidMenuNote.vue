<script setup lang="ts">
import UidIcon from '../../icons/UidIcon.vue'
import type { Component } from 'vue'

export interface UidMenuNoteProps {
  /** Icon component rendered before the text. */
  icon?: Component
}

withDefaults(defineProps<UidMenuNoteProps>(), { icon: undefined })

defineSlots<{
  default(): unknown
}>()
</script>

<!-- A footnote at the bottom of a menu: what the choices above mean. -->
<template>
  <p
    class="uid-menu-note"
    role="presentation"
  >
    <UidIcon
      v-if="icon"
      class="uid-menu-note__icon"
      :icon="icon"
      :size="14"
    />
    <span><slot /></span>
  </p>
</template>
