import type { Meta, StoryObj } from '@storybook/vue3'
import { ref, computed } from 'vue'
import UidTable from './UidTable.vue'
import type { UidTableColumn } from './UidTable.vue'

const meta: Meta<typeof UidTable> = {
  title: 'Data Display/Table',
  component: UidTable,
  tags: ['autodocs'],
  argTypes: {
    striped: { control: 'boolean' },
    bordered: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidTable>

const columns: UidTableColumn[] = [
  { key: 'name', label: 'Имя', sortable: true },
  { key: 'role', label: 'Роль' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Статус', align: 'center', width: '100px' },
]

const rawData = [
  { name: 'Иван Петров', role: 'Разработчик', email: 'ivan@example.com', status: 'Активен' },
  { name: 'Мария Иванова', role: 'Дизайнер', email: 'maria@example.com', status: 'Активна' },
  { name: 'Дмитрий Кузнецов', role: 'Менеджер', email: 'dmitry@example.com', status: 'Отпуск' },
  { name: 'Анна Сидорова', role: 'QA', email: 'anna@example.com', status: 'Активна' },
]

export const Default: Story = {
  render: () => ({
    components: { UidTable },
    setup: () => {
      const sortKey = ref('')
      const sortDirection = ref<'asc' | 'desc'>('asc')
      const data = computed(() => {
        if (!sortKey.value) return rawData
        return [...rawData].sort((a, b) => {
          const av = String(a[sortKey.value as keyof typeof a])
          const bv = String(b[sortKey.value as keyof typeof b])
          return sortDirection.value === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        })
      })
      return { columns, data, sortKey, sortDirection }
    },
    template: `
      <UidTable
        :columns="columns"
        :data="data"
        v-model:sortKey="sortKey"
        v-model:sortDirection="sortDirection"
        :bordered="true"
      />
    `,
  }),
}

export const Striped: Story = {
  render: () => ({
    components: { UidTable },
    setup: () => ({ columns, data: rawData }),
    template: `<UidTable :columns="columns" :data="data" :striped="true" :bordered="true" />`,
  }),
}

export const Loading: Story = {
  render: () => ({
    components: { UidTable },
    setup: () => ({ columns, data: [] }),
    template: `<UidTable :columns="columns" :data="data" :loading="true" :bordered="true" />`,
  }),
}

export const Empty: Story = {
  render: () => ({
    components: { UidTable },
    setup: () => ({ columns, data: [] }),
    template: `<UidTable :columns="columns" :data="data" :bordered="true" empty-text="Записи не найдены" />`,
  }),
}
