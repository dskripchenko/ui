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

export const FixedColumns: Story = {
  render: () => ({
    components: { UidTable },
    setup: () => {
      const wideColumns: UidTableColumn[] = [
        { key: 'id', label: 'ID', width: '64px', fixed: 'left' },
        { key: 'name', label: 'Имя', width: '180px', fixed: 'left' },
        { key: 'role', label: 'Роль', width: '200px' },
        { key: 'email', label: 'Email', width: '260px' },
        { key: 'city', label: 'Город', width: '200px' },
        { key: 'phone', label: 'Телефон', width: '200px' },
        { key: 'status', label: 'Статус', width: '120px', align: 'center', fixed: 'right' },
      ]
      const rows = rawData.map((r, i) => ({
        ...r,
        id: i + 1,
        city: 'Москва',
        phone: `+7 900 000-00-0${i}`,
      }))
      const selection = ref(new Set<string | number>([2]))
      return { wideColumns, rows, selection }
    },
    template: `
      <div style="max-width: 640px">
        <UidTable
          :columns="wideColumns"
          :data="rows"
          striped
          bordered
          selectable
          v-model:selection="selection"
        />
      </div>
    `,
  }),
}

/** `selectionFixed` pins the checkbox column alone, without any `fixed` data columns. */
export const SelectionFixed: Story = {
  render: () => ({
    components: { UidTable },
    setup: () => {
      const wideColumns: UidTableColumn[] = [
        { key: 'name', label: 'Имя', width: '180px' },
        { key: 'role', label: 'Роль', width: '200px' },
        { key: 'email', label: 'Email', width: '260px' },
        { key: 'city', label: 'Город', width: '200px' },
        { key: 'status', label: 'Статус', width: '120px', align: 'center' },
      ]
      const rows = rawData.map((r, i) => ({ ...r, id: i + 1, city: 'Москва' }))
      const selection = ref(new Set<string | number>([1]))
      return { wideColumns, rows, selection }
    },
    template: `
      <div style="max-width: 520px">
        <UidTable
          :columns="wideColumns"
          :data="rows"
          bordered
          selectable
          selection-fixed
          v-model:selection="selection"
        />
      </div>
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

// The host decides what expands: here a click on a row toggles it.
export const ExpandableRows: Story = {
  render: () => ({
    components: { UidTable },
    setup: () => {
      const data = rawData.map((row, i) => ({ id: i + 1, ...row }))
      const expanded = ref(new Set<string | number>([1]))
      function onRowClick(row: Record<string, unknown>): void {
        const id = row.id as number
        const next = new Set(expanded.value)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        expanded.value = next
      }
      return { columns, data, expanded, onRowClick }
    },
    template: `
      <UidTable
        :columns="columns"
        :data="data"
        v-model:expanded="expanded"
        :bordered="true"
        @row-click="onRowClick"
      >
        <template #expanded="{ row }">
          <div style="display: grid; gap: 4px;">
            <strong>{{ row.name }}</strong>
            <span>{{ row.role }} · {{ row.email }}</span>
          </div>
        </template>
      </UidTable>
    `,
  }),
}

// A totals row: one footer-<column key> slot per column that has something to show.
export const Footer: Story = {
  render: () => ({
    components: { UidTable },
    setup: () => {
      const active = rawData.filter((row) => row.status.startsWith('Актив')).length
      return { columns, data: rawData, active }
    },
    template: `
      <UidTable :columns="columns" :data="data" :bordered="true">
        <template #footer-name>Итого: {{ data.length }}</template>
        <template #footer-status>{{ active }}</template>
      </UidTable>
    `,
  }),
}

export const Grouped: Story = {
  render: () => ({
    components: { UidTable },
    setup: () => ({
      columns: [
        { key: 'name', label: 'Task' },
        { key: 'status', label: 'Status' },
      ],
      rows: [
        { id: 1, name: 'Retry webhooks', status: 'In progress' },
        { id: 2, name: 'Sign payloads', status: 'In progress' },
        { id: 3, name: 'Export to CSV', status: 'To do' },
      ],
    }),
    template: `
      <UidTable :columns="columns" :data="rows" group-by="status" bordered>
        <template #group="{ row }">{{ row.value }} · {{ row.count }}</template>
      </UidTable>
    `,
  }),
}
