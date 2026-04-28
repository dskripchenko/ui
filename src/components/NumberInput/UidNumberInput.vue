<script setup lang="ts">
import './UidNumberInput.css'
import { computed, useId } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import type { Size } from '../../types/index.js'

export interface UidNumberInputProps {
  min?: number
  max?: number
  step?: number
  precision?: number
  disabled?: boolean
  readonly?: boolean
  size?: Size
  label?: string
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
  name?: string
  id?: string
  controls?: boolean
  centered?: boolean
}

const props = withDefaults(defineProps<UidNumberInputProps>(), {
  min: undefined,
  max: undefined,
  step: 1,
  precision: undefined,
  disabled: false,
  readonly: false,
  size: 'md',
  required: false,
  controls: true,
  centered: false,
})

const emit = defineEmits<{
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  change: [value: number | null]
}>()

const model = defineModel<number | null>({ default: null })

const inputId = props.id ?? useId()
const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)

const isMinReached = computed(() =>
  props.min !== undefined && model.value !== null && model.value <= props.min,
)
const isMaxReached = computed(() =>
  props.max !== undefined && model.value !== null && model.value >= props.max,
)

function clamp(n: number): number {
  if (props.min !== undefined && n < props.min) n = props.min
  if (props.max !== undefined && n > props.max) n = props.max
  return n
}

function round(n: number): number {
  if (props.precision === undefined) return n
  const f = 10 ** props.precision
  return Math.round(n * f) / f
}

function commit(next: number | null): void {
  const prev = model.value
  if (next === prev) return
  model.value = next
  emit('change', next)
}

function increment(): void {
  if (props.disabled || props.readonly) return
  const base = model.value ?? props.min ?? 0
  commit(round(clamp(base + props.step)))
}

function decrement(): void {
  if (props.disabled || props.readonly) return
  const base = model.value ?? props.max ?? 0
  commit(round(clamp(base - props.step)))
}

function onInput(e: Event): void {
  const raw = (e.target as HTMLInputElement).value
  if (raw === '' || raw === '-') {
    commit(null)
    return
  }
  const n = Number(raw)
  if (Number.isNaN(n)) return
  commit(round(n))
}

function onBlur(e: FocusEvent): void {
  if (model.value !== null) {
    const clamped = round(clamp(model.value))
    if (clamped !== model.value) commit(clamped)
  }
  emit('blur', e)
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'ArrowUp') { e.preventDefault(); increment() }
  else if (e.key === 'ArrowDown') { e.preventDefault(); decrement() }
}

const displayValue = computed(() => model.value === null ? '' : String(model.value))
</script>

<template>
  <div
    class="uid-number-input"
    :class="[
      `uid-number-input--${size}`,
      hasError && 'uid-number-input--error',
      disabled && 'uid-number-input--disabled',
      readonly && 'uid-number-input--readonly',
      centered && 'uid-number-input--centered',
    ]"
  >
    <label
      v-if="label"
      :for="inputId"
      class="uid-number-input__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="uid-number-input__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div class="uid-number-input__control">
      <button
        v-if="controls"
        type="button"
        class="uid-number-input__btn uid-number-input__btn--prefix"
        :disabled="disabled || readonly || isMinReached"
        :aria-label="`Уменьшить на ${step}`"
        tabindex="-1"
        @click="decrement"
      >
        <UidIcon
          :icon="Minus"
          :size="14"
        />
      </button>

      <input
        :id="inputId"
        class="uid-number-input__input"
        type="number"
        inputmode="decimal"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :value="displayValue"
        :aria-invalid="hasError ? 'true' : undefined"
        :aria-describedby="hintText ? `${inputId}-hint` : undefined"
        @input="onInput"
        @blur="onBlur"
        @focus="emit('focus', $event)"
        @keydown="onKeydown"
      >

      <button
        v-if="controls"
        type="button"
        class="uid-number-input__btn"
        :disabled="disabled || readonly || isMaxReached"
        :aria-label="`Увеличить на ${step}`"
        tabindex="-1"
        @click="increment"
      >
        <UidIcon
          :icon="Plus"
          :size="14"
        />
      </button>
    </div>

    <p
      v-if="hintText"
      :id="`${inputId}-hint`"
      class="uid-number-input__hint"
      :class="hasError && 'uid-number-input__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
