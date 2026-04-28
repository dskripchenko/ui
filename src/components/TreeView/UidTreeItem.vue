<script setup lang="ts">
import { computed, inject } from 'vue'
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

const hasChildren = computed(() => !!props.node.children && props.node.children.length > 0)
const isExpanded = computed(() => ctx.isExpanded(props.node.key))
const isSelected = computed(() => ctx.isSelected(props.node.key))
const isChecked = computed(() => ctx.isChecked(props.node.key))
const isIndeterminate = computed(() => ctx.isIndeterminate(props.node.key))
const isDisabled = computed(() => ctx.disabled.value || !!props.node.disabled)

function onRowClick(): void {
  if (isDisabled.value) return
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
  if (e.key === 'ArrowRight' && hasChildren.value && !isExpanded.value) {
    e.preventDefault()
    ctx.toggleExpand(props.node.key)
  } else if (e.key === 'ArrowLeft' && hasChildren.value && isExpanded.value) {
    e.preventDefault()
    ctx.toggleExpand(props.node.key)
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (ctx.checkable.value) ctx.toggleCheck(props.node)
    else if (ctx.selectable.value) ctx.toggleSelect(props.node)
  }
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
      class="uid-tree-item__row"
      :style="{ '--uid-tree-level': level }"
      :tabindex="isDisabled ? -1 : 0"
      @click="onRowClick"
      @keydown="onKeydown"
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
