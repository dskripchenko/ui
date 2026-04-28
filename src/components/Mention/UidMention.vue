<script setup lang="ts">
import './UidMention.css'
import { computed, nextTick, ref, useId } from 'vue'

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

const props = withDefaults(defineProps<UidMentionProps>(), {
  prefix: '@',
  rows: 4,
  emptyText: 'Никого не найдено',
  filter: undefined,
})

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
const dropdownPos = ref<{ top: number; left: number }>({ top: 0, left: 0 })

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
    if (!isOpen.value) {
      isOpen.value = true
      void nextTick(updateDropdownPos)
    }
  } else {
    isOpen.value = false
    query.value = ''
    triggerStart.value = -1
  }
}

function updateDropdownPos(): void {
  const field = fieldRef.value
  if (!field) return
  const r = field.getBoundingClientRect()
  dropdownPos.value = { top: r.height + 4, left: 0 }
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
  if (!isOpen.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    if (filtered.value.length > 0) {
      e.preventDefault()
      selectOption(filtered.value[activeIndex.value])
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

const dropdownStyle = computed(() => ({
  top: `${dropdownPos.value.top}px`,
  left: `${dropdownPos.value.left}px`,
}))
</script>

<template>
  <div
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

    <div
      v-if="isOpen"
      class="uid-mention__dropdown"
      :style="dropdownStyle"
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
        {{ emptyText }}
      </div>
    </div>
  </div>
</template>
