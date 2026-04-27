<script setup lang="ts">
import { computed, inject } from 'vue'
import { TABS_KEY, type TabValue } from './context.js'

export interface UidTabPanelProps {
  value: TabValue
}

const props = defineProps<UidTabPanelProps>()

defineSlots<{
  default(): unknown
}>()

const context = inject(TABS_KEY)!
const isActive = computed(() => context.activeTab.value === props.value)
const panelId = computed(() => `${context.idPrefix}-panel-${props.value}`)
const tabId = computed(() => `${context.idPrefix}-tab-${props.value}`)
</script>

<template>
  <div
    v-if="isActive"
    :id="panelId"
    class="uid-tab-panel"
    role="tabpanel"
    :aria-labelledby="tabId"
    tabindex="0"
  >
    <slot />
  </div>
</template>
