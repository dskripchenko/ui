<script setup lang="ts">
import './UidFormField.css'
import { computed, useId } from 'vue'

export interface UidFormFieldProps {
  label?: string
  labelFor?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<UidFormFieldProps>(), {
  label: undefined,
  labelFor: undefined,
  hint: undefined,
  error: undefined,
  required: false,
  disabled: false,
})

const hintId = useId()
const hasHint = computed(() => !!(props.error || props.hint))
const hintText = computed(() => props.error || props.hint)
const hasError = computed(() => !!props.error)

defineSlots<{
  default(): unknown
  label?(): unknown
}>()
</script>

<template>
  <div
    class="uid-form-field"
    :class="[
      hasError && 'uid-form-field--error',
      disabled && 'uid-form-field--disabled',
    ]"
  >
    <label
      v-if="label || $slots.label"
      class="uid-form-field__label"
      :for="labelFor"
    >
      <slot name="label">{{ label }}</slot>
      <span
        v-if="required"
        class="uid-form-field__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div class="uid-form-field__content">
      <slot />
    </div>

    <p
      v-if="hasHint"
      :id="hintId"
      class="uid-form-field__hint"
      :class="hasError && 'uid-form-field__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
