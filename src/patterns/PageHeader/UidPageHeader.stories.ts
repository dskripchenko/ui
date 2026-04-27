import type { Meta, StoryObj } from '@storybook/vue3'
import UidPageHeader from './UidPageHeader.vue'
import UidButton from '../../components/Button/UidButton.vue'

const meta: Meta<typeof UidPageHeader> = {
  title: 'Patterns/PageHeader',
  component: UidPageHeader,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    back: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof UidPageHeader>

export const Default: Story = {
  render: (args) => ({
    components: { UidPageHeader },
    setup: () => ({ args }),
    template: `<UidPageHeader v-bind="args" />`,
  }),
  args: {
    title: 'Проекты',
    description: 'Список всех ваших проектов',
  },
}

export const WithBack: Story = {
  render: (args) => ({
    components: { UidPageHeader },
    setup: () => ({ args }),
    template: `<UidPageHeader v-bind="args" @back="() => alert('Назад!')" />`,
  }),
  args: {
    title: 'Настройки проекта',
    back: true,
  },
}

export const WithActions: Story = {
  render: (args) => ({
    components: { UidPageHeader, UidButton },
    setup: () => ({ args }),
    template: `
      <UidPageHeader v-bind="args">
        <template #actions>
          <UidButton variant="ghost" size="sm">Импорт</UidButton>
          <UidButton size="sm">Создать проект</UidButton>
        </template>
      </UidPageHeader>
    `,
  }),
  args: {
    title: 'Проекты',
    description: 'Управляйте своими проектами',
  },
}

export const WithBreadcrumb: Story = {
  render: (args) => ({
    components: { UidPageHeader },
    setup: () => ({ args }),
    template: `
      <UidPageHeader v-bind="args">
        <template #breadcrumb>
          <nav style="font-size: 13px; color: var(--uid-color-text-secondary);">
            <a href="#">Главная</a>
            <span style="margin: 0 6px;">/</span>
            <a href="#">Проекты</a>
            <span style="margin: 0 6px;">/</span>
            <span>Новый проект</span>
          </nav>
        </template>
      </UidPageHeader>
    `,
  }),
  args: { title: 'Новый проект' },
}

export const WithTabs: Story = {
  render: (args) => ({
    components: { UidPageHeader },
    setup: () => ({ args }),
    template: `
      <UidPageHeader v-bind="args">
        <template #tabs>
          <nav style="display: flex; gap: 0; border-top: 1px solid var(--uid-color-border);">
            <a href="#" style="padding: 12px 16px; border-bottom: 2px solid var(--uid-color-primary); font-weight: 500; text-decoration: none;">Обзор</a>
            <a href="#" style="padding: 12px 16px; color: var(--uid-color-text-secondary); text-decoration: none;">Участники</a>
            <a href="#" style="padding: 12px 16px; color: var(--uid-color-text-secondary); text-decoration: none;">Настройки</a>
          </nav>
        </template>
      </UidPageHeader>
    `,
  }),
  args: { title: 'Мой проект' },
}
