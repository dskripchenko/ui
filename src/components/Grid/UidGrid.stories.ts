import type { Meta, StoryObj } from '@storybook/vue3'
import UidGrid from './UidGrid.vue'

const meta: Meta<typeof UidGrid> = {
  title: 'Layout/Grid',
  component: UidGrid,
  tags: ['autodocs'],
  argTypes: {
    cols: { control: 'number' },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
  },
}
export default meta

type Story = StoryObj<typeof UidGrid>

const Cell = {
  template: '<div style="padding:16px;background:var(--uid-color-surface-raised);border:1px solid var(--uid-color-border);border-radius:4px;font-size:13px;text-align:center"><slot /></div>',
  slots: ['default'],
}

export const ThreeColumns: Story = {
  render: () => ({
    components: { UidGrid, Cell },
    template: `
      <UidGrid :cols="3" gap="var(--uid-space-4)">
        <Cell v-for="i in 6" :key="i">Ячейка {{ i }}</Cell>
      </UidGrid>
    `,
  }),
}

export const TwoColumns: Story = {
  render: () => ({
    components: { UidGrid, Cell },
    template: `
      <UidGrid :cols="2" gap="var(--uid-space-4)">
        <Cell>Основной контент</Cell>
        <Cell>Боковая панель</Cell>
        <Cell>Ещё блок</Cell>
        <Cell>Ещё блок</Cell>
      </UidGrid>
    `,
  }),
}

export const CustomColumns: Story = {
  render: () => ({
    components: { UidGrid, Cell },
    template: `
      <UidGrid cols="250px 1fr" gap="var(--uid-space-4)">
        <Cell>Сайдбар (250px)</Cell>
        <Cell>Основной контент (1fr)</Cell>
      </UidGrid>
    `,
  }),
}
