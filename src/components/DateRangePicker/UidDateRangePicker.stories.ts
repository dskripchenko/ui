import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidDateRangePicker, { type DateRange } from './UidDateRangePicker.vue'

const meta: Meta<typeof UidDateRangePicker> = {
  title: 'Inputs/DateRangePicker',
  component: UidDateRangePicker,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
  decorators: [
    () => ({ template: '<div style="padding-bottom: 480px"><story /></div>' }),
  ],
}
export default meta

type Story = StoryObj<typeof UidDateRangePicker>

export const Default: Story = {
  render: () => ({
    components: { UidDateRangePicker },
    setup: () => ({ value: ref<DateRange>({ start: null, end: null }) }),
    template: `<UidDateRangePicker v-model="value" style="width:320px" />`,
  }),
}

export const Preset: Story = {
  render: () => ({
    components: { UidDateRangePicker },
    setup: () => ({
      value: ref<DateRange>({ start: '2026-04-01', end: '2026-04-15' }),
    }),
    template: `<UidDateRangePicker v-model="value" style="width:320px" />`,
  }),
}

export const WithMinMax: Story = {
  render: () => ({
    components: { UidDateRangePicker },
    setup: () => ({ value: ref<DateRange>({ start: null, end: null }) }),
    template: `
      <UidDateRangePicker
        v-model="value"
        min="2026-04-01"
        max="2026-12-31"
        placeholder="Только Q2-Q4 2026"
        style="width:320px"
      />
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { UidDateRangePicker },
    setup: () => ({
      value: ref<DateRange>({ start: '2026-01-01', end: '2026-01-15' }),
    }),
    template: `<UidDateRangePicker v-model="value" disabled style="width:320px" />`,
  }),
}
