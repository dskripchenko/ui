import type { Meta, StoryObj } from '@storybook/vue3'
import UidMenu from './UidMenu.vue'
import UidMenuItem from './UidMenuItem.vue'
import UidMenuSeparator from './UidMenuSeparator.vue'
import UidSubMenu from './UidSubMenu.vue'
import { Copy, Eye, Pencil, Trash2 } from 'lucide-vue-next'

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

export const WithIcons: Story = {
  render: () => ({
    components: { UidMenu, UidMenuItem, UidMenuSeparator },
    setup: () => ({ Copy, Eye, Pencil, Trash2 }),
    template: `
      <div style="display:flex;justify-content:center;padding:80px">
        <UidMenu>
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">Действия ▾</button>
          </template>
          <UidMenuItem :icon="Eye">Открыть</UidMenuItem>
          <UidMenuItem :icon="Pencil">Редактировать</UidMenuItem>
          <UidMenuItem :icon="Copy">Дублировать</UidMenuItem>
          <UidMenuSeparator />
          <UidMenuItem :icon="Trash2" variant="danger">Удалить</UidMenuItem>
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

export const NestedSubmenus: Story = {
  render: () => ({
    components: { UidMenu, UidMenuItem, UidMenuSeparator, UidSubMenu },
    template: `
      <div style="display:flex;justify-content:space-between;padding:80px">
        <UidMenu>
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">Файл ▾</button>
          </template>
          <UidMenuItem>Открыть</UidMenuItem>
          <UidSubMenu label="Экспорт">
            <UidMenuItem>PDF</UidMenuItem>
            <UidMenuItem>DOCX</UidMenuItem>
            <UidSubMenu label="Другие форматы">
              <UidMenuItem>ODT</UidMenuItem>
              <UidMenuItem>RTF</UidMenuItem>
            </UidSubMenu>
          </UidSubMenu>
          <UidSubMenu label="Поделиться">
            <UidMenuItem>Скопировать ссылку</UidMenuItem>
            <UidMenuItem>По почте</UidMenuItem>
          </UidSubMenu>
          <UidSubMenu label="Недоступно" disabled>
            <UidMenuItem>—</UidMenuItem>
          </UidSubMenu>
          <UidMenuSeparator />
          <UidMenuItem variant="danger">Удалить</UidMenuItem>
        </UidMenu>

        <UidMenu>
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">У правого края ▾</button>
          </template>
          <UidSubMenu label="Подменю уходит влево">
            <UidMenuItem>Первый</UidMenuItem>
            <UidMenuItem>Второй</UidMenuItem>
          </UidSubMenu>
        </UidMenu>
      </div>
    `,
  }),
}
