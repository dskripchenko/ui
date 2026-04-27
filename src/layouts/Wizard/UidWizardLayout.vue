<script setup lang="ts">
import './UidWizardLayout.css'
</script>

<template>
  <div class="uid-layout-wizard">
    <div
      v-if="$slots.header"
      class="uid-layout-wizard__header"
    >
      <slot name="header" />
    </div>

    <div
      v-if="$slots.stepper"
      class="uid-layout-wizard__stepper"
    >
      <slot name="stepper" />
    </div>

    <main class="uid-layout-wizard__content">
      <slot />
    </main>

    <div
      v-if="$slots.nav"
      class="uid-layout-wizard__nav"
    >
      <slot name="nav" />
    </div>
  </div>
</template>
