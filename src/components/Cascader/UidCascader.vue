<script setup lang="ts">
import './UidCascader.css'
import { computed, nextTick, onUnmounted, ref, useId, watch } from 'vue'
import { ChevronDown, ChevronRight, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'

export type CascaderValue = string | number

export interface CascaderOption {
  value: CascaderValue
  label: string
  children?: CascaderOption[]
  disabled?: boolean
}

export interface UidCascaderProps {
  options: CascaderOption[]
  placeholder?: string
  separator?: string
  clearable?: boolean
  disabled?: boolean
  label?: string
  hint?: string
  expandTrigger?: 'click' | 'hover'
  searchable?: boolean
  changeOnSelect?: boolean
  searchPlaceholder?: string
}

interface CascaderSearchMatch {
  values: CascaderValue[]
  path: CascaderOption[]
  leaf: boolean
}

interface LabelSegment {
  text: string
  match: boolean
}

const props = withDefaults(defineProps<UidCascaderProps>(), {
  separator: ' / ',
  clearable: true,
  disabled: false,
  expandTrigger: 'click',
  searchable: false,
  changeOnSelect: false,
  searchPlaceholder: undefined,
})

const emit = defineEmits<{
  change: [value: CascaderValue[], path: CascaderOption[]]
}>()

const model = defineModel<CascaderValue[]>({ default: () => [] })
const locale = useLocale()

const placeholderText = computed(() => props.placeholder ?? locale.value.select.placeholder)

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const activePath = ref<CascaderValue[]>([])

const searchRef = ref<HTMLInputElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const query = ref('')
const activeMatch = ref(0)
const listboxId = useId()

watch(isOpen, (val) => {
  if (val) {
    activePath.value = [...model.value]
    if (props.searchable) nextTick(() => searchRef.value?.focus())
  } else {
    query.value = ''
  }
})

const trimmedQuery = computed(() => query.value.trim().toLowerCase())

const allPaths = computed<CascaderSearchMatch[]>(() => {
  const out: CascaderSearchMatch[] = []
  const walk = (level: CascaderOption[], trail: CascaderOption[]) => {
    for (const opt of level) {
      if (opt.disabled) continue
      const path = [...trail, opt]
      const leaf = !opt.children || opt.children.length === 0
      if (leaf || props.changeOnSelect) {
        out.push({ values: path.map(p => p.value), path, leaf })
      }
      if (!leaf) walk(opt.children!, path)
    }
  }
  walk(props.options, [])
  return out
})

const searchMatches = computed<CascaderSearchMatch[]>(() => {
  const q = trimmedQuery.value
  if (!q) return []
  return allPaths.value.filter(m => m.path.some(p => p.label.toLowerCase().includes(q)))
})

const isSearching = computed(() => props.searchable && trimmedQuery.value.length > 0)

watch(searchMatches, () => { activeMatch.value = 0 })

function segments(label: string): LabelSegment[] {
  const q = trimmedQuery.value
  if (!q) return [{ text: label, match: false }]
  const lower = label.toLowerCase()
  const out: LabelSegment[] = []
  let from = 0
  let idx = lower.indexOf(q, from)
  while (idx !== -1) {
    if (idx > from) out.push({ text: label.slice(from, idx), match: false })
    out.push({ text: label.slice(idx, idx + q.length), match: true })
    from = idx + q.length
    idx = lower.indexOf(q, from)
  }
  if (from < label.length) out.push({ text: label.slice(from), match: false })
  return out
}

function matchId(index: number): string {
  return `${listboxId}-opt-${index}`
}

function selectMatch(match: CascaderSearchMatch): void {
  commit([...match.values], match.path)
  close()
  triggerRef.value?.focus()
}

function onSearchKeydown(e: KeyboardEvent): void {
  const count = searchMatches.value.length
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (count) activeMatch.value = (activeMatch.value + 1) % count
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (count) activeMatch.value = (activeMatch.value - 1 + count) % count
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const match = searchMatches.value[activeMatch.value]
    if (match) selectMatch(match)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
    triggerRef.value?.focus()
  }
}

