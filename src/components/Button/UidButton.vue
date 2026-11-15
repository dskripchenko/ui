<script setup lang="ts">
import './UidButton.css'
import { computed, useAttrs, watchEffect, type Component } from 'vue'
import UidIcon from '../../icons/UidIcon.vue'
import { useRouterLink, type RouterLocation } from '../../composables/useRouterLink.js'

export type UidButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type UidButtonSize = 'sm' | 'md' | 'lg'
export type UidButtonIconPosition = 'start' | 'end'

export interface UidButtonProps {
  variant?: UidButtonVariant
  size?: UidButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  /** Icon component (e.g. from lucide-vue-next). Without default slot content the button becomes icon-only. */
  icon?: Component
  iconPosition?: UidButtonIconPosition
  /** Renders a link that looks like the button: `<a href>`. */
  href?: string
  /** Renders the app's RouterLink (or `<a href>` for a string when there is no router). */
  to?: RouterLocation
  /** For `href`: opens in a new tab, without the opener. */
  external?: boolean
}

const props = withDefaults(defineProps<UidButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  icon: undefined,
  iconPosition: 'start',
  href: undefined,
  to: undefined,
  external: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const slots = defineSlots<{
  default?(): unknown
  prepend?(): unknown
  append?(): unknown
}>()

const attrs = useAttrs()

const iconSize = computed(() => (props.size === 'sm' ? 16 : 20))
const iconOnly = computed(() => !!props.icon && !slots.default)

watchEffect(() => {
  if (
    import.meta.env.DEV
    && iconOnly.value
    && !attrs['aria-label']
    && !attrs['aria-labelledby']
    && !attrs.title
  ) {
    console.warn('[UidButton] icon-only button requires an aria-label')
  }
})

const { routerLink, fallbackHref } = useRouterLink(props)
const isLink = computed(() => props.href !== undefined || props.to !== undefined)
const inert = computed(() => props.disabled || props.loading)
const tag = computed<string | Component>(() => {
  if (!isLink.value) return 'button'
  return inert.value ? 'a' : routerLink.value ?? 'a'
})

// A link has no `disabled`: it loses its target and leaves the tab order.
const tagAttrs = computed(() => {
  if (!isLink.value) return { type: props.type, disabled: inert.value }
  if (inert.value) return { tabindex: -1 }
  if (routerLink.value) return { to: props.to }
  return {
    href: fallbackHref.value,
    target: props.external ? '_blank' : undefined,
    rel: props.external ? 'noopener noreferrer' : undefined,
  }
})

function handleClick(event: MouseEvent) {
  if (inert.value) {
    if (isLink.value) event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="tag"
    class="uid-button"
    :class="[`uid-button--${variant}`, `uid-button--${size}`, { 'uid-button--icon-only': iconOnly }]"
    v-bind="tagAttrs"
    :aria-disabled="inert ? 'true' : undefined"
    :data-loading="loading ? 'true' : undefined"
    @click="handleClick"
  >
    <span
      v-if="$slots.prepend"
      class="uid-button__prepend"
    >
      <slot name="prepend" />
    </span>
    <UidIcon
      v-if="icon && iconPosition === 'start'"
      class="uid-button__icon"
      :icon="icon"
      :size="iconSize"
    />
    <slot />
    <UidIcon
      v-if="icon && iconPosition === 'end'"
      class="uid-button__icon"
      :icon="icon"
      :size="iconSize"
    />
    <span
      v-if="$slots.append"
      class="uid-button__append"
    >
      <slot name="append" />
    </span>
  </component>
</template>
