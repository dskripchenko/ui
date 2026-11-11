<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import UidSidebarItem from './UidSidebarItem.vue'

export interface UidSidebarMoreProps {
  href?: string
  to?: string | Record<string, unknown>
  /** primary — what still asks for attention ("13 more unread"); secondary — a way to the catalogue. */
  tone?: 'primary' | 'secondary'
}

withDefaults(defineProps<UidSidebarMoreProps>(), {
  href: undefined,
  to: undefined,
  tone: 'secondary',
})

defineSlots<{
  default(): unknown
  icon?(): unknown
}>()
</script>

<template>
  <UidSidebarItem
    :href="href"
    :to="to"
    dense
    class="uid-sidebar-more"
    :class="`uid-sidebar-more--${tone}`"
  >
    <template
      v-if="$slots.icon"
      #icon
    >
      <slot name="icon" />
    </template>
    <slot />
    <template #meta>
      <ChevronRight
        :size="14"
        aria-hidden="true"
      />
    </template>
  </UidSidebarItem>
</template>
