import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { Heart, Smile } from 'lucide-vue-next'
import UidRating from './UidRating.vue'

const meta: Meta<typeof UidRating> = {
  title: 'Inputs/Rating',
  component: UidRating,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    tone: { control: 'select', options: ['warning', 'primary', 'success', 'danger'] },
    allowHalf: { control: 'boolean' },
    readonly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    showLabel: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidRating>

export const Default: Story = {
  render: () => ({
    components: { UidRating },
    setup: () => ({ value: ref(3) }),
    template: `<UidRating v-model="value" show-label />`,
  }),
}

export const Half: Story = {
  render: () => ({
    components: { UidRating },
    setup: () => ({ value: ref(3.5) }),
    template: `<UidRating v-model="value" allow-half show-label />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidRating },
    setup: () => ({ a: ref(4), b: ref(4), c: ref(4) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <UidRating v-model="a" size="sm" />
        <UidRating v-model="b" size="md" />
        <UidRating v-model="c" size="lg" />
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { UidRating },
    setup: () => ({ v: ref(4) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:8px">
        <UidRating v-model="v" tone="warning" show-label />
        <UidRating v-model="v" tone="primary" show-label />
        <UidRating v-model="v" tone="success" show-label />
        <UidRating v-model="v" tone="danger" show-label />
      </div>
    `,
  }),
}

export const Readonly: Story = {
  render: () => ({
    components: { UidRating },
    template: `<UidRating :model-value="4.5" allow-half readonly show-label />`,
  }),
}

export const CustomIcon: Story = {
  render: () => ({
    components: { UidRating },
    setup: () => ({ v: ref(3), Heart, Smile }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <UidRating v-model="v" :icon="Heart" tone="danger" />
        <UidRating v-model="v" :icon="Smile" tone="primary" />
      </div>
    `,
  }),
}

export const Max10: Story = {
  render: () => ({
    components: { UidRating },
    setup: () => ({ v: ref(7) }),
    template: `<UidRating v-model="v" :max="10" show-label />`,
  }),
}
