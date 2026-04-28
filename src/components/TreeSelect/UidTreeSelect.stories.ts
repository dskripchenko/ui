import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { Folder, FileText } from 'lucide-vue-next'
import UidTreeSelect from './UidTreeSelect.vue'
import type { TreeNode, TreeKey } from '../TreeView/context.js'

const meta: Meta<typeof UidTreeSelect> = {
  title: 'Inputs/TreeSelect',
  component: UidTreeSelect,
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
    showGuides: { control: 'boolean' },
    defaultExpandAll: { control: 'boolean' },
    maxTagCount: { control: 'number' },
  },
  decorators: [
    () => ({ template: '<div style="padding-bottom: 360px"><story /></div>' }),
  ],
}
export default meta

type Story = StoryObj<typeof UidTreeSelect>

const tree: TreeNode[] = [
  {
    key: 'frontend', label: 'Frontend', icon: Folder, children: [
      { key: 'vue', label: 'Vue', icon: FileText },
      { key: 'react', label: 'React', icon: FileText },
      { key: 'svelte', label: 'Svelte', icon: FileText },
    ],
  },
  {
    key: 'backend', label: 'Backend', icon: Folder, children: [
      { key: 'go', label: 'Go', icon: FileText },
      { key: 'python', label: 'Python', icon: FileText },
      { key: 'rust', label: 'Rust', icon: FileText },
    ],
  },
  { key: 'devops', label: 'DevOps', icon: Folder },
]

export const Default: Story = {
  render: () => ({
    components: { UidTreeSelect },
    setup: () => ({
      tree,
      value: ref<TreeKey | null>(null),
      expanded: ref<TreeKey[]>(['frontend']),
    }),
    template: `
      <UidTreeSelect
        v-model="value"
        v-model:expandedKeys="expanded"
        :nodes="tree"
        label="Технология"
        placeholder="Выбрать..."
        style="width:340px"
      />
    `,
  }),
}

export const Multiple: Story = {
  render: () => ({
    components: { UidTreeSelect },
    setup: () => ({
      tree,
      value: ref<TreeKey[]>(['vue', 'go']),
      expanded: ref<TreeKey[]>(['frontend', 'backend']),
    }),
    template: `
      <UidTreeSelect
        v-model="value"
        v-model:expandedKeys="expanded"
        :nodes="tree"
        multiple
        label="Стек"
        placeholder="Выберите технологии"
        style="width:380px"
      />
    `,
  }),
}

export const ExpandAllWithGuides: Story = {
  render: () => ({
    components: { UidTreeSelect },
    setup: () => ({
      tree,
      value: ref<TreeKey | null>(null),
      expanded: ref<TreeKey[]>([]),
    }),
    template: `
      <UidTreeSelect
        v-model="value"
        v-model:expandedKeys="expanded"
        :nodes="tree"
        default-expand-all
        show-guides
        label="С иконками и гайдами"
        style="width:340px"
      />
    `,
  }),
}

export const MaxTags: Story = {
  render: () => ({
    components: { UidTreeSelect },
    setup: () => ({
      tree,
      value: ref<TreeKey[]>(['vue', 'react', 'go', 'rust']),
      expanded: ref<TreeKey[]>(['frontend', 'backend']),
    }),
    template: `
      <UidTreeSelect
        v-model="value"
        v-model:expandedKeys="expanded"
        :nodes="tree"
        multiple
        :max-tag-count="2"
        label="Не более 2 видимых"
        style="width:340px"
      />
    `,
  }),
}
