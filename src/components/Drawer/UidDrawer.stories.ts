import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidDrawer from './UidDrawer.vue'

const meta: Meta<typeof UidDrawer> = {
  title: 'Overlays/Drawer',
  component: UidDrawer,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'select', options: ['right', 'left', 'bottom'] },
    closeOnOverlay: { control: 'boolean' },
    hideClose: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidDrawer>

export const Default: Story = {
  render: () => ({
    components: { UidDrawer },
    setup: () => ({ open: ref(false) }),
    template: `
      <div>
        <button @click="open = true" style="padding:8px 16px;cursor:pointer">Открыть панель</button>
        <UidDrawer v-model="open" title="Боковая панель">
          <p>Содержимое боковой панели. Нажмите ✕ или кликните рядом, чтобы закрыть.</p>
        </UidDrawer>
      </div>
    `,
  }),
}

export const Sides: Story = {
  render: () => ({
    components: { UidDrawer },
    setup: () => ({
      openRight: ref(false),
      openLeft: ref(false),
      openBottom: ref(false),
    }),
    template: `
      <div style="display:flex;gap:8px">
        <button @click="openRight = true" style="padding:8px 16px;cursor:pointer">Справа</button>
        <button @click="openLeft = true" style="padding:8px 16px;cursor:pointer">Слева</button>
        <button @click="openBottom = true" style="padding:8px 16px;cursor:pointer">Снизу</button>

        <UidDrawer v-model="openRight" title="Панель справа" side="right">
          <p>Выезжает справа (по умолчанию).</p>
        </UidDrawer>
        <UidDrawer v-model="openLeft" title="Панель слева" side="left">
          <p>Выезжает слева.</p>
        </UidDrawer>
        <UidDrawer v-model="openBottom" title="Панель снизу" side="bottom">
          <p>Выезжает снизу — удобно для мобильных.</p>
        </UidDrawer>
      </div>
    `,
  }),
}

export const WithFooter: Story = {
  render: () => ({
    components: { UidDrawer },
    setup: () => ({ open: ref(false) }),
    template: `
      <div>
        <button @click="open = true" style="padding:8px 16px;cursor:pointer">Открыть с футером</button>
        <UidDrawer v-model="open" title="Редактирование">
          <p>Форма для редактирования данных.</p>
          <template #footer>
            <button @click="open = false" style="padding:6px 14px;cursor:pointer">Отмена</button>
            <button @click="open = false" style="padding:6px 14px;cursor:pointer;background:#3b82f6;color:#fff;border:none;border-radius:4px">Сохранить</button>
          </template>
        </UidDrawer>
      </div>
    `,
  }),
}
