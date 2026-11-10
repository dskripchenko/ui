import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidEmojiPicker from './UidEmojiPicker.vue'

const meta: Meta<typeof UidEmojiPicker> = {
  title: 'Components/EmojiPicker',
  component: UidEmojiPicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidEmojiPicker>

export const Default: Story = {
  render: () => ({
    components: { UidEmojiPicker },
    setup: () => ({ picked: ref(''), tone: ref(0) }),
    template: `
      <div>
        <UidEmojiPicker v-model:skin-tone="tone" :recent="['👍', '🎉', '✅', '🔥']" @select="(e) => (picked = e)" />
        <p>Picked: {{ picked }}</p>
      </div>
    `,
  }),
}
