import type { Meta, StoryObj } from '@storybook/vue3'
import UidBreadcrumb from './UidBreadcrumb.vue'
import UidBreadcrumbItem from './UidBreadcrumbItem.vue'

const meta: Meta<typeof UidBreadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: UidBreadcrumb,
  tags: ['autodocs'],
  argTypes: {
    separator: { control: 'text' },
    nowrap: { control: 'boolean' },
    collapse: { control: 'boolean' },
    collapseMenu: { control: 'boolean' },
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

export const NonLinkCrumbs: Story = {
  render: () => ({
    components: { UidBreadcrumb, UidBreadcrumbItem },
    setup: () => ({ onSection: () => alert('Раздел') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <!-- A middle crumb without a link is plain text; only the last crumb is current -->
        <UidBreadcrumb>
          <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
          <UidBreadcrumbItem>Настройки</UidBreadcrumbItem>
          <UidBreadcrumbItem>Профиль</UidBreadcrumbItem>
        </UidBreadcrumb>
        <!-- Router location (RouterLink when vue-router is installed) and a click-only crumb -->
        <UidBreadcrumb>
          <UidBreadcrumbItem to="/">Главная</UidBreadcrumbItem>
          <UidBreadcrumbItem @click="onSection">Раздел (click)</UidBreadcrumbItem>
          <UidBreadcrumbItem :current="false">Без текущей страницы</UidBreadcrumbItem>
        </UidBreadcrumb>
      </div>
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

const longTrail = `
  <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
  <UidBreadcrumbItem href="/catalog">Каталог товаров</UidBreadcrumbItem>
  <UidBreadcrumbItem href="/catalog/electronics">Электроника и бытовая техника</UidBreadcrumbItem>
  <UidBreadcrumbItem href="/catalog/electronics/phones">Смартфоны и аксессуары</UidBreadcrumbItem>
  <UidBreadcrumbItem :current="true">Apple iPhone 15 Pro Max 256 ГБ, титановый синий</UidBreadcrumbItem>
`

/** `nowrap`: one line, long crumbs truncate with an ellipsis. Drag the corner to resize. */
export const Nowrap: Story = {
  render: () => ({
    components: { UidBreadcrumb, UidBreadcrumbItem },
    template: `
      <div style="resize:horizontal;overflow:hidden;width:420px;max-width:100%;padding:8px;border:1px dashed var(--uid-color-border)">
        <UidBreadcrumb nowrap>${longTrail}</UidBreadcrumb>
      </div>
    `,
  }),
}

/**
 * `collapse`: when the trail does not fit, the middle crumbs collapse into "…",
 * which opens a menu of the hidden crumbs (`collapse-menu="false"` for a plain "…").
 * Drag the corner to resize.
 */
export const Collapse: Story = {
  render: () => ({
    components: { UidBreadcrumb, UidBreadcrumbItem },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="resize:horizontal;overflow:hidden;width:480px;max-width:100%;padding:8px;border:1px dashed var(--uid-color-border)">
          <UidBreadcrumb collapse>${longTrail}</UidBreadcrumb>
        </div>
        <div style="resize:horizontal;overflow:hidden;width:480px;max-width:100%;padding:8px;border:1px dashed var(--uid-color-border)">
          <UidBreadcrumb collapse :collapse-menu="false">${longTrail}</UidBreadcrumb>
        </div>
      </div>
    `,
  }),
}
