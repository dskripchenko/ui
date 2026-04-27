<script setup lang="ts">
import './UidAccordion.css'
import { computed, provide } from 'vue'
import { ACCORDION_KEY } from './context.js'

export interface UidAccordionProps {
  multiple?: boolean
}

const model = defineModel<string | string[]>({ default: '' })

withDefaults(defineProps<UidAccordionProps>(), {
  multiple: false,
})

defineSlots<{
  default(): unknown
}>()

const openSet = computed<Set<string>>(() => {
  const val = model.value
  if (Array.isArray(val)) return new Set(val)
  return val ? new Set([val]) : new Set()
})

function isOpen(value: string): boolean {
  return openSet.value.has(value)
}

function toggle(value: string): void {
  const val = model.value
  if (Array.isArray(val)) {
    const set = new Set(val)
    if (set.has(value)) set.delete(value)
    else set.add(value)
    model.value = [...set]
  } else {
    model.value = val === value ? '' : value
  }
}

provide(ACCORDION_KEY, { isOpen, toggle })
</script>

<template>
  <div class="uid-accordion">
    <slot />
  </div>
</template>
