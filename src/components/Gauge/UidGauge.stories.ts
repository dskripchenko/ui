import type { Meta, StoryObj } from '@storybook/vue3'
import UidGauge from './UidGauge.vue'

const meta: Meta<typeof UidGauge> = {
  title: 'Charts/Gauge',
  component: UidGauge,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info'] },
    showValue: { control: 'boolean' },
    showLimits: { control: 'boolean' },
    showNeedle: { control: 'boolean' },
    value: { control: 'number' },
    size: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidGauge>

export const Default: Story = {
  args: {
    value: 65,
    min: 0,
    max: 100,
    size: 220,
    suffix: '%',
    label: 'Использование диска',
    showLimits: true,
    showValue: true,
    tone: 'primary',
  },
  render: (args) => ({
    components: { UidGauge },
    setup: () => ({ args }),
    template: `<UidGauge v-bind="args" />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidGauge },
    template: `
      <div style="display:flex;align-items:flex-end;gap:32px">
        <UidGauge :value="65" :size="120" suffix="%" />
        <UidGauge :value="65" :size="180" suffix="%" />
        <UidGauge :value="65" :size="240" suffix="%" />
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { UidGauge },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:720px">
        <UidGauge :value="20" :size="180" tone="success" suffix="%" label="Cool" />
        <UidGauge :value="60" :size="180" tone="warning" suffix="%" label="Warm" />
        <UidGauge :value="90" :size="180" tone="danger" suffix="%" label="Hot" />
      </div>
    `,
  }),
}

export const Ranges: Story = {
  render: () => ({
    components: { UidGauge },
    setup: () => ({
      ranges: [
        { from: 0, to: 50, color: '#22c55e' },
        { from: 50, to: 80, color: '#eab308' },
        { from: 80, to: 100, color: '#ef4444' },
      ],
    }),
    template: `
      <div style="display:flex;gap:32px">
        <UidGauge :value="35" :size="220" :ranges="ranges" suffix="%" show-needle show-limits label="CPU" />
        <UidGauge :value="65" :size="220" :ranges="ranges" suffix="%" show-needle show-limits label="Память" />
        <UidGauge :value="92" :size="220" :ranges="ranges" suffix="%" show-needle show-limits label="Диск" />
      </div>
    `,
  }),
}

export const WithNeedle: Story = {
  render: () => ({
    components: { UidGauge },
    template: `
      <UidGauge
        :value="120"
        :min="0"
        :max="240"
        :size="240"
        suffix="км/ч"
        label="Скорость"
        show-needle
        show-limits
      />
    `,
  }),
}

export const CustomFormat: Story = {
  render: () => ({
    components: { UidGauge },
    setup: () => ({
      formatValue: (v: number) => `$${(v / 1000).toFixed(1)}k`,
    }),
    template: `
      <UidGauge
        :value="42500"
        :min="0"
        :max="100000"
        :size="220"
        :format-value="formatValue"
        label="Доход за месяц"
        tone="success"
      />
    `,
  }),
}
