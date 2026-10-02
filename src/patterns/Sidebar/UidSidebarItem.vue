<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRouterLink } from '../../composables/useRouterLink.js'

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

const { routerLink, fallbackHref } = useRouterLink(props)

const tag = computed<string | Component>(() => props.as ?? routerLink.value ?? 'a')

const attrs = computed(() => {
  if (props.as === undefined && routerLink.value) return { to: props.to }
  return { href: props.disabled ? undefined : fallbackHref.value }
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
