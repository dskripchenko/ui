<script setup lang="ts">
import './UidAuthLayout.css'

export interface UidAuthLayoutProps {
  variant?: 'centered' | 'split'
}

withDefaults(defineProps<UidAuthLayoutProps>(), {
  variant: 'centered',
})
</script>

<template>
  <div
    class="uid-layout-auth"
    :class="[`uid-layout-auth--${variant}`]"
  >
    <div
      v-if="variant === 'split' && $slots.brand"
      class="uid-layout-auth__brand"
    >
      <slot name="brand" />
    </div>

    <div class="uid-layout-auth__main">
      <div class="uid-layout-auth__card">
        <slot />
      </div>

      <div
        v-if="$slots.footer"
        class="uid-layout-auth__footer"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
