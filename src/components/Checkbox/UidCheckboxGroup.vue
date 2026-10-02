<script setup lang="ts">
import './UidCheckboxGroup.css'
import { computed, useId } from 'vue'
import UidCheckbox from './UidCheckbox.vue'

export type CheckboxGroupValue = string | number

export interface CheckboxGroupOption {
  value: CheckboxGroupValue
  label: string
  disabled?: boolean
}

export interface UidCheckboxGroupProps {
  options: CheckboxGroupOption[]
  name?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  direction?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<UidCheckboxGroupProps>(), {
  name: undefined,
  label: undefined,
  hint: undefined,
  error: undefined,
  disabled: false,
  required: false,
  direction: 'vertical',
})

const emit = defineEmits<{
  change: [value: CheckboxGroupValue[]]
}>()

const model = defineModel<CheckboxGroupValue[]>({ default: () => [] })

const autoId = useId()
const groupName = computed(() => props.name ?? autoId)
const legendId = useId()
const hintId = useId()

const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)

const selected = computed<CheckboxGroupValue[]>(() => (Array.isArray(model.value) ? model.value : []))

function isChecked(value: CheckboxGroupValue): boolean {
  return selected.value.includes(value)
}

function toggle(option: CheckboxGroupOption, checked: boolean): void {
  if (props.disabled || option.disabled) return
  const current = selected.value
  // Keep the order of the options list so the value is stable regardless of click order.
  const next = checked
    ? props.options
      .map(o => o.value)
      .filter(v => v === option.value || current.includes(v))
      .concat(current.filter(v => !props.options.some(o => o.value === v)))
    : current.filter(v => v !== option.value)
  model.value = next
  emit('change', next)
}
</script>

<template>
  <div
    role="group"
    class="uid-checkbox-group"
    :class="[
      `uid-checkbox-group--${direction}`,
      hasError && 'uid-checkbox-group--error',
      disabled && 'uid-checkbox-group--disabled',
    ]"
    :aria-labelledby="label ? legendId : undefined"
    :aria-describedby="hintText ? hintId : undefined"
    :aria-invalid="hasError ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <p
      v-if="label"
      :id="legendId"
      class="uid-checkbox-group__legend"
    >
      {{ label }}
      <span
        v-if="required"
        class="uid-checkbox-group__required"
        aria-hidden="true"
      >*</span>
    </p>

    <div class="uid-checkbox-group__options">
      <UidCheckbox
        v-for="option in options"
        :key="option.value"
        class="uid-checkbox-group__option"
        :model-value="isChecked(option.value)"
        :label="option.label"
        :name="groupName"
        :disabled="disabled || option.disabled"
        @update:model-value="toggle(option, $event)"
      />
    </div>

    <p
      v-if="hintText"
      :id="hintId"
      class="uid-checkbox-group__hint"
      :class="hasError && 'uid-checkbox-group__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
