import type { Meta, StoryObj } from '@storybook/vue3'
import UidAvatar from '../../components/Avatar/UidAvatar.vue'
import UidTopBar from './UidTopBar.vue'

const meta: Meta<typeof UidTopBar> = {
  title: 'Patterns/TopBar',
  component: UidTopBar,
  tags: ['autodocs'],
  args: { searchLabel: 'Search everything…', notifications: 7, theme: 'light', locale: 'en' },
  render: (args) => ({
    components: { UidTopBar, UidAvatar },
    setup: () => ({ args }),
    template: '<UidTopBar v-bind="args"><template #crumbs>Docs › KB-12</template><template #user><UidAvatar name="Ada Lovelace" size="sm" /></template></UidTopBar>',
  }),
}

export default meta
type Story = StoryObj<typeof UidTopBar>

export const Default: Story = {}

export const ManyNotifications: Story = { args: { notifications: 140 } }

export const Minimal: Story = { args: { notifications: null, theme: null, locale: null } }
