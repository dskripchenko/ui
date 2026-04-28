import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidMention from './UidMention.vue'

const meta: Meta<typeof UidMention> = {
  title: 'Inputs/Mention',
  component: UidMention,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    rows: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidMention>

const team = [
  { value: 'alice', label: 'Alice', hint: 'Дизайнер' },
  { value: 'bob', label: 'Bob', hint: 'Backend' },
  { value: 'charlie', label: 'Charlie', hint: 'PM' },
  { value: 'diana', label: 'Diana', hint: 'Frontend' },
  { value: 'eve', label: 'Eve', hint: 'QA' },
]

export const Default: Story = {
  render: () => ({
    components: { UidMention },
    setup: () => ({ value: ref(''), team }),
    template: `
      <UidMention
        v-model="value"
        :options="team"
        label="Сообщение"
        placeholder="Напишите @ чтобы упомянуть участника"
        style="max-width:480px"
      />
    `,
  }),
}

export const MultiplePrefix: Story = {
  render: () => ({
    components: { UidMention },
    setup: () => ({
      value: ref(''),
      mixed: [
        ...team,
        { value: 'urgent', label: 'urgent', hint: 'тег' },
        { value: 'feature', label: 'feature', hint: 'тег' },
      ],
    }),
    template: `
      <UidMention
        v-model="value"
        :options="mixed"
        :prefix="['@', '#']"
        label="Заметка"
        placeholder="Используй @ для людей или # для тегов"
        style="max-width:480px"
      />
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { UidMention },
    setup: () => ({ value: ref('Привет @alice, готова обсудить?'), team }),
    template: `
      <UidMention
        v-model="value"
        :options="team"
        disabled
        style="max-width:480px"
      />
    `,
  }),
}
