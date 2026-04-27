import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidSlider from './UidSlider.vue'

const meta: Meta<typeof UidSlider> = {
  title: 'Components/Slider',
  component: UidSlider,
  tags: ['autodocs'],
  argTypes: {
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
    disabled: { control: 'boolean' },
    showValue: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof UidSlider>

export const Default: Story = {
  render: () => ({
    components: { UidSlider },
    setup: () => ({ value: ref(50) }),
    template: `<UidSlider v-model="value" />`,
  }),
}

export const WithLabel: Story = {
  render: () => ({
    components: { UidSlider },
    setup: () => ({ value: ref(30) }),
    template: `<UidSlider v-model="value" label="Громкость" show-value style="max-width: 400px;" />`,
  }),
}

export const CustomRange: Story = {
  render: () => ({
    components: { UidSlider },
    setup: () => ({ value: ref(1000) }),
    template: `
      <UidSlider
        v-model="value"
        label="Бюджет"
        :min="0"
        :max="10000"
        :step="500"
        show-value
        :format-value="v => v.toLocaleString('ru') + ' ₽'"
        style="max-width: 400px;"
      />
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { UidSlider },
    setup: () => ({ value: ref(40) }),
    template: `<UidSlider v-model="value" label="Недоступно" disabled show-value style="max-width: 400px;" />`,
  }),
}

export const Multiple: Story = {
  render: () => ({
    components: { UidSlider },
    setup() {
      return {
        volume: ref(70),
        brightness: ref(50),
        contrast: ref(100),
      }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 400px;">
        <UidSlider v-model="volume" label="Громкость" show-value />
        <UidSlider v-model="brightness" label="Яркость" show-value :format-value="v => v + '%'" />
        <UidSlider v-model="contrast" label="Контраст" show-value :format-value="v => v + '%'" />
      </div>
    `,
  }),
}
