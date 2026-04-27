<script setup lang="ts">
import './UidCheckbox.css'
import { computed, onMounted, ref, useId, watch } from 'vue'

export interface UidCheckboxProps {
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  indeterminate?: boolean
}

const props = withDefaults(defineProps<UidCheckboxProps>(), {
  label: undefined,
  hint: undefined,
  error: undefined,
  name: undefined,
  id: undefined,
  disabled: false,
  required: false,
  indeterminate: false,
})

const emit = defineEmits<{
  change: [value: boolean]
}>()

const model = defineModel<boolean>({ default: false })
const inputRef = ref<HTMLInputElement | null>(null)
const autoId = useId()
const inputId = props.id ?? autoId
const hintId = `${inputId}-hint`

const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)

function applyIndeterminate(val: boolean): void {
  if (inputRef.value) inputRef.value.indeterminate = val
}

onMounted(() => applyIndeterminate(props.indeterminate))
watch(() => props.indeterminate, applyIndeterminate)

function handleChange(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked
  model.value = checked
  emit('change', checked)
}
</script>

<template>
  <div
    class="uid-checkbox"
    :class="[
      hasError && 'uid-checkbox--error',
      disabled && 'uid-checkbox--disabled',
    ]"
  >
    <label class="uid-checkbox__label">
      <input
        :id="inputId"
        ref="inputRef"
        type="checkbox"
        class="uid-checkbox__input"
        :name="name"
        :checked="model"
        :disabled="disabled"
        :required="required"
        :aria-describedby="hintText ? hintId : undefined"
        :aria-invalid="hasError ? 'true' : undefined"
        @change="handleChange"
      >
      <span
        class="uid-checkbox__box"
        aria-hidden="true"
      />
      <span
        v-if="label"
        class="uid-checkbox__text"
      >
        {{ label }}
        <span
          v-if="required"
          class="uid-checkbox__required"
          aria-hidden="true"
        >*</span>
      </span>
    </label>

    <p
      v-if="hintText"
      :id="hintId"
      class="uid-checkbox__hint"
      :class="hasError && 'uid-checkbox__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
