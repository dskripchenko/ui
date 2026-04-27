import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidSwitch from './UidSwitch.vue'

const meta: Meta<typeof UidSwitch> = {
  title: 'Inputs/Switch',
  component: UidSwitch,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidSwitch>

export const Default: Story = {
  args: { label: 'Уведомления' },
}

export const Playground: Story = {
  args: { label: 'Переключатель', hint: 'Подсказка' },
  render: (args: Record<string, unknown>) => ({
    components: { UidSwitch },
    setup: () => ({ args, value: ref(false) }),
    template: `<UidSwitch v-bind="args" v-model="value" />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidSwitch },
    setup: () => ({ sm: ref(true), md: ref(true), lg: ref(false) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <UidSwitch v-model="sm" size="sm" label="Small" />
        <UidSwitch v-model="md" size="md" label="Medium" />
        <UidSwitch v-model="lg" size="lg" label="Large" />
      </div>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidSwitch },
    setup: () => ({ on: ref(true), off: ref(false) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <UidSwitch v-model="off" label="Выключен" />
        <UidSwitch v-model="on" label="Включён" />
        <UidSwitch v-model="off" label="Disabled (выключен)" disabled />
        <UidSwitch v-model="on" label="Disabled (включён)" disabled />
        <UidSwitch v-model="off" label="С ошибкой" error="Необходимо включить" />
        <UidSwitch v-model="off" label="С подсказкой" hint="Включите для активации функции" />
      </div>
    `,
  }),
}
