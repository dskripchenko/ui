import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { Folder, FileText, FolderOpen } from 'lucide-vue-next'
import UidTreeView from './UidTreeView.vue'
import type { TreeNode, TreeKey } from './context.js'

const meta: Meta<typeof UidTreeView> = {
  title: 'Data Display/TreeView',
  component: UidTreeView,
  tags: ['autodocs'],
  argTypes: {
    selectable: { control: 'select', options: [false, 'single', 'multiple'] },
    checkable: { control: 'boolean' },
    showGuides: { control: 'boolean' },
    defaultExpandAll: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidTreeView>

const fileTree: TreeNode[] = [
  {
    key: 'src', label: 'src', icon: Folder, children: [
      {
        key: 'components', label: 'components', icon: Folder, children: [
          { key: 'button.vue', label: 'Button.vue', icon: FileText },
          { key: 'input.vue', label: 'Input.vue', icon: FileText },
        ],
      },
      {
        key: 'styles', label: 'styles', icon: Folder, children: [
          { key: 'globals.css', label: 'globals.css', icon: FileText },
        ],
      },
      { key: 'main.ts', label: 'main.ts', icon: FileText },
    ],
  },
  {
    key: 'public', label: 'public', icon: FolderOpen, children: [
      { key: 'index.html', label: 'index.html', icon: FileText },
    ],
  },
  { key: 'package.json', label: 'package.json', icon: FileText },
]

export const Default: Story = {
  render: () => ({
    components: { UidTreeView },
    setup: () => ({
      nodes: fileTree,
      expanded: ref<TreeKey[]>(['src']),
      selected: ref<TreeKey[]>([]),
    }),
    template: `
      <UidTreeView
        :nodes="nodes"
        v-model:expandedKeys="expanded"
        v-model:selectedKeys="selected"
        style="width:320px"
      />
    `,
  }),
}

export const ExpandAll: Story = {
  render: () => ({
    components: { UidTreeView },
    setup: () => ({
      nodes: fileTree,
      expanded: ref<TreeKey[]>([]),
      selected: ref<TreeKey[]>([]),
    }),
    template: `
      <UidTreeView
        :nodes="nodes"
        v-model:expandedKeys="expanded"
        v-model:selectedKeys="selected"
        default-expand-all
        show-guides
        style="width:320px"
      />
    `,
  }),
}

export const Checkable: Story = {
  render: () => ({
    components: { UidTreeView },
    setup: () => ({
      nodes: fileTree,
      expanded: ref<TreeKey[]>(['src', 'components']),
      checked: ref<TreeKey[]>(['button.vue']),
    }),
    template: `
      <UidTreeView
        :nodes="nodes"
        v-model:expandedKeys="expanded"
        v-model:checkedKeys="checked"
        :selectable="false"
        checkable
        show-guides
        style="width:320px"
      />
    `,
  }),
}

export const Multiple: Story = {
  render: () => ({
    components: { UidTreeView },
    setup: () => ({
      nodes: fileTree,
      expanded: ref<TreeKey[]>(['src', 'components']),
      selected: ref<TreeKey[]>(['button.vue']),
    }),
    template: `
      <UidTreeView
        :nodes="nodes"
        v-model:expandedKeys="expanded"
        v-model:selectedKeys="selected"
        selectable="multiple"
        style="width:320px"
      />
    `,
  }),
}
