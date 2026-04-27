<script setup lang="ts">
import './UidInput.css'
import { computed, useId } from 'vue'
import { useField } from '../../composables/useField'
import type { Size } from '../../types/index.js'
import type { RuleInput } from '../../utils/validation/types.js'

export interface UidInputProps {
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: Size
  label?: string
  hint?: string
  error?: string
  required?: boolean
  name?: string
  rules?: RuleInput
  id?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<UidInputProps>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  size: 'md',
  required: false,
})

const emit = defineEmits<{
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

defineSlots<{
  prepend?(): unknown
  append?(): unknown
}>()

const model = defineModel<string>({ default: '' })

const inputId = props.id ?? useId()

const { error: internalError, validate, onBlur: fieldOnBlur } = useField(model, computed(() => props.rules), {
  name: props.name,
  label: props.label,
})

const errorMessage = computed(() => props.error || internalError.value)
const hasError = computed(() => !!errorMessage.value)
const hintText = computed(() => errorMessage.value || props.hint)

function onBlur(event: FocusEvent): void {
  fieldOnBlur()
  emit('blur', event)
}

defineExpose({ validate })
</script>

<template>
  <div
    class="uid-input-field"
    :class="[
      `uid-input-field--${size}`,
      hasError && 'uid-input-field--error',
      disabled && 'uid-input-field--disabled',
      readonly && 'uid-input-field--readonly',
    ]"
  >
    <label
      v-if="label"
      :for="inputId"
      class="uid-input-field__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="uid-input-field__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div class="uid-input-field__control">
      <span
        v-if="$slots.prepend"
        class="uid-input-field__prepend"
      >
        <slot name="prepend" />
      </span>

      <input
        :id="inputId"
        v-model="model"
        class="uid-input-field__input"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :aria-invalid="hasError ? 'true' : undefined"
        :aria-describedby="hintText ? `${inputId}-hint` : undefined"
        @blur="onBlur"
        @focus="emit('focus', $event)"
      >

      <span
        v-if="$slots.append"
        class="uid-input-field__append"
      >
        <slot name="append" />
      </span>
    </div>

    <p
      v-if="hintText"
      :id="`${inputId}-hint`"
      class="uid-input-field__hint"
      :class="hasError && 'uid-input-field__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
