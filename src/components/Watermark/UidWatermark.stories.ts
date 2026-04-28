import type { Meta, StoryObj } from '@storybook/vue3'
import UidWatermark from './UidWatermark.vue'

const meta: Meta<typeof UidWatermark> = {
  title: 'Data Display/Watermark',
  component: UidWatermark,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof UidWatermark>

const cardStyle = `
  padding: 32px;
  border: 1px solid var(--uid-color-border);
  border-radius: 12px;
  background: var(--uid-color-bg);
  height: 320px;
`

export const Default: Story = {
  render: () => ({
    components: { UidWatermark },
    setup: () => ({ cardStyle }),
    template: `
      <UidWatermark content="dskripchenko/ui" :style="cardStyle">
        <h3 style="margin:0 0 12px">Защищённый документ</h3>
        <p style="color:var(--uid-color-text-secondary);line-height:1.6">
          Конфиденциальная информация. Распространение запрещено.
          На фоне отображается водяной знак с именем владельца.
        </p>
      </UidWatermark>
    `,
  }),
}

export const MultiLine: Story = {
  render: () => ({
    components: { UidWatermark },
    setup: () => ({ cardStyle, lines: ['CONFIDENTIAL', 'DO NOT SHARE'] }),
    template: `
      <UidWatermark
        :content="lines"
        color="rgba(220, 38, 38, 0.15)"
        :style="cardStyle"
      >
        <h3 style="margin:0 0 12px">Корпоративный отчёт</h3>
        <p style="color:var(--uid-color-text-secondary);line-height:1.6">
          Двухстрочный водяной знак с красным цветом для критически важных документов.
        </p>
      </UidWatermark>
    `,
  }),
}

export const CustomFont: Story = {
  render: () => ({
    components: { UidWatermark },
    setup: () => ({ cardStyle }),
    template: `
      <UidWatermark
        content="DRAFT"
        font="800 32px system-ui"
        color="rgba(245, 158, 11, 0.2)"
        :gap="[180, 140]"
        :rotate="-15"
        :style="cardStyle"
      >
        <h3 style="margin:0 0 12px">Черновик статьи</h3>
        <p style="color:var(--uid-color-text-secondary);line-height:1.6">
          Большой текст «DRAFT» по фону для черновых версий.
        </p>
      </UidWatermark>
    `,
  }),
}

export const Subtle: Story = {
  render: () => ({
    components: { UidWatermark },
    setup: () => ({ cardStyle }),
    template: `
      <UidWatermark
        content="© 2026"
        color="rgba(0, 0, 0, 0.05)"
        :rotate="0"
        :gap="[80, 60]"
        :style="cardStyle"
      >
        <h3 style="margin:0 0 12px">Легкий копирайт</h3>
        <p style="color:var(--uid-color-text-secondary);line-height:1.6">
          Слабый водяной знак, едва заметный — для авторских прав.
        </p>
      </UidWatermark>
    `,
  }),
}
