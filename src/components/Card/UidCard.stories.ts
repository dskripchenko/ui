import type { Meta, StoryObj } from '@storybook/vue3'
import UidCard from './UidCard.vue'

const meta: Meta<typeof UidCard> = {
  title: 'Data Display/Card',
  component: UidCard,
  tags: ['autodocs'],
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    clickable: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidCard>

export const Default: Story = {
  render: () => ({
    components: { UidCard },
    template: `
      <UidCard style="width:320px">
        <template #header>Заголовок карточки</template>
        <p style="margin:0;color:var(--uid-color-text-secondary)">
          Это содержимое карточки. Здесь может быть любой контент.
        </p>
        <template #footer>
          <button style="padding:6px 14px;cursor:pointer">Действие</button>
        </template>
      </UidCard>
    `,
  }),
}

export const WithMedia: Story = {
  render: () => ({
    components: { UidCard },
    template: `
      <UidCard style="width:320px">
        <template #media>
          <div style="height:180px;background:var(--uid-color-surface-raised);display:flex;align-items:center;justify-content:center;color:var(--uid-color-text-disabled)">
            Изображение
          </div>
        </template>
        <template #header>Статья</template>
        <p style="margin:0;font-size:14px;color:var(--uid-color-text-secondary)">
          Краткое описание статьи или продукта.
        </p>
        <template #footer>
          <span style="font-size:12px;color:var(--uid-color-text-disabled)">14 апреля 2025</span>
        </template>
      </UidCard>
    `,
  }),
}

export const Clickable: Story = {
  render: () => ({
    components: { UidCard },
    template: `
      <div style="display:flex;gap:16px">
        <UidCard style="width:220px" :clickable="true" tabindex="0">
          <template #header>Интерактивная</template>
          <p style="margin:0;font-size:14px;color:var(--uid-color-text-secondary)">
            Наведи, чтобы увидеть hover-эффект.
          </p>
        </UidCard>
        <UidCard style="width:220px" :clickable="true" tabindex="0">
          <template #header>Ещё одна</template>
          <p style="margin:0;font-size:14px;color:var(--uid-color-text-secondary)">
            Второй вариант.
          </p>
        </UidCard>
      </div>
    `,
  }),
}
