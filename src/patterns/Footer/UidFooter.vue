<script setup lang="ts">
import './UidFooter.css'

export interface UidFooterProps {
  variant?: 'minimal' | 'columns'
}

withDefaults(defineProps<UidFooterProps>(), {
  variant: 'minimal',
})

defineSlots<{
  default?(): unknown
  columns?(): unknown
  bottom?(): unknown
}>()
</script>

<template>
  <footer
    class="uid-pattern-footer"
    :class="`uid-pattern-footer--${variant}`"
  >
    <div class="uid-pattern-footer__inner">
      <div
        v-if="$slots.columns"
        class="uid-pattern-footer__columns"
      >
        <slot name="columns" />
      </div>
      <div
        v-else-if="$slots.default"
        class="uid-pattern-footer__content"
      >
        <slot />
      </div>
      <div
        v-if="$slots.bottom"
        class="uid-pattern-footer__bottom"
      >
        <slot name="bottom" />
      </div>
    </div>
  </footer>
</template>
