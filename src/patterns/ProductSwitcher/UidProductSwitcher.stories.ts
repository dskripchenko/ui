import type { Meta, StoryObj } from '@storybook/vue3'
import { BookOpen, ListChecks } from '../../icons/index.js'
import UidProductSwitcher from './UidProductSwitcher.vue'

const items = [
  { key: 'docs', label: 'Docs', href: '#docs', icon: BookOpen },
  { key: 'tasks', label: 'Tasks', href: '#tasks', icon: ListChecks, current: true },
]

const meta: Meta<typeof UidProductSwitcher> = {
  title: 'Patterns/ProductSwitcher',
  component: UidProductSwitcher,
  tags: ['autodocs'],
  args: { items, label: 'Switch product' },
}

export default meta
type Story = StoryObj<typeof UidProductSwitcher>

export const Segments: Story = {}

export const Compact: Story = { args: { compact: true } }

export const WithHint: Story = {
  args: { hint: (item: { label: string }) => `Open KB-12 in ${item.label}` },
}
