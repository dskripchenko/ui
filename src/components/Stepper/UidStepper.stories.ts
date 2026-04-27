import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidStepper from './UidStepper.vue'

const meta: Meta<typeof UidStepper> = {
  title: 'Components/Stepper',
  component: UidStepper,
  tags: ['autodocs'],
  argTypes: {
    current: { control: { type: 'number', min: 0 } },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
}

export default meta
type Story = StoryObj<typeof UidStepper>

const steps = [
  { label: 'Личные данные', description: 'Основная информация' },
  { label: 'Контакты', description: 'Email и телефон' },
  { label: 'Подтверждение', description: 'Проверьте данные' },
]

export const Default: Story = {
  args: { steps, current: 1 },
}

export const AllCompleted: Story = {
  args: { steps, current: 3 },
}

export const FirstStep: Story = {
  args: { steps, current: 0 },
}

export const Vertical: Story = {
  args: { steps, current: 1, orientation: 'vertical' },
}

export const Interactive: Story = {
  render: () => ({
    components: { UidStepper },
    setup() {
      const current = ref(0)
      return { steps, current }
    },
    template: `
      <div>
        <UidStepper :steps="steps" :current="current" />
        <div style="display: flex; gap: 8px; margin-top: 24px;">
          <button :disabled="current === 0" @click="current--">Назад</button>
          <button :disabled="current === steps.length - 1" @click="current++">Вперёд</button>
        </div>
      </div>
    `,
  }),
}

export const WithoutDescriptions: Story = {
  args: {
    steps: [{ label: 'Шаг 1' }, { label: 'Шаг 2' }, { label: 'Шаг 3' }, { label: 'Шаг 4' }],
    current: 2,
  },
}
