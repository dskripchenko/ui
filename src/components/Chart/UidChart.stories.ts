import type { Meta, StoryObj } from '@storybook/vue3'
import UidChart from './UidChart.vue'
import type { ChartReference, ChartSeries } from './UidChart.vue'

const meta: Meta<typeof UidChart> = {
  title: 'Charts/Chart',
  component: UidChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Общий SVG-график: линии, области, столбцы (рядом или стопкой) и точки по общей оси категорий, опорные линии по x и y, подсказка по наведению и с клавиатуры, скрытая таблица данных для скринридеров.',
      },
    },
  },
  argTypes: {
    legend: { control: 'inline-radio', options: [undefined, true, false, 'top', 'bottom'] },
    xLabels: { control: 'inline-radio', options: ['auto', 'all', 'none'] },
    height: { control: 'number' },
    yTicks: { control: 'number' },
    grid: { control: 'boolean' },
    tooltip: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidChart>

const days = ['Mon 3', 'Tue 4', 'Wed 5', 'Thu 6', 'Fri 7', 'Mon 10', 'Tue 11', 'Wed 12', 'Thu 13', 'Fri 14']

const burndownSeries: ChartSeries[] = [
  { key: 'remaining', label: 'Remaining', data: [40, 38, 35, 41, 36, 30, 27, null, null, null] },
  { key: 'ideal', label: 'Ideal', tone: 'neutral', dashed: true, data: [40, 35.6, 31.1, 26.7, 22.2, 17.8, 13.3, 8.9, 4.4, 0] },
  { key: 'added', label: 'Scope added', type: 'dots', tone: 'warning', data: [null, null, null, 41, null, null, null, null, null, null] },
]

const burndownRefs: ChartReference[] = [{ axis: 'x', value: 6, label: 'Today', dashed: true }]

export const Burndown: Story = {
  args: {
    categories: days,
    series: burndownSeries,
    references: burndownRefs,
    height: 260,
    yTicks: 4,
    grid: true,
    tooltip: true,
    xLabels: 'auto',
  },
  render: (args) => ({
    components: { UidChart },
    setup: () => ({ args, fmt: (v: number) => `${Math.round(v)} pt` }),
    template: `<div style="width:640px;max-width:100%"><UidChart v-bind="args" :format-value="fmt" aria-label="Burndown" /></div>`,
  }),
}

const sprints = ['Sprint 21', 'Sprint 22', 'Sprint 23', 'Sprint 24', 'Sprint 25', 'Sprint 26']

export const Velocity: Story = {
  render: () => ({
    components: { UidChart },
    setup: () => ({
      categories: sprints,
      series: [
        { key: 'plan', label: 'Planned', type: 'bar', tone: 'neutral', data: [34, 36, 30, 40, 38, 36] },
        { key: 'done', label: 'Completed', type: 'bar', tone: 'accent', data: [30, 37, 28, 33, 39, null] },
      ] satisfies ChartSeries[],
      references: [{ axis: 'y', value: 33.4, label: 'Average', dashed: true }] satisfies ChartReference[],
    }),
    template: `<div style="width:640px;max-width:100%"><UidChart :categories="categories" :series="series" :references="references" /></div>`,
  }),
}

export const StackedBars: Story = {
  render: () => ({
    components: { UidChart },
    setup: () => ({
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      series: [
        { key: 'bug', label: 'Bugs', type: 'bar', stack: 'kind', data: [12, 9, 14, 8, 6, 10] },
        { key: 'feature', label: 'Features', type: 'bar', stack: 'kind', data: [20, 24, 18, 26, 30, 22] },
        { key: 'chore', label: 'Chores', type: 'bar', stack: 'kind', data: [5, 7, 4, 6, 8, 5] },
      ] satisfies ChartSeries[],
    }),
    template: `<div style="width:640px;max-width:100%"><UidChart :categories="categories" :series="series" legend="top" /></div>`,
  }),
}

export const Area: Story = {
  render: () => ({
    components: { UidChart },
    setup: () => ({
      categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
      series: [
        { key: 'open', label: 'Open', type: 'area', stack: 'flow', data: [8, 10, 12, 9, 11, 14, 12, 10] },
        { key: 'progress', label: 'In progress', type: 'area', stack: 'flow', data: [4, 5, 6, 7, 6, 5, 7, 8] },
        { key: 'done', label: 'Done', type: 'area', stack: 'flow', data: [2, 5, 9, 14, 18, 23, 27, 32] },
      ] satisfies ChartSeries[],
    }),
    template: `<div style="width:640px;max-width:100%"><UidChart :categories="categories" :series="series" /></div>`,
  }),
}

const manyDays = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 0, 1 + i))
  return d.toISOString().slice(0, 10)
})

export const ManyCategories: Story = {
  render: () => ({
    components: { UidChart },
    setup: () => {
      let s = 11
      const rnd = () => {
        s = (s * 9301 + 49297) % 233280
        return s / 233280
      }
      let v = 120
      return {
        categories: manyDays,
        series: [
          { key: 'value', label: 'Throughput', data: manyDays.map(() => (v = Math.max(0, v + (rnd() - 0.48) * 20))) },
        ] satisfies ChartSeries[],
        fmtCat: (c: string) => c.slice(5),
        fmt: (n: number) => n.toFixed(0),
      }
    },
    template: `<div style="box-sizing:border-box;width:100%;max-width:720px;resize:horizontal;overflow:hidden;min-width:220px;border:1px dashed var(--uid-border-subtle);padding:8px"><UidChart :categories="categories" :series="series" :format-category="fmtCat" :format-value="fmt" /></div>`,
  }),
}

export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  render: () => ({
    components: { UidChart },
    setup: () => ({
      categories: ['Q1', 'Q2', 'Q3', 'Q4'],
      series: [1, 2, 3, 4, 5, 6].map((k) => ({
        key: `s${k}`,
        label: `Series ${k}`,
        type: k <= 3 ? 'bar' : 'line',
        data: [10 + k * 3, 14 + k * 2, 12 + k * 4, 18 + k],
      })) satisfies ChartSeries[],
    }),
    template: `<div style="box-sizing:border-box;width:640px;max-width:100%;padding:16px;background:var(--uid-surface-raised)"><UidChart :categories="categories" :series="series" /></div>`,
  }),
}

export const Empty: Story = {
  render: () => ({
    components: { UidChart },
    setup: () => ({ series: [{ key: 'a', label: 'A', data: [null, null] }] satisfies ChartSeries[] }),
    template: `<div style="width:480px;max-width:100%"><UidChart :categories="['A', 'B']" :series="series" :height="160" /></div>`,
  }),
}
