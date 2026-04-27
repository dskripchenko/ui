import type { Meta, StoryObj } from '@storybook/vue3'
import UidAvatar from './UidAvatar.vue'
import UidAvatarGroup from './UidAvatarGroup.vue'

const meta: Meta<typeof UidAvatar> = {
  title: 'Data Display/Avatar',
  component: UidAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'square'] },
  },
}
export default meta

type Story = StoryObj<typeof UidAvatar>

export const Default: Story = {
  args: { name: 'Иван Петров', size: 'md' },
  render: (args: Record<string, unknown>) => ({
    components: { UidAvatar },
    setup: () => ({ args }),
    template: `<UidAvatar v-bind="args" />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidAvatar },
    template: `
      <div style="display:flex;gap:16px;align-items:center">
        <UidAvatar name="АБ" size="xs" />
        <UidAvatar name="АБ" size="sm" />
        <UidAvatar name="АБ" size="md" />
        <UidAvatar name="АБ" size="lg" />
        <UidAvatar name="АБ" size="xl" />
      </div>
    `,
  }),
}

export const Initials: Story = {
  render: () => ({
    components: { UidAvatar },
    template: `
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <UidAvatar name="Иван Петров" />
        <UidAvatar name="Мария" />
        <UidAvatar name="Дмитрий Кузнецов" />
        <UidAvatar name="Анна Сидорова" />
        <UidAvatar name="Павел Орлов" />
      </div>
    `,
  }),
}

export const Group: Story = {
  render: () => ({
    components: { UidAvatar, UidAvatarGroup },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <UidAvatarGroup>
          <UidAvatar name="Иван Петров" />
          <UidAvatar name="Мария Иванова" />
          <UidAvatar name="Дмитрий Кузнецов" />
        </UidAvatarGroup>
        <UidAvatarGroup :max="3">
          <UidAvatar name="Иван Петров" />
          <UidAvatar name="Мария Иванова" />
          <UidAvatar name="Дмитрий Кузнецов" />
          <UidAvatar name="Анна Сидорова" />
          <UidAvatar name="Павел Орлов" />
        </UidAvatarGroup>
      </div>
    `,
  }),
}
