<script setup lang="ts">
import './UidTreeSelect.css'
import { computed, onUnmounted, ref, useId, watch } from 'vue'
import { ChevronDown, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidTreeView from '../TreeView/UidTreeView.vue'
import type { TreeNode, TreeKey } from '../TreeView/context.js'

export interface UidTreeSelectProps {
  nodes: TreeNode[]
  multiple?: boolean
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
  multiple: false,
  placeholder: 'Выберите...',
  disabled: false,
  clearable: true,
  defaultExpandAll: false,
  showGuides: false,
  required: false,
  maxTagCount: undefined,
})

const emit = defineEmits<{
  change: [value: TreeKey | TreeKey[] | null]
}>()

const model = defineModel<TreeKey | TreeKey[] | null>({ default: null })
const expandedKeys = defineModel<TreeKey[]>('expandedKeys', { default: () => [] })

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const inputId = useId()
const dropdownId = useId()

const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)

function flatten(items: TreeNode[]): TreeNode[] {
  return items.flatMap(it => [it, ...(it.children ? flatten(it.children) : [])])
}

const flatNodes = computed(() => flatten(props.nodes))

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
  const next = props.multiple ? [] : null
  model.value = next
  emit('change', next)
}

function removeTag(e: MouseEvent, key: TreeKey): void {
  e.stopPropagation()
  if (!Array.isArray(model.value)) return
  const next = model.value.filter(k => k !== key)
  model.value = next
  emit('change', next)
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
</script>

<template>
  <div
    ref="containerRef"
    class="uid-tree-select"
    :class="{
      'uid-tree-select--open': isOpen,
      'uid-tree-select--disabled': disabled,
      'uid-tree-select--error': hasError,
    }"
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
      :aria-label="placeholder"
      :aria-disabled="disabled"
      :aria-invalid="hasError ? 'true' : undefined"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <div class="uid-tree-select__value">
        <template v-if="multiple">
          <span
            v-for="node in visibleTags"
            :key="node.key"
            class="uid-tree-select__chip"
          >
            <span>{{ node.label }}</span>
            <button
              type="button"
              class="uid-tree-select__chip-remove"
              :aria-label="`Удалить ${node.label}`"
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
          >{{ placeholder }}</span>
        </template>
        <template v-else>
          <span v-if="selectedNodes.length > 0">{{ selectedNodes[0].label }}</span>
          <span
            v-else
            class="uid-tree-select__placeholder"
          >{{ placeholder }}</span>
        </template>
      </div>

      <div class="uid-tree-select__suffix">
        <button
          v-if="clearable && selectedKeys.length > 0"
          type="button"
          class="uid-tree-select__clear"
          aria-label="Очистить"
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

    <div
      v-if="isOpen"
      :id="dropdownId"
      class="uid-tree-select__dropdown"
    >
      <UidTreeView
        :nodes="nodes"
        v-model:expanded-keys="expandedKeys"
        :selected-keys="selectedKeys"
        :selectable="multiple ? 'multiple' : 'single'"
        :default-expand-all="defaultExpandAll"
        :show-guides="showGuides"
        @select="onSelect"
      />
    </div>

    <p
      v-if="hintText"
      class="uid-tree-select__hint"
      :class="hasError && 'uid-tree-select__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
