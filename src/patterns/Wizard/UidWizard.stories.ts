import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidWizard from './UidWizard.vue'
import UidWizardStep from './UidWizardStep.vue'
import UidStepper from '../../components/Stepper/UidStepper.vue'
import UidButton from '../../components/Button/UidButton.vue'
import UidInput from '../../components/Input/UidInput.vue'

const meta: Meta<typeof UidWizard> = {
  title: 'Patterns/Wizard',
  component: UidWizard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidWizard>

const wizardSteps = [
  { label: 'Личные данные' },
  { label: 'Контакты' },
  { label: 'Подтверждение' },
]

export const Default: Story = {
  render: () => ({
    components: { UidWizard, UidWizardStep, UidStepper, UidButton, UidInput },
    setup() {
      const current = ref(0)
      const name = ref('')
      const email = ref('')

      async function validateStep0() {
        return name.value.trim().length > 0
      }

      async function validateStep1() {
        return email.value.includes('@')
      }

      return { current, wizardSteps, name, email, validateStep0, validateStep1 }
    },
    template: `
      <UidWizard v-model="current" :steps="wizardSteps" style="max-width: 600px;">
        <UidStepper :steps="wizardSteps" :current="current" />

        <UidWizardStep :index="0" :validate="validateStep0">
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <h3 style="margin: 0;">Личные данные</h3>
            <UidInput v-model="name" label="Имя" placeholder="Иван Иванов" />
            <p v-if="name.trim() === ''" style="color: var(--uid-color-danger); font-size: 13px; margin: 0;">
              Введите имя, чтобы продолжить
            </p>
          </div>
        </UidWizardStep>

        <UidWizardStep :index="1" :validate="validateStep1">
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <h3 style="margin: 0;">Контакты</h3>
            <UidInput v-model="email" label="Email" placeholder="ivan@example.com" type="email" />
          </div>
        </UidWizardStep>

        <UidWizardStep :index="2">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <h3 style="margin: 0;">Подтверждение</h3>
            <p style="margin: 0;"><strong>Имя:</strong> {{ name || '—' }}</p>
            <p style="margin: 0;"><strong>Email:</strong> {{ email || '—' }}</p>
          </div>
        </UidWizardStep>

        <div style="display: flex; justify-content: space-between; padding-top: 8px;">
          <UidButton variant="ghost" :disabled="current === 0" @click="current--">Назад</UidButton>
          <UidButton v-if="current < wizardSteps.length - 1" @click="$refs.wizard?.next()">Далее</UidButton>
          <UidButton v-else variant="success">Отправить</UidButton>
        </div>
      </UidWizard>
    `,
  }),
}

export const Simple: Story = {
  render: () => ({
    components: { UidWizard, UidWizardStep, UidStepper, UidButton },
    setup() {
      const current = ref(0)
      const steps = [{ label: 'Шаг 1' }, { label: 'Шаг 2' }, { label: 'Шаг 3' }]
      return { current, steps }
    },
    template: `
      <UidWizard v-model="current" :steps="steps" style="max-width: 500px;">
        <UidStepper :steps="steps" :current="current" />

        <UidWizardStep :index="0">
          <p>Содержимое первого шага</p>
        </UidWizardStep>
        <UidWizardStep :index="1">
          <p>Содержимое второго шага</p>
        </UidWizardStep>
        <UidWizardStep :index="2">
          <p>Содержимое третьего шага — завершение!</p>
        </UidWizardStep>

        <div style="display: flex; gap: 8px;">
          <UidButton variant="ghost" :disabled="current === 0" @click="current--">Назад</UidButton>
          <UidButton :disabled="current === steps.length - 1" @click="current++">Далее</UidButton>
        </div>
      </UidWizard>
    `,
  }),
}

export const VerticalStepper: Story = {
  render: () => ({
    components: { UidWizard, UidWizardStep, UidStepper, UidButton },
    setup() {
      const current = ref(1)
      const steps = [
        { label: 'Аккаунт', description: 'Основные данные' },
        { label: 'Профиль', description: 'О себе' },
        { label: 'Настройки', description: 'Предпочтения' },
      ]
      return { current, steps }
    },
    template: `
      <div style="display: flex; gap: 48px; max-width: 700px;">
        <UidStepper :steps="steps" :current="current" orientation="vertical" style="flex-shrink: 0;" />
        <UidWizard v-model="current" :steps="steps" style="flex: 1;">
          <UidWizardStep :index="0"><p>Данные аккаунта</p></UidWizardStep>
          <UidWizardStep :index="1"><p>Данные профиля</p></UidWizardStep>
          <UidWizardStep :index="2"><p>Настройки системы</p></UidWizardStep>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <UidButton variant="ghost" :disabled="current === 0" @click="current--">Назад</UidButton>
            <UidButton :disabled="current === steps.length - 1" @click="current++">Далее</UidButton>
          </div>
        </UidWizard>
      </div>
    `,
  }),
}
