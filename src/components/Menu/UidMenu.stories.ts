import type { Meta, StoryObj } from '@storybook/vue3'
import UidMenu from './UidMenu.vue'
import UidMenuItem from './UidMenuItem.vue'
import UidMenuSeparator from './UidMenuSeparator.vue'

const meta: Meta<typeof UidMenu> = {
  title: 'Overlays/Menu',
  component: UidMenu,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof UidMenu>

export const Default: Story = {
  render: () => ({
    components: { UidMenu, UidMenuItem, UidMenuSeparator },
    template: `
      <div style="display:flex;justify-content:center;padding:80px">
        <UidMenu>
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">Действия ▾</button>
          </template>
          <UidMenuItem>Открыть</UidMenuItem>
          <UidMenuItem>Редактировать</UidMenuItem>
          <UidMenuItem>Дублировать</UidMenuItem>
          <UidMenuSeparator />
          <UidMenuItem variant="danger">Удалить</UidMenuItem>
        </UidMenu>
      </div>
    `,
  }),
}

export const WithDisabled: Story = {
  render: () => ({
    components: { UidMenu, UidMenuItem, UidMenuSeparator },
    template: `
      <div style="display:flex;justify-content:center;padding:80px">
        <UidMenu>
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">Меню</button>
          </template>
          <UidMenuItem>Просмотр</UidMenuItem>
          <UidMenuItem :disabled="true">Редактировать (нет доступа)</UidMenuItem>
          <UidMenuSeparator />
          <UidMenuItem variant="danger" :disabled="true">Удалить (нет доступа)</UidMenuItem>
        </UidMenu>
      </div>
    `,
  }),
}

export const MultipleMenus: Story = {
  render: () => ({
    components: { UidMenu, UidMenuItem, UidMenuSeparator },
    template: `
      <div style="display:flex;gap:16px;justify-content:center;padding:80px">
        <UidMenu>
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">Файл</button>
          </template>
          <UidMenuItem>Создать</UidMenuItem>
          <UidMenuItem>Открыть</UidMenuItem>
          <UidMenuSeparator />
          <UidMenuItem>Сохранить</UidMenuItem>
        </UidMenu>

        <UidMenu>
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">Правка</button>
          </template>
          <UidMenuItem>Отменить</UidMenuItem>
          <UidMenuItem>Повторить</UidMenuItem>
          <UidMenuSeparator />
          <UidMenuItem>Копировать</UidMenuItem>
          <UidMenuItem>Вставить</UidMenuItem>
        </UidMenu>
      </div>
    `,
  }),
}
