<script setup lang="ts">
import './UidRadioGroup.css'
import { computed, provide, useId } from 'vue'
import { RADIO_GROUP_KEY, type RadioValue } from './context.js'

export interface UidRadioGroupProps {
  name?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  direction?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<UidRadioGroupProps>(), {
  name: undefined,
  label: undefined,
  hint: undefined,
  error: undefined,
  disabled: false,
  required: false,
  direction: 'vertical',
})

const model = defineModel<RadioValue>()
const autoId = useId()
const groupName = props.name ?? autoId
const legendId = useId()
const hintId = useId()

const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)
const disabledRef = computed(() => props.disabled)

provide(RADIO_GROUP_KEY, {
  modelValue: model as ReturnType<typeof defineModel<RadioValue>>,
  update: (value: RadioValue) => { model.value = value },
  name: groupName,
  disabled: disabledRef,
})

defineSlots<{ default(): unknown }>()
</script>

<template>
  <div
    role="radiogroup"
    class="uid-radio-group"
    :class="[
      `uid-radio-group--${direction}`,
      hasError && 'uid-radio-group--error',
      disabled && 'uid-radio-group--disabled',
    ]"
    :aria-labelledby="label ? legendId : undefined"
    :aria-describedby="hintText ? hintId : undefined"
    :aria-required="required ? 'true' : undefined"
    :aria-invalid="hasError ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <p
      v-if="label"
      :id="legendId"
      class="uid-radio-group__legend"
    >
      {{ label }}
      <span
        v-if="required"
        class="uid-radio-group__required"
        aria-hidden="true"
      >*</span>
    </p>

    <div class="uid-radio-group__options">
      <slot />
    </div>

    <p
      v-if="hintText"
      :id="hintId"
      class="uid-radio-group__hint"
      :class="hasError && 'uid-radio-group__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
