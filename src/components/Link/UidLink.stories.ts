import type { Meta, StoryObj } from '@storybook/vue3'
import UidLink from './UidLink.vue'

const meta: Meta<typeof UidLink> = {
  title: 'Navigation/Link',
  component: UidLink,
  tags: ['autodocs'],
  argTypes: {
    external: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidLink>

export const Default: Story = {
  args: { href: '/about' },
  render: (args: Record<string, unknown>) => ({
    components: { UidLink },
    setup: () => ({ args }),
    template: `<UidLink v-bind="args">Перейти на страницу</UidLink>`,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UidLink },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          Обычная ссылка:
          <UidLink href="/about">Подробнее</UidLink>
        </div>
        <div>
          Внешняя ссылка:
          <UidLink href="https://example.com" :external="true">example.com ↗</UidLink>
        </div>
        <div>
          Отключённая:
          <UidLink href="/blocked" :disabled="true">Недоступно</UidLink>
        </div>
        <div>
          Встроенная в текст: Прочитайте нашу
          <UidLink href="/privacy">политику конфиденциальности</UidLink>
          перед регистрацией.
        </div>
      </div>
    `,
  }),
}
