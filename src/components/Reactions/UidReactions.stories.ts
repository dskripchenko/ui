import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidReactions from './UidReactions.vue'

const meta: Meta<typeof UidReactions> = {
  title: 'Components/Reactions',
  component: UidReactions,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidReactions>

export const Default: Story = {
  render: () => ({
    components: { UidReactions },
    setup: () => {
      const reactions = ref([
        { emoji: '👍', count: 3, mine: true, who: 'you, Bob and Ilya' },
        { emoji: '🎉', count: 1, mine: false, who: 'Maria' },
        { emoji: '✅', count: 2, mine: false, who: 'Bob and Maria' },
      ])
      function toggle(emoji: string): void {
        reactions.value = reactions.value.map((r) => (r.emoji === emoji ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) } : r)).filter((r) => r.count > 0)
      }
      return { reactions, toggle }
    },
    template: '<UidReactions :reactions="reactions" @toggle="toggle" />',
  }),
}
