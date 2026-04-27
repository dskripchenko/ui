import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidCheckbox from './UidCheckbox.vue'

const meta: Meta<typeof UidCheckbox> = {
  title: 'Inputs/Checkbox',
  component: UidCheckbox,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidCheckbox>

export const Default: Story = {
  args: { label: 'Принять условия использования' },
}

export const Playground: Story = {
  args: {
    label: 'Лейбл',
    hint: 'Подсказка',
  },
  render: (args: Record<string, unknown>) => ({
    components: { UidCheckbox },
    setup: () => ({ args, value: ref(false) }),
    template: `<UidCheckbox v-bind="args" v-model="value" />`,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidCheckbox },
    setup: () => ({
      checked: ref(true),
      unchecked: ref(false),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <UidCheckbox v-model="unchecked" label="Обычный" />
        <UidCheckbox v-model="checked" label="Отмечен" />
        <UidCheckbox v-model="unchecked" label="Indeterminate" :indeterminate="true" />
        <UidCheckbox v-model="unchecked" label="Disabled" disabled />
        <UidCheckbox v-model="checked" label="Disabled checked" disabled />
        <UidCheckbox v-model="unchecked" label="С ошибкой" error="Это поле обязательно" />
        <UidCheckbox v-model="unchecked" label="С подсказкой" hint="Опциональное поле" />
      </div>
    `,
  }),
}

export const WithHint: Story = {
  args: {
    label: 'Подписаться на рассылку',
    hint: 'Не будем спамить — только важные обновления',
  },
}

export const WithError: Story = {
  args: {
    label: 'Я принимаю условия использования',
    error: 'Необходимо принять условия',
    required: true,
  },
}
