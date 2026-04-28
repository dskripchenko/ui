import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidCombobox from './UidCombobox.vue'

const meta: Meta<typeof UidCombobox> = {
  title: 'Inputs/Combobox',
  component: UidCombobox,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
    allowCreate: { control: 'boolean' },
  },
  decorators: [
    () => ({ template: '<div style="padding-bottom: 320px"><story /></div>' }),
  ],
}
export default meta

type Story = StoryObj<typeof UidCombobox>

const frameworks = [
  { value: 'vue', label: 'Vue', hint: 'Progressive' },
  { value: 'react', label: 'React', hint: 'Library' },
  { value: 'svelte', label: 'Svelte', hint: 'Compiler' },
  { value: 'angular', label: 'Angular', hint: 'Framework' },
  { value: 'solid', label: 'Solid', hint: 'Reactive' },
  { value: 'qwik', label: 'Qwik', hint: 'Resumable' },
  { value: 'preact', label: 'Preact', hint: '3kb' },
]

export const Default: Story = {
  render: () => ({
    components: { UidCombobox },
    setup: () => ({
      value: ref<string | number | null>(null),
      options: frameworks,
    }),
    template: `
      <UidCombobox
        v-model="value"
        :options="options"
        label="Фреймворк"
        placeholder="Найти..."
        style="width:320px"
      />
    `,
  }),
}

export const AllowCreate: Story = {
  render: () => ({
    components: { UidCombobox },
    setup: () => {
      const tags = ref([
        { value: 'urgent', label: 'Срочно' },
        { value: 'bug', label: 'Bug' },
      ])
      const value = ref<string | number | null>(null)
      function onCreate(label: string): void {
        const v = label.toLowerCase()
        tags.value = [...tags.value, { value: v, label }]
        value.value = v
      }
      return { tags, value, onCreate }
    },
    template: `
      <UidCombobox
        v-model="value"
        :options="tags"
        label="Тег"
        placeholder="Введите или создайте"
        allow-create
        @create="onCreate"
        style="width:320px"
      />
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidCombobox },
    setup: () => ({
      a: ref<string | number | null>(null),
      b: ref<string | number | null>('vue'),
      c: ref<string | number | null>(null),
      options: frameworks,
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidCombobox v-model="a" :options="options" label="Default" />
        <UidCombobox v-model="b" :options="options" label="Disabled" disabled />
        <UidCombobox v-model="c" :options="options" label="Error" error="Поле обязательно" required />
      </div>
    `,
  }),
}
