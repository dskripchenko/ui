import type { Meta, StoryObj } from '@storybook/vue3'
import UidBadge from './UidBadge.vue'

const meta: Meta<typeof UidBadge> = {
  title: 'Feedback/Badge',
  component: UidBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'info', 'success', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'md'] },
    dot: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidBadge>

export const Default: Story = {
  args: { variant: 'default' },
  render: (args: Record<string, unknown>) => ({
    components: { UidBadge },
    setup: () => ({ args }),
    template: `<UidBadge v-bind="args">Новый</UidBadge>`,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UidBadge },
    template: `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <UidBadge variant="default">Default</UidBadge>
        <UidBadge variant="info">Info</UidBadge>
        <UidBadge variant="success">Success</UidBadge>
        <UidBadge variant="warning">Warning</UidBadge>
        <UidBadge variant="danger">Danger</UidBadge>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidBadge },
    template: `
      <div style="display:flex;align-items:center;gap:8px">
        <UidBadge size="sm" variant="info">Sm</UidBadge>
        <UidBadge size="md" variant="info">Md</UidBadge>
      </div>
    `,
  }),
}

export const Dots: Story = {
  render: () => ({
    components: { UidBadge },
    template: `
      <div style="display:flex;align-items:center;gap:12px">
        <UidBadge dot variant="default" />
        <UidBadge dot variant="info" />
        <UidBadge dot variant="success" />
        <UidBadge dot variant="warning" />
        <UidBadge dot variant="danger" />
      </div>
    `,
  }),
}

export const WithNumbers: Story = {
  render: () => ({
    components: { UidBadge },
    template: `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <UidBadge variant="danger">3</UidBadge>
        <UidBadge variant="danger">12</UidBadge>
        <UidBadge variant="danger">99+</UidBadge>
        <UidBadge variant="info">Новое</UidBadge>
        <UidBadge variant="success">Активен</UidBadge>
        <UidBadge variant="warning">Beta</UidBadge>
      </div>
    `,
  }),
}
