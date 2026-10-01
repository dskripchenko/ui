import type { Meta, StoryObj } from '@storybook/vue3'
import UidImage from './UidImage.vue'

const SAMPLE = 'https://picsum.photos/id/1015/640/400'
const SAMPLE_LARGE = 'https://picsum.photos/id/1015/1600/1000'

const meta: Meta<typeof UidImage> = {
  title: 'Data Display/Image',
  component: UidImage,
  tags: ['autodocs'],
  argTypes: {
    fit: { control: 'select', options: ['cover', 'contain', 'fill', 'none', 'scale-down'] },
    lazy: { control: 'boolean' },
    preview: { control: 'boolean' },
    radius: { control: 'select', options: ['none', 'sm', 'md', 'lg', 'full'] },
  },
}
export default meta

type Story = StoryObj<typeof UidImage>

export const Playground: Story = {
  args: { src: SAMPLE, alt: 'Горное озеро', width: 320, height: 200, fit: 'cover', lazy: true },
  render: (args: Record<string, unknown>) => ({
    components: { UidImage },
    setup: () => ({ args }),
    template: `<UidImage v-bind="args" />`,
  }),
}

export const Fallback: Story = {
  name: 'Ошибка загрузки',
  render: () => ({
    components: { UidImage },
    setup: () => ({ SAMPLE }),
    template: `
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <UidImage src="/missing.png" alt="Нет изображения" :width="160" :height="120" />
        <UidImage src="/missing.png" :fallback-src="SAMPLE" alt="Запасное изображение" :width="160" :height="120" />
        <UidImage src="/missing.png" alt="Своя заглушка" :width="160" :height="120">
          <template #fallback><span style="font-size:12px">Фото недоступно</span></template>
        </UidImage>
      </div>
    `,
  }),
}

export const Preview: Story = {
  name: 'Просмотр по клику',
  render: () => ({
    components: { UidImage },
    setup: () => ({ SAMPLE, SAMPLE_LARGE }),
    template: `<UidImage :src="SAMPLE" :preview-src="SAMPLE_LARGE" alt="Горное озеро" preview :width="240" :height="150" />`,
  }),
}

export const Radius: Story = {
  name: 'Скругления',
  render: () => ({
    components: { UidImage },
    setup: () => ({ SAMPLE }),
    template: `
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <UidImage :src="SAMPLE" alt="none" radius="none" :width="96" :height="96" />
        <UidImage :src="SAMPLE" alt="md" radius="md" :width="96" :height="96" />
        <UidImage :src="SAMPLE" alt="lg" radius="lg" :width="96" :height="96" />
        <UidImage :src="SAMPLE" alt="full" radius="full" :width="96" :height="96" />
      </div>
    `,
  }),
}
