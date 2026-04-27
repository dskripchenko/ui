<script setup lang="ts">
import './UidLink.css'
import { computed, resolveComponent, type Component } from 'vue'

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

const tag = computed<string | Component>(() => {
  if (props.as) return props.as
  if (props.to !== undefined) {
    try {
      return resolveComponent('RouterLink')
    } catch {
      return 'a'
    }
  }
  return 'a'
})

const attrs = computed(() => {
  if (props.to !== undefined) return { to: props.to }
  return {
    href: props.disabled ? undefined : props.href,
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
