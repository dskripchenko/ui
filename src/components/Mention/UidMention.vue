<script setup lang="ts">
import './UidMention.css'
import { computed, nextTick, ref, useAttrs, useId } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import { useFloatingPanel } from '../../composables/useFloatingPanel.js'
import { useControlAttrs } from '../../composables/useControlAttrs.js'

export interface MentionOption {
  value: string
  label: string
  hint?: string
}

export interface UidMentionProps {
  options: MentionOption[]
  prefix?: string | string[]
  placeholder?: string
  disabled?: boolean
  rows?: number
  label?: string
  emptyText?: string
  filter?: (option: MentionOption, query: string) => boolean
}

defineOptions({ inheritAttrs: false })
const { rootAttrs, controlAttrs } = useControlAttrs()
const attrs = useAttrs()

// The host's keydown runs after the list's: keys the open list takes (arrows,
// Enter, Tab, Escape) never reach it, so Enter picks an option, not "send".
function fieldAttrs(): Record<string, unknown> {
  const rest = controlAttrs()
  delete rest.onKeydown
  return rest
}

function hostKeydown(e: KeyboardEvent): void {
  const handler = attrs.onKeydown
  const list = Array.isArray(handler) ? handler : handler === undefined ? [] : [handler]
  for (const h of list) if (typeof h === 'function') h(e)
}

const props = withDefaults(defineProps<UidMentionProps>(), {
  prefix: '@',
  rows: 4,
  filter: undefined,
})

const locale = useLocale()
const emptyMessage = computed(() => props.emptyText ?? locale.value.mention.noResults)

const emit = defineEmits<{
  select: [option: MentionOption, prefix: string]
}>()

const model = defineModel<string>({ default: '' })

const fieldRef = ref<HTMLTextAreaElement | null>(null)
const fieldId = useId()
const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const triggerStart = ref(-1)
const currentPrefix = ref('')
const panelRef = ref<HTMLElement | null>(null)
// Anchored under the textarea, teleported out of any clipping container.
const { panelStyle } = useFloatingPanel(fieldRef, panelRef, isOpen)

const prefixes = computed(() => Array.isArray(props.prefix) ? props.prefix : [props.prefix])

const filtered = computed(() => {
  const q = query.value.toLowerCase()
  if (props.filter) return props.options.filter(o => props.filter!(o, query.value))
  if (!q) return props.options
  return props.options.filter(o =>
    o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  )
})

function detectTrigger(): void {
  const field = fieldRef.value
  if (!field) return
  const cursor = field.selectionStart ?? 0
  const text = model.value.slice(0, cursor)

  let foundStart = -1
  let foundPrefix = ''
  for (const p of prefixes.value) {
    const idx = text.lastIndexOf(p)
    if (idx > foundStart) {
      const before = text[idx - 1]
      if (idx === 0 || /\s/.test(before ?? '')) {
        const between = text.slice(idx + p.length)
        if (!/\s/.test(between)) {
          foundStart = idx
          foundPrefix = p
        }
      }
    }
  }

  if (foundStart >= 0) {
    triggerStart.value = foundStart
    currentPrefix.value = foundPrefix
    query.value = text.slice(foundStart + foundPrefix.length)
    activeIndex.value = 0
    if (!isOpen.value) isOpen.value = true
  } else {
    isOpen.value = false
    query.value = ''
    triggerStart.value = -1
  }
}


function selectOption(opt: MentionOption): void {
  if (triggerStart.value < 0) return
  const field = fieldRef.value
  if (!field) return
  const cursor = field.selectionStart ?? 0
  const before = model.value.slice(0, triggerStart.value)
  const after = model.value.slice(cursor)
  const insert = `${currentPrefix.value}${opt.value} `
  model.value = before + insert + after
  emit('select', opt, currentPrefix.value)
  isOpen.value = false
  triggerStart.value = -1
  query.value = ''
  void nextTick(() => {
    const newCursor = before.length + insert.length
    field.focus()
    field.setSelectionRange(newCursor, newCursor)
  })
}

function onInput(e: Event): void {
  model.value = (e.target as HTMLTextAreaElement).value
  detectTrigger()
}

function onClickField(): void {
  detectTrigger()
}

function onKeydown(e: KeyboardEvent): void {
  if (!isOpen.value || !listKeydown(e)) hostKeydown(e)
}

/** Handles a key of the open list; false when the list does not use it. */
function listKeydown(e: KeyboardEvent): boolean {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
    return true
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    return true
  }
  if (e.key === 'Enter' || e.key === 'Tab') {
    const option = filtered.value[activeIndex.value]
    if (option === undefined) return false
    e.preventDefault()
    selectOption(option)
    return true
  }
  if (e.key === 'Escape') {
    // Ours to handle: an enclosing modal must not close with the list.
    e.stopPropagation()
    isOpen.value = false
    return true
  }
  return false
}

/** Puts the caret in the field. */
function focus(): void {
  fieldRef.value?.focus()
}

defineExpose({
  focus,
  /** The textarea, for a host that formats the selection. */
  field: fieldRef,
  /** Whether the list of options is open. */
  isOpen,
})

</script>

<template>
  <div
    v-bind="rootAttrs()"
    class="uid-mention"
    :class="{ 'uid-mention--disabled': disabled }"
  >
    <label
      v-if="label"
      :for="fieldId"
      class="uid-mention__label"
    >
      {{ label }}
    </label>

    <textarea
      v-bind="fieldAttrs()"
      :id="fieldId"
      ref="fieldRef"
      class="uid-mention__field"
      :value="model"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      @input="onInput"
      @click="onClickField"
      @keydown="onKeydown"
      @keyup="detectTrigger"
      @blur="isOpen = false"
    />

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panelRef"
        class="uid-mention__dropdown"
        :style="panelStyle"
      >
        <button
          v-for="(opt, idx) in filtered"
          :key="opt.value"
          type="button"
          class="uid-mention__option"
          :class="{ 'uid-mention__option--active': idx === activeIndex }"
          @mousedown.prevent="selectOption(opt)"
          @mouseenter="activeIndex = idx"
        >
          <span class="uid-mention__option-label">{{ opt.label }}</span>
          <span
            v-if="opt.hint"
            class="uid-mention__option-hint"
          >{{ opt.hint }}</span>
        </button>
        <div
          v-if="filtered.length === 0"
          class="uid-mention__empty"
        >
          {{ emptyMessage }}
        </div>
      </div>
    </Teleport>
  </div>
</template>
