<script setup lang="ts">
import { computed, getCurrentInstance, inject, onMounted, onUpdated, ref, watch } from 'vue'
import { useRouterLink } from '../../composables/useRouterLink.js'
import { BREADCRUMB_KEY } from './context.js'

export interface UidBreadcrumbItemProps {
  href?: string
  /** Router location. Rendered through the app's globally registered RouterLink; without one it falls back to `href` (or a string `to`). */
  to?: string | Record<string, unknown>
  /**
   * Marks the crumb as the current page (`aria-current="page"`, current styling, no link).
   * When omitted, only the last crumb of the list is treated as current.
   * Set `false` to keep the last crumb a regular one.
   */
  current?: boolean
}

const props = withDefaults(defineProps<UidBreadcrumbItemProps>(), {
  href: undefined,
  to: undefined,
  current: undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

defineSlots<{
  default(): unknown
}>()

const instance = getCurrentInstance()
const ctx = inject(BREADCRUMB_KEY, null)

const itemRef = ref<HTMLLIElement | null>(null)
const isLast = ref(false)

function syncLast(): void {
  const el = itemRef.value
  isLast.value = !!el && el.nextElementSibling === null
}

onMounted(syncLast)
onUpdated(syncLast)
if (ctx) watch(ctx.tick, syncLast, { flush: 'post' })

const isCurrent = computed(() => props.current ?? isLast.value)

const { routerLink, fallbackHref } = useRouterLink(props)

/** A crumb without a link but with a click listener becomes a button so it stays keyboard-accessible. */
function hasClickListener(): boolean {
  return !!instance?.vnode.props?.onClick
}

function onClick(event: MouseEvent): void {
  emit('click', event)
}
</script>

<template>
  <li
    ref="itemRef"
    class="uid-breadcrumb__item"
  >
    <span
      v-if="isCurrent"
      class="uid-breadcrumb__current"
      aria-current="page"
    >
      <slot />
    </span>
    <component
      :is="routerLink"
      v-else-if="routerLink"
      class="uid-breadcrumb__link"
      :to="to"
      @click="onClick"
    >
      <slot />
    </component>
    <a
      v-else-if="fallbackHref"
      class="uid-breadcrumb__link"
      :href="fallbackHref"
      @click="onClick"
    >
      <slot />
    </a>
    <button
      v-else-if="hasClickListener()"
      type="button"
      class="uid-breadcrumb__link uid-breadcrumb__link--button"
      @click="onClick"
    >
      <slot />
    </button>
    <span
      v-else
      class="uid-breadcrumb__text"
    >
      <slot />
    </span>
  </li>
</template>
