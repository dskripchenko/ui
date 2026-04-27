import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidProgress from './UidProgress.vue'
import UidButton from '../Button/UidButton.vue'

const meta: Meta<typeof UidProgress> = {
  title: 'Feedback/Progress',
  component: UidProgress,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'info', 'success', 'warning', 'danger'] },
    showValue: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidProgress>

export const Default: Story = {
  args: { value: 60, label: 'Загрузка файла', showValue: true },
  render: (args: Record<string, unknown>) => ({
    components: { UidProgress },
    setup: () => ({ args }),
    template: `<UidProgress v-bind="args" style="width:320px" />`,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UidProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidProgress :value="80" variant="default" label="Default" show-value />
        <UidProgress :value="65" variant="success" label="Success" show-value />
        <UidProgress :value="45" variant="warning" label="Warning" show-value />
        <UidProgress :value="30" variant="danger" label="Danger" show-value />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidProgress :value="60" size="sm" label="Small (4px)" />
        <UidProgress :value="60" size="md" label="Medium (8px)" />
        <UidProgress :value="60" size="lg" label="Large (12px)" />
      </div>
    `,
  }),
}

export const Indeterminate: Story = {
  render: () => ({
    components: { UidProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidProgress label="Загрузка..." />
        <UidProgress label="Синхронизация..." variant="success" />
        <UidProgress size="sm" />
      </div>
    `,
  }),
}

export const Animated: Story = {
  render: () => ({
    components: { UidProgress, UidButton },
    setup: () => {
      const progress = ref(0)
      let interval: ReturnType<typeof setInterval> | null = null

      function start() {
        progress.value = 0
        if (interval) clearInterval(interval)
        interval = setInterval(() => {
          progress.value += Math.random() * 8
          if (progress.value >= 100) {
            progress.value = 100
            clearInterval(interval!)
          }
        }, 150)
      }

      return { progress, start }
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:320px">
        <UidProgress :value="progress" variant="success" label="Обработка..." show-value />
        <UidButton size="sm" @click="start">Запустить</UidButton>
      </div>
    `,
  }),
}
