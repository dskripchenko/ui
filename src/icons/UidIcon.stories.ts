import type { Meta, StoryObj } from '@storybook/vue3'
import { Home, Settings, Search, Bell, User, Star, Heart, ChevronRight } from 'lucide-vue-next'
import UidIcon from './UidIcon.vue'

const meta: Meta<typeof UidIcon> = {
  title: 'Foundation/Icon',
  component: UidIcon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'number' },
    strokeWidth: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidIcon>

export const Default: Story = {
  args: { icon: Home, size: 20 },
}

export const Playground: Story = {
  args: { icon: Settings, size: 20, strokeWidth: 2 },
  render: (args: Record<string, unknown>) => ({
    components: { UidIcon },
    setup: () => ({ args }),
    template: `<UidIcon v-bind="args" />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidIcon },
    setup: () => ({ icons: [Home, Search, Bell, User] }),
    template: `
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
        <div v-for="(icon, i) in icons" :key="i" style="display:flex;align-items:center;gap:12px">
          <UidIcon :icon="icon" :size="16" />
          <UidIcon :icon="icon" :size="20" />
          <UidIcon :icon="icon" :size="24" />
        </div>
      </div>
    `,
  }),
}

export const Catalog: Story = {
  render: () => ({
    components: { UidIcon },
    setup: () => ({
      icons: [
        { name: 'Home', component: Home },
        { name: 'Settings', component: Settings },
        { name: 'Search', component: Search },
        { name: 'Bell', component: Bell },
        { name: 'User', component: User },
        { name: 'Star', component: Star },
        { name: 'Heart', component: Heart },
        { name: 'ChevronRight', component: ChevronRight },
      ],
    }),
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:24px">
        <div
          v-for="item in icons"
          :key="item.name"
          style="display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;color:var(--uid-text-secondary)"
        >
          <UidIcon :icon="item.component" :size="24" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    `,
  }),
}
