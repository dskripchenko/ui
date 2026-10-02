<script setup lang="ts" generic="M extends boolean = false">
import './UidSelect.css'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useId } from 'vue'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import { usePopover } from '../../composables/usePopover.js'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  group?: string
}

export type SelectValue = string | number

/**
 * The v-model type for a given `multiple` flag: `SelectValue | null` in single
 * mode, `SelectValue[]` with `multiple: true`. A non-literal `boolean` (for
 * example `:multiple="isMulti"`) gives the union of both.
 */
export type SelectModelValue<M extends boolean = false> = M extends true
  ? SelectValue[]
  : SelectValue | null

export interface UidSelectProps<M extends boolean = boolean> {
  /** v-model value: `SelectValue | null` in single mode, `SelectValue[]` with `multiple`. */
  modelValue?: SelectModelValue<M>
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
  /**
   * Multi-value mode: v-model is an array, the selected options are shown as
   * removable chips, and picking an option toggles it without closing the dropdown.
   * The type parameter `M` follows this flag, so `v-model` and the
   * `update:modelValue` / `change` payloads are typed per mode.
   * (`boolean & M` keeps the runtime prop a Boolean, so a bare `multiple` attribute works.)
   */
  multiple?: boolean & M
  /** Multiple mode: show at most this many chips and collapse the rest into "+N". */
  maxTagCount?: number
}

// `multiple` defaults to undefined rather than false: a generic prop cannot
// take a literal default, and an absent flag is falsy (single mode) anyway.
const props = withDefaults(defineProps<UidSelectProps<M>>(), {
  disabled: false,
  searchable: false,
  clearable: false,
  size: 'md',
  modelValue: undefined,
  multiple: undefined,
  maxTagCount: undefined,
})

const locale = useLocale()
const placeholderText = computed(() => props.placeholder ?? locale.value.select.placeholder)

// The model is declared by hand instead of with defineModel so that
// `update:modelValue` carries exactly `SelectModelValue<M>` (defineModel adds
// `undefined` to an optional model's emit type).
const emit = defineEmits<{
  'update:modelValue': [value: SelectModelValue<M>]
  change: [value: SelectModelValue<M>]
}>()

/** Used while the parent does not bind `modelValue` (uncontrolled use). */
const localValue = ref<SelectValue | SelectValue[] | null>(null)

/** Mode-agnostic view of the model for the implementation (the public type depends on `M`). */
const rawModel = computed<SelectValue | SelectValue[] | null>(() =>
  props.modelValue === undefined
    ? localValue.value
    : (props.modelValue as SelectValue | SelectValue[] | null),
)

function commit(value: SelectValue | SelectValue[] | null): void {
  localValue.value = value
  emit('update:modelValue', value as SelectModelValue<M>)
  emit('change', value as SelectModelValue<M>)
}

const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const listboxId = useId()

// The dropdown is teleported into the body and positioned through usePopover.
// That solves the popover being clipped by parent containers with
// overflow: hidden. The width is bound through CSS (see .uid-select__dropdown)
// from the triggerRef rect.
const { floatingStyle, update: updatePopover } = usePopover(triggerRef, dropdownRef, {
  placement: 'bottom-start',
  offset: 4,
})

const triggerWidth = ref<number>(0)
function syncTriggerWidth(): void {
  triggerWidth.value = triggerRef.value?.getBoundingClientRect().width ?? 0
}

const dropdownStyle = computed(() => ({
  ...floatingStyle.value,
  // Match the dropdown width to the trigger width — the standard select UX.
  minWidth: triggerWidth.value > 0 ? `${triggerWidth.value}px` : 'auto',
}))

const selectedOption = computed(() =>
  props.multiple ? null : (props.options.find(o => o.value === rawModel.value) ?? null),
)

/** Selected values as an array in both modes (multiple tolerates a scalar or null model). */
const selectedValues = computed<SelectValue[]>(() => {
  const v = rawModel.value
  if (Array.isArray(v)) return v
  return v === null ? [] : [v]
})

/** Multiple mode: the selected options in the order they were picked. */
const selectedOptions = computed<SelectOption[]>(() =>
  selectedValues.value
    .map(v => props.options.find(o => o.value === v))
    .filter((o): o is SelectOption => !!o),
)

const visibleTags = computed(() =>
  props.maxTagCount !== undefined && props.maxTagCount >= 0
    ? selectedOptions.value.slice(0, props.maxTagCount)
    : selectedOptions.value,
)
const hiddenTagCount = computed(() => selectedOptions.value.length - visibleTags.value.length)

const hasValue = computed(() =>
  props.multiple ? selectedValues.value.length > 0 : rawModel.value !== null,
)

