import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidAccordion from './UidAccordion.vue'
import UidAccordionItem from './UidAccordionItem.vue'

const meta: Meta<typeof UidAccordion> = {
  title: 'Data Display/Accordion',
  component: UidAccordion,
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidAccordion>

export const Default: Story = {
  render: () => ({
    components: { UidAccordion, UidAccordionItem },
    setup: () => ({ open: ref('') }),
    template: `
      <UidAccordion v-model="open" style="max-width:600px">
        <UidAccordionItem value="what" title="Что такое Vue 3?">
          Vue 3 — прогрессивный JavaScript-фреймворк для создания пользовательских интерфейсов.
        </UidAccordionItem>
        <UidAccordionItem value="composables" title="Что такое composables?">
          Composables — это функции, использующие Composition API для инкапсуляции и переиспользования логики с состоянием.
        </UidAccordionItem>
        <UidAccordionItem value="why" title="Почему стоит выбрать Vue?">
          Vue сочетает простоту, производительность и богатую экосистему.
        </UidAccordionItem>
      </UidAccordion>
    `,
  }),
}

export const Multiple: Story = {
  render: () => ({
    components: { UidAccordion, UidAccordionItem },
    setup: () => ({ open: ref<string[]>([]) }),
    template: `
      <UidAccordion v-model="open" :multiple="true" style="max-width:600px">
        <UidAccordionItem value="one" title="Первый раздел">
          Содержимое первого раздела.
        </UidAccordionItem>
        <UidAccordionItem value="two" title="Второй раздел">
          Содержимое второго раздела.
        </UidAccordionItem>
        <UidAccordionItem value="three" title="Третий раздел">
          Содержимое третьего раздела.
        </UidAccordionItem>
      </UidAccordion>
    `,
  }),
}

export const WithDisabled: Story = {
  render: () => ({
    components: { UidAccordion, UidAccordionItem },
    setup: () => ({ open: ref('') }),
    template: `
      <UidAccordion v-model="open" style="max-width:600px">
        <UidAccordionItem value="active" title="Активный раздел">
          Этот раздел можно открыть.
        </UidAccordionItem>
        <UidAccordionItem value="disabled" title="Недоступный раздел" :disabled="true">
          Это содержимое недоступно.
        </UidAccordionItem>
      </UidAccordion>
    `,
  }),
}