function findChildren(values: CascaderValue[]): CascaderOption[] {
  let level = props.options
  for (const v of values) {
    const found = level.find(o => o.value === v)
    if (!found || !found.children) return []
    level = found.children
  }
  return level
}

const columns = computed<CascaderOption[][]>(() => {
  const cols: CascaderOption[][] = [props.options]
  for (let i = 0; i < activePath.value.length; i++) {
    const next = findChildren(activePath.value.slice(0, i + 1))
    if (next.length === 0) break
    cols.push(next)
  }
  return cols
})

const selectedPath = computed<CascaderOption[]>(() => {
  if (model.value.length === 0) return []
  const result: CascaderOption[] = []
  let level = props.options
  for (const v of model.value) {
    const found = level.find(o => o.value === v)
    if (!found) break
    result.push(found)
    level = found.children ?? []
  }
  return result
})

const displayLabels = computed(() => selectedPath.value.map(p => p.label))

function open(): void {
  if (props.disabled) return
  isOpen.value = true
}

function close(): void {
  isOpen.value = false
}

function toggle(): void {
  if (isOpen.value) close(); else open()
}

function commit(values: CascaderValue[], path?: CascaderOption[]): void {
  model.value = values
  emit('change', values, path ?? pathFromValues(values))
}

function expandOption(opt: CascaderOption, level: number): void {
  if (opt.disabled) return
  activePath.value = [...activePath.value.slice(0, level), opt.value]
}

function handleOption(opt: CascaderOption, level: number): void {
  if (opt.disabled) return
  expandOption(opt, level)
  const newPath = [...activePath.value]
  if (!opt.children || opt.children.length === 0) {
    commit(newPath)
    close()
  } else if (props.changeOnSelect) {
    commit(newPath)
  }
}

function onOptionHover(opt: CascaderOption, level: number): void {
  if (props.expandTrigger === 'hover' && opt.children?.length) expandOption(opt, level)
}

function pathFromValues(values: CascaderValue[]): CascaderOption[] {
  const result: CascaderOption[] = []
  let level = props.options
  for (const v of values) {
    const found = level.find(o => o.value === v)
    if (!found) break
    result.push(found)
    level = found.children ?? []
  }
  return result
}

function clearValue(e: MouseEvent): void {
  e.stopPropagation()
  model.value = []
  emit('change', [], [])
}

function onTriggerKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
  else if (e.key === 'Escape') close()
}

function onOutsideClick(e: PointerEvent): void {
  const target = e.target as Node
  if (!containerRef.value?.contains(target)) close()
}

watch(isOpen, (val) => {
  if (val) document.addEventListener('pointerdown', onOutsideClick)
  else document.removeEventListener('pointerdown', onOutsideClick)
})

onUnmounted(() => document.removeEventListener('pointerdown', onOutsideClick))

function isActive(opt: CascaderOption, level: number): boolean {
  return activePath.value[level] === opt.value
}

function isSelected(opt: CascaderOption, level: number): boolean {
  return model.value.length === level + 1 && model.value[level] === opt.value
    && activePath.value.slice(0, level).every((v, i) => model.value[i] === v)
}
</script>

