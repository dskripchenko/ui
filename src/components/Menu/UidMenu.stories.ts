import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidMenu from './UidMenu.vue'
import UidMenuItem from './UidMenuItem.vue'
import UidMenuLabel from './UidMenuLabel.vue'
import UidMenuNote from './UidMenuNote.vue'
import UidMenuSeparator from './UidMenuSeparator.vue'
import UidSubMenu from './UidSubMenu.vue'
import { Copy, Eye, EyeOff, Info, LayoutGrid, Pencil, PanelLeft, Pin, Trash2 } from 'lucide-vue-next'

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

// A row menu at the right edge of a table: 'bottom-end' aligns the menu to the
// trigger's right edge, so it does not run past the table.
export const PlacementEnd: Story = {
  render: () => ({
    components: { UidMenu, UidMenuItem, UidMenuSeparator },
    template: `
      <div style="padding:24px">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid var(--uid-color-border);border-radius:8px">
          <span>Строка таблицы</span>
          <UidMenu placement="bottom-end">
            <template #trigger>
              <button style="padding:4px 10px;cursor:pointer" aria-label="Действия">⋯</button>
            </template>
            <UidMenuItem>Открыть</UidMenuItem>
            <UidMenuItem>Дублировать</UidMenuItem>
            <UidMenuSeparator />
            <UidMenuItem variant="danger">Удалить</UidMenuItem>
          </UidMenu>
        </div>
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

export const ContextMenu: Story = {
  name: 'Контекстное меню (openAt)',
  render: () => ({
    components: { UidMenu, UidMenuItem, UidMenuSeparator },
    setup() {
      const menu = ref<InstanceType<typeof UidMenu> | null>(null)
      return { menu }
    },
    template: `
      <div
        style="height:240px;display:grid;place-items:center;border:1px dashed var(--uid-color-border);border-radius:8px"
        @contextmenu.prevent="menu.openAt($event.clientX, $event.clientY)"
      >
        Правый клик в любом месте области
        <UidMenu ref="menu">
          <UidMenuItem>Открыть</UidMenuItem>
          <UidMenuItem>Переименовать</UidMenuItem>
          <UidMenuSeparator />
          <UidMenuItem variant="danger">Удалить</UidMenuItem>
        </UidMenu>
      </div>
    `,
  }),
}

export const Choices: Story = {
  name: 'Выбор: радио, переключатели, сноска',
  render: () => ({
    components: { UidMenu, UidMenuItem, UidMenuLabel, UidMenuNote, UidMenuSeparator },
    setup() {
      const view = ref<'grid' | 'speaker' | 'stage'>('grid')
      const hideEmpty = ref(false)
      const hideMine = ref(true)
      return { view, hideEmpty, hideMine, LayoutGrid, PanelLeft, Pin, EyeOff, Info }
    },
    template: `
      <div style="display:flex;justify-content:center;padding:80px;--uid-menu-min-width:260px">
        <UidMenu>
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">Вид ▾</button>
          </template>
          <UidMenuLabel>Вид</UidMenuLabel>
          <UidMenuItem type="radio" :icon="LayoutGrid" :checked="view === 'grid'" hint="все плитки одного размера" @click="view = 'grid'">Сетка</UidMenuItem>
          <UidMenuItem type="radio" :icon="PanelLeft" :checked="view === 'speaker'" hint="крупно тот, кто говорит" @click="view = 'speaker'">Докладчик</UidMenuItem>
          <UidMenuItem type="radio" :icon="Pin" :checked="view === 'stage'" hint="один выбранный крупно" @click="view = 'stage'">Сцена</UidMenuItem>
          <UidMenuSeparator />
          <UidMenuItem type="switch" :icon="EyeOff" :checked="hideEmpty" hint="кроме того, кто говорит" @click="hideEmpty = !hideEmpty">Скрыть пустые</UidMenuItem>
          <UidMenuItem type="switch" :icon="EyeOff" :checked="hideMine" @click="hideMine = !hideMine">Скрыть свою</UidMenuItem>
          <UidMenuNote :icon="Info">Выбор виден только вам</UidMenuNote>
        </UidMenu>
      </div>
    `,
  }),
}
