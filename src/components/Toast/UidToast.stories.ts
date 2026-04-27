import type { Meta, StoryObj } from '@storybook/vue3'
import UidToastProvider from './UidToastProvider.vue'
import UidButton from '../Button/UidButton.vue'
import { useToast } from '../../composables/useToast.js'

const meta: Meta = {
  title: 'Feedback/Toast',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj

export const Playground: Story = {
  render: () => ({
    components: { UidToastProvider, UidButton },
    setup: () => {
      const toast = useToast()
      return { toast }
    },
    template: `
      <UidToastProvider />
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <UidButton variant="secondary" @click="toast.info('Информационное сообщение')">Info</UidButton>
        <UidButton variant="secondary" @click="toast.success('Операция выполнена успешно!')">Success</UidButton>
        <UidButton variant="secondary" @click="toast.warning('Обратите внимание')">Warning</UidButton>
        <UidButton variant="danger" @click="toast.error('Произошла ошибка')">Error</UidButton>
        <UidButton variant="ghost" @click="toast.add({ message: 'С заголовком и кастомной длительностью', title: 'Заголовок', variant: 'info', duration: 8000 })">С заголовком</UidButton>
        <UidButton variant="ghost" @click="toast.clear()">Очистить все</UidButton>
      </div>
    `,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UidToastProvider, UidButton },
    setup: () => {
      const toast = useToast()
      function showAll() {
        toast.info('Информационное сообщение')
        setTimeout(() => toast.success('Операция выполнена'), 200)
        setTimeout(() => toast.warning('Предупреждение'), 400)
        setTimeout(() => toast.error('Ошибка выполнения'), 600)
      }
      return { showAll, toast }
    },
    template: `
      <UidToastProvider />
      <div style="display:flex;gap:8px">
        <UidButton @click="showAll">Показать все варианты</UidButton>
        <UidButton variant="ghost" @click="toast.clear()">Очистить</UidButton>
      </div>
    `,
  }),
}
