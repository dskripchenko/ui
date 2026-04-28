import type { InjectionKey, Ref } from 'vue'

export type TreeKey = string | number

export interface TreeNode {
  key: TreeKey
  label: string
  children?: TreeNode[]
  disabled?: boolean
  icon?: unknown
}

export type TreeSelectable = 'single' | 'multiple' | false

export interface TreeContext {
  selectable: Ref<TreeSelectable>
  checkable: Ref<boolean>
  disabled: Ref<boolean>
  expandedKeys: Ref<Set<TreeKey>>
  selectedKeys: Ref<Set<TreeKey>>
  checkedKeys: Ref<Set<TreeKey>>
  focusedKey: Ref<TreeKey | null>
  isExpanded(key: TreeKey): boolean
  isSelected(key: TreeKey): boolean
  isChecked(key: TreeKey): boolean
  isIndeterminate(key: TreeKey): boolean
  isFirst(key: TreeKey): boolean
  toggleExpand(key: TreeKey): void
  toggleSelect(node: TreeNode): void
  toggleCheck(node: TreeNode): void
  focusKey(key: TreeKey): void
  focusRelative(key: TreeKey, delta: number): void
  focusEdge(edge: 'first' | 'last'): void
  parentKeyOf(key: TreeKey): TreeKey | null
}

export const treeContextKey: InjectionKey<TreeContext> = Symbol('UidTree')
