<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { ACCORDION_KEY } from './context.js'

export interface UidAccordionItemProps {
  value: string
  title: string
  disabled?: boolean
}

const props = withDefaults(defineProps<UidAccordionItemProps>(), {
  disabled: false,
})

defineSlots<{
  default(): unknown
  title?(): unknown
}>()

const id = useId()
const headerId = `${id}-header`
const panelId = `${id}-panel`

const context = inject(ACCORDION_KEY)!
const open = computed(() => context.isOpen(props.value))

function toggle(): void {
  if (!props.disabled) context.toggle(props.value)
}
</script>

<template>
  <div
    class="uid-accordion-item"
    :class="{ 'uid-accordion-item--open': open, 'uid-accordion-item--disabled': disabled }"
  >
    <button
      :id="headerId"
      type="button"
      class="uid-accordion-item__trigger"
      :aria-expanded="open"
      :aria-controls="panelId"
      :disabled="disabled || undefined"
      @click="toggle"
    >
      <span class="uid-accordion-item__title">
        <slot name="title">{{ title }}</slot>
      </span>
      <span
        class="uid-accordion-item__chevron"
        aria-hidden="true"
      >
        <UidIcon
          :icon="ChevronDown"
          :size="16"
        />
      </span>
    </button>

    <div
      :id="panelId"
      class="uid-accordion-item__body"
      role="region"
      :aria-labelledby="headerId"
      :hidden="!open"
    >
      <div class="uid-accordion-item__body-inner">
        <slot />
      </div>
    </div>
  </div>
</template>
