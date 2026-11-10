import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidObjectCard from './UidObjectCard.vue'
import UidButton from '../Button/UidButton.vue'
import UidAlert from '../Alert/UidAlert.vue'

const meta: Meta<typeof UidObjectCard> = {
  title: 'Components/ObjectCard',
  component: UidObjectCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidObjectCard>

const base = { code: 'KB-12', title: 'Refund policy needs the new terms', status: { label: 'Draft', tone: 'info' as const }, href: '#', hrefLabel: 'Open' }

export const Default: Story = {
  args: base,
  render: (args) => ({
    components: { UidObjectCard },
    setup: () => ({ args }),
    template: '<UidObjectCard v-bind="args"><template #meta><span>Anna Lee</span><span>Updated 2 days ago</span></template></UidObjectCard>',
  }),
}

export const WithActions: Story = {
  render: () => ({
    components: { UidObjectCard, UidButton },
    setup: () => {
      const busy = ref(false)
      function move(): void {
        busy.value = true
        setTimeout(() => { busy.value = false }, 1500)
      }
      return { base, busy, move }
    },
    template: `<UidObjectCard v-bind="base" status-action status-action-label="Change state" :busy="busy" busy-label="Sending to review…" @status="move">
      <template #meta><span>Anna Lee</span></template>
      <template #actions>
        <UidButton variant="secondary" size="sm">Status</UidButton>
        <UidButton variant="secondary" size="sm">Assign</UidButton>
        <UidButton variant="secondary" size="sm">Comment</UidButton>
      </template>
    </UidObjectCard>`,
  }),
}

export const Refused: Story = {
  render: () => ({
    components: { UidObjectCard, UidButton, UidAlert },
    setup: () => ({ base }),
    template: `<UidObjectCard v-bind="base" invalid>
      <template #notice><UidAlert variant="danger" title="Could not publish.">The article waits for KB-9.</UidAlert></template>
    </UidObjectCard>`,
  }),
}
