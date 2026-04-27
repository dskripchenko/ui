import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidSelect from './UidSelect.vue'
import type { SelectOption } from './UidSelect.vue'

const meta: Meta<typeof UidSelect> = {
  title: 'Components/Select',
  component: UidSelect,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="padding-bottom: 320px"><story /></div>' })],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    searchable: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof UidSelect>

const countries: SelectOption[] = [
  { value: 'ru', label: 'Россия' },
  { value: 'us', label: 'США' },
  { value: 'gb', label: 'Великобритания', group: 'Европа' },
  { value: 'de', label: 'Германия', group: 'Европа' },
  { value: 'fr', label: 'Франция', group: 'Европа' },
  { value: 'jp', label: 'Япония', group: 'Азия' },
  { value: 'cn', label: 'Китай', group: 'Азия' },
  { value: 'kr', label: 'Южная Корея', group: 'Азия', disabled: true },
]

export const Default: Story = {
  render: (args) => ({
    components: { UidSelect },
    setup: () => ({ args, value: ref(null) }),
    template: `<UidSelect v-bind="args" v-model="value" style="max-width: 280px;" />`,
  }),
  args: { options: countries, placeholder: 'Выберите страну' },
}

export const WithValue: Story = {
  render: (args) => ({
    components: { UidSelect },
    setup: () => ({ args, value: ref('de') }),
    template: `<UidSelect v-bind="args" v-model="value" style="max-width: 280px;" />`,
  }),
  args: { options: countries, clearable: true },
}

export const Searchable: Story = {
  render: (args) => ({
    components: { UidSelect },
    setup: () => ({ args, value: ref(null) }),
    template: `<UidSelect v-bind="args" v-model="value" style="max-width: 280px;" />`,
  }),
  args: { options: countries, searchable: true, placeholder: 'Поиск страны...' },
}

export const Sizes: Story = {
  render: () => ({
    components: { UidSelect },
    setup: () => ({
      options: [{ value: '1', label: 'Первый' }, { value: '2', label: 'Второй' }],
      sm: ref(null), md: ref(null), lg: ref(null),
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 280px;">
        <UidSelect v-model="sm" :options="options" size="sm" placeholder="Малый (sm)" />
        <UidSelect v-model="md" :options="options" size="md" placeholder="Средний (md)" />
        <UidSelect v-model="lg" :options="options" size="lg" placeholder="Большой (lg)" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { UidSelect },
    setup: () => ({ args, value: ref('ru') }),
    template: `<UidSelect v-bind="args" v-model="value" style="max-width: 280px;" />`,
  }),
  args: { options: countries, disabled: true },
}
