<script setup lang="ts">
import { Bell, Globe, Moon, PanelLeft, Search, Sun } from 'lucide-vue-next'
import UidButton from '../../components/Button/UidButton.vue'
import UidNotificationBadge from '../../components/NotificationBadge/UidNotificationBadge.vue'
import './UidTopBar.css'

export interface UidTopBarProps {
  /** The menu button on the left (a sidebar to collapse). */
  toggle?: boolean
  toggleLabel?: string
  /** The search field that opens a command palette; null — none. */
  searchLabel?: string | null
  /** The keys that open it, shown in the field. */
  searchShortcut?: string
  /** Unread notifications on the bell; null — no bell. */
  notifications?: number | null
  notificationsLabel?: string
  /** The current theme: the button offers the other one; null — no button. */
  theme?: 'light' | 'dark' | null
  lightLabel?: string
  darkLabel?: string
  /** The current language's code, e.g. "ru": the button switches it; null — no button. */
  locale?: string | null
  localeLabel?: string
}

withDefaults(defineProps<UidTopBarProps>(), {
  toggle: true,
  toggleLabel: 'Toggle the menu',
  searchLabel: 'Search…',
  searchShortcut: '⌘K',
  notifications: null,
  notificationsLabel: 'Notifications',
  theme: null,
  lightLabel: 'Light theme',
  darkLabel: 'Dark theme',
  locale: null,
  localeLabel: 'Language',
})

const emit = defineEmits<{
  toggle: []
  search: []
  notifications: []
  theme: []
  locale: []
}>()

defineSlots<{
  /** Breadcrumbs or a title, filling the space. */
  crumbs?(): unknown
  /** Before the user: anything the app adds to the bar. */
  actions?(): unknown
  /** The signed-in person: an avatar with a menu. */
  user?(): unknown
}>()
</script>

<template>
  <header class="uid-top-bar">
    <UidButton
      v-if="toggle"
      variant="ghost"
      size="sm"
      :icon="PanelLeft"
      :aria-label="toggleLabel"
      :title="toggleLabel"
      class="uid-top-bar__toggle"
      data-test="toggle-sidebar"
      @click="emit('toggle')"
    />
    <div class="uid-top-bar__crumbs">
      <slot name="crumbs" />
    </div>
    <button
      v-if="searchLabel !== null"
      type="button"
      class="uid-top-bar__search"
      :aria-label="searchLabel"
      data-test="open-palette"
      @click="emit('search')"
    >
      <Search :size="14" />
      <span class="uid-top-bar__search-text">{{ searchLabel }}</span>
      <kbd
        v-if="searchShortcut"
        class="uid-top-bar__kbd"
      >{{ searchShortcut }}</kbd>
    </button>
    <UidNotificationBadge
      v-if="notifications !== null"
      :count="notifications"
      :max="99"
      tone="danger"
      class="uid-top-bar__badge"
      data-test="bell-count"
    >
      <UidButton
        variant="ghost"
        size="sm"
        :icon="Bell"
        :aria-label="notificationsLabel"
        :title="notificationsLabel"
        data-test="bell"
        @click="emit('notifications')"
      />
    </UidNotificationBadge>
    <slot name="actions" />
    <UidButton
      v-if="theme !== null"
      variant="ghost"
      size="sm"
      :icon="theme === 'dark' ? Sun : Moon"
      :aria-label="theme === 'dark' ? lightLabel : darkLabel"
      :title="theme === 'dark' ? lightLabel : darkLabel"
      class="uid-top-bar__extra"
      data-test="theme"
      @click="emit('theme')"
    />
    <button
      v-if="locale !== null"
      type="button"
      class="uid-top-bar__locale uid-top-bar__extra"
      :title="localeLabel"
      :aria-label="`${locale.toUpperCase()} — ${localeLabel}`"
      data-test="locale"
      @click="emit('locale')"
    >
      <Globe :size="14" />
      {{ locale.toUpperCase() }}
    </button>
    <slot name="user" />
  </header>
</template>
