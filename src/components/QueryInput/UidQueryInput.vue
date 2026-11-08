<script setup lang="ts">
import './UidQueryInput.css'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useFloatingPanel } from '../../composables/useFloatingPanel.js'
import { useControlAttrs } from '../../composables/useControlAttrs.js'
import type { UidCodeToken } from '../Code/index.js'

/** A word the field offers at the caret. */
export interface QuerySuggestion {
  value: string
  label?: string
  hint?: string
}

/** What to offer and which part of the text the choice replaces. */
export interface QuerySuggestions {
  from: number
  to: number
  options: QuerySuggestion[]
}

/** A part of the text to underline, in characters from the start. */
export interface QueryInputError {
  position: number
  length: number
  message?: string
}

export interface UidQueryInputProps {
  /** Splits the text into coloured tokens; their texts joined are the whole text. */
  tokenize?: (text: string) => UidCodeToken[]
  /** What to offer at the caret; null — nothing. */
  suggest?: (text: string, caret: number) => QuerySuggestions | null
  /** The part to underline, with the reason as its title. */
  error?: QueryInputError | null
  placeholder?: string
  disabled?: boolean
  /** A short tag before the text (the language's name). */
  prefix?: string
}

defineOptions({ inheritAttrs: false })
const { rootAttrs, controlAttrs } = useControlAttrs()

const props = withDefaults(defineProps<UidQueryInputProps>(), {
  tokenize: undefined,
  suggest: undefined,
  error: null,
  placeholder: undefined,
  prefix: undefined,
})

const emit = defineEmits<{
  /** Enter with no suggestion open. */
  submit: [value: string]
}>()

const model = defineModel<string>({ default: '' })

const fieldRef = ref<HTMLInputElement | null>(null)
const mirrorRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const wrapRef = ref<HTMLElement | null>(null)
const listId = useId()
const isOpen = ref(false)
const activeIndex = ref(0)
const offer = ref<QuerySuggestions | null>(null)
const { panelStyle } = useFloatingPanel(wrapRef, panelRef, isOpen)

/** The tokens with the error range cut out of them and marked. */
const pieces = computed(() => {
  const text = model.value
  const tokens = props.tokenize ? props.tokenize(text) : [{ type: 'plain' as const, text }]
  const from = props.error ? Math.max(0, props.error.position) : -1
  const to = props.error ? Math.min(text.length, from + Math.max(1, props.error.length)) : -1
  const out: { type: string; text: string; error: boolean }[] = []
  let at = 0
  for (const token of tokens) {
    const end = at + token.text.length
    if (from >= 0 && from < end && to > at) {
      const a = Math.max(from, at) - at
      const b = Math.min(to, end) - at
      if (a > 0) out.push({ type: token.type, text: token.text.slice(0, a), error: false })
      out.push({ type: token.type, text: token.text.slice(a, b), error: true })
      if (b < token.text.length) out.push({ type: token.type, text: token.text.slice(b), error: false })
    } else {
      out.push({ type: token.type, text: token.text, error: false })
    }
    at = end
  }
  // An error past the end (a missing word) shows as a mark after the text.
  if (from >= text.length && props.error) out.push({ type: 'plain', text: ' ', error: true })
  return out
})

function refresh(): void {
  const field = fieldRef.value
  if (!field || !props.suggest) {
    isOpen.value = false
    return
  }
  const next = props.suggest(model.value, field.selectionStart ?? model.value.length)
  offer.value = next && next.options.length > 0 ? next : null
  activeIndex.value = 0
  isOpen.value = offer.value !== null && document.activeElement === field
}

function choose(option: QuerySuggestion): void {
  const current = offer.value
  const field = fieldRef.value
  if (!current || !field) return
  const before = model.value.slice(0, current.from)
  const after = model.value.slice(current.to)
  const spaced = after.startsWith(' ') || option.value.endsWith('(') ? '' : ' '
  model.value = before + option.value + spaced + after
  isOpen.value = false
  void nextTick(() => {
    const caret = before.length + option.value.length + spaced.length
    field.focus()
    field.setSelectionRange(caret, caret)
    refresh()
  })
}

function syncScroll(): void {
  if (mirrorRef.value && fieldRef.value) mirrorRef.value.scrollLeft = fieldRef.value.scrollLeft
}

function onInput(event: Event): void {
  model.value = (event.target as HTMLInputElement).value
  void nextTick(() => {
    syncScroll()
    refresh()
  })
}

function onKeydown(event: KeyboardEvent): void {
  const options = offer.value?.options ?? []
  if (isOpen.value && options.length > 0) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % options.length
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + options.length) % options.length
      return
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      const option = options[activeIndex.value]
      if (option) {
        event.preventDefault()
        choose(option)
        return
      }
    }
    if (event.key === 'Escape') {
      // Ours to handle: an enclosing dialog must not close with the list.
      event.stopPropagation()
      isOpen.value = false
      return
    }
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('submit', model.value)
  }
  if (event.key === ' ' && event.ctrlKey) {
    event.preventDefault()
    refresh()
  }
}

watch(model, () => void nextTick(syncScroll))

defineExpose({ focus: () => fieldRef.value?.focus() })
</script>

<template>
  <div
    v-bind="rootAttrs()"
    ref="wrapRef"
    class="uid-query-input"
    :class="{ 'uid-query-input--disabled': disabled, 'uid-query-input--invalid': error }"
  >
    <span
      v-if="prefix || $slots.prefix"
      class="uid-query-input__prefix"
    >
      <slot name="prefix">{{ prefix }}</slot>
    </span>
    <div class="uid-query-input__box">
      <div
        ref="mirrorRef"
        class="uid-query-input__mirror"
        aria-hidden="true"
      ><span
        v-for="(piece, index) in pieces"
        :key="index"
        :class="[`uid-query-input__tok--${piece.type}`, { 'uid-query-input__error': piece.error }]"
      >{{ piece.text }}</span></div>
      <input
        v-bind="controlAttrs()"
        ref="fieldRef"
        class="uid-query-input__field"
        type="text"
        role="combobox"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        :aria-expanded="isOpen"
        :aria-controls="listId"
        :aria-invalid="error ? 'true' : undefined"
        :title="error?.message"
        :value="model"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="onInput"
        @keydown="onKeydown"
        @click="refresh"
        @focus="refresh"
        @scroll="syncScroll"
        @blur="isOpen = false"
      >
    </div>
    <span
      v-if="$slots.suffix"
      class="uid-query-input__suffix"
    >
      <slot name="suffix" />
    </span>

    <Teleport to="body">
      <div
        v-if="isOpen && offer"
        :id="listId"
        ref="panelRef"
        class="uid-query-input__panel"
        role="listbox"
        :style="panelStyle"
      >
        <button
          v-for="(option, index) in offer.options"
          :key="option.value"
          type="button"
          role="option"
          class="uid-query-input__option"
          :class="{ 'uid-query-input__option--active': index === activeIndex }"
          :aria-selected="index === activeIndex"
          @mousedown.prevent="choose(option)"
          @mouseenter="activeIndex = index"
        >
          <span class="uid-query-input__option-label">{{ option.label ?? option.value }}</span>
          <span
            v-if="option.hint"
            class="uid-query-input__option-hint"
          >{{ option.hint }}</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>
