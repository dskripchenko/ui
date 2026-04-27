<script setup lang="ts">
export interface UidBreadcrumbItemProps {
  href?: string
  current?: boolean
}

withDefaults(defineProps<UidBreadcrumbItemProps>(), {
  href: undefined,
  current: false,
})

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <li class="uid-breadcrumb__item">
    <a
      v-if="href && !current"
      class="uid-breadcrumb__link"
      :href="href"
    >
      <slot />
    </a>
    <span
      v-else
      class="uid-breadcrumb__current"
      :aria-current="current ? 'page' : undefined"
    >
      <slot />
    </span>
  </li>
</template>
