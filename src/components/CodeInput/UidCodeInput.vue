<script setup lang="ts">
import './UidCodeInput.css'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import type { Size } from '../../types/index.js'

export interface UidCodeInputProps {
  /** Number of cells. Default 6. */
  length?: number
  /** 'numeric' takes digits only; 'alphanumeric' takes Latin letters and digits, uppercased. Default 'numeric'. */
  mode?: 'numeric' | 'alphanumeric'
  disabled?: boolean
  /** Error styling and aria-invalid on every cell. */
  invalid?: boolean
  /** Focus the first empty cell on mount. */
  autofocus?: boolean
  /** Name of a hidden input carrying the whole value, so a form posts it. */
  name?: string
  size?: Size
  /** Accessible name of the group. Default from the locale: "Verification code". */
  label?: string
  /** id of the first cell, for an outside <label for>. */
  id?: string
}

const props = withDefaults(defineProps<UidCodeInputProps>(), {
  length: 6,
  mode: 'numeric',
  disabled: false,
  invalid: false,
  autofocus: false,
  name: undefined,
  size: 'md',
  label: undefined,
  id: undefined,
})

const emit = defineEmits<{
  /** All cells are filled; fired once per distinct complete value. */
  complete: [value: string]
}>()

const model = defineModel<string>({ default: '' })

const locale = useLocale()
const t = computed(() => locale.value.codeInput)

const count = computed(() => Math.max(1, Math.floor(props.length)))
const cells = ref<string[]>([])
const inputs: HTMLInputElement[] = []
let lastComplete: string | null = null

/** Keeps the characters `mode` allows, uppercased in alphanumeric mode. */
function sanitize(text: string): string {
  if (props.mode === 'alphanumeric') return text.toUpperCase().replace(/[^0-9A-Z]/g, '')
  return text.replace(/[^0-9]/g, '')
}

function joined(): string {
  return cells.value.join('')
}

function fromModel(value: string): void {
  const chars = [...sanitize(value ?? '')].slice(0, count.value)
  cells.value = Array.from({ length: count.value }, (_, i) => chars[i] ?? '')
  lastComplete = chars.length === count.value ? joined() : null
}

fromModel(model.value)

watch(model, (value) => {
  // Our own emits come back equal to the cells; only an outside change re-splits them.
  if (value !== joined()) fromModel(value)
})
watch(() => [props.length, props.mode], () => {
  fromModel(joined())
  if (model.value !== joined()) model.value = joined()
})

function setInput(el: unknown, i: number): void {
  if (el instanceof HTMLInputElement) inputs[i] = el
}

function commit(): void {
  const value = joined()
  model.value = value
  const complete = cells.value.every(c => c !== '')
  if (!complete) {
    lastComplete = null
  } else if (value !== lastComplete) {
    lastComplete = value
    emit('complete', value)
  }
}

function focusCell(i: number): void {
  const el = inputs[Math.min(Math.max(i, 0), count.value - 1)]
  if (!el) return
  el.focus()
  el.select()
}

/** Spreads a whole code over the cells from the first one; the rest are cleared. */
function spread(text: string): void {
  const chars = [...sanitize(text)].slice(0, count.value)
  if (chars.length === 0) return
  cells.value = Array.from({ length: count.value }, (_, i) => chars[i] ?? '')
  commit()
  void nextTick(() => focusCell(chars.length))
}

function setCell(i: number, ch: string): void {
  const next = [...cells.value]
  next[i] = ch
  cells.value = next
  commit()
}

function syncElement(i: number): void {
  const el = inputs[i]
  if (el && el.value !== cells.value[i]) el.value = cells.value[i] ?? ''
}

function onKeydown(i: number, event: KeyboardEvent): void {
  if (props.disabled) return
  const { key } = event
  if (key === 'Backspace') {
    event.preventDefault()
    if (cells.value[i]) {
      setCell(i, '')
    } else if (i > 0) {
      setCell(i - 1, '')
      focusCell(i - 1)
    }
    return
  }
  if (key === 'Delete') {
    event.preventDefault()
    if (cells.value[i]) setCell(i, '')
    return
  }
  if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End') {
    event.preventDefault()
    const target = key === 'ArrowLeft' ? i - 1 : key === 'ArrowRight' ? i + 1 : key === 'Home' ? 0 : count.value - 1
    focusCell(target)
    return
  }
  if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    // A printable key replaces the cell's character; one that mode rejects is dropped.
    event.preventDefault()
    const ch = sanitize(key)
    if (!ch) return
    setCell(i, ch)
    if (i < count.value - 1) focusCell(i + 1)
    else inputs[i]?.select()
  }
}

/** Virtual keyboards (no usable keydown) and the OS autofill of a whole code land here. */
function onInput(i: number, event: Event): void {
  const el = event.target as HTMLInputElement
  const raw = el.value
  const previous = cells.value[i] ?? ''
  let text = sanitize(raw)
  // Typed next to the old character rather than over it: keep only the new one.
  if (text.length === 2 && previous && (event as InputEvent).inputType === 'insertText') {
    text = text.startsWith(previous) ? text.slice(1) : text.slice(0, 1)
  }
  if (text.length > 1) {
    spread(text)
  } else if (text.length === 1) {
    setCell(i, text)
    if (i < count.value - 1) focusCell(i + 1)
  } else if (raw === '') {
    setCell(i, '')
  }
  syncElement(i)
}

function onPaste(event: ClipboardEvent): void {
  if (props.disabled) return
  event.preventDefault()
  spread(event.clipboardData?.getData('text') ?? '')
}

function onFocus(event: FocusEvent): void {
  (event.target as HTMLInputElement).select()
}

function focus(): void {
  const empty = cells.value.findIndex(c => c === '')
  focusCell(empty === -1 ? count.value - 1 : empty)
}

function clear(): void {
  cells.value = Array.from({ length: count.value }, () => '')
  commit()
}

onMounted(() => {
  if (props.autofocus && !props.disabled) focus()
})

defineExpose({ focus, clear })
</script>

<template>
  <div
    class="uid-code-input"
    :class="[
      `uid-code-input--${size}`,
      invalid && 'uid-code-input--invalid',
      disabled && 'uid-code-input--disabled',
    ]"
    role="group"
    :aria-label="label ?? t.label"
  >
    <input
      v-for="(ch, i) in cells"
      :id="i === 0 ? id : undefined"
      :key="i"
      :ref="(el) => setInput(el, i)"
      class="uid-code-input__cell"
      type="text"
      :value="ch"
      :inputmode="mode === 'numeric' ? 'numeric' : 'text'"
      :pattern="mode === 'numeric' ? '[0-9]*' : undefined"
      :autocomplete="i === 0 ? 'one-time-code' : 'off'"
      :autocapitalize="mode === 'alphanumeric' ? 'characters' : 'off'"
      autocorrect="off"
      spellcheck="false"
      :disabled="disabled"
      :aria-label="t.cell(i + 1, count)"
      :aria-invalid="invalid ? 'true' : undefined"
      @keydown="onKeydown(i, $event)"
      @input="onInput(i, $event)"
      @paste="onPaste"
      @focus="onFocus"
      @click="($event.target as HTMLInputElement).select()"
    >
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="model"
    >
  </div>
</template>
