<script setup lang="ts">
import { computed, inject } from 'vue'
import { TABS_KEY, type TabValue } from './context.js'

export interface UidTabProps {
  value: TabValue
  disabled?: boolean
}

const props = withDefaults(defineProps<UidTabProps>(), {
  disabled: false,
})

defineSlots<{
  default(): unknown
}>()

const context = inject(TABS_KEY)!
const isActive = computed(() => context.activeTab.value === props.value)
const tabId = computed(() => `${context.idPrefix}-tab-${props.value}`)
const panelId = computed(() => `${context.idPrefix}-panel-${props.value}`)

function activate(): void {
  if (!props.disabled) context.setTab(props.value)
}

function onKeydown(event: KeyboardEvent): void {
  const target = event.currentTarget as HTMLElement
  const tablist = target.closest('[role="tablist"]')
  if (!tablist) return
  const tabs = Array.from(
    tablist.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'),
  )
  const idx = tabs.indexOf(target)
  const orientation = tablist.getAttribute('aria-orientation')
  const isVertical = orientation === 'vertical'

  const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'
  const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'

  if (event.key === nextKey) {
    event.preventDefault()
    const next = tabs[(idx + 1) % tabs.length]
    next?.focus()
    next?.click()
  } else if (event.key === prevKey) {
    event.preventDefault()
    const prev = tabs[(idx - 1 + tabs.length) % tabs.length]
    prev?.focus()
    prev?.click()
  } else if (event.key === 'Home') {
    event.preventDefault()
    tabs[0]?.focus()
    tabs[0]?.click()
  } else if (event.key === 'End') {
    event.preventDefault()
    tabs[tabs.length - 1]?.focus()
    tabs[tabs.length - 1]?.click()
  }
}
</script>

<template>
  <button
    :id="tabId"
    type="button"
    class="uid-tab"
    :class="{ 'uid-tab--active': isActive }"
    role="tab"
    :aria-selected="isActive"
    :aria-controls="panelId"
    :disabled="disabled || undefined"
    :tabindex="isActive ? 0 : -1"
    @click="activate"
    @keydown="onKeydown"
  >
    <slot />
  </button>
</template>