<template>
  <div
    ref="containerRef"
    class="uid-cascader"
    :class="{
      'uid-cascader--open': isOpen,
      'uid-cascader--disabled': disabled,
    }"
  >
    <label
      v-if="label"
      class="uid-cascader__label"
    >
      {{ label }}
    </label>

    <div
      ref="triggerRef"
      class="uid-cascader__trigger"
      tabindex="0"
      role="combobox"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      :aria-label="placeholderText"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <div class="uid-cascader__value">
        <template v-if="displayLabels.length > 0">
          <template
            v-for="(label, idx) in displayLabels"
            :key="idx"
          >
            <span>{{ label }}</span>
            <span
              v-if="idx < displayLabels.length - 1"
              class="uid-cascader__separator"
            >{{ separator }}</span>
          </template>
        </template>
        <span
          v-else
          class="uid-cascader__placeholder"
        >{{ placeholderText }}</span>
      </div>

      <div class="uid-cascader__suffix">
        <button
          v-if="clearable && model.length > 0"
          type="button"
          class="uid-cascader__clear"
          :aria-label="locale.common.clear"
          @click="clearValue"
        >
          <UidIcon
            :icon="X"
            :size="14"
          />
        </button>
        <UidIcon
          :icon="ChevronDown"
          :size="16"
          class="uid-cascader__chevron"
          :class="{ 'uid-cascader__chevron--open': isOpen }"
        />
      </div>
    </div>

    <div
      v-if="isOpen"
      class="uid-cascader__dropdown"
    >
      <div
        v-if="searchable"
        class="uid-cascader__search"
      >
        <input
          ref="searchRef"
          v-model="query"
          type="text"
          class="uid-cascader__search-input"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          :aria-expanded="isSearching"
          :aria-controls="isSearching ? listboxId : undefined"
          :aria-activedescendant="isSearching && searchMatches.length ? matchId(activeMatch) : undefined"
          :aria-label="searchPlaceholder ?? locale.common.search"
          :placeholder="searchPlaceholder ?? locale.common.search"
          @keydown="onSearchKeydown"
        >
      </div>

      <ul
        v-if="isSearching"
        :id="listboxId"
        class="uid-cascader__results"
        role="listbox"
      >
        <li
          v-for="(match, idx) in searchMatches"
          :id="matchId(idx)"
          :key="match.values.join('\u0000')"
          class="uid-cascader__result"
          :class="{ 'uid-cascader__result--active': idx === activeMatch }"
          role="option"
          :aria-selected="idx === activeMatch"
          @mousedown.prevent
          @mouseenter="activeMatch = idx"
          @click="selectMatch(match)"
        >
          <template
            v-for="(opt, level) in match.path"
            :key="level"
          >
            <span
              v-if="level > 0"
              class="uid-cascader__separator"
            >{{ separator }}</span>
            <span><template
              v-for="(seg, sIdx) in segments(opt.label)"
              :key="sIdx"
            ><mark
              v-if="seg.match"
              class="uid-cascader__highlight"
            >{{ seg.text }}</mark><template v-else>{{ seg.text }}</template></template></span>
          </template>
        </li>
        <li
          v-if="searchMatches.length === 0"
          class="uid-cascader__empty"
          role="presentation"
        >
          {{ locale.common.noResults }}
        </li>
      </ul>

      <div
        v-else
        class="uid-cascader__columns"
      >
        <div
          v-for="(col, level) in columns"
          :key="level"
          class="uid-cascader__column"
        >
          <button
            v-for="opt in col"
            :key="opt.value"
            type="button"
            class="uid-cascader__option"
            :class="{
              'uid-cascader__option--active': isActive(opt, level),
              'uid-cascader__option--selected': changeOnSelect && isSelected(opt, level),
              'uid-cascader__option--disabled': opt.disabled,
            }"
            :aria-haspopup="opt.children?.length ? 'true' : undefined"
            :aria-expanded="opt.children?.length ? isActive(opt, level) : undefined"
            :aria-disabled="opt.disabled ? 'true' : undefined"
            @click="handleOption(opt, level)"
            @mouseenter="onOptionHover(opt, level)"
          >
            <span class="uid-cascader__option-label">{{ opt.label }}</span>
            <UidIcon
              v-if="opt.children?.length"
              :icon="ChevronRight"
              :size="14"
              class="uid-cascader__option-arrow"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>

    <p
      v-if="hint"
      class="uid-cascader__hint"
    >{{ hint }}</p>
  </div>
</template>
