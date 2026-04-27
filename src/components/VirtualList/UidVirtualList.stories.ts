import type { Meta, StoryObj } from '@storybook/vue3'
import UidVirtualList from './UidVirtualList.vue'

const meta: Meta<typeof UidVirtualList> = {
  title: 'Components/VirtualList',
  component: UidVirtualList,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidVirtualList>

const bigList = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Пользователь #${i + 1}`,
  email: `user${i}@example.com`,
}))

export const Default: Story = {
  render: () => ({
    components: { UidVirtualList },
    setup: () => ({ items: bigList }),
    template: `
      <div>
        <p style="margin-bottom: 8px; font-size: 13px; color: var(--uid-color-text-secondary);">
          Рендерится {{ items.length.toLocaleString('ru') }} элементов, в DOM только видимые
        </p>
        <UidVirtualList :items="items" :item-height="56" :height="400" style="border: 1px solid var(--uid-color-border); border-radius: 8px;">
          <template #item="{ item, index }">
            <div style="display: flex; align-items: center; gap: 12px; padding: 0 16px; height: 56px; border-bottom: 1px solid var(--uid-color-border);">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--uid-color-primary-subtle); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--uid-color-primary); flex-shrink: 0;">
                {{ item.name[0] }}{{ item.name[index + 1] || '' }}
              </div>
              <div>
                <div style="font-weight: 500; font-size: 14px;">{{ item.name }}</div>
                <div style="font-size: 12px; color: var(--uid-color-text-secondary);">{{ item.email }}</div>
              </div>
              <div style="margin-left: auto; font-size: 12px; color: var(--uid-color-text-tertiary);">#{{ index }}</div>
            </div>
          </template>
        </UidVirtualList>
      </div>
    `,
  }),
}

export const SimpleRows: Story = {
  render: () => ({
    components: { UidVirtualList },
    setup: () => ({ items: Array.from({ length: 5000 }, (_, i) => `Строка ${i + 1}`) }),
    template: `
      <UidVirtualList :items="items" :item-height="40" :height="300" style="border: 1px solid var(--uid-color-border); border-radius: 8px;">
        <template #item="{ item, index }">
          <div style="display: flex; align-items: center; padding: 0 16px; height: 40px; border-bottom: 1px solid var(--uid-color-border);">
            <span style="color: var(--uid-color-text-tertiary); width: 60px; font-size: 12px;">{{ index + 1 }}</span>
            <span>{{ item }}</span>
          </div>
        </template>
      </UidVirtualList>
    `,
  }),
}
