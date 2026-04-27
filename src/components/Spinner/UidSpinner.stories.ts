import type { Meta, StoryObj } from '@storybook/vue3'
import UidSpinner from './UidSpinner.vue'

const meta: Meta<typeof UidSpinner> = {
  title: 'Feedback/Spinner',
  component: UidSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta

type Story = StoryObj<typeof UidSpinner>

export const Default: Story = {
  args: { size: 'md' },
}

export const Sizes: Story = {
  render: () => ({
    components: { UidSpinner },
    template: `
      <div style="display:flex;align-items:center;gap:24px">
        <UidSpinner size="sm" />
        <UidSpinner size="md" />
        <UidSpinner size="lg" />
      </div>
    `,
  }),
}

export const Colors: Story = {
  render: () => ({
    components: { UidSpinner },
    template: `
      <div style="display:flex;align-items:center;gap:24px">
        <UidSpinner style="color:var(--uid-accent)" />
        <UidSpinner style="color:var(--uid-success)" />
        <UidSpinner style="color:var(--uid-warning)" />
        <UidSpinner style="color:var(--uid-danger)" />
        <span style="background:var(--uid-accent);padding:8px;border-radius:6px;display:inline-flex">
          <UidSpinner style="color:white" />
        </span>
      </div>
    `,
  }),
}

export const InlineWithText: Story = {
  render: () => ({
    components: { UidSpinner },
    template: `
      <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--uid-text-secondary)">
        <UidSpinner size="sm" style="color:var(--uid-accent)" />
        Загрузка данных...
      </div>
    `,
  }),
}
