import type { Meta, StoryObj } from '@storybook/vue3'
import UidHeader from './UidHeader.vue'
import UidButton from '../../components/Button/UidButton.vue'

const meta: Meta<typeof UidHeader> = {
  title: 'Patterns/Header',
  component: UidHeader,
  tags: ['autodocs'],
  argTypes: {
    sticky: { control: 'boolean' },
    bordered: { control: 'boolean' },
    transparent: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof UidHeader>

export const Default: Story = {
  render: (args) => ({
    components: { UidHeader, UidButton },
    setup: () => ({ args }),
    template: `
      <UidHeader v-bind="args">
        <template #logo><strong>MyApp</strong></template>
        <template #nav>
          <a href="#">Главная</a>
          <a href="#">О нас</a>
          <a href="#">Контакты</a>
        </template>
        <template #actions>
          <UidButton size="sm">Войти</UidButton>
        </template>
      </UidHeader>
    `,
  }),
  args: { bordered: true },
}

export const Sticky: Story = {
  render: (args) => ({
    components: { UidHeader },
    setup: () => ({ args }),
    template: `
      <UidHeader v-bind="args">
        <template #logo><strong>MyApp</strong></template>
        <template #nav><a href="#">Страницы</a></template>
      </UidHeader>
      <div style="height: 300px; background: var(--uid-color-bg-subtle); padding: 16px;">
        Прокрути страницу — шапка зафиксирована сверху
      </div>
    `,
  }),
  args: { sticky: true, bordered: true },
}

export const Transparent: Story = {
  render: (args) => ({
    components: { UidHeader },
    setup: () => ({ args }),
    template: `
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding-bottom: 80px;">
        <UidHeader v-bind="args">
          <template #logo><span style="color: #fff; font-weight: bold;">MyApp</span></template>
          <template #nav>
            <a href="#" style="color: #fff;">Главная</a>
            <a href="#" style="color: #fff;">О нас</a>
          </template>
        </UidHeader>
      </div>
    `,
  }),
  args: { transparent: true, bordered: false },
}

export const WithMobileSlot: Story = {
  render: (args) => ({
    components: { UidHeader, UidButton },
    setup: () => ({ args }),
    template: `
      <UidHeader v-bind="args">
        <template #logo><strong>MyApp</strong></template>
        <template #nav>
          <a href="#">Главная</a>
          <a href="#">Каталог</a>
        </template>
        <template #actions>
          <UidButton size="sm">Войти</UidButton>
        </template>
        <template #mobile>
          <button style="background: none; border: none; cursor: pointer;">☰</button>
        </template>
      </UidHeader>
    `,
  }),
  args: { bordered: true },
}
