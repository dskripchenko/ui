import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidTransfer from './UidTransfer.vue'
import type { TransferKey } from './UidTransfer.vue'

const meta: Meta<typeof UidTransfer> = {
  title: 'Inputs/Transfer',
  component: UidTransfer,
  tags: ['autodocs'],
  argTypes: {
    searchable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidTransfer>

const teamMembers = [
  { key: 'alice', label: 'Alice' },
  { key: 'bob', label: 'Bob' },
  { key: 'charlie', label: 'Charlie' },
  { key: 'diana', label: 'Diana' },
  { key: 'eve', label: 'Eve' },
  { key: 'frank', label: 'Frank' },
  { key: 'grace', label: 'Grace' },
  { key: 'henry', label: 'Henry' },
]

export const Default: Story = {
  render: () => ({
    components: { UidTransfer },
    setup: () => ({ items: teamMembers, value: ref<TransferKey[]>(['alice', 'charlie']) }),
    template: `<UidTransfer :items="items" v-model="value" style="max-width:560px" />`,
  }),
}

export const Searchable: Story = {
  render: () => ({
    components: { UidTransfer },
    setup: () => ({ items: teamMembers, value: ref<TransferKey[]>([]) }),
    template: `<UidTransfer :items="items" v-model="value" searchable style="max-width:560px" />`,
  }),
}

export const CustomTitles: Story = {
  render: () => ({
    components: { UidTransfer },
    setup: () => ({
      items: [
        { key: 'r', label: 'Просмотр' },
        { key: 'w', label: 'Запись' },
        { key: 'd', label: 'Удаление', disabled: true },
        { key: 'a', label: 'Администрирование' },
      ],
      value: ref<TransferKey[]>(['r']),
    }),
    template: `
      <UidTransfer
        :items="items"
        v-model="value"
        :titles="['Все права', 'Назначены']"
        style="max-width:520px"
      />
    `,
  }),
}

export const ManyItems: Story = {
  render: () => ({
    components: { UidTransfer },
    setup: () => {
      const items = Array.from({ length: 30 }, (_, i) => ({
        key: `item-${i}`,
        label: `Опция #${i + 1}`,
      }))
      return { items, value: ref<TransferKey[]>(['item-3', 'item-7', 'item-12']) }
    },
    template: `
      <UidTransfer
        :items="items"
        v-model="value"
        searchable
        style="max-width:600px"
      />
    `,
  }),
}
