import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidCheckboxGroup from './UidCheckboxGroup.vue'
import type { CheckboxGroupOption } from './UidCheckboxGroup.vue'

const meta: Meta<typeof UidCheckboxGroup> = {
  title: 'Inputs/CheckboxGroup',
  component: UidCheckboxGroup,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['vertical', 'horizontal'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidCheckboxGroup>

const permissions: CheckboxGroupOption[] = [
  { value: 'read', label: 'Чтение' },
  { value: 'write', label: 'Запись' },
  { value: 'export', label: 'Экспорт' },
  { value: 'delete', label: 'Удаление', disabled: true },
]

export const Default: Story = {
  render: (args) => ({
    components: { UidCheckboxGroup },
    setup: () => ({ args, value: ref(['read']) }),
    template: `
      <div>
        <UidCheckboxGroup v-bind="args" v-model="value" />
        <p style="margin-top:12px;font-size:13px">v-model: {{ value }}</p>
      </div>
    `,
  }),
  args: { options: permissions, label: 'Права доступа', hint: 'Можно выбрать несколько' },
}

export const Horizontal: Story = {
  render: () => ({
    components: { UidCheckboxGroup },
    setup: () => ({ permissions, value: ref(['read', 'export']) }),
    template: `<UidCheckboxGroup v-model="value" :options="permissions" direction="horizontal" label="Права" />`,
  }),
}

export const WithError: Story = {
  render: () => ({
    components: { UidCheckboxGroup },
    setup: () => ({ permissions, value: ref([]) }),
    template: `<UidCheckboxGroup v-model="value" :options="permissions" label="Права" required error="Выберите хотя бы одно право" />`,
  }),
}
