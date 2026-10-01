import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidColorPicker from './UidColorPicker.vue'

const meta: Meta<typeof UidColorPicker> = {
  title: 'Components/ColorPicker',
  component: UidColorPicker,
  tags: ['autodocs'],
  parameters: {
    docs: { story: { height: '460px' } },
  },
  decorators: [
    () => ({
      template: '<div style="padding: 16px 16px 380px 16px; width: 320px"><story /></div>',
    }),
  ],
  argTypes: {
    modelValue: { control: 'text' },
    disabled: { control: 'boolean' },
    alpha: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof UidColorPicker>

export const Default: Story = {
  render: args => ({
    components: { UidColorPicker },
    setup() {
      const color = ref<string | null>(null)
      return { args, color }
    },
    template: `<UidColorPicker v-bind="args" v-model="color" />`,
  }),
}

export const WithValue: Story = {
  render: args => ({
    components: { UidColorPicker },
    setup() {
      const color = ref<string | null>('#3b82f6')
      return { args, color }
    },
    template: `<UidColorPicker v-bind="args" v-model="color" />`,
  }),
}

export const WithPresets: Story = {
  render: args => ({
    components: { UidColorPicker },
    setup() {
      const color = ref<string | null>('#ef4444')
      const presets = [
        '#ef4444', '#f97316', '#eab308', '#22c55e',
        '#3b82f6', '#8b5cf6', '#ec4899', '#000000',
        '#6b7280', '#ffffff',
      ]
      return { args, color, presets }
    },
    template: `<UidColorPicker v-bind="args" v-model="color" :presets="presets" />`,
  }),
}

export const WithAlpha: Story = {
  render: args => ({
    components: { UidColorPicker },
    setup() {
      const color = ref<string | null>('#3b82f680')
      return { args, color }
    },
    template: `<UidColorPicker v-bind="args" v-model="color" :alpha="true" />`,
  }),
}

export const Disabled: Story = {
  args: {
    modelValue: '#3b82f6',
    disabled: true,
  },
}

export const CssColorFormats: Story = {
  render: args => ({
    components: { UidColorPicker },
    setup() {
      const rgb = ref<string | null>('rgb(59, 130, 246)')
      const hsl = ref<string | null>('hsl(142 71% 45%)')
      const short = ref<string | null>('#f0a')
      return { args, rgb, hsl, short }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <p style="margin: 0;">Значение может прийти как rgb(), hsl() или короткий hex — компонент нормализует его в hex. В поле ввода тоже можно вставить любой из этих форматов.</p>
        <UidColorPicker v-bind="args" v-model="rgb" />
        <UidColorPicker v-bind="args" v-model="hsl" />
        <UidColorPicker v-bind="args" v-model="short" :alpha="true" />
      </div>
    `,
  }),
}
