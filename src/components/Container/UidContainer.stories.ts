import type { Meta, StoryObj } from '@storybook/vue3'
import UidContainer from './UidContainer.vue'

const meta: Meta<typeof UidContainer> = {
  title: 'Layout/Container',
  component: UidContainer,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'] },
    padding: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidContainer>

export const Default: Story = {
  args: { size: 'lg', padding: true },
  render: (args: Record<string, unknown>) => ({
    components: { UidContainer },
    setup: () => ({ args }),
    template: `
      <div style="background:var(--uid-color-surface-raised);padding:8px">
        <UidContainer v-bind="args">
          <div style="background:var(--uid-color-surface);border:1px dashed var(--uid-color-border);padding:16px;text-align:center;font-size:13px">
            Содержимое контейнера (size={{ args.size }})
          </div>
        </UidContainer>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidContainer },
    template: `
      <div style="background:var(--uid-color-surface-raised);display:flex;flex-direction:column;gap:8px;padding:8px">
        <UidContainer v-for="size in ['sm','md','lg','xl']" :key="size" :size="size">
          <div style="background:var(--uid-color-surface);border:1px dashed var(--uid-color-border);padding:8px;text-align:center;font-size:12px">
            {{ size }}
          </div>
        </UidContainer>
      </div>
    `,
  }),
}
