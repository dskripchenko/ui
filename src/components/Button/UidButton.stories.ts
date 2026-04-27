import type { Meta, StoryObj } from '@storybook/vue3'
import { Search, Plus } from 'lucide-vue-next'
import UidButton from './UidButton.vue'
import UidIcon from '../../icons/UidIcon.vue'

const meta: Meta<typeof UidButton> = {
  title: 'Inputs/Button',
  component: UidButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
  },
}
export default meta

type Story = StoryObj<typeof UidButton>

export const Playground: Story = {
  args: { variant: 'primary', size: 'md', disabled: false, loading: false },
  render: (args: Record<string, unknown>) => ({
    components: { UidButton },
    setup: () => ({ args }),
    template: `<UidButton v-bind="args">Кнопка</UidButton>`,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UidButton },
    template: `
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <UidButton variant="primary">Primary</UidButton>
        <UidButton variant="secondary">Secondary</UidButton>
        <UidButton variant="ghost">Ghost</UidButton>
        <UidButton variant="danger">Danger</UidButton>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidButton },
    template: `
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <UidButton size="sm">Small</UidButton>
        <UidButton size="md">Medium</UidButton>
        <UidButton size="lg">Large</UidButton>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { UidButton },
    template: `
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <UidButton variant="primary" disabled>Primary</UidButton>
        <UidButton variant="secondary" disabled>Secondary</UidButton>
        <UidButton variant="ghost" disabled>Ghost</UidButton>
        <UidButton variant="danger" disabled>Danger</UidButton>
      </div>
    `,
  }),
}

export const Loading: Story = {
  render: () => ({
    components: { UidButton },
    template: `
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <UidButton variant="primary" loading>Сохранение...</UidButton>
        <UidButton variant="secondary" loading>Загрузка...</UidButton>
      </div>
    `,
  }),
}

export const WithIcon: Story = {
  render: () => ({
    components: { UidButton, UidIcon },
    setup: () => ({ Search, Plus }),
    template: `
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <UidButton variant="primary">
          <template #prepend><UidIcon :icon="Plus" :size="16" /></template>
          Добавить
        </UidButton>
        <UidButton variant="secondary">
          <template #prepend><UidIcon :icon="Search" :size="16" /></template>
          Поиск
        </UidButton>
        <UidButton variant="ghost">
          Ещё
          <template #append><UidIcon :icon="Search" :size="16" /></template>
        </UidButton>
      </div>
    `,
  }),
}
