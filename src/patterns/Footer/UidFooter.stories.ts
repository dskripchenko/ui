import type { Meta, StoryObj } from '@storybook/vue3'
import UidFooter from './UidFooter.vue'

const meta: Meta<typeof UidFooter> = {
  title: 'Patterns/Footer',
  component: UidFooter,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['minimal', 'columns'] },
  },
}

export default meta
type Story = StoryObj<typeof UidFooter>

export const Minimal: Story = {
  render: (args) => ({
    components: { UidFooter },
    setup: () => ({ args }),
    template: `
      <UidFooter v-bind="args">
        <span>© 2025 MyApp. Все права защищены.</span>
        <template #bottom>
          <nav style="display: flex; gap: 16px;">
            <a href="#">Конфиденциальность</a>
            <a href="#">Условия</a>
          </nav>
        </template>
      </UidFooter>
    `,
  }),
  args: { variant: 'minimal' },
}

export const Columns: Story = {
  render: (args) => ({
    components: { UidFooter },
    setup: () => ({ args }),
    template: `
      <UidFooter v-bind="args">
        <template #columns>
          <div>
            <strong>Продукт</strong>
            <ul style="list-style: none; padding: 0; margin: 8px 0 0;">
              <li><a href="#">Возможности</a></li>
              <li><a href="#">Цены</a></li>
            </ul>
          </div>
          <div>
            <strong>Компания</strong>
            <ul style="list-style: none; padding: 0; margin: 8px 0 0;">
              <li><a href="#">О нас</a></li>
              <li><a href="#">Блог</a></li>
            </ul>
          </div>
          <div>
            <strong>Поддержка</strong>
            <ul style="list-style: none; padding: 0; margin: 8px 0 0;">
              <li><a href="#">Документация</a></li>
              <li><a href="#">Контакты</a></li>
            </ul>
          </div>
        </template>
        <template #bottom>
          <span>© 2025 MyApp</span>
        </template>
      </UidFooter>
    `,
  }),
  args: { variant: 'columns' },
}
