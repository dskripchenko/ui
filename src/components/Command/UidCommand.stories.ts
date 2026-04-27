import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidCommand from './UidCommand.vue'
import UidButton from '../Button/UidButton.vue'
import type { CommandItem } from './UidCommand.vue'

const meta: Meta<typeof UidCommand> = {
  title: 'Components/Command',
  component: UidCommand,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidCommand>

const commands: CommandItem[] = [
  {
    id: 'new-project',
    label: 'Создать проект',
    description: 'Начать новый проект',
    group: 'Проекты',
    action: () => alert('Создать проект'),
  },
  {
    id: 'open-project',
    label: 'Открыть проект',
    description: 'Открыть существующий',
    group: 'Проекты',
    action: () => alert('Открыть проект'),
  },
  {
    id: 'settings',
    label: 'Настройки',
    description: 'Параметры приложения',
    shortcut: ['⌘', ','],
    group: 'Система',
    action: () => alert('Настройки'),
  },
  {
    id: 'theme',
    label: 'Сменить тему',
    description: 'Переключить светлую / тёмную',
    group: 'Система',
    action: () => alert('Смена темы'),
  },
  {
    id: 'logout',
    label: 'Выйти',
    shortcut: ['⌘', 'Q'],
    group: 'Аккаунт',
    action: () => alert('Выход'),
  },
  {
    id: 'docs',
    label: 'Документация',
    description: 'Открыть справку',
    group: 'Помощь',
    action: () => alert('Документация'),
  },
]

export const Default: Story = {
  render: () => ({
    components: { UidCommand, UidButton },
    setup() {
      const open = ref(false)
      return { open, commands }
    },
    template: `
      <div>
        <UidButton @click="open = true">Открыть палитру (Ctrl+K)</UidButton>
        <p style="margin-top: 8px; font-size: 13px; color: var(--uid-color-text-secondary);">
          Или нажмите Ctrl+K / ⌘K
        </p>
        <UidCommand v-model="open" :commands="commands" />
      </div>
    `,
  }),
}

export const WithoutGroups: Story = {
  render: () => ({
    components: { UidCommand, UidButton },
    setup() {
      const open = ref(true)
      const flat: CommandItem[] = [
        { id: '1', label: 'Главная', action: () => {} },
        { id: '2', label: 'Профиль', action: () => {} },
        { id: '3', label: 'Настройки', action: () => {} },
        { id: '4', label: 'Выйти', action: () => {} },
      ]
      return { open, commands: flat }
    },
    template: `
      <div style="height: 500px;">
        <UidCommand v-model="open" :commands="commands" placeholder="Куда перейти?" />
      </div>
    `,
  }),
}