function isSelected(opt: SelectOption): boolean {
  return props.multiple ? selectedValues.value.includes(opt.value) : opt.value === rawModel.value
}

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
    const idx = filtered.value.findIndex(o => isSelected(o))
    activeIndex.value = idx >= 0 ? idx : 0
    syncTriggerWidth()
    await nextTick()
    // Position the popover after the mount and the reflow (rAF guarantees the layout is ready).
    updatePopover()
    requestAnimationFrame(() => updatePopover())
    if (props.searchable) searchRef.value?.focus()
    scrollActiveIntoView()
    document.addEventListener('pointerdown', onOutsideClick)
    window.addEventListener('resize', updatePopover)
    window.addEventListener('scroll', updatePopover, true)
  } else {
    document.removeEventListener('pointerdown', onOutsideClick)
    window.removeEventListener('resize', updatePopover)
    window.removeEventListener('scroll', updatePopover, true)
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

function setMultiple(values: SelectValue[]) {
  commit(values)
}

function selectOption(opt: SelectOption) {
  if (opt.disabled) return
  if (props.multiple) {
    const current = selectedValues.value
    setMultiple(
      current.includes(opt.value)
        ? current.filter(v => v !== opt.value)
        : [...current, opt.value],
    )
    // Keep the dropdown open so several options can be picked in a row.
    nextTick(() => updatePopover())
    return
  }
  commit(opt.value)
  close()
  triggerRef.value?.focus()
}

function removeValue(value: SelectValue, e?: Event) {
  e?.stopPropagation()
  if (props.disabled) return
  setMultiple(selectedValues.value.filter(v => v !== value))
  nextTick(() => updatePopover())
}

function clearValue(e: MouseEvent) {
  e.stopPropagation()
  if (props.multiple) {
    setMultiple([])
    return
  }
  commit(null)
}

function onOutsideClick(e: PointerEvent) {
  const target = e.target as Node
  // The dropdown lives in the body (a Teleport) but it is "ours" — a click inside it does not close it.
  if (containerRef.value?.contains(target)) return
  if (dropdownRef.value?.contains(target)) return
  close()
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
  } else if (e.key === 'Backspace' && props.multiple && selectedValues.value.length > 0) {
    e.preventDefault()
    removeValue(selectedValues.value[selectedValues.value.length - 1])
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

onUnmounted(() => {
  document.removeEventListener('pointerdown', onOutsideClick)
  window.removeEventListener('resize', updatePopover)
  window.removeEventListener('scroll', updatePopover, true)
})
</script>

<template>
  <div
    ref="containerRef"
    class="uid-select"
    :class="[`uid-select--${size}`, {
      'uid-select--open': isOpen,
      'uid-select--disabled': disabled,
      'uid-select--multiple': multiple,
    }]"
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
        v-if="multiple && selectedOptions.length > 0"
        class="uid-select__tags"
      >
        <span
          v-for="opt in visibleTags"
          :key="opt.value"
          class="uid-select__tag"
        >
          <span class="uid-select__tag-label">{{ opt.label }}</span>
          <button
            v-if="!disabled"
            type="button"
            class="uid-select__tag-remove"
            tabindex="-1"
            :aria-label="locale.tagsInput.remove(opt.label)"
            @click="removeValue(opt.value, $event)"
          >
            <UidIcon
              :icon="X"
              :size="12"
            />
          </button>
        </span>
        <span
          v-if="hiddenTagCount > 0"
          class="uid-select__tag uid-select__tag--more"
        >+{{ hiddenTagCount }}</span>
      </span>
      <span
        v-else
        class="uid-select__value"
        :class="{ 'uid-select__value--placeholder': !selectedOption }"
      >
        {{ selectedOption?.label ?? placeholderText }}
      </span>
      <div class="uid-select__suffix">
        <button
          v-if="clearable && hasValue"
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

    <Teleport to="body">
      <Transition name="uid-select-dropdown">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="uid-select__dropdown"
          :style="dropdownStyle"
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
          :aria-multiselectable="multiple ? 'true' : undefined"
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
                  'uid-select__option--selected': isSelected(opt),
                  'uid-select__option--active': filtered.indexOf(opt) === activeIndex,
                  'uid-select__option--disabled': opt.disabled,
                }"
                :data-active="filtered.indexOf(opt) === activeIndex ? 'true' : undefined"
                role="option"
                :aria-selected="isSelected(opt)"
                :aria-disabled="opt.disabled"
                @click="selectOption(opt)"
                @mouseenter="!opt.disabled && (activeIndex = filtered.indexOf(opt))"
              >
                <span>{{ opt.label }}</span>
                <UidIcon
                  v-if="isSelected(opt)"
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
    </Teleport>
  </div>
</template>
