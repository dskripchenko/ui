import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidFormField from './UidFormField.vue'
import UidCheckbox from '../Checkbox/UidCheckbox.vue'
import UidInput from '../Input/UidInput.vue'

const meta: Meta<typeof UidFormField> = {
  title: 'Inputs/FormField',
  component: UidFormField,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidFormField>

export const WithCheckboxGroup: Story = {
  render: () => ({
    components: { UidFormField, UidCheckbox },
    setup: () => ({
      fruits: ref({ apple: true, banana: false, cherry: false }),
    }),
    template: `
      <UidFormField label="Фрукты" hint="Выберите один или несколько" style="width:320px">
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">
          <UidCheckbox v-model="fruits.apple" label="Яблоко" />
          <UidCheckbox v-model="fruits.banana" label="Банан" />
          <UidCheckbox v-model="fruits.cherry" label="Вишня" />
        </div>
      </UidFormField>
    `,
  }),
}

export const WithError: Story = {
  render: () => ({
    components: { UidFormField, UidCheckbox },
    setup: () => ({ agreed: ref(false) }),
    template: `
      <UidFormField error="Необходимо принять условия" style="width:320px">
        <UidCheckbox v-model="agreed" label="Я принимаю условия использования" />
      </UidFormField>
    `,
  }),
}

export const Required: Story = {
  render: () => ({
    components: { UidFormField, UidInput },
    setup: () => ({ v: ref('') }),
    template: `
      <UidFormField label="Название" label-for="title-input" required hint="Обязательное поле" style="width:320px">
        <UidInput id="title-input" v-model="v" placeholder="Введите название" />
      </UidFormField>
    `,
  }),
}
