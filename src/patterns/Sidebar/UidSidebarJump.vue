<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { computed, inject } from 'vue'
import { SIDEBAR_COLLAPSED } from './context.js'

export interface UidSidebarJumpProps {
  /** The field's text, e.g. "Go to a conversation…". */
  label: string
  /** The keys that open it. */
  shortcut?: string
}

const props = withDefaults(defineProps<UidSidebarJumpProps>(), { shortcut: '⌘K' })
const emit = defineEmits<{ open: [] }>()
const collapsed = inject(SIDEBAR_COLLAPSED, computed(() => false))
const name = computed(() => (props.shortcut ? `${props.label} ${props.shortcut}` : props.label))
</script>

<template>
  <button
    type="button"
    class="uid-sidebar-jump"
    :class="{ 'uid-sidebar-jump--icon': collapsed }"
    :aria-label="name"
    :title="collapsed ? name : undefined"
    :aria-keyshortcuts="shortcut === '⌘K' ? 'Meta+K Control+K' : undefined"
    @click="emit('open')"
  >
    <Search
      :size="14"
      aria-hidden="true"
    />
    <template v-if="!collapsed">
      <span class="uid-sidebar-jump__label">{{ label }}</span>
      <kbd
        v-if="shortcut"
        class="uid-sidebar-jump__kbd"
      >{{ shortcut }}</kbd>
    </template>
  </button>
</template>
