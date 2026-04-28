import type { Meta, StoryObj } from '@storybook/vue3'
import UidHeatmap from './UidHeatmap.vue'

const meta: Meta<typeof UidHeatmap> = {
  title: 'Charts/Heatmap',
  component: UidHeatmap,
  tags: ['autodocs'],
  argTypes: {
    showLegend: { control: 'boolean' },
    showWeekdays: { control: 'boolean' },
    showMonths: { control: 'boolean' },
    cellSize: { control: 'number' },
    gap: { control: 'number' },
    levels: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidHeatmap>

function buildYearOfData(seed = 42): { date: string; value: number }[] {
  const result: { date: string; value: number }[] = []
  const end = new Date()
  let s = seed
  for (let i = 0; i < 365; i++) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    s = (s * 9301 + 49297) % 233280
    const r = s / 233280
    const value = r < 0.3 ? 0 : Math.floor(r * 12)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    result.push({ date: iso, value })
  }
  return result
}

export const Default: Story = {
  render: () => ({
    components: { UidHeatmap },
    setup: () => ({ data: buildYearOfData() }),
    template: `<UidHeatmap :data="data" />`,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { UidHeatmap },
    setup: () => ({ data: buildYearOfData() }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <UidHeatmap :data="data" />
        <UidHeatmap :data="data" color="var(--uid-color-success)" />
        <UidHeatmap :data="data" color="var(--uid-color-danger)" />
        <UidHeatmap :data="data" color="#8b5cf6" />
      </div>
    `,
  }),
}

export const Compact: Story = {
  render: () => ({
    components: { UidHeatmap },
    setup: () => ({ data: buildYearOfData() }),
    template: `
      <UidHeatmap :data="data" :cell-size="8" :gap="2" :show-legend="false" :show-weekdays="false" />
    `,
  }),
}

export const ThreeMonths: Story = {
  render: () => ({
    components: { UidHeatmap },
    setup: () => ({
      data: buildYearOfData(),
      startDate: (() => {
        const d = new Date()
        d.setMonth(d.getMonth() - 3)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      })(),
    }),
    template: `<UidHeatmap :data="data" :start-date="startDate" />`,
  }),
}

export const CustomTooltip: Story = {
  render: () => ({
    components: { UidHeatmap },
    setup: () => ({
      data: buildYearOfData(),
      formatTooltip: (p: { date: string; value: number }) => {
        if (p.value === 0) return `Нет коммитов · ${p.date}`
        return `${p.value} ${p.value === 1 ? 'коммит' : 'коммитов'} · ${p.date}`
      },
    }),
    template: `<UidHeatmap :data="data" :format-tooltip="formatTooltip" />`,
  }),
}
