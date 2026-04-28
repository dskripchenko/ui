import type { Meta, StoryObj } from '@storybook/vue3'
import UidBackTop from './UidBackTop.vue'

const meta: Meta<typeof UidBackTop> = {
  title: 'Navigation/BackTop',
  component: UidBackTop,
  tags: ['autodocs'],
  argTypes: {
    visibleAfter: { control: 'number' },
    smooth: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidBackTop>

export const Default: Story = {
  render: () => ({
    components: { UidBackTop },
    template: `
      <div>
        <div style="font-size:14px;color:var(--uid-color-text-secondary);margin-bottom:16px">
          Прокрутите страницу вниз — кнопка появится в правом нижнем углу
        </div>
        <div v-for="i in 80" :key="i" style="padding:12px 16px;border-bottom:1px solid var(--uid-color-border);font-size:13px;color:var(--uid-color-text-tertiary)">
          Строка #{{ i }}
        </div>
        <UidBackTop />
      </div>
    `,
  }),
}

export const CustomThreshold: Story = {
  render: () => ({
    components: { UidBackTop },
    template: `
      <div>
        <div style="font-size:14px;color:var(--uid-color-text-secondary);margin-bottom:16px">
          Появляется после 1000px скролла
        </div>
        <div v-for="i in 80" :key="i" style="padding:12px 16px;border-bottom:1px solid var(--uid-color-border);font-size:13px;color:var(--uid-color-text-tertiary)">
          Строка #{{ i }}
        </div>
        <UidBackTop :visible-after="1000" />
      </div>
    `,
  }),
}
