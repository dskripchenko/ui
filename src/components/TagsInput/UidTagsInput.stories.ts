import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidTagsInput from './UidTagsInput.vue'

const meta: Meta<typeof UidTagsInput> = {
  title: 'Inputs/TagsInput',
  component: UidTagsInput,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    unique: { control: 'boolean' },
    max: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidTagsInput>

export const Default: Story = {
  render: () => ({
    components: { UidTagsInput },
    setup: () => ({
      tags: ref<string[]>(['vue', 'typescript']),
    }),
    template: `
      <UidTagsInput
        v-model="tags"
        label="Технологии"
        placeholder="Введите тег и Enter"
        hint="Можно вводить через запятую или Enter"
        style="width:380px"
      />
    `,
  }),
}

export const Emails: Story = {
  render: () => ({
    components: { UidTagsInput },
    setup: () => ({
      emails: ref<string[]>([]),
      validate: (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
    }),
    template: `
      <UidTagsInput
        v-model="emails"
        label="Получатели"
        placeholder="Введите email"
        :validate="validate"
        hint="Только корректные email-адреса"
        style="width:380px"
      />
    `,
  }),
}

export const WithMax: Story = {
  render: () => ({
    components: { UidTagsInput },
    setup: () => ({ tags: ref<string[]>(['a', 'b']) }),
    template: `
      <UidTagsInput
        v-model="tags"
        label="Максимум 3 тега"
        :max="3"
        placeholder="Добавить ещё..."
        style="width:380px"
      />
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidTagsInput },
    setup: () => ({
      a: ref(['vue']),
      b: ref(['vue', 'react']),
      c: ref(['vue', 'react', 'svelte']),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:380px">
        <UidTagsInput v-model="a" size="sm" label="Small" />
        <UidTagsInput v-model="b" size="md" label="Medium" />
        <UidTagsInput v-model="c" size="lg" label="Large" />
      </div>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidTagsInput },
    setup: () => ({
      a: ref(['vue']),
      b: ref(['readonly-tag']),
      c: ref([]),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:380px">
        <UidTagsInput v-model="a" label="Default" placeholder="Тег..." />
        <UidTagsInput v-model="b" label="Disabled" disabled />
        <UidTagsInput v-model="c" label="Error" error="Минимум 1 тег" placeholder="Введите тег" />
      </div>
    `,
  }),
}
