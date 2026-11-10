<script setup lang="ts">
import './UidTabBar.css'
import { useLocale } from '../../composables/useLocale.js'

export interface UidTabBarProps {
  /** Accessible name of the navigation; the locale's by default. */
  label?: string
  /** Keep the bar at the bottom of the viewport. */
  fixed?: boolean
}

withDefaults(defineProps<UidTabBarProps>(), {
  label: undefined,
  fixed: false,
})

defineSlots<{
  default(): unknown
}>()

const uidLocale = useLocale()
</script>

<template>
  <nav
    class="uid-tab-bar"
    :class="{ 'uid-tab-bar--fixed': fixed }"
    :aria-label="label ?? uidLocale.tabBar.label"
  >
    <slot />
  </nav>
</template>
