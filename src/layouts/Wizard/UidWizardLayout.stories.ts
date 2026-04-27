import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidWizardLayout from './UidWizardLayout.vue'
import UidWizard from '../../patterns/Wizard/UidWizard.vue'
import UidWizardStep from '../../patterns/Wizard/UidWizardStep.vue'
import UidStepper from '../../components/Stepper/UidStepper.vue'
import UidButton from '../../components/Button/UidButton.vue'
import UidInput from '../../components/Input/UidInput.vue'

const meta: Meta<typeof UidWizardLayout> = {
  title: 'Layouts/WizardLayout',
  component: UidWizardLayout,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidWizardLayout>

const wizardSteps = [
  { label: 'Личные данные' },
  { label: 'Контакты' },
  { label: 'Подтверждение' },
]

export const Default: Story = {
  render: () => ({
    components: { UidWizardLayout, UidWizard, UidWizardStep, UidStepper, UidButton, UidInput },
    setup() {
      const current = ref(0)
      return { current, wizardSteps }
    },
    template: `
      <UidWizard v-model="current" :steps="wizardSteps">
        <UidWizardLayout style="width: 520px; border: 1px solid var(--uid-color-border); border-radius: 8px; overflow: hidden;">
          <template #header>
            <div style="display: flex; align-items: center; gap: 12px;">
              <UidButton v-if="current > 0" variant="ghost" size="sm" style="flex-shrink:0" @click="current--">←</UidButton>
              <span style="font-size: 20px; font-weight: 600;">Создание аккаунта</span>
            </div>
          </template>

          <template #stepper>
            <UidStepper :steps="wizardSteps" :current="current" />
          </template>

          <UidWizardStep :index="0">
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <h3 style="margin: 0;">Личные данные</h3>
              <UidInput label="Имя" placeholder="Иван Иванов" />
            </div>
          </UidWizardStep>

          <UidWizardStep :index="1">
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <h3 style="margin: 0;">Контакты</h3>
              <UidInput label="Email" placeholder="ivan@example.com" type="email" />
              <UidInput label="Телефон" placeholder="+7 (999) 000-00-00" />
            </div>
          </UidWizardStep>

          <UidWizardStep :index="2">
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <h3 style="margin: 0;">Подтверждение</h3>
              <p style="margin: 0; color: var(--uid-color-text-secondary);">
                Проверьте введённые данные и нажмите «Завершить».
              </p>
            </div>
          </UidWizardStep>

          <template #nav>
            <UidButton variant="outline" :disabled="current === 0" @click="current--">Назад</UidButton>
            <UidButton v-if="current < wizardSteps.length - 1" @click="current++">Далее</UidButton>
            <UidButton v-else variant="primary">Завершить</UidButton>
          </template>
        </UidWizardLayout>
      </UidWizard>
    `,
  }),
}
