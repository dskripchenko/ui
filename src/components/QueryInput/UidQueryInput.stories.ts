import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import UidQueryInput from './UidQueryInput.vue'
import type { UidCodeToken } from '../Code/index.js'

const meta: Meta<typeof UidQueryInput> = {
  title: 'Inputs/QueryInput',
  component: UidQueryInput,
  tags: ['autodocs'],
  argTypes: { disabled: { control: 'boolean' } },
}
export default meta

type Story = StoryObj<typeof UidQueryInput>

const FIELDS = ['status', 'assignee', 'priority', 'project']
const KEYWORDS = ['and', 'or', 'not', 'in', 'order', 'by', 'asc', 'desc']

// A toy language: fields, keywords, operators, quoted strings, functions.
function tokenize(text: string): UidCodeToken[] {
  return (text.match(/"[^"]*"?|\w+\(\)|[=!<>~]+|\s+|[^\s"=!<>~]+/g) ?? []).map((part) => ({
    type: part.startsWith('"') ? 'string'
      : part.endsWith('()') ? 'function'
        : /^[=!<>~]+$/.test(part) ? 'operator'
          : FIELDS.includes(part.toLowerCase()) ? 'property'
            : KEYWORDS.includes(part.toLowerCase()) ? 'keyword'
              : 'plain',
    text: part,
  }))
}

function suggest(text: string, caret: number) {
  const from = text.slice(0, caret).search(/\S*$/)
  const typed = text.slice(from, caret).toLowerCase()
  const options = [...FIELDS, 'AND', 'OR', 'ORDER BY']
    .filter((word) => word.toLowerCase().startsWith(typed))
    .map((value) => ({ value, hint: FIELDS.includes(value) ? 'field' : 'keyword' }))
  return { from, to: caret, options }
}

export const Default: Story = {
  render: () => ({
    components: { UidQueryInput },
    setup: () => {
      const value = ref('status = done AND assignee in (me(), "Ann Lee") ORDER BY priority DESC')
      return { value, tokenize, suggest }
    },
    template: `
      <UidQueryInput v-model="value" prefix="QL" :tokenize="tokenize" :suggest="suggest" aria-label="Query">
        <template #suffix><span style="color: var(--uid-success)">✓ 128</span></template>
      </UidQueryInput>
    `,
  }),
}

export const WithError: Story = {
  render: () => ({
    components: { UidQueryInput },
    setup: () => {
      const value = ref('colour = red')
      const error = computed(() => (value.value.startsWith('colour') ? { position: 0, length: 6, message: 'There is no field "colour"' } : null))
      return { value, error, tokenize }
    },
    template: `
      <UidQueryInput v-model="value" :tokenize="tokenize" :error="error" aria-label="Query">
        <template #suffix><span style="color: var(--uid-danger)">{{ error ? error.message : '' }}</span></template>
      </UidQueryInput>
    `,
  }),
}
