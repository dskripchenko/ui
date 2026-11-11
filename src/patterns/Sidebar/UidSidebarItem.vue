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
  /** A 28px row: a conversation in a long list. */
  dense?: boolean
  /** On the right, quiet: a time, "yesterday", "15:00". */
  meta?: string
  /** Mentions: a danger "@N" pill. */
  mentions?: number
  /** Unread: a neutral number. */
  count?: number
  /** Something new here: the label is bold. */
  strong?: boolean
  /** Muted: the row is dimmed. */
  quiet?: boolean
}

const props = withDefaults(defineProps<UidSidebarItemProps>(), {
  href: undefined,
  to: undefined,
  active: false,
  disabled: false,
  badge: undefined,
  as: undefined,
  dense: false,
  meta: undefined,
  mentions: 0,
  count: 0,
  strong: false,
  quiet: false,
})

defineSlots<{
  default(): unknown
  icon?(): unknown
  /** After the label: a tag ("guest", "Agent"). */
  suffix?(): unknown
  /** Instead of the meta text. */
  meta?(): unknown
  /** On hover and focus, in place of the meta and the counts: buttons for the row. */
  actions?(): unknown
}>()

const { routerLink, fallbackHref } = useRouterLink(props)

const tag = computed<string | Component>(() => props.as ?? routerLink.value ?? 'a')

const attrs = computed(() => {
  if (props.as === undefined && routerLink.value) return { to: props.to }
  return { href: props.disabled ? undefined : fallbackHref.value }
})
</script>

<template>
  <div
    v-if="$slots.actions"
    class="uid-sidebar-item-row"
    :class="{ 'uid-sidebar-item-row--dense': dense }"
  >
    <component
      :is="tag"
      class="uid-sidebar-item"
      :class="{
        'uid-sidebar-item--active': active,
        'uid-sidebar-item--disabled': disabled,
        'uid-sidebar-item--dense': dense,
        'uid-sidebar-item--strong': strong,
        'uid-sidebar-item--quiet': quiet,
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
        v-if="$slots.suffix"
        class="uid-sidebar-item__suffix"
      ><slot name="suffix" /></span>
      <span
        v-if="$slots.meta || meta"
        class="uid-sidebar-item__meta"
      ><slot name="meta">{{ meta }}</slot></span>
      <span
        v-if="mentions > 0"
        class="uid-sidebar-item__mentions"
      >@{{ mentions }}</span>
      <span
        v-if="count > 0"
        class="uid-sidebar-item__count"
      >{{ count > 99 ? '99+' : count }}</span>
      <span
        v-if="badge !== undefined"
        class="uid-sidebar-item__badge"
      >
        {{ badge }}
      </span>
    </component>
    <span class="uid-sidebar-item__actions">
      <slot name="actions" />
    </span>
  </div>
  <component
    :is="tag"
    v-else
    class="uid-sidebar-item"
    :class="{
      'uid-sidebar-item--active': active,
      'uid-sidebar-item--disabled': disabled,
      'uid-sidebar-item--dense': dense,
      'uid-sidebar-item--strong': strong,
      'uid-sidebar-item--quiet': quiet,
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
      v-if="$slots.suffix"
      class="uid-sidebar-item__suffix"
    ><slot name="suffix" /></span>
    <span
      v-if="$slots.meta || meta"
      class="uid-sidebar-item__meta"
    ><slot name="meta">{{ meta }}</slot></span>
    <span
      v-if="mentions > 0"
      class="uid-sidebar-item__mentions"
    >@{{ mentions }}</span>
    <span
      v-if="count > 0"
      class="uid-sidebar-item__count"
    >{{ count > 99 ? '99+' : count }}</span>
    <span
      v-if="badge !== undefined"
      class="uid-sidebar-item__badge"
    >
      {{ badge }}
    </span>
  </component>
</template>
