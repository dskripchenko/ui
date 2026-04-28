import type { Meta, StoryObj } from '@storybook/vue3'
import { Bell, Mail, MessageCircle, ShoppingCart } from 'lucide-vue-next'
import UidNotificationBadge from './UidNotificationBadge.vue'
import UidIcon from '../../icons/UidIcon.vue'
import UidButton from '../Button/UidButton.vue'
import UidAvatar from '../Avatar/UidAvatar.vue'

const meta: Meta<typeof UidNotificationBadge> = {
  title: 'Data Display/NotificationBadge',
  component: UidNotificationBadge,
  tags: ['autodocs'],
  argTypes: {
    placement: { control: 'select', options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] },
    tone: { control: 'select', options: ['danger', 'primary', 'success', 'warning', 'info'] },
    dot: { control: 'boolean' },
    showZero: { control: 'boolean' },
    count: { control: 'number' },
    max: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidNotificationBadge>

export const Default: Story = {
  render: () => ({
    components: { UidNotificationBadge, UidIcon, UidButton },
    setup: () => ({ Bell }),
    template: `
      <div style="display:flex;gap:32px;align-items:center;padding:16px">
        <UidNotificationBadge :count="5">
          <UidButton variant="ghost"><UidIcon :icon="Bell" :size="20" /></UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge :count="42">
          <UidButton variant="ghost"><UidIcon :icon="Bell" :size="20" /></UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge :count="120">
          <UidButton variant="ghost"><UidIcon :icon="Bell" :size="20" /></UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge :count="999" :max="99">
          <UidButton variant="ghost"><UidIcon :icon="Bell" :size="20" /></UidButton>
        </UidNotificationBadge>
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { UidNotificationBadge, UidIcon, UidButton },
    setup: () => ({ Bell, Mail, MessageCircle, ShoppingCart }),
    template: `
      <div style="display:flex;gap:32px;align-items:center;padding:16px">
        <UidNotificationBadge :count="3" tone="danger">
          <UidButton variant="ghost"><UidIcon :icon="Bell" :size="20" /></UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge :count="3" tone="primary">
          <UidButton variant="ghost"><UidIcon :icon="Mail" :size="20" /></UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge :count="3" tone="success">
          <UidButton variant="ghost"><UidIcon :icon="MessageCircle" :size="20" /></UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge :count="3" tone="warning">
          <UidButton variant="ghost"><UidIcon :icon="ShoppingCart" :size="20" /></UidButton>
        </UidNotificationBadge>
      </div>
    `,
  }),
}

export const Dot: Story = {
  render: () => ({
    components: { UidNotificationBadge, UidIcon, UidButton, UidAvatar },
    setup: () => ({ Bell }),
    template: `
      <div style="display:flex;gap:32px;align-items:center;padding:16px">
        <UidNotificationBadge dot :count="1">
          <UidButton variant="ghost"><UidIcon :icon="Bell" :size="20" /></UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge dot :count="1" tone="success">
          <UidAvatar name="Alice" />
        </UidNotificationBadge>
      </div>
    `,
  }),
}

export const Placements: Story = {
  render: () => ({
    components: { UidNotificationBadge, UidIcon, UidButton },
    setup: () => ({ Bell }),
    template: `
      <div style="display:grid;grid-template-columns:repeat(2,auto);gap:24px;padding:16px;width:fit-content">
        <UidNotificationBadge :count="5" placement="top-left">
          <UidButton variant="outline" size="lg">TopLeft</UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge :count="5" placement="top-right">
          <UidButton variant="outline" size="lg">TopRight</UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge :count="5" placement="bottom-left">
          <UidButton variant="outline" size="lg">BottomLeft</UidButton>
        </UidNotificationBadge>
        <UidNotificationBadge :count="5" placement="bottom-right">
          <UidButton variant="outline" size="lg">BottomRight</UidButton>
        </UidNotificationBadge>
      </div>
    `,
  }),
}
