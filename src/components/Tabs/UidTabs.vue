<script setup lang="ts">
import './UidTabs.css'
import { provide, useId } from 'vue'
import { TABS_KEY, type TabValue } from './context.js'

export interface UidTabsProps {
  orientation?: 'horizontal' | 'vertical'
}

const model = defineModel<TabValue>({ required: true })

withDefaults(defineProps<UidTabsProps>(), {
  orientation: 'horizontal',
})

defineSlots<{
  list(): unknown
  default(): unknown
}>()

const idPrefix = useId()

provide(TABS_KEY, {
  activeTab: model,
  setTab: (value: TabValue) => { model.value = value },
  idPrefix,
})
</script>

<template>
  <div
    class="uid-tabs"
    :class="`uid-tabs--${orientation}`"
  >
    <div
      class="uid-tabs__list"
      role="tablist"
      :aria-orientation="orientation"
    >
      <slot name="list" />
    </div>
    <div class="uid-tabs__panels">
      <slot />
    </div>
  </div>
</template>
