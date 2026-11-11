<script setup lang="ts">
import './UidSidebar.css'
import { computed, provide } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import { SIDEBAR_COLLAPSED } from './context.js'


export interface UidSidebarProps {
  collapsed?: boolean
  width?: string
  position?: 'left' | 'right'
}

const props = withDefaults(defineProps<UidSidebarProps>(), {
  collapsed: false,
  width: undefined,
  position: 'left',
})

const uidLocale = useLocale()
// Sections turn into icons with a flyout when the sidebar is collapsed.
provide(SIDEBAR_COLLAPSED, computed(() => props.collapsed))

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
    :aria-label="uidLocale.sidebar.label"
  >
    <div
      v-if="$slots.header"
      class="uid-pattern-sidebar__header"
    >
      <slot name="header" />
    </div>
    <nav
      class="uid-pattern-sidebar__nav"
      :aria-label="uidLocale.sidebar.nav"
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
