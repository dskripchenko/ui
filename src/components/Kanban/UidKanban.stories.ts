import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UidKanban from './UidKanban.vue'

const meta = {
  title: 'Data/Kanban',
  component: UidKanban,
  tags: ['autodocs'],
  argTypes: {
    editable: { control: 'boolean' },
    locked: { control: 'boolean' },
    lockable: { control: 'boolean' },
  },
} satisfies Meta<typeof UidKanban>

export default meta
type Story = StoryObj<typeof meta>

const SOURCE = `# Release 3.0
lanes: Payments, Refunds
tags: payments=info, refunds=warning

## Backlog
- Instant payments #payments {lane: Payments, who: Anna, due: 2026-11-15}
- Partial refunds over the API #refunds !high {lane: Refunds}
  Merchants ask to refund part of an amount without a call.

## In progress {wip: 3}
- [ACME-398](https://example.com/ACME-398) Antifraud v2 {lane: Payments, who: Oleg}

## Done {done}
- Signed webhooks #payments {lane: Payments}
`

/** An editable board that keeps its own source, as a host would after saving. */
export const Editable: Story = {
  args: { source: SOURCE, editable: true, lockable: true },
  render: (args) => ({
    components: { UidKanban },
    setup() {
      const source = ref(args.source ?? '')
      const locked = ref(false)
      return { args, source, locked }
    },
    template: '<UidKanban v-bind="args" :source="source" :locked="locked" @change="source = $event" @lock="locked = $event" />',
  }),
}

export const ReadOnly: Story = {
  args: { source: SOURCE },
}
