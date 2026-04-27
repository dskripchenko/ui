import type { Meta, StoryObj } from '@storybook/vue3'
import UidSimpleLayout from './UidSimpleLayout.vue'
import UidHeader from '../../patterns/Header/UidHeader.vue'
import UidFooter from '../../patterns/Footer/UidFooter.vue'

const meta: Meta<typeof UidSimpleLayout> = {
  title: 'Layouts/SimpleLayout',
  component: UidSimpleLayout,
  tags: ['autodocs'],
  argTypes: {
    full: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof UidSimpleLayout>

export const Default: Story = {
  render: (args) => ({
    components: { UidSimpleLayout, UidHeader, UidFooter },
    setup: () => ({ args }),
    template: `
      <UidSimpleLayout v-bind="args">
        <template #header>
          <UidHeader :bordered="true">
            <template #logo><strong>MyApp</strong></template>
            <template #nav>
              <a href="#">Главная</a>
              <a href="#">О нас</a>
            </template>
          </UidHeader>
        </template>

        <div style="padding: 32px; max-width: 800px; margin: 0 auto;">
          <h1>Контент страницы</h1>
          <p>Основное содержимое располагается здесь и занимает всё доступное пространство.</p>
        </div>

        <template #footer>
          <UidFooter variant="minimal">
            <span>© 2025 MyApp</span>
          </UidFooter>
        </template>
      </UidSimpleLayout>
    `,
  }),
  args: {},
}

export const ContentOnly: Story = {
  render: (args) => ({
    components: { UidSimpleLayout },
    setup: () => ({ args }),
    template: `
      <UidSimpleLayout v-bind="args">
        <div style="padding: 32px;">
          <h2>Страница без шапки и подвала</h2>
          <p>Только контент.</p>
        </div>
      </UidSimpleLayout>
    `,
  }),
  args: {},
}
