import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidTimePicker from './UidTimePicker.vue'

const meta: Meta<typeof UidTimePicker> = {
  title: 'Inputs/TimePicker',
  component: UidTimePicker,
  tags: ['autodocs'],
  argTypes: {
    step: { control: { type: 'number', min: 1, max: 60 } },
    withSeconds: { control: 'boolean' },
    hour12: { control: 'boolean' },
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
  decorators: [
    () => ({ template: '<div style="padding-bottom: 320px"><story /></div>' }),
  ],
}
export default meta

type Story = StoryObj<typeof UidTimePicker>

export const Default: Story = {
  render: () => ({
    components: { UidTimePicker },
    setup: () => ({ time: ref<string | null>('14:30') }),
    template: `<UidTimePicker v-model="time" style="width:240px" />`,
  }),
}

export const WithSeconds: Story = {
  render: () => ({
    components: { UidTimePicker },
    setup: () => ({ time: ref<string | null>('09:15:30') }),
    template: `<UidTimePicker v-model="time" with-seconds :step="1" style="width:280px" />`,
  }),
}

export const TwelveHour: Story = {
  render: () => ({
    components: { UidTimePicker },
    setup: () => ({ time: ref<string | null>('14:00') }),
    template: `<UidTimePicker v-model="time" hour12 style="width:240px" />`,
  }),
}

export const Step15: Story = {
  render: () => ({
    components: { UidTimePicker },
    setup: () => ({ time: ref<string | null>(null) }),
    template: `<UidTimePicker v-model="time" :step="15" placeholder="Шаг 15 мин" style="width:240px" />`,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidTimePicker },
    setup: () => ({ a: ref<string | null>('10:00'), b: ref<string | null>(null) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:240px">
        <UidTimePicker v-model="a" placeholder="Default" />
        <UidTimePicker v-model="b" placeholder="Disabled" disabled />
      </div>
    `,
  }),
}
