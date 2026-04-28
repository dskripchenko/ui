<script setup lang="ts">
import './UidTagsInput.css'
import { computed, ref, useId } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import type { Size } from '../../types/index.js'

export interface UidTagsInputProps {
  separators?: string[]
  max?: number
  unique?: boolean
  validate?: (value: string) => boolean
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  size?: Size
  id?: string
}

const props = withDefaults(defineProps<UidTagsInputProps>(), {
  separators: () => [',', 'Enter'],
  max: undefined,
  unique: true,
  validate: undefined,
  required: false,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  add: [value: string]
  remove: [value: string, index: number]
}>()

const model = defineModel<string[]>({ default: () => [] })
const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const inputId = props.id ?? useId()
const locale = useLocale()

const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)
const atLimit = computed(() => props.max !== undefined && model.value.length >= props.max)

function isValid(value: string): boolean {
  if (props.validate) return props.validate(value)
  return true
}

function commit(): void {
  const trimmed = inputValue.value.trim()
  if (!trimmed) return
  if (atLimit.value) return
  if (props.unique && model.value.includes(trimmed)) {
    inputValue.value = ''
    return
  }
  if (!isValid(trimmed)) return
  model.value = [...model.value, trimmed]
  emit('add', trimmed)
  inputValue.value = ''
}

function removeAt(index: number): void {
  const removed = model.value[index]
  model.value = model.value.filter((_, i) => i !== index)
  emit('remove', removed, index)
}

function onKeydown(e: KeyboardEvent): void {
  if (props.separators.includes(e.key)) {
    e.preventDefault()
    commit()
    return
  }
  if (e.key === 'Backspace' && inputValue.value === '' && model.value.length > 0) {
    removeAt(model.value.length - 1)
  }
}

function onInput(e: Event): void {
  const target = e.target as HTMLInputElement
  let v = target.value
  for (const sep of props.separators) {
    if (sep !== 'Enter' && v.includes(sep)) {
      const parts = v.split(sep)
      v = parts.pop() ?? ''
      target.value = v
      inputValue.value = v
      for (const part of parts) {
        const trimmed = part.trim()
        if (!trimmed) continue
        if (atLimit.value) break
        if (props.unique && model.value.includes(trimmed)) continue
        if (!isValid(trimmed)) continue
        model.value = [...model.value, trimmed]
        emit('add', trimmed)
      }
      return
    }
  }
  inputValue.value = v
}

function onPaste(e: ClipboardEvent): void {
  const text = e.clipboardData?.getData('text')
  if (!text) return
  const sepRegex = new RegExp(`[${props.separators.filter(s => s !== 'Enter').join('')}\\n]`)
  if (!sepRegex.test(text)) return
  e.preventDefault()
  for (const part of text.split(sepRegex)) {
    const trimmed = part.trim()
    if (!trimmed) continue
    if (atLimit.value) break
    if (props.unique && model.value.includes(trimmed)) continue
    if (!isValid(trimmed)) continue
    model.value = [...model.value, trimmed]
    emit('add', trimmed)
  }
}

function focusInput(): void {
  inputRef.value?.focus()
}
</script>

<template>
  <div
    class="uid-tags-input"
    :class="[
      `uid-tags-input--${size}`,
      hasError && 'uid-tags-input--error',
      disabled && 'uid-tags-input--disabled',
    ]"
  >
    <label
      v-if="label"
      :for="inputId"
      class="uid-tags-input__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="uid-tags-input__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div
      class="uid-tags-input__control"
      role="list"
      @click="focusInput"
    >
      <span
        v-for="(tag, idx) in model"
        :key="`${tag}-${idx}`"
        class="uid-tags-input__chip"
        :class="{ 'uid-tags-input__chip--invalid': !isValid(tag) }"
        role="listitem"
      >
        <span>{{ tag }}</span>
        <button
          v-if="!disabled"
          type="button"
          class="uid-tags-input__chip-remove"
          :aria-label="locale.tagsInput.remove(tag)"
          @click.stop="removeAt(idx)"
        >×</button>
      </span>

      <input
        :id="inputId"
        ref="inputRef"
        class="uid-tags-input__field"
        type="text"
        :placeholder="model.length === 0 ? placeholder : ''"
        :disabled="disabled"
        :readonly="atLimit"
        :value="inputValue"
        :aria-invalid="hasError ? 'true' : undefined"
        :aria-describedby="hintText ? `${inputId}-hint` : undefined"
        @input="onInput"
        @keydown="onKeydown"
        @paste="onPaste"
        @blur="commit"
      >
    </div>

    <p
      v-if="hintText"
      :id="`${inputId}-hint`"
      class="uid-tags-input__hint"
      :class="hasError && 'uid-tags-input__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
