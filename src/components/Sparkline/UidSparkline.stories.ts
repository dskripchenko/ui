import type { Meta, StoryObj } from '@storybook/vue3'
import UidSparkline from './UidSparkline.vue'
import UidStat from '../Stat/UidStat.vue'

const meta: Meta<typeof UidSparkline> = {
  title: 'Charts/Sparkline',
  component: UidSparkline,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['line', 'area', 'bar'] },
    smooth: { control: 'boolean' },
    showDots: { control: 'boolean' },
    showLast: { control: 'boolean' },
    showZero: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidSparkline>

const trendUp = [4, 6, 5, 8, 7, 10, 9, 12, 11, 14]
const trendDown = [12, 10, 11, 8, 9, 6, 7, 4, 5, 3]
const mixed = [3, -2, 5, -1, 4, -3, 6, 1, -2, 5]

export const Default: Story = {
  render: () => ({
    components: { UidSparkline },
    setup: () => ({ trendUp }),
    template: `<UidSparkline :data="trendUp" :width="180" :height="48" />`,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UidSparkline },
    setup: () => ({ trendUp }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div>
          <p style="margin:0 0 8px;font-size:13px;color:var(--uid-color-text-secondary)">Line</p>
          <UidSparkline :data="trendUp" type="line" :width="200" :height="48" />
        </div>
        <div>
          <p style="margin:0 0 8px;font-size:13px;color:var(--uid-color-text-secondary)">Area</p>
          <UidSparkline :data="trendUp" type="area" :width="200" :height="48" />
        </div>
        <div>
          <p style="margin:0 0 8px;font-size:13px;color:var(--uid-color-text-secondary)">Bar</p>
          <UidSparkline :data="trendUp" type="bar" :width="200" :height="48" />
        </div>
      </div>
    `,
  }),
}

export const Smooth: Story = {
  render: () => ({
    components: { UidSparkline },
    setup: () => ({ trendUp }),
    template: `
      <div style="display:flex;gap:24px">
        <UidSparkline :data="trendUp" type="area" :width="200" :height="60" />
        <UidSparkline :data="trendUp" type="area" smooth :width="200" :height="60" />
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { UidSparkline },
    setup: () => ({ trendUp, trendDown }),
    template: `
      <div style="display:flex;flex-direction:column;gap:8px">
        <UidSparkline :data="trendUp" type="area" color="var(--uid-color-success)" :width="240" :height="48" />
        <UidSparkline :data="trendDown" type="area" color="var(--uid-color-danger)" :width="240" :height="48" />
        <UidSparkline :data="trendUp" type="area" color="var(--uid-color-warning)" :width="240" :height="48" />
      </div>
    `,
  }),
}

export const WithDots: Story = {
  render: () => ({
    components: { UidSparkline },
    setup: () => ({ trendUp }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <UidSparkline :data="trendUp" :width="240" :height="48" show-dots smooth />
        <UidSparkline :data="trendUp" :width="240" :height="48" show-last smooth />
      </div>
    `,
  }),
}

export const Bipolar: Story = {
  render: () => ({
    components: { UidSparkline },
    setup: () => ({ mixed }),
    template: `
      <div style="display:flex;flex-direction:column;gap:8px">
        <UidSparkline :data="mixed" type="bar" show-zero :width="240" :height="60" />
        <UidSparkline :data="mixed" type="line" show-zero smooth :width="240" :height="60" />
      </div>
    `,
  }),
}

export const InStat: Story = {
  render: () => ({
    components: { UidSparkline, UidStat },
    setup: () => ({ trendUp, trendDown }),
    template: `
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-width:560px">
        <UidStat title="Конверсия" :value="4.7" suffix="%" :precision="1" :trend="0.6">
          <template #footer>
            <UidSparkline :data="trendUp" type="area" :width="240" :height="36" color="var(--uid-color-success)" />
          </template>
        </UidStat>
        <UidStat title="Bounce rate" :value="32" suffix="%" :trend="-2.1" tone="warning">
          <template #footer>
            <UidSparkline :data="trendDown" type="area" :width="240" :height="36" color="var(--uid-color-danger)" />
          </template>
        </UidStat>
      </div>
    `,
  }),
}

export const Inline: Story = {
  render: () => ({
    components: { UidSparkline },
    setup: () => ({ trendUp }),
    template: `
      <p style="font-size:14px;line-height:1.7;max-width:520px">
        Активность пользователей за неделю
        <UidSparkline :data="trendUp" :width="60" :height="16" type="area" smooth />
        выросла на 30%, основной рост пришёлся на четверг и пятницу.
      </p>
    `,
  }),
}
