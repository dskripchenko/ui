<script setup lang="ts">
import './UidCombobox.css'
import { computed, nextTick, onUnmounted, ref, useId, watch } from 'vue'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import type { Size } from '../../types/index.js'

export interface ComboboxOption {
  value: string | number
  label: string
  hint?: string
  disabled?: boolean
}

export interface UidComboboxProps {
  options: ComboboxOption[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  allowCreate?: boolean
  filter?: (option: ComboboxOption, query: string) => boolean
  size?: Size
  label?: string
  hint?: string
  error?: string
  required?: boolean
  emptyText?: string
  id?: string
}

const props = withDefaults(defineProps<UidComboboxProps>(), {
  disabled: false,
  clearable: true,
  allowCreate: false,
  filter: undefined,
  size: 'md',
  required: false,
})

const locale = useLocale()
const placeholderText = computed(() => props.placeholder ?? locale.value.combobox.placeholder)
const emptyMessage = computed(() => props.emptyText ?? locale.value.combobox.noResults)

const emit = defineEmits<{
  change: [value: string | number | null]
  create: [value: string]
}>()

const model = defineModel<string | number | null>({ default: null })

const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const inputId = props.id ?? useId()
const listboxId = useId()

const selectedOption = computed(() =>
  props.options.find(o => o.value === model.value) ?? null,
)

watch(selectedOption, (opt) => {
  if (!isOpen.value) query.value = opt?.label ?? ''
}, { immediate: true })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  if (props.filter) return props.options.filter(o => props.filter!(o, query.value))
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

const showCreate = computed(() =>
  props.allowCreate &&
  query.value.trim().length > 0 &&
  !filtered.value.some(o => o.label.toLowerCase() === query.value.trim().toLowerCase()),
)

const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)

watch(query, () => { activeIndex.value = 0 })

function open(): void {
  if (props.disabled) return
  isOpen.value = true
}

function close(): void {
  isOpen.value = false
  query.value = selectedOption.value?.label ?? ''
}

function selectOption(opt: ComboboxOption): void {
  if (opt.disabled) return
  model.value = opt.value
  emit('change', opt.value)
  query.value = opt.label
  isOpen.value = false
  inputRef.value?.blur()
}

function createOption(): void {
  const v = query.value.trim()
  if (!v) return
  emit('create', v)
  isOpen.value = false
}

function clearValue(e: MouseEvent): void {
  e.stopPropagation()
  model.value = null
  emit('change', null)
  query.value = ''
  inputRef.value?.focus()
}

function onInput(e: Event): void {
  query.value = (e.target as HTMLInputElement).value
  if (!isOpen.value) open()
}

function onFocus(): void {
  open()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!isOpen.value) { open(); return }
    moveDown()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (isOpen.value) moveUp()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (!isOpen.value) { open(); return }
    selectActive()
  } else if (e.key === 'Escape') {
    if (isOpen.value) close(); else inputRef.value?.blur()
  } else if (e.key === 'Tab') {
    close()
  }
}

function moveDown(): void {
  const total = filtered.value.length + (showCreate.value ? 1 : 0)
  if (total === 0) return
  activeIndex.value = Math.min(activeIndex.value + 1, total - 1)
  scrollActive()
}

function moveUp(): void {
  activeIndex.value = Math.max(activeIndex.value - 1, 0)
  scrollActive()
}

function selectActive(): void {
  if (showCreate.value && activeIndex.value === filtered.value.length) {
    createOption()
    return
  }
  const opt = filtered.value[activeIndex.value]
  if (opt) selectOption(opt)
}

function scrollActive(): void {
  nextTick(() => {
    const el = listRef.value?.querySelector('[data-active="true"]') as HTMLElement | null
    el?.scrollIntoView?.({ block: 'nearest' })
  })
}

function onOutsideClick(e: PointerEvent): void {
  const target = e.target as Node
  if (!containerRef.value?.contains(target)) close()
}

watch(isOpen, (val) => {
  if (val) {
    activeIndex.value = Math.max(0, filtered.value.findIndex(o => o.value === model.value))
    document.addEventListener('pointerdown', onOutsideClick)
  } else {
    document.removeEventListener('pointerdown', onOutsideClick)
  }
})

onUnmounted(() => document.removeEventListener('pointerdown', onOutsideClick))
</script>

<template>
  <div
    ref="containerRef"
    class="uid-combobox"
    :class="[
      `uid-combobox--${size}`,
      isOpen && 'uid-combobox--open',
      disabled && 'uid-combobox--disabled',
      hasError && 'uid-combobox--error',
    ]"
  >
    <label
      v-if="label"
      :for="inputId"
      class="uid-combobox__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="uid-combobox__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div class="uid-combobox__control">
      <input
        :id="inputId"
        ref="inputRef"
        class="uid-combobox__field"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-autocomplete="'list'"
        :aria-activedescendant="isOpen ? `${listboxId}-${activeIndex}` : undefined"
        :aria-invalid="hasError ? 'true' : undefined"
        :placeholder="placeholderText"
        :disabled="disabled"
        :required="required"
        :value="query"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeydown"
      >
      <div class="uid-combobox__suffix">
        <button
          v-if="clearable && model !== null"
          type="button"
          class="uid-combobox__clear"
          :aria-label="locale.common.clear"
          @click="clearValue"
        >
          <UidIcon
            :icon="X"
            :size="12"
          />
        </button>
        <UidIcon
          :icon="ChevronDown"
          :size="16"
          class="uid-combobox__chevron"
          :class="{ 'uid-combobox__chevron--open': isOpen }"
          aria-hidden="true"
          @click="open"
        />
      </div>
    </div>

    <div
      v-if="isOpen"
      :id="listboxId"
      ref="listRef"
      class="uid-combobox__dropdown"
      role="listbox"
    >
      <template v-if="filtered.length > 0">
        <button
          v-for="(opt, idx) in filtered"
          :id="`${listboxId}-${idx}`"
          :key="opt.value"
          type="button"
          role="option"
          class="uid-combobox__option"
          :class="{
            'uid-combobox__option--active': idx === activeIndex,
            'uid-combobox__option--selected': opt.value === model,
            'uid-combobox__option--disabled': opt.disabled,
          }"
          :data-active="idx === activeIndex ? 'true' : undefined"
          :aria-selected="opt.value === model"
          :aria-disabled="opt.disabled"
          @click="selectOption(opt)"
          @mouseenter="!opt.disabled && (activeIndex = idx)"
        >
          <span class="uid-combobox__option-label">{{ opt.label }}</span>
          <span
            v-if="opt.hint"
            class="uid-combobox__option-hint"
          >{{ opt.hint }}</span>
          <UidIcon
            v-if="opt.value === model"
            :icon="Check"
            :size="14"
            class="uid-combobox__check"
            aria-hidden="true"
          />
        </button>
      </template>

      <button
        v-if="showCreate"
        :id="`${listboxId}-${filtered.length}`"
        type="button"
        role="option"
        class="uid-combobox__option uid-combobox__create"
        :class="{ 'uid-combobox__option--active': activeIndex === filtered.length }"
        :data-active="activeIndex === filtered.length ? 'true' : undefined"
        @click="createOption"
        @mouseenter="activeIndex = filtered.length"
      >
        <span class="uid-combobox__option-label">{{ locale.combobox.create(query) }}</span>
      </button>

      <div
        v-if="filtered.length === 0 && !showCreate"
        class="uid-combobox__empty"
      >
        {{ emptyMessage }}
      </div>
    </div>

    <p
      v-if="hintText"
      class="uid-combobox__hint"
      :class="hasError && 'uid-combobox__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
