import type { Meta, StoryObj } from '@storybook/vue3'
import UidDivider from './UidDivider.vue'

const meta: Meta<typeof UidDivider> = {
  title: 'Data Display/Divider',
  component: UidDivider,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    label: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof UidDivider>

export const Horizontal: Story = {
  render: () => ({
    components: { UidDivider },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:400px">
        <p style="margin:0">Содержимое выше</p>
        <UidDivider />
        <p style="margin:0">Содержимое ниже</p>
      </div>
    `,
  }),
}

export const WithLabel: Story = {
  render: () => ({
    components: { UidDivider },
    template: `
      <div style="width:400px">
        <UidDivider label="или" />
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { UidDivider },
    template: `
      <div style="display:flex;align-items:center;gap:16px;height:40px">
        <span>Слева</span>
        <UidDivider orientation="vertical" />
        <span>Справа</span>
      </div>
    `,
  }),
}
