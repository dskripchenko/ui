import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { Search, Mail, Lock, Eye } from 'lucide-vue-next'
import UidInput from './UidInput.vue'
import UidIcon from '../../icons/UidIcon.vue'

const meta: Meta<typeof UidInput> = {
  title: 'Inputs/Input',
  component: UidInput,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'search', 'url'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidInput>

export const Default: Story = {
  args: { label: 'Email', placeholder: 'you@example.com', type: 'email' },
}

export const Playground: Story = {
  args: {
    label: 'Лейбл',
    placeholder: 'Введите значение...',
    hint: 'Подсказка под полем',
    size: 'md',
  },
  render: (args: Record<string, unknown>) => ({
    components: { UidInput },
    setup: () => ({ args, value: ref('') }),
    template: `<UidInput v-bind="args" v-model="value" style="width:320px" />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidInput },
    setup: () => ({ sm: ref(''), md: ref(''), lg: ref('') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidInput v-model="sm" size="sm" label="Small" placeholder="size=sm" />
        <UidInput v-model="md" size="md" label="Medium" placeholder="size=md" />
        <UidInput v-model="lg" size="lg" label="Large" placeholder="size=lg" />
      </div>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidInput },
    setup: () => ({ v: ref('') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidInput v-model="v" label="Default" placeholder="Обычное поле" />
        <UidInput v-model="v" label="Disabled" placeholder="Недоступно" disabled />
        <UidInput v-model="v" label="Readonly" value="Только чтение" readonly />
        <UidInput v-model="v" label="Error" error="Это поле обязательно" placeholder="Ошибка" />
        <UidInput v-model="v" label="Required" placeholder="Обязательное" required hint="Обязательное поле" />
      </div>
    `,
  }),
}

export const WithIcons: Story = {
  render: () => ({
    components: { UidInput, UidIcon },
    setup: () => ({ email: ref(''), password: ref(''), search: ref(''), Mail, Lock, Eye, Search }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidInput v-model="email" label="Email" type="email" placeholder="you@example.com">
          <template #prepend><UidIcon :icon="Mail" :size="16" /></template>
        </UidInput>
        <UidInput v-model="password" label="Пароль" type="password" placeholder="••••••••">
          <template #prepend><UidIcon :icon="Lock" :size="16" /></template>
          <template #append><UidIcon :icon="Eye" :size="16" /></template>
        </UidInput>
        <UidInput v-model="search" type="search" placeholder="Поиск...">
          <template #prepend><UidIcon :icon="Search" :size="16" /></template>
        </UidInput>
      </div>
    `,
  }),
}

export const WithValidation: Story = {
  render: () => ({
    components: { UidInput },
    setup: () => ({
      email: ref(''),
      password: ref(''),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <p style="font-size:13px;color:var(--uid-text-secondary)">Нажмите Tab, чтобы выйти из поля и увидеть валидацию</p>
        <UidInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          rules="required|email"
          required
        />
        <UidInput
          v-model="password"
          label="Пароль"
          type="password"
          placeholder="Минимум 8 символов"
          rules="required|min:8"
          required
        />
      </div>
    `,
  }),
}
