<script setup lang="ts">
import { computed, inject } from 'vue'
import { Check } from 'lucide-vue-next'
import { MENU_CLOSE_KEY } from './context.js'
import UidIcon from '../../icons/UidIcon.vue'
import type { Component } from 'vue'

export interface UidMenuItemProps {
  /** Icon component (e.g. from lucide-vue-next) rendered before the label. */
  icon?: Component
  disabled?: boolean
  variant?: 'default' | 'danger'
  /** A second, quieter line under the label. */
  hint?: string
  /**
   * A choice: `radio` — one of a group, a check mark when chosen;
   * `switch` — on or off, a switch at the end. A plain item by default.
   */
  type?: 'item' | 'radio' | 'switch'
  /** Whether a radio or switch item is on. */
  checked?: boolean
  /** Keep the menu open after a click. Switch items keep it open unless told otherwise. */
  keepOpen?: boolean
}

const props = withDefaults(defineProps<UidMenuItemProps>(), {
  icon: undefined,
  disabled: false,
  variant: 'default',
  hint: undefined,
  type: 'item',
  checked: false,
  keepOpen: undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

defineSlots<{
  default(): unknown
}>()

const close = inject(MENU_CLOSE_KEY, () => {})

const role = computed(() => (props.type === 'radio' ? 'menuitemradio' : props.type === 'switch' ? 'menuitemcheckbox' : 'menuitem'))
const stays = computed(() => props.keepOpen ?? props.type === 'switch')
const rich = computed(() => props.hint !== undefined || props.type !== 'item')

function handleClick(event: MouseEvent): void {
  if (props.disabled) return
  emit('click', event)
  if (!stays.value) close()
}
</script>

<template>
  <button
    type="button"
    class="uid-menu-item"
    :class="[
      `uid-menu-item--${variant}`,
      {
        'uid-menu-item--disabled': disabled,
        'uid-menu-item--rich': rich,
        'uid-menu-item--checked': type !== 'item' && checked,
      },
    ]"
    :role="role"
    :aria-checked="type === 'item' ? undefined : checked"
    :disabled="disabled"
    @click="handleClick"
  >
    <UidIcon
      v-if="icon"
      class="uid-menu-item__icon"
      :icon="icon"
      :size="16"
    />
    <span
      v-if="rich"
      class="uid-menu-item__body"
    >
      <span class="uid-menu-item__label"><slot /></span>
      <span
        v-if="hint"
        class="uid-menu-item__hint"
      >{{ hint }}</span>
    </span>
    <slot v-else />
    <UidIcon
      v-if="type === 'radio' && checked"
      class="uid-menu-item__check"
      :icon="Check"
      :size="16"
    />
    <span
      v-if="type === 'switch'"
      class="uid-menu-item__switch"
      aria-hidden="true"
    ><span class="uid-menu-item__thumb" /></span>
  </button>
</template>
