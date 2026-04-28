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
  isExpanded(key: TreeKey): boolean
  isSelected(key: TreeKey): boolean
  isChecked(key: TreeKey): boolean
  isIndeterminate(key: TreeKey): boolean
  toggleExpand(key: TreeKey): void
  toggleSelect(node: TreeNode): void
  toggleCheck(node: TreeNode): void
}

export const treeContextKey: InjectionKey<TreeContext> = Symbol('UidTree')
