import type { Meta, StoryObj } from '@storybook/vue3'
import UidHistoryStrip, { type HistoryCell } from './UidHistoryStrip.vue'

const meta: Meta<typeof UidHistoryStrip> = {
  title: 'Components/HistoryStrip',
  component: UidHistoryStrip,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidHistoryStrip>

const tones: HistoryCell['tone'][] = ['success', 'success', 'success', 'warning', 'success', 'danger', 'success', 'none']
const runs: HistoryCell[] = Array.from({ length: 40 }, (_, i) => ({ key: i, tone: tones[(i * 7) % tones.length]!, title: `Run ${i + 1}` }))
const days: HistoryCell[] = Array.from({ length: 90 }, (_, i) => ({ key: i, tone: i === 61 ? 'danger' : i === 30 ? 'warning' : 'success', title: `Day ${i + 1}` }))

export const Fixed: Story = {
  args: { cells: runs, label: 'Last 40 runs' },
}

export const Fill: Story = {
  args: { cells: days, label: '90 days, 99.8% up', fit: 'fill', height: 28 },
}
