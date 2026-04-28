import type { Meta, StoryObj } from '@storybook/vue3'
import { Users, DollarSign, Activity, ShoppingCart } from 'lucide-vue-next'
import UidStat from './UidStat.vue'

const meta: Meta<typeof UidStat> = {
  title: 'Data Display/Stat',
  component: UidStat,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info'] },
    variant: { control: 'select', options: ['card', 'ghost'] },
    loading: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidStat>

export const Default: Story = {
  render: () => ({
    components: { UidStat },
    setup: () => ({ Users }),
    template: `
      <UidStat
        title="Активные пользователи"
        :value="12483"
        :trend="12.5"
        :icon="Users"
        footer="за последние 7 дней"
        style="width:280px"
      />
    `,
  }),
}

export const Grid: Story = {
  render: () => ({
    components: { UidStat },
    setup: () => ({ Users, DollarSign, Activity, ShoppingCart }),
    template: `
      <div style="display:grid;grid-template-columns:repeat(2, minmax(220px,1fr));gap:16px;max-width:560px">
        <UidStat
          title="Пользователи"
          :value="12483"
          :trend="12.5"
          :icon="Users"
          tone="primary"
        />
        <UidStat
          title="Доход"
          :value="892450"
          :precision="0"
          prefix="$"
          :trend="3.2"
          :icon="DollarSign"
          tone="success"
        />
        <UidStat
          title="Активные сессии"
          :value="384"
          :trend="-2.1"
          :icon="Activity"
          tone="warning"
        />
        <UidStat
          title="Заказы"
          :value="1203"
          :trend="0"
          :icon="ShoppingCart"
          tone="info"
        />
      </div>
    `,
  }),
}

export const Ghost: Story = {
  render: () => ({
    components: { UidStat },
    setup: () => ({ Users }),
    template: `
      <div style="display:flex;gap:48px">
        <UidStat title="Пользователи" :value="12483" :trend="12.5" variant="ghost" :icon="Users" />
        <UidStat title="Удержание" :value="84.5" suffix="%" :precision="1" :trend="2" variant="ghost" />
      </div>
    `,
  }),
}

export const NoIcon: Story = {
  render: () => ({
    components: { UidStat },
    template: `
      <UidStat
        title="Конверсия"
        :value="4.7"
        suffix="%"
        :precision="1"
        :trend="0.6"
        footer="Хорошие результаты"
        style="width:240px"
      />
    `,
  }),
}

export const Loading: Story = {
  render: () => ({
    components: { UidStat },
    setup: () => ({ Users }),
    template: `
      <UidStat
        title="Загружается..."
        :value="0"
        loading
        :icon="Users"
        style="width:280px"
      />
    `,
  }),
}

export const CustomFormatter: Story = {
  render: () => ({
    components: { UidStat },
    setup: () => ({
      formatter: (v: number | string) => `${(Number(v) / 1000).toFixed(1)}k`,
    }),
    template: `
      <UidStat
        title="Просмотры"
        :value="124830"
        :formatter="formatter"
        :trend="8.4"
        style="width:240px"
      />
    `,
  }),
}
