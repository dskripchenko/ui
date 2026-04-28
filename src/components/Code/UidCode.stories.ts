import type { Meta, StoryObj } from '@storybook/vue3'
import UidCode from './UidCode.vue'

const meta: Meta<typeof UidCode> = {
  title: 'Data Display/Code',
  component: UidCode,
  tags: ['autodocs'],
  argTypes: {
    inline: { control: 'boolean' },
    lineNumbers: { control: 'boolean' },
    copy: { control: 'boolean' },
    wrap: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidCode>

const tsExample = `interface User {
  id: number
  name: string
  email: string
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`
}

const alice: User = { id: 1, name: 'Alice', email: 'a@b.c' }
console.log(greet(alice))`

const jsonExample = `{
  "name": "@dskripchenko/ui",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs"
}`

export const Default: Story = {
  args: { code: tsExample, language: 'typescript' },
  render: (args: Record<string, unknown>) => ({
    components: { UidCode },
    setup: () => ({ args }),
    template: `<UidCode v-bind="args" style="max-width:560px" />`,
  }),
}

export const WithLineNumbers: Story = {
  render: () => ({
    components: { UidCode },
    setup: () => ({ tsExample }),
    template: `
      <UidCode
        :code="tsExample"
        language="typescript"
        line-numbers
        style="max-width:560px"
      />
    `,
  }),
}

export const Json: Story = {
  render: () => ({
    components: { UidCode },
    setup: () => ({ jsonExample }),
    template: `
      <UidCode
        :code="jsonExample"
        language="json"
        line-numbers
        style="max-width:480px"
      />
    `,
  }),
}

export const Inline: Story = {
  render: () => ({
    components: { UidCode },
    template: `
      <p style="font-size:15px;line-height:1.7;max-width:520px">
        Установи через <UidCode code="pnpm add @dskripchenko/ui" inline />,
        затем импортируй стили:
        <UidCode code="import '@dskripchenko/ui/styles/themes.css'" inline />.
      </p>
    `,
  }),
}

export const Wrap: Story = {
  render: () => ({
    components: { UidCode },
    template: `
      <UidCode
        code="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia odit officia, blanditiis, totam minus tempore quisquam quam impedit at perferendis voluptatum cum eaque animi recusandae aspernatur ipsam dolorem itaque expedita."
        language="text"
        wrap
        style="max-width:480px"
      />
    `,
  }),
}

export const MaxHeight: Story = {
  render: () => ({
    components: { UidCode },
    setup: () => ({
      long: Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join('\n'),
    }),
    template: `
      <UidCode
        :code="long"
        language="text"
        line-numbers
        max-height="240px"
        style="max-width:400px"
      />
    `,
  }),
}

export const Minimal: Story = {
  render: () => ({
    components: { UidCode },
    template: `
      <UidCode
        code="echo 'no header'"
        :copy="false"
        style="max-width:400px"
      />
    `,
  }),
}
