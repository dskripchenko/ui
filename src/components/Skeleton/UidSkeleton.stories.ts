import type { Meta, StoryObj } from '@storybook/vue3'
import UidSkeleton from './UidSkeleton.vue'

const meta: Meta<typeof UidSkeleton> = {
  title: 'Feedback/Skeleton',
  component: UidSkeleton,
  tags: ['autodocs'],
  argTypes: {
    rounded: { control: 'select', options: [false, true, 'full'] },
  },
}
export default meta

type Story = StoryObj<typeof UidSkeleton>

export const Default: Story = {
  args: { width: '200px', height: '16px' },
}

export const TextLines: Story = {
  render: () => ({
    components: { UidSkeleton },
    template: `
      <div style="width:320px;display:flex;flex-direction:column;gap:16px">
        <UidSkeleton :lines="1" height="20px" />
        <UidSkeleton :lines="3" height="14px" />
        <UidSkeleton :lines="5" height="14px" />
      </div>
    `,
  }),
}

export const CardLoader: Story = {
  render: () => ({
    components: { UidSkeleton },
    template: `
      <div style="width:320px;padding:16px;border:1px solid var(--uid-border-subtle);border-radius:8px;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;align-items:center;gap:12px">
          <UidSkeleton width="40px" height="40px" rounded="full" />
          <div style="flex:1;display:flex;flex-direction:column;gap:6px">
            <UidSkeleton width="60%" height="14px" />
            <UidSkeleton width="40%" height="12px" />
          </div>
        </div>
        <UidSkeleton width="100%" height="120px" rounded />
        <UidSkeleton :lines="3" height="13px" />
      </div>
    `,
  }),
}

export const Shapes: Story = {
  render: () => ({
    components: { UidSkeleton },
    template: `
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <UidSkeleton width="80px" height="16px" />
        <UidSkeleton width="80px" height="16px" :rounded="true" />
        <UidSkeleton width="48px" height="48px" rounded="full" />
        <UidSkeleton width="100px" height="32px" rounded="full" />
      </div>
    `,
  }),
}
