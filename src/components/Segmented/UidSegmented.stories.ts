import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidSegmented from './UidSegmented.vue'

const meta: Meta<typeof UidSegmented> = {
  title: 'Components/Segmented',
  component: UidSegmented,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidSegmented>

export const Variants: Story = {
  render: () => ({
    components: { UidSegmented },
    setup: () => ({
      view: ref('week'),
      minutes: ref(60),
      days: ref([3]),
      views: [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }],
      lengths: [15, 30, 45, 60].map((m) => ({ value: m, label: `${m} min` })),
      weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d, i) => ({ value: i + 1, label: d })),
    }),
    template: `<div style="display:grid;gap:16px">
      <UidSegmented v-model="view" :options="views" label="View" />
      <UidSegmented v-model="minutes" :options="lengths" variant="chips" label="Length" />
      <UidSegmented v-model="days" :options="weekdays" variant="chips" shape="round" size="sm" multiple label="Days" />
    </div>`,
  }),
}
