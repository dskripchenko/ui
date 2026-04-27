import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidDatePicker from './UidDatePicker.vue'

const meta: Meta<typeof UidDatePicker> = {
  title: 'Components/DatePicker',
  component: UidDatePicker,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="padding-bottom: 320px"><story /></div>' })],
  argTypes: {
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof UidDatePicker>

export const Default: Story = {
  render: (args) => ({
    components: { UidDatePicker },
    setup: () => ({ args, value: ref<string | null>(null) }),
    template: `<UidDatePicker v-bind="args" v-model="value" style="max-width: 280px;" />`,
  }),
  args: {},
}

export const WithValue: Story = {
  render: (args) => ({
    components: { UidDatePicker },
    setup: () => ({ args, value: ref<string | null>('2025-04-15') }),
    template: `<UidDatePicker v-bind="args" v-model="value" style="max-width: 280px;" />`,
  }),
  args: {},
}

export const WithMinMax: Story = {
  render: () => ({
    components: { UidDatePicker },
    setup() {
      const today = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
      const min = fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3))
      const max = fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14))
      return { value: ref<string | null>(null), min, max }
    },
    template: `
      <div style="max-width: 280px;">
        <p style="font-size: 13px; color: var(--uid-color-text-secondary); margin: 0 0 8px;">
          Доступны только следующие 2 недели
        </p>
        <UidDatePicker v-model="value" :min="min" :max="max" />
      </div>
    `,
  }),
}

export const CustomFormat: Story = {
  render: () => ({
    components: { UidDatePicker },
    setup: () => ({
      value: ref<string | null>('2025-12-31'),
      format: (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    }),
    template: `<UidDatePicker v-model="value" :format="format" style="max-width: 300px;" />`,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { UidDatePicker },
    setup: () => ({ args, value: ref<string | null>('2025-04-15') }),
    template: `<UidDatePicker v-bind="args" v-model="value" style="max-width: 280px;" />`,
  }),
  args: { disabled: true },
}
