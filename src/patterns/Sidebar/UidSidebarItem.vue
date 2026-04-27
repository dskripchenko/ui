<script setup lang="ts">
import { computed, resolveComponent, type Component } from 'vue'

export interface UidSidebarItemProps {
  href?: string
  to?: string | Record<string, unknown>
  active?: boolean
  disabled?: boolean
  badge?: string | number
  as?: string | Component
}

const props = withDefaults(defineProps<UidSidebarItemProps>(), {
  href: undefined,
  to: undefined,
  active: false,
  disabled: false,
  badge: undefined,
  as: undefined,
})

defineSlots<{
  default(): unknown
  icon?(): unknown
}>()

const tag = computed<string | Component>(() => {
  if (props.as) return props.as
  if (props.to !== undefined) {
    try { return resolveComponent('RouterLink') } catch { return 'a' }
  }
  return 'a'
})

const attrs = computed(() => {
  if (props.to !== undefined) return { to: props.to }
  return { href: props.disabled ? undefined : props.href }
})
</script>

<template>
  <component
    :is="tag"
    class="uid-sidebar-item"
    :class="{
      'uid-sidebar-item--active': active,
      'uid-sidebar-item--disabled': disabled,
    }"
    v-bind="attrs"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
  >
    <span
      v-if="$slots.icon"
      class="uid-sidebar-item__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span class="uid-sidebar-item__label">
      <slot />
    </span>
    <span
      v-if="badge !== undefined"
      class="uid-sidebar-item__badge"
    >
      {{ badge }}
    </span>
  </component>
</template>
