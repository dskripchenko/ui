<script setup lang="ts">
import './UidSidebarLayout.css'
import { computed, provide } from 'vue'
import { SIDEBAR_LAYOUT_KEY } from '../../composables/useSidebar.js'

export interface UidSidebarLayoutProps {
  sidebarWidth?: string
}

const props = withDefaults(defineProps<UidSidebarLayoutProps>(), {
  sidebarWidth: undefined,
})

const collapsed = defineModel<boolean>({ default: false })

const toggle = () => { collapsed.value = !collapsed.value }
const open = () => { collapsed.value = false }
const close = () => { collapsed.value = true }

provide(SIDEBAR_LAYOUT_KEY, { collapsed, toggle, open, close })

const rootStyle = computed(() =>
  props.sidebarWidth ? { '--uid-layout-sidebar-width': props.sidebarWidth } : undefined,
)
</script>

<template>
  <div
    class="uid-layout-sidebar"
    :class="{ 'uid-layout-sidebar--collapsed': collapsed }"
    :style="rootStyle"
  >
    <aside class="uid-layout-sidebar__sidebar">
      <slot name="sidebar" />
    </aside>

    <div
      class="uid-layout-sidebar__backdrop"
      aria-hidden="true"
      @click="close"
    />

    <div class="uid-layout-sidebar__main">
      <div
        v-if="$slots.header"
        class="uid-layout-sidebar__main-header"
      >
        <slot name="header" />
      </div>

      <main class="uid-layout-sidebar__main-content">
        <slot />
      </main>

      <div
        v-if="$slots.footer"
        class="uid-layout-sidebar__main-footer"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
