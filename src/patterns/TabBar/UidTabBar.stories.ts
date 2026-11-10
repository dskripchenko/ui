import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { Hash, House, MessageSquare, Search, User } from '../../icons/index.js'
import UidTabBar from './UidTabBar.vue'
import UidTabBarItem from './UidTabBarItem.vue'

const meta: Meta<typeof UidTabBar> = {
  title: 'Patterns/TabBar',
  component: UidTabBar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidTabBar>

export const Default: Story = {
  render: (args) => ({
    components: { UidTabBar, UidTabBarItem, Hash, House, MessageSquare, Search, User },
    setup: () => ({ args, active: ref('home') }),
    template: `
      <div style="width: 390px; border: 1px solid var(--uid-color-border);">
        <UidTabBar v-bind="args">
          <UidTabBarItem as="button" :active="active === 'home'" :badge="3" @click="active = 'home'">
            <template #icon><House :size="20" /></template>Home
          </UidTabBarItem>
          <UidTabBarItem as="button" :active="active === 'channels'" @click="active = 'channels'">
            <template #icon><Hash :size="20" /></template>Channels
          </UidTabBarItem>
          <UidTabBarItem as="button" :active="active === 'direct'" :badge="1" @click="active = 'direct'">
            <template #icon><MessageSquare :size="20" /></template>Direct
          </UidTabBarItem>
          <UidTabBarItem as="button" :active="active === 'search'" @click="active = 'search'">
            <template #icon><Search :size="20" /></template>Search
          </UidTabBarItem>
          <UidTabBarItem as="button" :active="active === 'profile'" dot @click="active = 'profile'">
            <template #icon><User :size="20" /></template>Profile
          </UidTabBarItem>
        </UidTabBar>
      </div>
    `,
  }),
}
