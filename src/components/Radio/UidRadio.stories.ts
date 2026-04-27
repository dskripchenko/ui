import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidRadio from './UidRadio.vue'
import UidRadioGroup from './UidRadioGroup.vue'

const meta: Meta<typeof UidRadio> = {
  title: 'Inputs/Radio',
  component: UidRadio,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof UidRadio>

export const Standalone: Story = {
  render: () => ({
    components: { UidRadio },
    setup: () => ({ value: ref('a') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:8px">
        <UidRadio v-model="value" value="a" label="Вариант A" name="standalone" />
        <UidRadio v-model="value" value="b" label="Вариант B" name="standalone" />
        <UidRadio v-model="value" value="c" label="Вариант C" name="standalone" />
        <p style="font-size:13px;color:var(--uid-text-secondary);margin-top:8px">Выбрано: {{ value }}</p>
      </div>
    `,
  }),
}

export const WithGroup: Story = {
  render: () => ({
    components: { UidRadio, UidRadioGroup },
    setup: () => ({ value: ref('male') }),
    template: `
      <UidRadioGroup v-model="value" label="Пол" hint="Выберите один из вариантов" required>
        <UidRadio value="male" label="Мужской" />
        <UidRadio value="female" label="Женский" />
        <UidRadio value="other" label="Другой" />
      </UidRadioGroup>
    `,
  }),
}

export const Horizontal: Story = {
  render: () => ({
    components: { UidRadio, UidRadioGroup },
    setup: () => ({ value: ref('md') }),
    template: `
      <UidRadioGroup v-model="value" label="Размер" direction="horizontal">
        <UidRadio value="sm" label="S" />
        <UidRadio value="md" label="M" />
        <UidRadio value="lg" label="L" />
        <UidRadio value="xl" label="XL" />
      </UidRadioGroup>
    `,
  }),
}

export const WithError: Story = {
  render: () => ({
    components: { UidRadio, UidRadioGroup },
    setup: () => ({ value: ref(undefined) }),
    template: `
      <UidRadioGroup v-model="value" label="Способ оплаты" error="Выберите способ оплаты" required>
        <UidRadio value="card" label="Банковская карта" />
        <UidRadio value="cash" label="Наличные" />
        <UidRadio value="crypto" label="Криптовалюта" />
      </UidRadioGroup>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { UidRadio, UidRadioGroup },
    setup: () => ({ value: ref('a') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <UidRadioGroup v-model="value" label="Вся группа недоступна" disabled>
          <UidRadio value="a" label="Вариант A" />
          <UidRadio value="b" label="Вариант B" />
        </UidRadioGroup>

        <UidRadioGroup v-model="value" label="Один элемент недоступен">
          <UidRadio value="a" label="Вариант A" />
          <UidRadio value="b" label="Вариант B (disabled)" disabled />
          <UidRadio value="c" label="Вариант C" />
        </UidRadioGroup>
      </div>
    `,
  }),
}
