import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidDateRangePicker, { type DateRange, type DateRangePreset } from './UidDateRangePicker.vue'

const meta: Meta<typeof UidDateRangePicker> = {
  title: 'Inputs/DateRangePicker',
  component: UidDateRangePicker,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
    withTime: { control: 'boolean' },
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

export const WithTime: Story = {
  render: () => ({
    components: { UidDateRangePicker },
    setup: () => ({
      value: ref<DateRange>({ start: '2026-04-01T09:00', end: '2026-04-15T18:30' }),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:8px">
        <UidDateRangePicker v-model="value" with-time style="width:360px" />
        <code>{{ value }}</code>
      </div>
    `,
  }),
}

const quarterPresets: DateRangePreset[] = [
  { label: 'I квартал', range: () => ({ start: '2026-01-01', end: '2026-03-31' }) },
  { label: 'II квартал', range: () => ({ start: '2026-04-01', end: '2026-06-30' }) },
  { label: 'III квартал', range: () => ({ start: '2026-07-01', end: '2026-09-30' }) },
  { label: 'IV квартал', range: () => ({ start: '2026-10-01', end: '2026-12-31' }) },
]

export const CustomPresets: Story = {
  render: () => ({
    components: { UidDateRangePicker },
    setup: () => ({ value: ref<DateRange>({ start: null, end: null }), presets: quarterPresets }),
    template: `<UidDateRangePicker v-model="value" :presets="presets" placeholder="Квартал" style="width:320px" />`,
  }),
}

export const WithoutPresets: Story = {
  render: () => ({
    components: { UidDateRangePicker },
    setup: () => ({ value: ref<DateRange>({ start: null, end: null }) }),
    template: `<UidDateRangePicker v-model="value" :presets="false" style="width:320px" />`,
  }),
}
