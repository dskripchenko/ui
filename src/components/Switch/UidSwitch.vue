<script setup lang="ts">
import './UidSwitch.css'
import { computed, useId } from 'vue'
import type { Size } from '../../types/index.js'

export interface UidSwitchProps {
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  size?: Size
}

const props = withDefaults(defineProps<UidSwitchProps>(), {
  label: undefined,
  hint: undefined,
  error: undefined,
  name: undefined,
  id: undefined,
  disabled: false,
  required: false,
  size: 'md',
})

const emit = defineEmits<{
  change: [value: boolean]
}>()

const model = defineModel<boolean>({ default: false })
const autoId = useId()
const inputId = props.id ?? autoId
const hintId = `${inputId}-hint`

const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)

function handleChange(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked
  model.value = checked
  emit('change', checked)
}
</script>

<template>
  <div
    class="uid-switch"
    :class="[
      `uid-switch--${size}`,
      hasError && 'uid-switch--error',
      disabled && 'uid-switch--disabled',
    ]"
  >
    <label class="uid-switch__label">
      <input
        :id="inputId"
        type="checkbox"
        role="switch"
        class="uid-switch__input"
        :name="name"
        :checked="model"
        :disabled="disabled"
        :required="required"
        :aria-describedby="hintText ? hintId : undefined"
        :aria-invalid="hasError ? 'true' : undefined"
        @change="handleChange"
      >
      <span
        class="uid-switch__track"
        aria-hidden="true"
      >
        <span class="uid-switch__thumb" />
      </span>
      <span
        v-if="label"
        class="uid-switch__text"
      >
        {{ label }}
        <span
          v-if="required"
          class="uid-switch__required"
          aria-hidden="true"
        >*</span>
      </span>
    </label>

    <p
      v-if="hintText"
      :id="hintId"
      class="uid-switch__hint"
      :class="hasError && 'uid-switch__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
