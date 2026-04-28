<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue'
import { ChevronRight, Check } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import { treeContextKey, type TreeContext, type TreeNode } from './context.js'

interface Props {
  node: TreeNode
  level: number
}

const props = defineProps<Props>()

const injected = inject(treeContextKey)
if (!injected) throw new Error('UidTreeItem must be used inside UidTree')
const ctx = injected as TreeContext
const locale = useLocale()

const rowRef = ref<HTMLElement | null>(null)

const hasChildren = computed(() => !!props.node.children && props.node.children.length > 0)
const isExpanded = computed(() => ctx.isExpanded(props.node.key))
const isSelected = computed(() => ctx.isSelected(props.node.key))
const isChecked = computed(() => ctx.isChecked(props.node.key))
const isIndeterminate = computed(() => ctx.isIndeterminate(props.node.key))
const isDisabled = computed(() => ctx.disabled.value || !!props.node.disabled)

const isFocused = computed(() => ctx.focusedKey.value === props.node.key)
const tabIndex = computed(() => {
  if (isDisabled.value) return -1
  if (isFocused.value) return 0
  if (ctx.focusedKey.value === null && ctx.isFirst(props.node.key)) return 0
  return -1
})

watch(isFocused, (val) => {
  if (val) nextTick(() => rowRef.value?.focus())
})

function onRowClick(): void {
  if (isDisabled.value) return
  ctx.focusKey(props.node.key)
  if (hasChildren.value) ctx.toggleExpand(props.node.key)
  if (ctx.selectable.value) ctx.toggleSelect(props.node)
}

function onChevronClick(e: MouseEvent): void {
  e.stopPropagation()
  if (isDisabled.value) return
  ctx.toggleExpand(props.node.key)
}

function onCheckClick(e: MouseEvent): void {
  e.stopPropagation()
  if (isDisabled.value) return
  ctx.toggleCheck(props.node)
}

function onKeydown(e: KeyboardEvent): void {
  const k = props.node.key
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    ctx.focusRelative(k, 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    ctx.focusRelative(k, -1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (hasChildren.value && !isExpanded.value) ctx.toggleExpand(k)
    else if (hasChildren.value && isExpanded.value) ctx.focusRelative(k, 1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (hasChildren.value && isExpanded.value) ctx.toggleExpand(k)
    else {
      const parent = ctx.parentKeyOf(k)
      if (parent !== null) ctx.focusKey(parent)
    }
  } else if (e.key === 'Home') {
    e.preventDefault()
    ctx.focusEdge('first')
  } else if (e.key === 'End') {
    e.preventDefault()
    ctx.focusEdge('last')
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (ctx.checkable.value) ctx.toggleCheck(props.node)
    else if (ctx.selectable.value) ctx.toggleSelect(props.node)
  }
}

function onFocus(): void {
  if (!isFocused.value) ctx.focusKey(props.node.key)
}
</script>

<template>
  <li
    class="uid-tree-item"
    :class="{
      'uid-tree-item--selected': isSelected,
      'uid-tree-item--disabled': isDisabled,
      'uid-tree-item--expanded': isExpanded,
    }"
    role="treeitem"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-selected="ctx.selectable.value ? isSelected : undefined"
    :aria-disabled="isDisabled || undefined"
  >
    <div
      ref="rowRef"
      class="uid-tree-item__row"
      :style="{ '--uid-tree-level': level }"
      :tabindex="tabIndex"
      @click="onRowClick"
      @keydown="onKeydown"
      @focus="onFocus"
    >
      <button
        v-if="hasChildren"
        type="button"
        class="uid-tree-item__chevron"
        :class="{ 'uid-tree-item__chevron--open': isExpanded }"
        :aria-label="isExpanded ? locale.treeView.collapse : locale.treeView.expand"
        tabindex="-1"
        @click="onChevronClick"
      >
        <UidIcon
          :icon="ChevronRight"
          :size="14"
        />
      </button>
      <span
        v-else
        class="uid-tree-item__chevron uid-tree-item__chevron--placeholder"
        aria-hidden="true"
      />

      <span
        v-if="ctx.checkable.value"
        class="uid-tree-item__check"
        :class="{
          'uid-tree-item__check--checked': isChecked,
          'uid-tree-item__check--indeterminate': isIndeterminate,
        }"
        role="checkbox"
        :aria-checked="isIndeterminate ? 'mixed' : isChecked"
        @click="onCheckClick"
      >
        <UidIcon
          v-if="isChecked && !isIndeterminate"
          :icon="Check"
          :size="12"
        />
      </span>

      <span
        v-if="node.icon"
        class="uid-tree-item__icon"
      >
        <UidIcon
          :icon="node.icon"
          :size="16"
        />
      </span>

      <span class="uid-tree-item__label">{{ node.label }}</span>
    </div>

    <ul
      v-if="hasChildren && isExpanded"
      class="uid-tree-item__children"
      role="group"
    >
      <UidTreeItem
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :level="level + 1"
      />
    </ul>
  </li>
</template>
