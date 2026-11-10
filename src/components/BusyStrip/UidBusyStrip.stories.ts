import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import UidBusyStrip from './UidBusyStrip.vue'
import UidButton from '../Button/UidButton.vue'
import { firstFree, type BusyRow } from './busyStrip'

const meta: Meta<typeof UidBusyStrip> = {
  title: 'Components/BusyStrip',
  component: UidBusyStrip,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidBusyStrip>

const rows: BusyRow[] = [
  { id: 1, label: 'Anna Lee (you)', segments: [{ start: 12 * 60, end: 13 * 60, kind: 'own', label: 'Lunch' }, { start: 9 * 60 + 30, end: 9 * 60 + 45, kind: 'own' }] },
  { id: 2, label: 'Tom Hart', segments: [{ start: 9 * 60 + 30, end: 9 * 60 + 45, kind: 'busy' }, { start: 10 * 60 + 30, end: 11 * 60 + 30, kind: 'busy' }] },
  { id: 3, label: 'Sam Ortiz', segments: [{ start: 15 * 60 + 30, end: 16 * 60, kind: 'busy' }] },
  { id: 4, label: 'Mia Chen', segments: [{ start: 0, end: 24 * 60, kind: 'away' }] },
]

export const Default: Story = {
  render: () => ({
    components: { UidBusyStrip, UidButton },
    setup: () => {
      const start = ref(15 * 60)
      const selection = computed(() => ({ start: start.value, end: start.value + 60 }))
      const free = computed(() => firstFree(rows.slice(0, 3), { from: 15 * 60, to: 19 * 60, duration: 60 }))
      return { rows, start, selection, free }
    },
    template: `<div style="max-width: 400px; display: grid; gap: 12px">
      <UidBusyStrip :rows="rows" :selection="selection" :pick-step="30" @pick="start = $event" />
      <UidButton v-if="free !== null" size="sm" variant="secondary" @click="start = free">First free for everyone: {{ Math.floor(free / 60) }}:{{ String(free % 60).padStart(2, '0') }}</UidButton>
    </div>`,
  }),
}
