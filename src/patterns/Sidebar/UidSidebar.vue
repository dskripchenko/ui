<script setup lang="ts">
import './UidSidebar.css'

export interface UidSidebarProps {
  collapsed?: boolean
  width?: string
  position?: 'left' | 'right'
}

withDefaults(defineProps<UidSidebarProps>(), {
  collapsed: false,
  width: undefined,
  position: 'left',
})

defineSlots<{
  header?(): unknown
  nav?(): unknown
  footer?(): unknown
}>()
</script>

<template>
  <aside
    class="uid-pattern-sidebar"
    :class="[
      `uid-pattern-sidebar--${position}`,
      { 'uid-pattern-sidebar--collapsed': collapsed },
    ]"
    :style="width && !collapsed ? { '--uid-sidebar-width': width } : undefined"
    aria-label="Боковая навигация"
  >
    <div
      v-if="$slots.header"
      class="uid-pattern-sidebar__header"
    >
      <slot name="header" />
    </div>
    <nav
      class="uid-pattern-sidebar__nav"
      aria-label="Навигация"
    >
      <slot name="nav" />
    </nav>
    <div
      v-if="$slots.footer"
      class="uid-pattern-sidebar__footer"
    >
      <slot name="footer" />
    </div>
  </aside>
</template>
