import type { Meta, StoryObj } from '@storybook/vue3'
import UidResult from './UidResult.vue'
import UidButton from '../../components/Button/UidButton.vue'

const meta: Meta<typeof UidResult> = {
  title: 'Patterns/Result',
  component: UidResult,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['success', 'info', 'warning', 'error'] },
    compact: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidResult>

export const Success: Story = {
  render: () => ({
    components: { UidResult, UidButton },
    template: `
      <UidResult
        status="success"
        title="Заказ оформлен"
        description="Мы отправили подтверждение на ваш email. Курьер свяжется в течение часа."
      >
        <template #actions>
          <UidButton variant="primary">К заказу</UidButton>
          <UidButton variant="outline">Главная</UidButton>
        </template>
      </UidResult>
    `,
  }),
}

export const Info: Story = {
  render: () => ({
    components: { UidResult, UidButton },
    template: `
      <UidResult
        status="info"
        title="Запрос отправлен"
        description="Менеджер рассмотрит заявку в течение 24 часов и свяжется с вами."
      >
        <template #actions>
          <UidButton>Понятно</UidButton>
        </template>
      </UidResult>
    `,
  }),
}

export const Warning: Story = {
  render: () => ({
    components: { UidResult, UidButton },
    template: `
      <UidResult
        status="warning"
        title="Подтвердите действие"
        description="Это действие нельзя отменить. Все связанные данные будут удалены."
      >
        Удалится 24 связанных записи и 3 архивных копии.
        <template #actions>
          <UidButton variant="danger">Удалить</UidButton>
          <UidButton variant="outline">Отмена</UidButton>
        </template>
      </UidResult>
    `,
  }),
}

export const Error: Story = {
  render: () => ({
    components: { UidResult, UidButton },
    template: `
      <UidResult
        status="error"
        title="Платёж не прошёл"
        description="Банк отклонил транзакцию. Проверьте данные карты и попробуйте снова."
      >
        <template #actions>
          <UidButton variant="primary">Повторить</UidButton>
          <UidButton variant="outline">Сменить способ</UidButton>
        </template>
      </UidResult>
    `,
  }),
}

export const Compact: Story = {
  render: () => ({
    components: { UidResult, UidButton },
    template: `
      <UidResult
        status="success"
        title="Сохранено"
        description="Изменения применены"
        compact
      >
        <template #actions>
          <UidButton size="sm">OK</UidButton>
        </template>
      </UidResult>
    `,
  }),
}
