import type { Meta, StoryObj } from '@storybook/vue3'
import UidBreadcrumb from './UidBreadcrumb.vue'
import UidBreadcrumbItem from './UidBreadcrumbItem.vue'

const meta: Meta<typeof UidBreadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: UidBreadcrumb,
  tags: ['autodocs'],
  argTypes: {
    separator: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof UidBreadcrumb>

export const Default: Story = {
  render: () => ({
    components: { UidBreadcrumb, UidBreadcrumbItem },
    template: `
      <UidBreadcrumb>
        <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
        <UidBreadcrumbItem href="/catalog">Каталог</UidBreadcrumbItem>
        <UidBreadcrumbItem href="/catalog/phones">Смартфоны</UidBreadcrumbItem>
        <UidBreadcrumbItem :current="true">iPhone 15 Pro</UidBreadcrumbItem>
      </UidBreadcrumb>
    `,
  }),
}

export const CustomSeparator: Story = {
  render: () => ({
    components: { UidBreadcrumb, UidBreadcrumbItem },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <UidBreadcrumb separator="/">
          <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
          <UidBreadcrumbItem href="/docs">Документация</UidBreadcrumbItem>
          <UidBreadcrumbItem :current="true">Компоненты</UidBreadcrumbItem>
        </UidBreadcrumb>
        <UidBreadcrumb separator=">">
          <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
          <UidBreadcrumbItem href="/docs">Документация</UidBreadcrumbItem>
          <UidBreadcrumbItem :current="true">Компоненты</UidBreadcrumbItem>
        </UidBreadcrumb>
        <UidBreadcrumb separator="·">
          <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
          <UidBreadcrumbItem href="/docs">Документация</UidBreadcrumbItem>
          <UidBreadcrumbItem :current="true">Компоненты</UidBreadcrumbItem>
        </UidBreadcrumb>
      </div>
    `,
  }),
}

export const Short: Story = {
  render: () => ({
    components: { UidBreadcrumb, UidBreadcrumbItem },
    template: `
      <UidBreadcrumb>
        <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
        <UidBreadcrumbItem :current="true">О нас</UidBreadcrumbItem>
      </UidBreadcrumb>
    `,
  }),
}
