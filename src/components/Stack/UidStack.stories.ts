import type { Meta, StoryObj } from '@storybook/vue3'
import UidStack from './UidStack.vue'

const meta: Meta<typeof UidStack> = {
  title: 'Layout/Stack',
  component: UidStack,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between', 'around', 'evenly'] },
    wrap: { control: 'boolean' },
    inline: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidStack>

const Box = { template: '<div style="padding:12px 20px;background:var(--uid-color-surface-raised);border:1px solid var(--uid-color-border);border-radius:4px;font-size:13px"><slot /></div>', slots: ['default'] }

export const Column: Story = {
  render: () => ({
    components: { UidStack, Box },
    template: `
      <UidStack direction="column" gap="var(--uid-space-3)" style="width:240px">
        <Box>Элемент 1</Box>
        <Box>Элемент 2</Box>
        <Box>Элемент 3</Box>
      </UidStack>
    `,
  }),
}

export const Row: Story = {
  render: () => ({
    components: { UidStack, Box },
    template: `
      <UidStack direction="row" gap="var(--uid-space-3)" align="center">
        <Box>Элемент A</Box>
        <Box>Элемент B</Box>
        <Box>Элемент C</Box>
      </UidStack>
    `,
  }),
}

export const SpaceBetween: Story = {
  render: () => ({
    components: { UidStack, Box },
    template: `
      <UidStack direction="row" justify="between" align="center" style="width:500px">
        <Box>Слева</Box>
        <Box>По центру</Box>
        <Box>Справа</Box>
      </UidStack>
    `,
  }),
}

export const Wrap: Story = {
  render: () => ({
    components: { UidStack, Box },
    template: `
      <UidStack direction="row" :wrap="true" gap="var(--uid-space-2)" style="width:300px">
        <Box>Тег 1</Box>
        <Box>Тег 2</Box>
        <Box>Тег 3</Box>
        <Box>Тег 4</Box>
        <Box>Тег 5</Box>
        <Box>Тег 6</Box>
      </UidStack>
    `,
  }),
}
