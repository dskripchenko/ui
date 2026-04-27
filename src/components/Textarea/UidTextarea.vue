<script setup lang="ts">
import './UidTextarea.css'
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { useField } from '../../composables/useField.js'
import type { Size } from '../../types/index.js'
import type { RuleInput } from '../../utils/validation/types.js'

export interface UidTextareaProps {
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
  rows?: number
  autoGrow?: boolean
  maxRows?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const props = withDefaults(defineProps<UidTextareaProps>(), {
  placeholder: undefined,
  label: undefined,
  hint: undefined,
  error: undefined,
  name: undefined,
  rules: undefined,
  id: undefined,
  maxRows: undefined,
  disabled: false,
  readonly: false,
  size: 'md',
  required: false,
  rows: 3,
  autoGrow: false,
  resize: 'vertical',
})

const emit = defineEmits<{
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const model = defineModel<string>({ default: '' })
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const autoId = useId()
const inputId = props.id ?? autoId

const { error: internalError, validate, onBlur: fieldOnBlur } = useField(model, computed(() => props.rules), {
  name: props.name,
  label: props.label,
})

const errorMessage = computed(() => props.error || internalError.value)
const hasError = computed(() => !!errorMessage.value)
const hintText = computed(() => errorMessage.value || props.hint)

function adjustHeight(): void {
  const el = textareaRef.value
  if (!el) return
  const style = getComputedStyle(el)
  el.style.height = 'auto'
  let newHeight = el.scrollHeight
  if (props.maxRows) {
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    newHeight = Math.min(newHeight, lineHeight * props.maxRows + paddingY)
  }
  el.style.height = `${newHeight}px`
}

onMounted(() => {
  if (props.autoGrow) adjustHeight()
})

watch(model, async () => {
  if (props.autoGrow) {
    await nextTick()
    adjustHeight()
  }
})

function onBlur(event: FocusEvent): void {
  fieldOnBlur()
  emit('blur', event)
}

defineExpose({ validate })
</script>

<template>
  <div
    class="uid-textarea-field"
    :class="[
      `uid-textarea-field--${size}`,
      hasError && 'uid-textarea-field--error',
      disabled && 'uid-textarea-field--disabled',
      readonly && 'uid-textarea-field--readonly',
    ]"
  >
    <label
      v-if="label"
      :for="inputId"
      class="uid-textarea-field__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="uid-textarea-field__required"
        aria-hidden="true"
      >*</span>
    </label>

    <textarea
      :id="inputId"
      ref="textareaRef"
      v-model="model"
      class="uid-textarea-field__textarea"
      :name="name"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-describedby="hintText ? `${inputId}-hint` : undefined"
      :style="autoGrow ? { resize: 'none', overflow: 'hidden' } : { resize }"
      @blur="onBlur"
      @focus="emit('focus', $event)"
    />

    <p
      v-if="hintText"
      :id="`${inputId}-hint`"
      class="uid-textarea-field__hint"
      :class="hasError && 'uid-textarea-field__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
