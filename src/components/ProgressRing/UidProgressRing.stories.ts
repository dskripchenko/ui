import type { Meta, StoryObj } from '@storybook/vue3'
import { ref, onMounted } from 'vue'
import UidProgressRing from './UidProgressRing.vue'

const meta: Meta<typeof UidProgressRing> = {
  title: 'Charts/ProgressRing',
  component: UidProgressRing,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info'] },
    indeterminate: { control: 'boolean' },
    showLabel: { control: 'boolean' },
    value: { control: 'number' },
    size: { control: 'number' },
    strokeWidth: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidProgressRing>

export const Default: Story = {
  render: () => ({
    components: { UidProgressRing },
    template: `<UidProgressRing :value="65" :size="100" show-label />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidProgressRing },
    template: `
      <div style="display:flex;align-items:center;gap:24px">
        <UidProgressRing :value="65" :size="40" :stroke-width="4" />
        <UidProgressRing :value="65" :size="64" :stroke-width="6" show-label />
        <UidProgressRing :value="65" :size="100" :stroke-width="8" show-label />
        <UidProgressRing :value="65" :size="160" :stroke-width="12" show-label />
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { UidProgressRing },
    template: `
      <div style="display:flex;gap:24px">
        <UidProgressRing :value="80" tone="primary" show-label />
        <UidProgressRing :value="80" tone="success" show-label />
        <UidProgressRing :value="50" tone="warning" show-label />
        <UidProgressRing :value="20" tone="danger" show-label />
        <UidProgressRing :value="60" tone="info" show-label />
      </div>
    `,
  }),
}

export const CustomLabel: Story = {
  render: () => ({
    components: { UidProgressRing },
    template: `
      <div style="display:flex;gap:24px">
        <UidProgressRing :value="850" :max="1000" :size="100" show-label :format-label="(v, m) => v + '/' + m" />
        <UidProgressRing :value="3.5" :max="5" :size="100">
          <span style="font-size:18px;font-weight:600">3.5★</span>
        </UidProgressRing>
        <UidProgressRing :value="42" :size="100">
          <div style="text-align:center">
            <div style="font-size:18px;font-weight:600">42</div>
            <div style="font-size:11px;color:var(--uid-color-text-tertiary)">из 100</div>
          </div>
        </UidProgressRing>
      </div>
    `,
  }),
}

export const Indeterminate: Story = {
  render: () => ({
    components: { UidProgressRing },
    template: `
      <div style="display:flex;gap:24px;align-items:center">
        <UidProgressRing indeterminate :size="40" :stroke-width="4" />
        <UidProgressRing indeterminate :size="64" :stroke-width="6" />
        <UidProgressRing indeterminate :size="100" :stroke-width="8" tone="success" />
      </div>
    `,
  }),
}

export const Animated: Story = {
  render: () => ({
    components: { UidProgressRing },
    setup: () => {
      const value = ref(0)
      onMounted(() => {
        let v = 0
        const interval = setInterval(() => {
          v = (v + 7) % 110
          value.value = Math.min(100, v)
        }, 200)
        return () => clearInterval(interval)
      })
      return { value }
    },
    template: `<UidProgressRing :value="value" :size="120" :stroke-width="10" show-label />`,
  }),
}
