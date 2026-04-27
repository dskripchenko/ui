import type { Meta, StoryObj } from '@storybook/vue3'
import UidAuthLayout from './UidAuthLayout.vue'
import UidButton from '../../components/Button/UidButton.vue'
import UidInput from '../../components/Input/UidInput.vue'
import UidCard from '../../components/Card/UidCard.vue'

const meta: Meta<typeof UidAuthLayout> = {
  title: 'Layouts/AuthLayout',
  component: UidAuthLayout,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['centered', 'split'] },
  },
}

export default meta
type Story = StoryObj<typeof UidAuthLayout>

const LoginForm = `
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div>
      <h2 style="margin: 0 0 4px;">Войти в аккаунт</h2>
      <p style="margin: 0; color: var(--uid-color-text-secondary); font-size: 14px;">
        Введите ваши данные для входа
      </p>
    </div>
    <UidInput label="Email" placeholder="ivan@example.com" type="email" />
    <UidInput label="Пароль" placeholder="••••••••" type="password" />
    <UidButton style="width: 100%;">Войти</UidButton>
  </div>
`

export const Centered: Story = {
  render: (args) => ({
    components: { UidAuthLayout, UidButton, UidInput, UidCard },
    setup: () => ({ args }),
    template: `
      <UidAuthLayout v-bind="args" style="min-height: 500px;">
        <UidCard style="padding: 32px;">
          ${LoginForm}
        </UidCard>
        <template #footer>
          <p style="text-align: center; margin: 0;">
            Нет аккаунта? <a href="#">Зарегистрироваться</a>
          </p>
        </template>
      </UidAuthLayout>
    `,
  }),
  args: { variant: 'centered' },
}

export const Split: Story = {
  render: (args) => ({
    components: { UidAuthLayout, UidButton, UidInput, UidCard },
    setup: () => ({ args }),
    template: `
      <UidAuthLayout v-bind="args" style="min-height: 500px;">
        <template #brand>
          <div style="text-align: center; color: white;">
            <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
            <h2 style="margin: 0 0 8px; color: white;">MyApp</h2>
            <p style="margin: 0; opacity: 0.8;">Лучший инструмент для ваших задач</p>
          </div>
        </template>
        <div style="display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 360px;">
          <div>
            <h2 style="margin: 0 0 4px;">Добро пожаловать</h2>
            <p style="margin: 0; color: var(--uid-color-text-secondary); font-size: 14px;">
              Войдите в свой аккаунт
            </p>
          </div>
          <UidInput label="Email" placeholder="ivan@example.com" type="email" />
          <UidInput label="Пароль" placeholder="••••••••" type="password" />
          <UidButton style="width: 100%;">Войти</UidButton>
        </div>
        <template #footer>
          <p style="text-align: center; margin: 0;">
            Нет аккаунта? <a href="#">Зарегистрироваться</a>
          </p>
        </template>
      </UidAuthLayout>
    `,
  }),
  args: { variant: 'split' },
}
