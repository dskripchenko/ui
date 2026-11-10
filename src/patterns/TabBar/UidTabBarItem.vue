<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRouterLink } from '../../composables/useRouterLink.js'

export interface UidTabBarItemProps {
  href?: string
  to?: string | Record<string, unknown>
  active?: boolean
  disabled?: boolean
  /** A count over the icon; 0 or undefined shows nothing. */
  badge?: string | number
  /** A dot over the icon, when there is something new but no count. */
  dot?: boolean
  as?: string | Component
}

const props = withDefaults(defineProps<UidTabBarItemProps>(), {
  href: undefined,
  to: undefined,
  active: false,
  disabled: false,
  badge: undefined,
  dot: false,
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
  if (props.as === 'button') return { type: 'button', disabled: props.disabled || undefined }
  return { href: props.disabled ? undefined : fallbackHref.value }
})

const shownBadge = computed(() => (props.badge === undefined || props.badge === 0 || props.badge === '' ? null : props.badge))
</script>

<template>
  <component
    :is="tag"
    class="uid-tab-bar-item"
    :class="{
      'uid-tab-bar-item--active': active,
      'uid-tab-bar-item--disabled': disabled,
    }"
    v-bind="attrs"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
  >
    <span
      class="uid-tab-bar-item__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
      <span
        v-if="shownBadge !== null"
        class="uid-tab-bar-item__badge"
      >{{ shownBadge }}</span>
      <span
        v-else-if="dot"
        class="uid-tab-bar-item__dot"
      />
    </span>
    <span class="uid-tab-bar-item__label">
      <slot />
    </span>
  </component>
</template>
