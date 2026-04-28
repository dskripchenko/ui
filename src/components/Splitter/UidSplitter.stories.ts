import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidSplitter from './UidSplitter.vue'

const meta: Meta<typeof UidSplitter> = {
  title: 'Layout/Splitter',
  component: UidSplitter,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidSplitter>

const paneStyle = 'padding: 16px; height: 100%; box-sizing: border-box;'
const containerStyle =
  'height: 320px; border: 1px solid var(--uid-color-border); border-radius: 8px; overflow: hidden;'

export const Horizontal: Story = {
  render: () => ({
    components: { UidSplitter },
    setup: () => ({ size: ref(35), paneStyle, containerStyle }),
    template: `
      <div :style="containerStyle">
        <UidSplitter v-model="size">
          <template #start>
            <div :style="paneStyle + 'background: var(--uid-color-bg-subtle)'">
              <h4 style="margin:0 0 8px">Левая</h4>
              <p style="margin:0;color:var(--uid-color-text-secondary)">{{ size.toFixed(0) }}%</p>
            </div>
          </template>
          <template #end>
            <div :style="paneStyle">
              <h4 style="margin:0 0 8px">Правая</h4>
              <p style="margin:0;color:var(--uid-color-text-secondary)">Перетащите делитель</p>
            </div>
          </template>
        </UidSplitter>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { UidSplitter },
    setup: () => ({ size: ref(40), paneStyle, containerStyle }),
    template: `
      <div :style="containerStyle">
        <UidSplitter v-model="size" direction="vertical">
          <template #start>
            <div :style="paneStyle + 'background: var(--uid-color-bg-subtle)'">
              <h4 style="margin:0 0 8px">Верхняя</h4>
              <p style="margin:0;color:var(--uid-color-text-secondary)">{{ size.toFixed(0) }}%</p>
            </div>
          </template>
          <template #end>
            <div :style="paneStyle">
              <h4 style="margin:0 0 8px">Нижняя</h4>
              <p style="margin:0;color:var(--uid-color-text-secondary)">Перетащите делитель</p>
            </div>
          </template>
        </UidSplitter>
      </div>
    `,
  }),
}

export const Nested: Story = {
  render: () => ({
    components: { UidSplitter },
    setup: () => ({
      outerSize: ref(30),
      innerSize: ref(50),
      paneStyle,
      containerStyle,
    }),
    template: `
      <div :style="containerStyle">
        <UidSplitter v-model="outerSize">
          <template #start>
            <div :style="paneStyle + 'background: var(--uid-color-bg-subtle)'">
              <h4 style="margin:0 0 8px">Сайдбар</h4>
              <p style="margin:0;color:var(--uid-color-text-secondary)">{{ outerSize.toFixed(0) }}%</p>
            </div>
          </template>
          <template #end>
            <UidSplitter v-model="innerSize" direction="vertical">
              <template #start>
                <div :style="paneStyle">
                  <h4 style="margin:0">Редактор</h4>
                </div>
              </template>
              <template #end>
                <div :style="paneStyle + 'background: var(--uid-color-bg-subtle)'">
                  <h4 style="margin:0">Терминал</h4>
                </div>
              </template>
            </UidSplitter>
          </template>
        </UidSplitter>
      </div>
    `,
  }),
}

export const WithLimits: Story = {
  render: () => ({
    components: { UidSplitter },
    setup: () => ({ size: ref(50), paneStyle, containerStyle }),
    template: `
      <div :style="containerStyle">
        <UidSplitter v-model="size" :min="25" :max="75">
          <template #start>
            <div :style="paneStyle + 'background: var(--uid-color-bg-subtle)'">
              25%–75% диапазон<br />
              {{ size.toFixed(0) }}%
            </div>
          </template>
          <template #end>
            <div :style="paneStyle">Без выхода за границы</div>
          </template>
        </UidSplitter>
      </div>
    `,
  }),
}
