import type { Meta, StoryObj } from '@storybook/vue3'
import UidErrorState from './UidErrorState.vue'
import UidButton from '../../components/Button/UidButton.vue'

const meta: Meta<typeof UidErrorState> = {
  title: 'Patterns/ErrorState',
  component: UidErrorState,
  tags: ['autodocs'],
  argTypes: {
    code: { control: 'select', options: ['404', '500', 'network', undefined] },
    title: { control: 'text' },
    description: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof UidErrorState>

export const NotFound: Story = {
  render: (args) => ({
    components: { UidErrorState, UidButton },
    setup: () => ({ args }),
    template: `
      <UidErrorState v-bind="args">
        <template #actions>
          <UidButton @click="() => history.back()">Назад</UidButton>
          <UidButton variant="ghost" as="a" href="/">На главную</UidButton>
        </template>
      </UidErrorState>
    `,
  }),
  args: { code: '404' },
}

export const ServerError: Story = {
  render: (args) => ({
    components: { UidErrorState, UidButton },
    setup: () => ({ args }),
    template: `
      <UidErrorState v-bind="args">
        <template #actions>
          <UidButton @click="() => location.reload()">Обновить страницу</UidButton>
        </template>
      </UidErrorState>
    `,
  }),
  args: { code: '500' },
}

export const NetworkError: Story = {
  render: (args) => ({
    components: { UidErrorState, UidButton },
    setup: () => ({ args }),
    template: `
      <UidErrorState v-bind="args">
        <template #actions>
          <UidButton @click="() => location.reload()">Повторить</UidButton>
        </template>
      </UidErrorState>
    `,
  }),
  args: { code: 'network' },
}

export const CustomError: Story = {
  render: (args) => ({
    components: { UidErrorState, UidButton },
    setup: () => ({ args }),
    template: `
      <UidErrorState v-bind="args">
        <template #actions>
          <UidButton>Связаться с поддержкой</UidButton>
        </template>
      </UidErrorState>
    `,
  }),
  args: {
    title: 'Доступ запрещён',
    description: 'У вас нет прав для просмотра этой страницы. Обратитесь к администратору.',
  },
}

export const Default: Story = {
  render: (args) => ({
    components: { UidErrorState },
    setup: () => ({ args }),
    template: `<UidErrorState v-bind="args" />`,
  }),
  args: {},
}
