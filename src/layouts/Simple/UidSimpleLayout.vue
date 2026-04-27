<script setup lang="ts">
import './UidSimpleLayout.css'

export interface UidSimpleLayoutProps {
  full?: boolean
}

withDefaults(defineProps<UidSimpleLayoutProps>(), {
  full: false,
})
</script>

<template>
  <div
    class="uid-layout-simple"
    :class="{ 'uid-layout-simple--full': full }"
  >
    <div
      v-if="$slots.header"
      class="uid-layout-simple__header"
    >
      <slot name="header" />
    </div>

    <main class="uid-layout-simple__content">
      <slot />
    </main>

    <div
      v-if="$slots.footer"
      class="uid-layout-simple__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
