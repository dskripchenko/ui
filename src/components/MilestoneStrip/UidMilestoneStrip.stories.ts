import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidMilestoneStrip from './UidMilestoneStrip.vue'
import type { Milestone } from './milestoneStrip'

const meta: Meta<typeof UidMilestoneStrip> = {
  title: 'Components/MilestoneStrip',
  component: UidMilestoneStrip,
  tags: ['autodocs'],
  argTypes: {
    monthFormat: { control: 'inline-radio', options: ['short', 'long'] },
  },
}

export default meta
type Story = StoryObj<typeof UidMilestoneStrip>

const items: Milestone[] = [
  { key: 'design', label: 'Design approved', date: '2026-09-12', caption: 'Done' },
  { key: 'beta', label: 'Public beta', date: '2026-10-20', caption: 'Two blockers open', risk: true },
  { key: 'docs', label: 'Docs complete', date: '2026-11-18', caption: 'On track' },
  { key: 'release', label: 'Release 2.0', date: '2026-12-15', caption: 'Planned', href: '#release' },
]

export const Default: Story = {
  args: { items, today: '2026-11-10', todayLabel: 'Today, November 10', monthFormat: 'short' },
  render: (args) => ({
    components: { UidMilestoneStrip },
    setup: () => {
      const picked = ref('')
      return { args, picked }
    },
    template: `<div style="width: 720px; max-width: 100%; display: grid; gap: 8px; padding: 16px; background: var(--uid-color-surface)">
      <UidMilestoneStrip v-bind="args" @select="picked = $event.label" />
      <small v-if="picked">Selected: {{ picked }}</small>
    </div>`,
  }),
}

export const Narrow: Story = {
  args: { items, today: '2026-11-10', monthFormat: 'short' },
  render: (args) => ({
    components: { UidMilestoneStrip },
    setup: () => ({ args }),
    template: '<div style="width: 358px; background: var(--uid-color-surface)"><UidMilestoneStrip v-bind="args" /></div>',
  }),
}

export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  args: { items, today: '2026-11-10', todayLabel: 'Today', monthFormat: 'long' },
  render: (args) => ({
    components: { UidMilestoneStrip },
    setup: () => ({ args }),
    template: '<div style="width: 720px; max-width: 100%; padding: 16px; background: var(--uid-color-surface)"><UidMilestoneStrip v-bind="args" /></div>',
  }),
}
