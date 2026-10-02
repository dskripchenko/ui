<script setup lang="ts">
import './UidTreeSelect.css'
import { computed, onUnmounted, ref, useId, watch } from 'vue'
import type { Size } from '../../types/index.js'
import { useFloatingPanel } from '../../composables/useFloatingPanel.js'
import { ChevronDown, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidTreeView from '../TreeView/UidTreeView.vue'
import { useLocale } from '../../composables/useLocale.js'
import type { TreeNode, TreeKey } from '../TreeView/context.js'

export interface UidTreeSelectProps {
  /** Control height of the shared size scale (`--uid-size-sm|md|lg`). */
  size?: Size
  nodes: TreeNode[]
  multiple?: boolean
  checkable?: boolean
  checkStrictly?: boolean
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  defaultExpandAll?: boolean
  showGuides?: boolean
  label?: string
  hint?: string
  error?: string
  required?: boolean
  maxTagCount?: number
}

const props = withDefaults(defineProps<UidTreeSelectProps>(), {
  size: 'md',
  multiple: false,
  checkable: false,
  checkStrictly: false,
  disabled: false,
  clearable: true,
  defaultExpandAll: false,
  showGuides: false,
  required: false,
  maxTagCount: undefined,
})

const locale = useLocale()
const placeholderText = computed(() => props.placeholder ?? locale.value.treeSelect.placeholder)

const emit = defineEmits<{
  change: [value: TreeKey | TreeKey[] | null]
}>()

const model = defineModel<TreeKey | TreeKey[] | null>({ default: null })
const expandedKeys = defineModel<TreeKey[]>('expandedKeys', { default: () => [] })

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const { panelStyle, containsTarget } = useFloatingPanel(triggerRef, panelRef, isOpen, { matchWidth: 'exact' })
const inputId = useId()
const dropdownId = useId()

const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)

function flatten(items: TreeNode[]): TreeNode[] {
  return items.flatMap(it => [it, ...(it.children ? flatten(it.children) : [])])
}

const flatNodes = computed(() => flatten(props.nodes))

const isMulti = computed(() => props.multiple || props.checkable)

const parentMap = computed(() => {
  const map = new Map<TreeKey, TreeNode | null>()
  const walk = (items: TreeNode[], parent: TreeNode | null) => {
    for (const n of items) {
      map.set(n.key, parent)
      if (n.children) walk(n.children, n)
    }
  }
  walk(props.nodes, null)
  return map
})

const selectedKeys = computed<TreeKey[]>(() => {
  if (model.value === null || model.value === undefined) return []
  return Array.isArray(model.value) ? model.value : [model.value]
})

const selectedNodes = computed(() =>
  selectedKeys.value
    .map(k => flatNodes.value.find(n => n.key === k))
    .filter((n): n is TreeNode => Boolean(n)),
)

const visibleTags = computed(() => {
  if (!props.maxTagCount) return selectedNodes.value
  return selectedNodes.value.slice(0, props.maxTagCount)
})

const overflowCount = computed(() => {
  if (!props.maxTagCount) return 0
  return Math.max(0, selectedNodes.value.length - props.maxTagCount)
})

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

function sameKeys(a: TreeKey[], b: TreeKey[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every(k => set.has(k))
}

// In checkable mode the model holds every checked key, parents included.
const checkedModel = computed<TreeKey[]>({
  get: () => selectedKeys.value,
  set: (keys) => {
    if (sameKeys(keys, selectedKeys.value)) return
    model.value = [...keys]
    emit('change', [...keys])
  },
})

// Keys to drop with a chip: the node itself and, unless checks are strict,
// its enabled descendants and its ancestors (which can no longer be fully checked).
function keysToUncheck(key: TreeKey): Set<TreeKey> {
  const out = new Set<TreeKey>([key])
  if (!props.checkable || props.checkStrictly) return out
  const node = flatNodes.value.find(n => n.key === key)
  const walk = (n: TreeNode) => {
    for (const c of n.children ?? []) {
      if (c.disabled) continue
      out.add(c.key)
      walk(c)
    }
  }
  if (node) walk(node)
  let parent = parentMap.value.get(key) ?? null
  while (parent) {
    out.add(parent.key)
    parent = parentMap.value.get(parent.key) ?? null
  }
  return out
}

function onSelect(node: TreeNode): void {
  if (props.multiple) {
    const arr = Array.isArray(model.value) ? [...model.value] : []
    const idx = arr.indexOf(node.key)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(node.key)
    model.value = arr
    emit('change', arr)
  } else {
    model.value = node.key
    emit('change', node.key)
    close()
  }
}

function clearValue(e: MouseEvent): void {
  e.stopPropagation()
  const next = isMulti.value ? [] : null
  model.value = next
  emit('change', next)
}

function removeTag(e: MouseEvent, key: TreeKey): void {
  e.stopPropagation()
  if (!Array.isArray(model.value)) return
  const drop = keysToUncheck(key)
  const next = model.value.filter(k => !drop.has(k))
  model.value = next
  emit('change', next)
}

function onTriggerKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
  else if (e.key === 'Escape' && isOpen.value) { e.stopPropagation(); close() }
}

