import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidTag from './UidTag.vue'

const meta: Meta<typeof UidTag> = {
  title: 'Data Display/Tag',
  component: UidTag,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'info', 'success', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'md'] },
    dismissible: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidTag>

export const Default: Story = {
  args: { variant: 'default' },
  render: (args: Record<string, unknown>) => ({
    components: { UidTag },
    setup: () => ({ args }),
    template: `<UidTag v-bind="args">Метка</UidTag>`,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UidTag },
    template: `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <UidTag variant="default">Дефолт</UidTag>
        <UidTag variant="info">Информация</UidTag>
        <UidTag variant="success">Успех</UidTag>
        <UidTag variant="warning">Внимание</UidTag>
        <UidTag variant="danger">Ошибка</UidTag>
      </div>
    `,
  }),
}

export const Dismissible: Story = {
  render: () => ({
    components: { UidTag },
    setup: () => ({
      tags: ref(['Vue', 'TypeScript', 'Vite', 'Storybook']),
      remove: (tags: string[], tag: string) => tags.splice(tags.indexOf(tag), 1),
    }),
    template: `
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <UidTag
          v-for="tag in tags"
          :key="tag"
          variant="info"
          :dismissible="true"
          @dismiss="remove(tags, tag)"
        >
          {{ tag }}
        </UidTag>
      </div>
    `,
  }),
}
