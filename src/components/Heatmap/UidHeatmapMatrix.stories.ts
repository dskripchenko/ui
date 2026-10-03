import type { Meta, StoryObj } from '@storybook/vue3'
import UidHeatmapMatrix from './UidHeatmapMatrix.vue'

const meta: Meta<typeof UidHeatmapMatrix> = {
  title: 'Charts/HeatmapMatrix',
  component: UidHeatmapMatrix,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Матричная тепловая карта: строки × столбцы с подписями осей. В отличие от календарного `UidHeatmap`, ничего не знает о датах — рисует ровно ту матрицу, что передали. `null` — пустая ячейка «нет данных».',
      },
    },
  },
  argTypes: {
    colorScale: {
      control: 'select',
      options: ['default', 'viridis', 'magma', 'plasma', 'inferno', 'blues', 'greens', 'reds'],
    },
    colLabels: { control: 'inline-radio', options: ['auto', 'horizontal', 'rotated'] },
    cellHeight: { control: 'number' },
    gap: { control: 'number' },
    showLegend: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidHeatmapMatrix>

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const months = ['Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт']

function seeded(rows: number, cols: number, seed = 7): number[][] {
  let s = seed
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      s = (s * 9301 + 49297) % 233280
      return Math.round((s / 233280) * 40 + (r >= 5 ? 0 : 20) + c * 2)
    }),
  )
}

const ordersByWeekday = seeded(7, 6).map((row, r) => row.map((v, c) => (c === 5 && (r < 3 || r > 5) ? null : v)))

export const Default: Story = {
  args: {
    colorScale: 'viridis',
    colLabels: 'auto',
    cellHeight: 22,
    gap: 2,
    showLegend: true,
  },
  render: (args) => ({
    components: { UidHeatmapMatrix },
    setup: () => ({ args, rows: weekdays, cols: months, values: ordersByWeekday }),
    template: `<div style="width:560px;max-width:100%"><UidHeatmapMatrix v-bind="args" :rows="rows" :cols="cols" :values="values" /></div>`,
  }),
}

export const Scales: Story = {
  render: () => ({
    components: { UidHeatmapMatrix },
    setup: () => ({
      rows: weekdays,
      cols: months,
      values: seeded(7, 6, 3),
      scales: ['default', 'viridis', 'magma', 'blues', 'greens', 'reds'],
    }),
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;width:1000px;max-width:100%">
        <div v-for="s in scales" :key="s">
          <div style="font-size:12px;margin-bottom:6px">{{ s }}</div>
          <UidHeatmapMatrix :rows="rows" :cols="cols" :values="values" :color-scale="s" />
        </div>
      </div>
    `,
  }),
}

export const CustomStops: Story = {
  render: () => ({
    components: { UidHeatmapMatrix },
    setup: () => ({
      rows: weekdays,
      cols: months,
      values: seeded(7, 6, 11),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;width:520px;max-width:100%">
        <UidHeatmapMatrix :rows="rows" :cols="cols" :values="values" :color-scale="['#fef3c7', '#f59e0b', '#7c2d12']" />
        <UidHeatmapMatrix :rows="rows" :cols="cols" :values="values" color-scale="var(--uid-color-danger)" />
      </div>
    `,
  }),
}

export const HoursOfDay: Story = {
  render: () => ({
    components: { UidHeatmapMatrix },
    setup: () => ({
      rows: weekdays,
      cols: Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`),
      values: seeded(7, 24, 5),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:32px">
        <div style="width:900px;max-width:100%"><UidHeatmapMatrix :rows="rows" :cols="cols" :values="values" color-scale="magma" /></div>
        <div style="width:420px;max-width:100%"><UidHeatmapMatrix :rows="rows" :cols="cols" :values="values" color-scale="magma" /></div>
        <div style="width:260px;max-width:100%"><UidHeatmapMatrix :rows="rows" :cols="cols" :values="values" color-scale="magma" /></div>
      </div>
    `,
  }),
}

export const MoneyFormatter: Story = {
  render: () => ({
    components: { UidHeatmapMatrix },
    setup: () => ({
      rows: ['Север', 'Юг', 'Запад', 'Восток'],
      cols: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [[120500, 98000, 143200, null], [80400, 91000, 77000, 102300], [64000, null, 71500, 88000], [150000, 162500, 171000, 180250]],
      formatValue: (v: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v),
    }),
    template: `<div style="width:480px;max-width:100%"><UidHeatmapMatrix :rows="rows" :cols="cols" :values="values" color-scale="greens" :format-value="formatValue" /></div>`,
  }),
}

export const CustomTooltip: Story = {
  render: () => ({
    components: { UidHeatmapMatrix },
    setup: () => ({ rows: weekdays, cols: months, values: ordersByWeekday }),
    template: `
      <div style="width:520px;max-width:100%">
        <UidHeatmapMatrix :rows="rows" :cols="cols" :values="values" color-scale="blues">
          <template #tooltip="{ cell, formatted }">
            <span>{{ cell.col }}, {{ cell.row }}</span>
            <strong>{{ cell.value === null ? 'Месяц ещё идёт' : formatted + ' заказов' }}</strong>
          </template>
        </UidHeatmapMatrix>
      </div>
    `,
  }),
}