function onOutsideClick(e: PointerEvent): void {
  const target = e.target as Node
  if (!containerRef.value?.contains(target) && !containsTarget(target)) close()
}

watch(isOpen, (val) => {
  if (val) document.addEventListener('pointerdown', onOutsideClick)
  else document.removeEventListener('pointerdown', onOutsideClick)
})

onUnmounted(() => document.removeEventListener('pointerdown', onOutsideClick))
</script>

<template>
  <div
    ref="containerRef"
    class="uid-tree-select"
    :class="[`uid-tree-select--${size}`, {
      'uid-tree-select--open': isOpen,
      'uid-tree-select--disabled': disabled,
      'uid-tree-select--error': hasError,
    }]"
  >
    <label
      v-if="label"
      :for="inputId"
      class="uid-tree-select__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="uid-tree-select__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div
      :id="inputId"
      ref="triggerRef"
      class="uid-tree-select__trigger"
      tabindex="0"
      role="combobox"
      aria-haspopup="tree"
      :aria-expanded="isOpen"
      :aria-controls="dropdownId"
      :aria-label="placeholderText"
      :aria-disabled="disabled"
      :aria-invalid="hasError ? 'true' : undefined"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <div class="uid-tree-select__value">
        <template v-if="isMulti">
          <span
            v-for="node in visibleTags"
            :key="node.key"
            class="uid-tree-select__chip"
          >
            <span>{{ node.label }}</span>
            <button
              type="button"
              class="uid-tree-select__chip-remove"
              :aria-label="locale.treeSelect.removeTag(node.label)"
              @click.stop="removeTag($event, node.key)"
            >×</button>
          </span>
          <span
            v-if="overflowCount > 0"
            class="uid-tree-select__chip"
          >+{{ overflowCount }}</span>
          <span
            v-if="selectedNodes.length === 0"
            class="uid-tree-select__placeholder"
          >{{ placeholderText }}</span>
        </template>
        <template v-else>
          <span v-if="selectedNodes.length > 0">{{ selectedNodes[0].label }}</span>
          <span
            v-else
            class="uid-tree-select__placeholder"
          >{{ placeholderText }}</span>
        </template>
      </div>

      <div class="uid-tree-select__suffix">
        <button
          v-if="clearable && selectedKeys.length > 0"
          type="button"
          class="uid-tree-select__clear"
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
          class="uid-tree-select__chevron"
          :class="{ 'uid-tree-select__chevron--open': isOpen }"
          aria-hidden="true"
        />
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        :id="dropdownId"
        ref="panelRef"
        class="uid-tree-select__dropdown"
        :style="panelStyle"
      >
        <UidTreeView
          v-if="checkable"
          v-model:expanded-keys="expandedKeys"
          v-model:checked-keys="checkedModel"
          :nodes="nodes"
          :selectable="false"
          checkable
          :check-strictly="checkStrictly"
          :default-expand-all="defaultExpandAll"
          :show-guides="showGuides"
        />
        <UidTreeView
          v-else
          v-model:expanded-keys="expandedKeys"
          :nodes="nodes"
          :selected-keys="selectedKeys"
          :selectable="multiple ? 'multiple' : 'single'"
          :default-expand-all="defaultExpandAll"
          :show-guides="showGuides"
          @select="onSelect"
        />
      </div>
    </Teleport>

    <p
      v-if="hintText"
      class="uid-tree-select__hint"
      :class="hasError && 'uid-tree-select__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
