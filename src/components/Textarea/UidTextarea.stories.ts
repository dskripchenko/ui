import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidTextarea from './UidTextarea.vue'

const meta: Meta<typeof UidTextarea> = {
  title: 'Inputs/Textarea',
  component: UidTextarea,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    resize: { control: 'select', options: ['none', 'vertical', 'horizontal', 'both'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    autoGrow: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidTextarea>

export const Default: Story = {
  args: { label: 'Комментарий', placeholder: 'Введите текст...' },
}

export const Playground: Story = {
  args: {
    label: 'Лейбл',
    placeholder: 'Введите текст...',
    hint: 'Подсказка под полем',
    rows: 4,
  },
  render: (args: Record<string, unknown>) => ({
    components: { UidTextarea },
    setup: () => ({ args, value: ref('') }),
    template: `<UidTextarea v-bind="args" v-model="value" style="width:320px" />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidTextarea },
    setup: () => ({ sm: ref(''), md: ref(''), lg: ref('') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidTextarea v-model="sm" size="sm" label="Small" placeholder="size=sm" />
        <UidTextarea v-model="md" size="md" label="Medium" placeholder="size=md" />
        <UidTextarea v-model="lg" size="lg" label="Large" placeholder="size=lg" />
      </div>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidTextarea },
    setup: () => ({ v: ref('') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidTextarea v-model="v" label="Default" placeholder="Обычное поле" />
        <UidTextarea v-model="v" label="Disabled" placeholder="Недоступно" disabled />
        <UidTextarea v-model="v" label="Readonly" model-value="Только чтение" readonly />
        <UidTextarea v-model="v" label="Error" error="Это поле обязательно" placeholder="Ошибка" />
        <UidTextarea v-model="v" label="Required" placeholder="Обязательное" required hint="Обязательное поле" />
      </div>
    `,
  }),
}

export const AutoGrow: Story = {
  render: () => ({
    components: { UidTextarea },
    setup: () => ({ v: ref('') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <UidTextarea
          v-model="v"
          label="Авто-высота"
          placeholder="Начните печатать..."
          :auto-grow="true"
          :max-rows="6"
          hint="Высота подстраивается под контент (макс. 6 строк)"
        />
      </div>
    `,
  }),
}

export const WithValidation: Story = {
  render: () => ({
    components: { UidTextarea },
    setup: () => ({ bio: ref('') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <p style="font-size:13px;color:var(--uid-text-secondary)">Нажмите Tab, чтобы увидеть валидацию</p>
        <UidTextarea
          v-model="bio"
          label="О себе"
          placeholder="Минимум 20 символов..."
          rules="required|min:20"
          :rows="4"
          required
        />
      </div>
    `,
  }),
}
