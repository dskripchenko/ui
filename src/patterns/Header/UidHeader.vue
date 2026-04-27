<script setup lang="ts">
import './UidHeader.css'

export interface UidHeaderProps {
  sticky?: boolean
  bordered?: boolean
  transparent?: boolean
}

withDefaults(defineProps<UidHeaderProps>(), {
  sticky: false,
  bordered: true,
  transparent: false,
})

defineSlots<{
  logo?(): unknown
  nav?(): unknown
  actions?(): unknown
  mobile?(): unknown
}>()
</script>

<template>
  <header
    class="uid-pattern-header"
    :class="{
      'uid-pattern-header--sticky': sticky,
      'uid-pattern-header--bordered': bordered,
      'uid-pattern-header--transparent': transparent,
    }"
  >
    <div class="uid-pattern-header__inner">
      <div
        v-if="$slots.logo"
        class="uid-pattern-header__logo"
      >
        <slot name="logo" />
      </div>

      <nav
        v-if="$slots.nav"
        class="uid-pattern-header__nav"
        aria-label="Основная навигация"
      >
        <slot name="nav" />
      </nav>

      <div
        v-if="$slots.actions"
        class="uid-pattern-header__actions"
      >
        <slot name="actions" />
      </div>

      <div
        v-if="$slots.mobile"
        class="uid-pattern-header__mobile"
      >
        <slot name="mobile" />
      </div>
    </div>
  </header>
</template>
