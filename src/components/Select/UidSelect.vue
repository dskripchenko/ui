<script setup lang="ts">
import './UidSelect.css'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useId } from 'vue'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  group?: string
}

export interface UidSelectProps {
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<UidSelectProps>(), {
  disabled: false,
  searchable: false,
  clearable: false,
  size: 'md',
})

const locale = useLocale()
const placeholderText = computed(() => props.placeholder ?? locale.value.select.placeholder)

const emit = defineEmits<{
  change: [value: string | number | null]
}>()

const model = defineModel<string | number | null>({ default: null })

const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const listboxId = useId()

const selectedOption = computed(() =>
  props.options.find(o => o.value === model.value) ?? null,
)

const filtered = computed(() => {
  if (!props.searchable || !query.value.trim()) return props.options
  const q = query.value.toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

const groups = computed(() => {
  const map = new Map<string, SelectOption[]>()
  for (const opt of filtered.value) {
    const g = opt.group ?? ''
    if (!map.has(g)) map.set(g, [])
    map.get(g)!.push(opt)
  }
  return map
})

watch(isOpen, async (val) => {
  if (val) {
    query.value = ''
    const idx = filtered.value.findIndex(o => o.value === model.value)
    activeIndex.value = idx >= 0 ? idx : 0
    await nextTick()
    if (props.searchable) searchRef.value?.focus()
    scrollActiveIntoView()
    document.addEventListener('pointerdown', onOutsideClick)
  } else {
    document.removeEventListener('pointerdown', onOutsideClick)
  }
})

watch(query, () => { activeIndex.value = 0 })

function open() {
  if (!props.disabled) isOpen.value = true
}

function close() {
  isOpen.value = false
}

function toggle() {
  if (isOpen.value) close(); else open()
}

function selectOption(opt: SelectOption) {
  if (opt.disabled) return
  model.value = opt.value
  emit('change', opt.value)
  close()
  triggerRef.value?.focus()
}

function clearValue(e: MouseEvent) {
  e.stopPropagation()
  model.value = null
  emit('change', null)
}

function onOutsideClick(e: PointerEvent) {
  const target = e.target as Node
  if (!containerRef.value?.contains(target)) close()
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (isOpen.value) moveDown(); else open()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (isOpen.value) moveUp()
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (isOpen.value) selectActive(); else open()
  } else if (e.key === 'Escape') {
    close()
  }
}

function onListKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveDown() }
  else if (e.key === 'ArrowUp') { e.preventDefault(); moveUp() }
  else if (e.key === 'Enter') { e.preventDefault(); selectActive() }
  else if (e.key === 'Escape') { close(); triggerRef.value?.focus() }
}

function moveDown() {
  activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
  scrollActiveIntoView()
}

function moveUp() {
  activeIndex.value = Math.max(activeIndex.value - 1, 0)
  scrollActiveIntoView()
}

function selectActive() {
  const opt = filtered.value[activeIndex.value]
  if (opt) selectOption(opt)
}

function scrollActiveIntoView() {
  nextTick(() => {
    const el = listRef.value?.querySelector('[data-active="true"]') as HTMLElement | null
    el?.scrollIntoView?.({ block: 'nearest' })
  })
}

onUnmounted(() => document.removeEventListener('pointerdown', onOutsideClick))
</script>

<template>
  <div
    ref="containerRef"
    class="uid-select"
    :class="[`uid-select--${size}`, { 'uid-select--open': isOpen, 'uid-select--disabled': disabled }]"
  >
    <div
      ref="triggerRef"
      class="uid-select__trigger"
      role="combobox"
      tabindex="0"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-controls="listboxId"
      :aria-disabled="disabled"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span
        class="uid-select__value"
        :class="{ 'uid-select__value--placeholder': !selectedOption }"
      >
        {{ selectedOption?.label ?? placeholderText }}
      </span>
      <div class="uid-select__suffix">
        <button
          v-if="clearable && model !== null"
          type="button"
          class="uid-select__clear"
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
          class="uid-select__chevron"
          :class="{ 'uid-select__chevron--open': isOpen }"
          aria-hidden="true"
        />
      </div>
    </div>

    <Transition name="uid-select-dropdown">
      <div
        v-if="isOpen"
        class="uid-select__dropdown"
      >
        <div
          v-if="searchable"
          class="uid-select__search"
        >
          <input
            ref="searchRef"
            v-model="query"
            class="uid-select__search-input"
            type="text"
            :placeholder="locale.common.search"
            autocomplete="off"
            @keydown="onListKeydown"
          >
        </div>

        <div
          :id="listboxId"
          ref="listRef"
          class="uid-select__list"
          role="listbox"
          @keydown="onListKeydown"
        >
          <template v-if="filtered.length > 0">
            <template
              v-for="[groupName, opts] in groups"
              :key="groupName"
            >
              <div
                v-if="groupName"
                class="uid-select__group-label"
              >
                {{ groupName }}
              </div>
              <button
                v-for="opt in opts"
                :key="opt.value"
                type="button"
                class="uid-select__option"
                :class="{
                  'uid-select__option--selected': opt.value === model,
                  'uid-select__option--active': filtered.indexOf(opt) === activeIndex,
                  'uid-select__option--disabled': opt.disabled,
                }"
                :data-active="filtered.indexOf(opt) === activeIndex ? 'true' : undefined"
                role="option"
                :aria-selected="opt.value === model"
                :aria-disabled="opt.disabled"
                @click="selectOption(opt)"
                @mouseenter="!opt.disabled && (activeIndex = filtered.indexOf(opt))"
              >
                <span>{{ opt.label }}</span>
                <UidIcon
                  v-if="opt.value === model"
                  :icon="Check"
                  :size="14"
                  aria-hidden="true"
                  class="uid-select__check"
                />
              </button>
            </template>
          </template>

          <div
            v-else
            class="uid-select__empty"
          >
            {{ locale.select.noResults }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
