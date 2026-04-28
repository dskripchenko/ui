<script setup lang="ts">
import './UidCascader.css'
import { computed, onUnmounted, ref, watch } from 'vue'
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
}

const props = withDefaults(defineProps<UidCascaderProps>(), {
  separator: ' / ',
  clearable: true,
  disabled: false,
  expandTrigger: 'click',
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

watch(isOpen, (val) => {
  if (val) activePath.value = [...model.value]
})

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

function handleOption(opt: CascaderOption, level: number): void {
  if (opt.disabled) return
  const newPath = [...activePath.value.slice(0, level), opt.value]
  activePath.value = newPath
  if (!opt.children || opt.children.length === 0) {
    model.value = newPath
    const path = selectedPath.value.length > 0 ? [...selectedPath.value] : []
    emit('change', newPath, path.length > 0 ? path : pathFromValues(newPath))
    close()
  }
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
            'uid-cascader__option--disabled': opt.disabled,
          }"
          @click="handleOption(opt, level)"
          @mouseenter="expandTrigger === 'hover' && opt.children && handleOption(opt, level)"
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

    <p
      v-if="hint"
      class="uid-cascader__hint"
    >{{ hint }}</p>
  </div>
</template>
