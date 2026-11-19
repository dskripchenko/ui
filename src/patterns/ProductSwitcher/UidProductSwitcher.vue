<script setup lang="ts">
import { computed, type Component } from 'vue'
import { ArrowLeftRight } from 'lucide-vue-next'
import UidNotificationBadge from '../../components/NotificationBadge/UidNotificationBadge.vue'
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
  /**
   * What waits for the person in that product (its bell's count). Shown over
   * the icon of another product; the current one keeps it on its own bell.
   */
  badge?: number
}

export interface UidProductSwitcherProps {
  items: UidProductSwitcherItem[]
  /** One ⇄ button to the next product instead of the segments (a collapsed sidebar). */
  compact?: boolean
  /** Accessible name of the group. */
  label?: string
  /** Title of a link: receives the item, returns e.g. "Open KB-12 in Docs". Defaults to the label. */
  hint?: (item: UidProductSwitcherItem) => string
  /** Accessible name of a product with a count: receives the name and the count, e.g. "Messenger, 3 new". */
  badgeLabel?: (name: string, count: number) => string
}

const props = withDefaults(defineProps<UidProductSwitcherProps>(), {
  compact: false,
  label: 'Products',
  hint: undefined,
  badgeLabel: (name: string, count: number) => `${name}, ${count}`,
})

const count = (item: UidProductSwitcherItem): number => (item.current ? 0 : Math.max(0, Math.floor(item.badge ?? 0)))
const named = (item: UidProductSwitcherItem): string => (props.hint ? props.hint(item) : item.label)
const title = (item: UidProductSwitcherItem): string => (count(item) > 0 ? props.badgeLabel(named(item), count(item)) : named(item))
// The compact button stands for every other product: what waits in all of them.
const others = computed<number>(() => props.items.reduce((sum, item) => sum + count(item), 0))

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
    <UidNotificationBadge
      v-if="compact && next"
      :count="others"
      dot
      class="uid-product-switcher__badge"
    >
      <a
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
    </UidNotificationBadge>
    <template v-else>
      <UidNotificationBadge
        v-for="item in items"
        :key="item.key"
        :count="count(item)"
        :max="99"
        class="uid-product-switcher__badge"
        :data-test="`product-badge-${item.key}`"
      >
      <a
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
      </UidNotificationBadge>
    </template>
  </nav>
</template>
