import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidButton from '../Button/UidButton.vue'
import UidAiModelTag from './UidAiModelTag.vue'
import UidAiSuggestionCard from './UidAiSuggestionCard.vue'

const meta: Meta<typeof UidAiSuggestionCard> = {
  title: 'Components/AiSuggestionCard',
  component: UidAiSuggestionCard,
  tags: ['autodocs'],
  argTypes: { state: { control: 'inline-radio', options: ['pending', 'result', 'error'] } },
}

export default meta
type Story = StoryObj<typeof UidAiSuggestionCard>

const text = '- **Decided:** retry cancellations like payments, with backoff.\n- **Open:** the gateway timeout — waiting for the vendor.\n- **Next:** review of the merge request.'

export const Result: Story = {
  args: { title: 'Thread summary', text, meta: '9 messages · 10:24–11:52', model: 'qwen2.5:7b' },
  render: (args) => ({
    components: { UidAiSuggestionCard, UidButton },
    setup: () => {
      const body = ref(args.text ?? '')
      const editing = ref(false)
      return { args, body, editing }
    },
    template: `<UidAiSuggestionCard v-bind="args" v-model:text="body" v-model:editing="editing" :original="args.text" style="max-width: 360px">
      <template #actions>
        <UidButton size="sm">Publish</UidButton>
        <UidButton v-if="!editing" size="sm" variant="secondary" @click="editing = true">Edit</UidButton>
        <UidButton v-if="!editing" size="sm" variant="secondary">Copy</UidButton>
      </template>
    </UidAiSuggestionCard>`,
  }),
}

export const Pending: Story = {
  args: { title: 'Thread summary', state: 'pending', pendingText: 'The model is reading 9 messages · up to a minute', model: 'qwen2.5:7b' },
}

export const Failed: Story = {
  args: { title: 'Thread summary', state: 'error', retryable: true, error: { title: 'The model did not answer.', message: 'It has been silent for over a minute. Try again.', code: 'ai_unavailable', kind: 'failed' } },
}

export const Limit: Story = {
  args: { title: 'Thread summary', state: 'error', error: { title: 'The daily limit is used up.', message: 'Try again tomorrow.', code: 'ai_quota', kind: 'limit' } },
}

export const ModelTag: StoryObj<typeof UidAiModelTag> = {
  render: () => ({ components: { UidAiModelTag }, template: '<UidAiModelTag model="qwen2.5:7b" label="summary" />' }),
}
