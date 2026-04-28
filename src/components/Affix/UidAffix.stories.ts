import type { Meta, StoryObj } from '@storybook/vue3'
import UidAffix from './UidAffix.vue'

const meta: Meta<typeof UidAffix> = {
  title: 'Navigation/Affix',
  component: UidAffix,
  tags: ['autodocs'],
  argTypes: {
    offsetTop: { control: 'number' },
    offsetBottom: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidAffix>

const filler = `
  <div v-for="i in 30" :key="i" style="padding:14px 16px;border-bottom:1px solid var(--uid-color-border);color:var(--uid-color-text-secondary)">
    Длинный контент строка {{ i }}
  </div>
`

export const TopOffset: Story = {
  render: () => ({
    components: { UidAffix },
    template: `
      <div>
        ${filler}
        <UidAffix :offset-top="0">
          <div style="padding:12px 16px;background:var(--uid-color-bg);border-top:1px solid var(--uid-color-border);border-bottom:1px solid var(--uid-color-border);font-weight:600">
            Я прилипну к верху при скролле
          </div>
        </UidAffix>
        ${filler}
      </div>
    `,
  }),
}

export const WithOffset: Story = {
  render: () => ({
    components: { UidAffix },
    template: `
      <div>
        ${filler}
        <UidAffix :offset-top="64">
          <div style="padding:12px 16px;background:var(--uid-color-primary-subtle);color:var(--uid-color-primary);border-radius:8px;font-weight:600">
            Прилипну на 64px ниже верха (под navbar)
          </div>
        </UidAffix>
        ${filler}
      </div>
    `,
  }),
}

export const BottomOffset: Story = {
  render: () => ({
    components: { UidAffix },
    template: `
      <div>
        ${filler}
        <UidAffix :offset-bottom="0">
          <div style="padding:12px 16px;background:var(--uid-color-bg);border-top:1px solid var(--uid-color-border);font-weight:600">
            Прилипну к низу
          </div>
        </UidAffix>
        ${filler}
      </div>
    `,
  }),
}
