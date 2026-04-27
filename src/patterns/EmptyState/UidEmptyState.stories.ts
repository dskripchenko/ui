import type { Meta, StoryObj } from '@storybook/vue3'
import UidEmptyState from './UidEmptyState.vue'
import UidButton from '../../components/Button/UidButton.vue'

const meta: Meta<typeof UidEmptyState> = {
  title: 'Patterns/EmptyState',
  component: UidEmptyState,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof UidEmptyState>

export const Default: Story = {
  render: (args) => ({
    components: { UidEmptyState },
    setup: () => ({ args }),
    template: `<UidEmptyState v-bind="args" />`,
  }),
  args: {},
}

export const WithDescription: Story = {
  render: (args) => ({
    components: { UidEmptyState },
    setup: () => ({ args }),
    template: `<UidEmptyState v-bind="args" />`,
  }),
  args: {
    title: 'Проекты не найдены',
    description: 'Вы ещё не создали ни одного проекта. Начните прямо сейчас.',
  },
}

export const WithActions: Story = {
  render: (args) => ({
    components: { UidEmptyState, UidButton },
    setup: () => ({ args }),
    template: `
      <UidEmptyState v-bind="args">
        <template #actions>
          <UidButton>Создать проект</UidButton>
        </template>
      </UidEmptyState>
    `,
  }),
  args: {
    title: 'Нет проектов',
    description: 'Создайте первый проект, чтобы начать работу.',
  },
}

export const CustomIllustration: Story = {
  render: (args) => ({
    components: { UidEmptyState, UidButton },
    setup: () => ({ args }),
    template: `
      <UidEmptyState v-bind="args">
        <template #illustration>
          <div style="font-size: 64px; line-height: 1;">🔍</div>
        </template>
        <template #actions>
          <UidButton variant="ghost">Сбросить фильтры</UidButton>
        </template>
      </UidEmptyState>
    `,
  }),
  args: {
    title: 'Ничего не найдено',
    description: 'Попробуйте изменить параметры поиска.',
  },
}
