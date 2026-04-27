import type { Meta, StoryObj } from '@storybook/vue3'
import UidTooltip from './UidTooltip.vue'

const meta: Meta<typeof UidTooltip> = {
  title: 'Overlays/Tooltip',
  component: UidTooltip,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right'],
    },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidTooltip>

export const Default: Story = {
  args: { content: 'Это подсказка', placement: 'top' },
  render: (args: Record<string, unknown>) => ({
    components: { UidTooltip },
    setup: () => ({ args }),
    template: `
      <div style="display:flex;justify-content:center;padding:80px">
        <UidTooltip v-bind="args">
          <button style="padding:8px 16px;cursor:pointer">Наведи на меня</button>
        </UidTooltip>
      </div>
    `,
  }),
}

export const Placements: Story = {
  render: () => ({
    components: { UidTooltip },
    template: `
      <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;padding:80px">
        <UidTooltip content="Сверху" placement="top">
          <button style="padding:8px 16px;cursor:pointer">top</button>
        </UidTooltip>
        <UidTooltip content="Снизу" placement="bottom">
          <button style="padding:8px 16px;cursor:pointer">bottom</button>
        </UidTooltip>
        <UidTooltip content="Слева" placement="left">
          <button style="padding:8px 16px;cursor:pointer">left</button>
        </UidTooltip>
        <UidTooltip content="Справа" placement="right">
          <button style="padding:8px 16px;cursor:pointer">right</button>
        </UidTooltip>
        <UidTooltip content="Снизу слева" placement="bottom-start">
          <button style="padding:8px 16px;cursor:pointer">bottom-start</button>
        </UidTooltip>
        <UidTooltip content="Снизу справа" placement="bottom-end">
          <button style="padding:8px 16px;cursor:pointer">bottom-end</button>
        </UidTooltip>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { UidTooltip },
    template: `
      <div style="display:flex;justify-content:center;padding:80px">
        <UidTooltip content="Эта подсказка не появится" :disabled="true">
          <button style="padding:8px 16px;cursor:pointer">Disabled tooltip</button>
        </UidTooltip>
      </div>
    `,
  }),
}
