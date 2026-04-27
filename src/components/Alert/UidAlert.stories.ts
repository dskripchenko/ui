import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidAlert from './UidAlert.vue'

const meta: Meta<typeof UidAlert> = {
  title: 'Feedback/Alert',
  component: UidAlert,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    dismissible: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidAlert>

export const Default: Story = {
  args: { variant: 'info' },
  render: (args: Record<string, unknown>) => ({
    components: { UidAlert },
    setup: () => ({ args }),
    template: `<UidAlert v-bind="args" style="width:420px">Это информационное сообщение.</UidAlert>`,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UidAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:420px">
        <UidAlert variant="info">Информационное сообщение</UidAlert>
        <UidAlert variant="success">Операция выполнена успешно</UidAlert>
        <UidAlert variant="warning">Обратите внимание на это предупреждение</UidAlert>
        <UidAlert variant="danger">Произошла ошибка, попробуйте снова</UidAlert>
      </div>
    `,
  }),
}

export const WithTitle: Story = {
  render: () => ({
    components: { UidAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:420px">
        <UidAlert variant="success" title="Данные сохранены">
          Изменения были успешно применены и вступят в силу немедленно.
        </UidAlert>
        <UidAlert variant="warning" title="Предупреждение">
          Это действие нельзя отменить. Убедитесь, что вы хотите продолжить.
        </UidAlert>
        <UidAlert variant="danger" title="Ошибка авторизации">
          Сессия истекла. Пожалуйста, войдите снова.
        </UidAlert>
      </div>
    `,
  }),
}

export const Dismissible: Story = {
  render: () => ({
    components: { UidAlert },
    setup: () => ({
      show: ref({ info: true, success: true, warning: true }),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:420px">
        <UidAlert v-if="show.info" variant="info" dismissible @dismiss="show.info = false">
          Нажмите × чтобы скрыть это сообщение
        </UidAlert>
        <UidAlert v-if="show.success" variant="success" title="Готово!" dismissible @dismiss="show.success = false">
          Файл загружен успешно.
        </UidAlert>
        <UidAlert v-if="show.warning" variant="warning" dismissible @dismiss="show.warning = false">
          Осталось мало места на диске.
        </UidAlert>
        <p v-if="!show.info && !show.success && !show.warning" style="color:var(--uid-text-secondary);font-size:13px">
          Все уведомления скрыты. Обновите страницу.
        </p>
      </div>
    `,
  }),
}
