import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidNumberInput from './UidNumberInput.vue'

const meta: Meta<typeof UidNumberInput> = {
  title: 'Inputs/NumberInput',
  component: UidNumberInput,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    controls: { control: 'boolean' },
    centered: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidNumberInput>

export const Default: Story = {
  args: { label: 'Количество', placeholder: '0' },
  render: (args: Record<string, unknown>) => ({
    components: { UidNumberInput },
    setup: () => ({ args, value: ref<number | null>(1) }),
    template: `<UidNumberInput v-bind="args" v-model="value" style="width:240px" />`,
  }),
}

export const WithMinMax: Story = {
  render: () => ({
    components: { UidNumberInput },
    setup: () => ({ qty: ref<number | null>(5) }),
    template: `
      <UidNumberInput
        v-model="qty"
        label="От 0 до 10"
        :min="0"
        :max="10"
        hint="Кнопки блокируются на границах"
        style="width:240px"
      />
    `,
  }),
}

export const Decimal: Story = {
  render: () => ({
    components: { UidNumberInput },
    setup: () => ({ price: ref<number | null>(99.9) }),
    template: `
      <UidNumberInput
        v-model="price"
        label="Цена"
        :step="0.1"
        :precision="2"
        :min="0"
        style="width:240px"
      />
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidNumberInput },
    setup: () => ({ sm: ref(1), md: ref(1), lg: ref(1) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:240px">
        <UidNumberInput v-model="sm" size="sm" label="Small" />
        <UidNumberInput v-model="md" size="md" label="Medium" />
        <UidNumberInput v-model="lg" size="lg" label="Large" />
      </div>
    `,
  }),
}

export const Centered: Story = {
  render: () => ({
    components: { UidNumberInput },
    setup: () => ({ qty: ref(1) }),
    template: `
      <UidNumberInput
        v-model="qty"
        label="Корзина"
        :min="1"
        :max="99"
        centered
        style="width:140px"
      />
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidNumberInput },
    setup: () => ({ v: ref(5) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:240px">
        <UidNumberInput v-model="v" label="Default" />
        <UidNumberInput v-model="v" label="Disabled" disabled />
        <UidNumberInput v-model="v" label="Readonly" readonly />
        <UidNumberInput v-model="v" label="Error" error="Слишком большое значение" />
        <UidNumberInput v-model="v" label="Без кнопок" :controls="false" />
      </div>
    `,
  }),
}
