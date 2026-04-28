import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidCarousel from './UidCarousel.vue'

const meta: Meta<typeof UidCarousel> = {
  title: 'Data Display/Carousel',
  component: UidCarousel,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['horizontal', 'vertical'] },
    loop: { control: 'boolean' },
    autoplay: { control: 'number' },
    showArrows: { control: 'boolean' },
    showIndicators: { control: 'boolean' },
    pauseOnHover: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidCarousel>

const slides = [
  { title: 'Свежие фичи', desc: 'Узнай, что нового в обновлении 0.5', color: '#3b82f6' },
  { title: 'Темы', desc: 'Light, dark и кастомные темы из коробки', color: '#10b981' },
  { title: '60+ компонентов', desc: 'Готовы к продакшену', color: '#f59e0b' },
  { title: 'TypeScript', desc: 'Полная типизация и tree-shaking', color: '#ef4444' },
]

export const Default: Story = {
  render: () => ({
    components: { UidCarousel },
    setup: () => ({ slides, current: ref(0) }),
    template: `
      <UidCarousel
        :items="slides"
        v-model="current"
        style="width:520px;height:240px"
      >
        <template #default="{ item }">
          <div :style="{ background: item.color, height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px', color: 'white' }">
            <h3 style="margin:0 0 8px;font-size:24px">{{ item.title }}</h3>
            <p style="margin:0;font-size:15px;opacity:0.9">{{ item.desc }}</p>
          </div>
        </template>
      </UidCarousel>
    `,
  }),
}

export const Autoplay: Story = {
  render: () => ({
    components: { UidCarousel },
    setup: () => ({ slides, current: ref(0) }),
    template: `
      <UidCarousel
        :items="slides"
        v-model="current"
        :autoplay="2500"
        style="width:520px;height:240px"
      >
        <template #default="{ item }">
          <div :style="{ background: item.color, height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 600 }">
            {{ item.title }}
          </div>
        </template>
      </UidCarousel>
    `,
  }),
}

export const NoLoop: Story = {
  render: () => ({
    components: { UidCarousel },
    setup: () => ({ slides, current: ref(0) }),
    template: `
      <UidCarousel
        :items="slides"
        v-model="current"
        :loop="false"
        style="width:520px;height:240px"
      >
        <template #default="{ item }">
          <div :style="{ background: item.color, height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }">
            {{ item.title }}
          </div>
        </template>
      </UidCarousel>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { UidCarousel },
    setup: () => ({ slides, current: ref(0) }),
    template: `
      <UidCarousel
        :items="slides"
        v-model="current"
        direction="vertical"
        style="width:340px;height:280px"
      >
        <template #default="{ item }">
          <div :style="{ background: item.color, height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }">
            {{ item.title }}
          </div>
        </template>
      </UidCarousel>
    `,
  }),
}

export const Minimal: Story = {
  render: () => ({
    components: { UidCarousel },
    setup: () => ({ slides, current: ref(0) }),
    template: `
      <UidCarousel
        :items="slides"
        v-model="current"
        :show-arrows="false"
        :show-indicators="false"
        :autoplay="2000"
        style="width:520px;height:160px"
      >
        <template #default="{ item }">
          <div :style="{ background: item.color, height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: 500 }">
            {{ item.title }}
          </div>
        </template>
      </UidCarousel>
    `,
  }),
}
