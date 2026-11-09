import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidCodeInput from './UidCodeInput.vue'

const meta: Meta<typeof UidCodeInput> = {
  title: 'Inputs/CodeInput',
  component: UidCodeInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Поле одноразового кода из отдельных ячеек: ввод с переходом к следующей ячейке, Backspace назад, стрелки, вставка и автозаполнение всего кода, событие complete. Режимы numeric и alphanumeric.',
      },
    },
  },
  argTypes: {
    length: { control: { type: 'number', min: 2, max: 10 } },
    mode: { control: 'select', options: ['numeric', 'alphanumeric'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidCodeInput>

export const Default: Story = {
  args: { length: 6, mode: 'numeric', size: 'md', disabled: false, invalid: false },
  render: (args) => ({
    components: { UidCodeInput },
    setup: () => ({ args, code: ref(''), done: ref('') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:center;color:var(--uid-text-secondary);font-size:14px">
        <UidCodeInput v-bind="args" v-model="code" @complete="done = $event" />
        <span>value: "{{ code }}"<template v-if="done"> · complete: {{ done }}</template></span>
      </div>`,
  }),
}

export const Verify: Story = {
  render: () => ({
    components: { UidCodeInput },
    setup: () => {
      const code = ref('')
      const invalid = ref(false)
      const field = ref<InstanceType<typeof UidCodeInput> | null>(null)
      function check(value: string): void {
        // A stand-in for a server call: only 123456 passes.
        invalid.value = value !== '123456'
        if (invalid.value) {
          field.value?.clear()
          field.value?.focus()
        }
      }
      return { code, invalid, field, check }
    },
    template: `
      <form style="display:flex;flex-direction:column;gap:12px;align-items:center;color:var(--uid-text-primary);font-size:14px" @submit.prevent>
        <span>Enter the 6-digit code from your authenticator app</span>
        <UidCodeInput ref="field" v-model="code" name="code" autofocus :invalid="invalid" @complete="check" @update:model-value="invalid = false" />
        <span :style="{ color: invalid ? 'var(--uid-danger)' : 'var(--uid-text-secondary)' }">
          {{ invalid ? 'The code is not right. Try again.' : 'Try 123456.' }}
        </span>
      </form>`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { UidCodeInput },
    setup: () => ({ sm: ref('12'), md: ref('12'), lg: ref('12') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:20px">
        <UidCodeInput v-model="sm" size="sm" />
        <UidCodeInput v-model="md" size="md" />
        <UidCodeInput v-model="lg" size="lg" />
      </div>`,
  }),
}

export const Alphanumeric: Story = {
  render: () => ({
    components: { UidCodeInput },
    setup: () => ({ code: ref('') }),
    template: `<UidCodeInput v-model="code" mode="alphanumeric" :length="8" label="Recovery code" />`,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidCodeInput },
    template: `
      <div style="display:flex;flex-direction:column;gap:20px">
        <UidCodeInput model-value="482" invalid />
        <UidCodeInput model-value="4821" disabled />
      </div>`,
  }),
}

export const DarkTheme: Story = {
  ...Verify,
  globals: { theme: 'dark' },
}
