import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidModal from './UidModal.vue'

const meta: Meta<typeof UidModal> = {
  title: 'Overlays/Modal',
  component: UidModal,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    closeOnOverlay: { control: 'boolean' },
    hideClose: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidModal>

export const Default: Story = {
  render: () => ({
    components: { UidModal },
    setup: () => ({ open: ref(false) }),
    template: `
      <div>
        <button @click="open = true" style="padding:8px 16px;cursor:pointer">Открыть модальное окно</button>
        <UidModal v-model="open" title="Пример модального окна">
          <p>Это содержимое модального окна. Нажмите ✕ или кликните за пределами, чтобы закрыть.</p>
        </UidModal>
      </div>
    `,
  }),
}

export const WithFooter: Story = {
  render: () => ({
    components: { UidModal },
    setup: () => ({ open: ref(false) }),
    template: `
      <div>
        <button @click="open = true" style="padding:8px 16px;cursor:pointer">Открыть с футером</button>
        <UidModal v-model="open" title="Подтвердите действие">
          <p>Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.</p>
          <template #footer>
            <button @click="open = false" style="padding:6px 14px;cursor:pointer">Отмена</button>
            <button @click="open = false" style="padding:6px 14px;cursor:pointer;background:#ef4444;color:#fff;border:none;border-radius:4px">Удалить</button>
          </template>
        </UidModal>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidModal },
    setup: () => ({
      openSm: ref(false),
      openMd: ref(false),
      openLg: ref(false),
      openXl: ref(false),
    }),
    template: `
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button @click="openSm = true" style="padding:8px 16px;cursor:pointer">sm</button>
        <button @click="openMd = true" style="padding:8px 16px;cursor:pointer">md (по умолчанию)</button>
        <button @click="openLg = true" style="padding:8px 16px;cursor:pointer">lg</button>
        <button @click="openXl = true" style="padding:8px 16px;cursor:pointer">xl</button>

        <UidModal v-model="openSm" title="Маленькое окно" size="sm">
          <p>Компактное модальное окно для коротких сообщений.</p>
        </UidModal>
        <UidModal v-model="openMd" title="Стандартное окно" size="md">
          <p>Стандартный размер для большинства диалогов.</p>
        </UidModal>
        <UidModal v-model="openLg" title="Большое окно" size="lg">
          <p>Для форм с большим количеством полей.</p>
        </UidModal>
        <UidModal v-model="openXl" title="Широкое окно" size="xl">
          <p>Для таблиц и сложного содержимого.</p>
        </UidModal>
      </div>
    `,
  }),
}
