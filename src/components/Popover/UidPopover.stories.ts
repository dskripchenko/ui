import type { Meta, StoryObj } from '@storybook/vue3'
import UidPopover from './UidPopover.vue'

const meta: Meta<typeof UidPopover> = {
  title: 'Overlays/Popover',
  component: UidPopover,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right'],
    },
  },
}
export default meta

type Story = StoryObj<typeof UidPopover>

export const Default: Story = {
  args: { placement: 'bottom' },
  render: (args: Record<string, unknown>) => ({
    components: { UidPopover },
    setup: () => ({ args }),
    template: `
      <div style="display:flex;justify-content:center;padding:80px">
        <UidPopover v-bind="args">
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">Открыть попover</button>
          </template>
          <div>
            <p style="margin:0 0 8px;font-weight:600">Заголовок</p>
            <p style="margin:0;font-size:14px">Это содержимое поповера. Кликните за пределами, чтобы закрыть.</p>
          </div>
        </UidPopover>
      </div>
    `,
  }),
}

export const WithActions: Story = {
  render: () => ({
    components: { UidPopover },
    template: `
      <div style="display:flex;justify-content:center;padding:80px">
        <UidPopover placement="bottom-start">
          <template #trigger>
            <button style="padding:8px 16px;cursor:pointer">Действия ▾</button>
          </template>
          <div style="display:flex;flex-direction:column;gap:4px">
            <button style="text-align:left;padding:6px 8px;background:none;border:none;cursor:pointer;border-radius:4px">Редактировать</button>
            <button style="text-align:left;padding:6px 8px;background:none;border:none;cursor:pointer;border-radius:4px">Дублировать</button>
            <hr style="margin:4px 0;border:none;border-top:1px solid var(--uid-color-border)">
            <button style="text-align:left;padding:6px 8px;background:none;border:none;cursor:pointer;border-radius:4px;color:#ef4444">Удалить</button>
          </div>
        </UidPopover>
      </div>
    `,
  }),
}
