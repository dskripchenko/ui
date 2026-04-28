<script setup lang="ts">
import './UidTreeView.css'
import { computed, provide, ref, watch } from 'vue'
import UidTreeItem from './UidTreeItem.vue'
import { treeContextKey, type TreeNode, type TreeKey, type TreeSelectable } from './context.js'

export interface UidTreeViewProps {
  nodes: TreeNode[]
  selectable?: TreeSelectable
  checkable?: boolean
  disabled?: boolean
  defaultExpandAll?: boolean
  showGuides?: boolean
}

const props = withDefaults(defineProps<UidTreeViewProps>(), {
  selectable: 'single',
  checkable: false,
  disabled: false,
  defaultExpandAll: false,
  showGuides: false,
})

const emit = defineEmits<{
  select: [node: TreeNode]
  check: [node: TreeNode, checked: boolean]
}>()

const expandedKeys = defineModel<TreeKey[]>('expandedKeys', { default: () => [] })
const selectedKeys = defineModel<TreeKey[]>('selectedKeys', { default: () => [] })
const checkedKeys = defineModel<TreeKey[]>('checkedKeys', { default: () => [] })

function collectAllKeys(nodes: TreeNode[]): TreeKey[] {
  const keys: TreeKey[] = []
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      keys.push(n.key)
      if (n.children) walk(n.children)
    }
  }
  walk(nodes)
  return keys
}

if (props.defaultExpandAll && expandedKeys.value.length === 0) {
  expandedKeys.value = collectAllKeys(props.nodes)
}

const expandedSet = computed({
  get: () => new Set(expandedKeys.value),
  set: (s) => { expandedKeys.value = [...s] },
})

const selectedSet = computed({
  get: () => new Set(selectedKeys.value),
  set: (s) => { selectedKeys.value = [...s] },
})

const checkedSet = ref(new Set(checkedKeys.value))
watch(checkedKeys, (v) => { checkedSet.value = new Set(v) })

const indeterminateSet = ref<Set<TreeKey>>(new Set())

function descendantKeys(node: TreeNode): TreeKey[] {
  const keys: TreeKey[] = []
  const walk = (n: TreeNode) => {
    if (n.children) {
      for (const c of n.children) {
        keys.push(c.key)
        walk(c)
      }
    }
  }
  walk(node)
  return keys
}

function findNodeAndAncestors(key: TreeKey): { path: TreeNode[]; node: TreeNode | null } {
  const path: TreeNode[] = []
  let found: TreeNode | null = null
  const walk = (list: TreeNode[]): boolean => {
    for (const n of list) {
      path.push(n)
      if (n.key === key) { found = n; return true }
      if (n.children && walk(n.children)) return true
      path.pop()
    }
    return false
  }
  walk(props.nodes)
  return { path, node: found }
}

function recomputeAncestorState(): void {
  const indet = new Set<TreeKey>()
  const checked = new Set(checkedSet.value)

  const walk = (node: TreeNode): { all: boolean; some: boolean } => {
    if (!node.children || node.children.length === 0) {
      const isChecked = checked.has(node.key)
      return { all: isChecked, some: isChecked }
    }
    let all = true
    let some = false
    for (const c of node.children) {
      const r = walk(c)
      if (!r.all) all = false
      if (r.some || r.all) some = true
    }
    if (all) {
      checked.add(node.key)
      indet.delete(node.key)
    } else if (some) {
      checked.delete(node.key)
      indet.add(node.key)
    } else {
      checked.delete(node.key)
      indet.delete(node.key)
    }
    return { all, some }
  }

  for (const root of props.nodes) walk(root)
  checkedSet.value = checked
  indeterminateSet.value = indet
  checkedKeys.value = [...checked]
}

watch(() => props.nodes, recomputeAncestorState, { immediate: true, deep: true })
watch(checkedKeys, () => {
  if ([...checkedSet.value].sort().join(',') !== [...checkedKeys.value].sort().join(',')) {
    checkedSet.value = new Set(checkedKeys.value)
    recomputeAncestorState()
  }
})

function toggleExpand(key: TreeKey): void {
  const s = new Set(expandedSet.value)
  if (s.has(key)) s.delete(key); else s.add(key)
  expandedSet.value = s
}

function toggleSelect(node: TreeNode): void {
  if (props.selectable === false) return
  const s = new Set(selectedSet.value)
  if (props.selectable === 'single') {
    if (s.has(node.key)) s.delete(node.key); else { s.clear(); s.add(node.key) }
  } else {
    if (s.has(node.key)) s.delete(node.key); else s.add(node.key)
  }
  selectedSet.value = s
  emit('select', node)
}

function toggleCheck(node: TreeNode): void {
  const isCurrentlyChecked = checkedSet.value.has(node.key)
  const next = new Set(checkedSet.value)
  const descendants = descendantKeys(node)
  if (isCurrentlyChecked) {
    next.delete(node.key)
    for (const k of descendants) next.delete(k)
  } else {
    next.add(node.key)
    for (const k of descendants) next.add(k)
  }
  checkedSet.value = next
  checkedKeys.value = [...next]
  recomputeAncestorState()
  emit('check', node, !isCurrentlyChecked)
}

provide(treeContextKey, {
  selectable: computed(() => props.selectable),
  checkable: computed(() => props.checkable),
  disabled: computed(() => props.disabled),
  expandedKeys: expandedSet,
  selectedKeys: selectedSet,
  checkedKeys: checkedSet,
  isExpanded: (k) => expandedSet.value.has(k),
  isSelected: (k) => selectedSet.value.has(k),
  isChecked: (k) => checkedSet.value.has(k),
  isIndeterminate: (k) => indeterminateSet.value.has(k),
  toggleExpand,
  toggleSelect,
  toggleCheck,
})
</script>

<template>
  <ul
    class="uid-tree"
    :class="{ 'uid-tree--guides': showGuides }"
    role="tree"
  >
    <UidTreeItem
      v-for="node in nodes"
      :key="node.key"
      :node="node"
      :level="0"
    />
  </ul>
</template>
