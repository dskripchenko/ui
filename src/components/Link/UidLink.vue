<script setup lang="ts">
import './UidLink.css'
import { computed, type Component } from 'vue'
import { useRouterLink } from '../../composables/useRouterLink.js'

export interface UidLinkProps {
  href?: string
  to?: string | Record<string, unknown>
  external?: boolean
  disabled?: boolean
  as?: string | Component
}

const props = withDefaults(defineProps<UidLinkProps>(), {
  href: undefined,
  to: undefined,
  external: false,
  disabled: false,
  as: undefined,
})

defineSlots<{
  default(): unknown
}>()

const { routerLink, fallbackHref } = useRouterLink(props)

const tag = computed<string | Component>(() => props.as ?? routerLink.value ?? 'a')

const attrs = computed(() => {
  if (props.as === undefined && routerLink.value) return { to: props.to }
  return {
    href: props.disabled ? undefined : fallbackHref.value,
    target: props.external ? '_blank' : undefined,
    rel: props.external ? 'noopener noreferrer' : undefined,
  }
})
</script>

<template>
  <component
    :is="tag"
    class="uid-link"
    :class="{ 'uid-link--disabled': disabled }"
    v-bind="attrs"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
  >
    <slot />
  </component>
</template>
