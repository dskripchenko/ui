import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidDashboardGrid from './UidDashboardGrid.vue'
import type { DashboardGridItem } from './dashboardGridMath.js'

const meta: Meta<typeof UidDashboardGrid> = {
  title: 'Layout/DashboardGrid',
  component: UidDashboardGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Сетка дашборда: элементы по столбцам и строкам, перетаскивание за ручку, изменение размера за угол, клавиатура (стрелки, Shift+стрелки), вертикальное уплотнение и стопка в один столбец на узком контейнере.',
      },
    },
  },
  argTypes: {
    columns: { control: 'number' },
    rowHeight: { control: 'number' },
    gap: { control: 'number' },
    stackBelow: { control: 'number' },
    editable: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidDashboardGrid>

type Card = DashboardGridItem & { title: string; value: string }

const cards: Card[] = [
  { id: 'revenue', title: 'Revenue', value: '$48.2k', x: 0, y: 0, w: 4, h: 2, minW: 2 },
  { id: 'orders', title: 'Orders', value: '1,284', x: 4, y: 0, w: 4, h: 2, minW: 2 },
  { id: 'conversion', title: 'Conversion', value: '3.9%', x: 8, y: 0, w: 4, h: 2, minW: 2 },
  { id: 'traffic', title: 'Traffic', value: '82k visits', x: 0, y: 2, w: 8, h: 3, minH: 2 },
  { id: 'top', title: 'Top products', value: '12 items', x: 8, y: 2, w: 4, h: 3 },
  { id: 'notes', title: 'Notes', value: '3 open', x: 0, y: 5, w: 12, h: 1, maxH: 2 },
]

const cardStyle = [
  'box-sizing:border-box',
  'height:100%',
  'display:flex',
  'flex-direction:column',
  'gap:8px',
  'padding:12px 16px',
  'border:1px solid var(--uid-border-default)',
  'border-radius:var(--uid-radius-lg)',
  'background:var(--uid-surface-raised)',
  'color:var(--uid-text-primary)',
].join(';')

const handleStyle = 'border:0;background:none;color:var(--uid-text-tertiary);font-size:16px;line-height:1;padding:2px 4px;border-radius:var(--uid-radius-sm)'

export const Dashboard: Story = {
  args: { columns: 12, rowHeight: 80, gap: 16, stackBelow: 640, editable: true },
  render: (args) => ({
    components: { UidDashboardGrid },
    setup: () => ({ args, items: ref<Card[]>(cards.map(c => ({ ...c }))), cardStyle, handleStyle }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <label style="display:flex;gap:8px;align-items:center;color:var(--uid-text-primary)">
          <input v-model="args.editable" type="checkbox"> Edit layout
        </label>
        <UidDashboardGrid v-bind="args" v-model:items="items" label="Store overview">
          <template #item="{ item, editing, handle }">
            <article :style="cardStyle">
              <header style="display:flex;align-items:center;gap:8px">
                <button v-if="editing" type="button" v-bind="handle" :style="handleStyle">⠿</button>
                <strong style="font-size:14px">{{ item.title }}</strong>
              </header>
              <div style="font-size:24px;font-weight:600">{{ item.value }}</div>
            </article>
          </template>
        </UidDashboardGrid>
      </div>`,
  }),
}

export const Static: Story = {
  render: () => ({
    components: { UidDashboardGrid },
    setup: () => ({ items: cards, cardStyle }),
    template: `
      <UidDashboardGrid :items="items" :row-height="60" :gap="12">
        <template #item="{ item }">
          <article :style="cardStyle"><strong>{{ item.title }}</strong><span>{{ item.value }}</span></article>
        </template>
      </UidDashboardGrid>`,
  }),
}

export const Narrow: Story = {
  render: () => ({
    components: { UidDashboardGrid },
    setup: () => ({ items: cards, cardStyle }),
    template: `
      <div style="box-sizing:border-box;width:100%;max-width:900px;min-width:240px;resize:horizontal;overflow:hidden;border:1px dashed var(--uid-border-subtle);padding:8px">
        <UidDashboardGrid :items="items" editable :row-height="60">
          <template #item="{ item, handle }">
            <article :style="cardStyle">
              <header style="display:flex;gap:8px"><span v-bind="handle">⠿</span><strong>{{ item.title }}</strong></header>
              <span>{{ item.value }}</span>
            </article>
          </template>
        </UidDashboardGrid>
      </div>`,
  }),
}

export const DarkTheme: Story = {
  ...Dashboard,
  globals: { theme: 'dark' },
}
