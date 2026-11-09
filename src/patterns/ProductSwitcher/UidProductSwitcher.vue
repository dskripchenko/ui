<script setup lang="ts">
import { computed, type Component } from 'vue'
import { ArrowLeftRight } from '../../icons/index.js'
import './UidProductSwitcher.css'

export interface UidProductSwitcherItem {
  /** Stable key of the product. */
  key: string
  /** Name for the tooltip and screen readers. */
  label: string
  /** Where the product opens — usually the same object in the other product. */
  href: string
  /** Lucide-style icon component. */
  icon?: Component
  /** The product the person is in now. */
  current?: boolean
}

export interface UidProductSwitcherProps {
  items: UidProductSwitcherItem[]
  /** One ⇄ button to the next product instead of the segments (a collapsed sidebar). */
  compact?: boolean
  /** Accessible name of the group. */
  label?: string
  /** Title of a link: receives the item, returns e.g. "Open KB-12 in Docs". Defaults to the label. */
  hint?: (item: UidProductSwitcherItem) => string
}

const props = withDefaults(defineProps<UidProductSwitcherProps>(), {
  compact: false,
  label: 'Products',
  hint: undefined,
})

const title = (item: UidProductSwitcherItem): string => (props.hint ? props.hint(item) : item.label)

// The compact button leads to the product after the current one.
const next = computed<UidProductSwitcherItem | undefined>(() => {
  const at = props.items.findIndex((item) => item.current)
  return props.items[(at + 1) % Math.max(props.items.length, 1)]
})
</script>

<template>
  <nav
    class="uid-product-switcher"
    :class="{ 'uid-product-switcher--compact': compact }"
    :aria-label="label"
  >
    <a
      v-if="compact && next"
      class="uid-product-switcher__toggle"
      :href="next.href"
      :title="title(next)"
      :aria-label="title(next)"
    >
      <ArrowLeftRight
        :size="16"
        aria-hidden="true"
      />
    </a>
    <template v-else>
      <a
        v-for="item in items"
        :key="item.key"
        class="uid-product-switcher__item"
        :class="{ 'uid-product-switcher__item--current': item.current }"
        :href="item.current ? undefined : item.href"
        :title="item.current ? item.label : title(item)"
        :aria-label="item.current ? item.label : title(item)"
        :aria-current="item.current ? 'page' : undefined"
        :role="item.current ? 'link' : undefined"
        :aria-disabled="item.current || undefined"
      >
        <component
          :is="item.icon"
          v-if="item.icon"
          :size="14"
          aria-hidden="true"
        />
        <span
          v-else
          class="uid-product-switcher__letter"
          aria-hidden="true"
        >{{ item.label.charAt(0) }}</span>
      </a>
    </template>
  </nav>
</template>
