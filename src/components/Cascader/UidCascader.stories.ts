import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidCascader from './UidCascader.vue'
import type { CascaderOption, CascaderValue } from './UidCascader.vue'

const meta: Meta<typeof UidCascader> = {
  title: 'Inputs/Cascader',
  component: UidCascader,
  tags: ['autodocs'],
  argTypes: {
    expandTrigger: { control: 'select', options: ['click', 'hover'] },
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
  decorators: [
    () => ({ template: '<div style="padding-bottom: 360px"><story /></div>' }),
  ],
}
export default meta

type Story = StoryObj<typeof UidCascader>

const geo: CascaderOption[] = [
  {
    value: 'ru', label: 'Россия', children: [
      {
        value: 'msk', label: 'Москва', children: [
          { value: 'tverskoy', label: 'Тверской' },
          { value: 'arbat', label: 'Арбат' },
          { value: 'presnenskiy', label: 'Пресненский' },
        ],
      },
      {
        value: 'spb', label: 'Санкт-Петербург', children: [
          { value: 'central', label: 'Центральный' },
          { value: 'admir', label: 'Адмиралтейский' },
        ],
      },
      {
        value: 'nsk', label: 'Новосибирск', children: [
          { value: 'tsentral', label: 'Центральный' },
        ],
      },
    ],
  },
  {
    value: 'us', label: 'США', children: [
      {
        value: 'ny', label: 'Нью-Йорк', children: [
          { value: 'manh', label: 'Манхэттен' },
          { value: 'broo', label: 'Бруклин' },
        ],
      },
      {
        value: 'sf', label: 'Сан-Франциско', children: [
          { value: 'soma', label: 'SoMa' },
        ],
      },
    ],
  },
]

export const Default: Story = {
  render: () => ({
    components: { UidCascader },
    setup: () => ({ geo, value: ref<CascaderValue[]>([]) }),
    template: `
      <UidCascader
        v-model="value"
        :options="geo"
        label="Адрес"
        placeholder="Выберите страну → город → район"
        style="width:340px"
      />
    `,
  }),
}

export const Preselected: Story = {
  render: () => ({
    components: { UidCascader },
    setup: () => ({ geo, value: ref<CascaderValue[]>(['ru', 'msk', 'arbat']) }),
    template: `
      <UidCascader
        v-model="value"
        :options="geo"
        label="Адрес"
        style="width:340px"
      />
    `,
  }),
}

export const HoverExpand: Story = {
  render: () => ({
    components: { UidCascader },
    setup: () => ({ geo, value: ref<CascaderValue[]>([]) }),
    template: `
      <UidCascader
        v-model="value"
        :options="geo"
        expand-trigger="hover"
        placeholder="Hover для раскрытия"
        style="width:340px"
      />
    `,
  }),
}

export const Categories: Story = {
  render: () => ({
    components: { UidCascader },
    setup: () => {
      const cats: CascaderOption[] = [
        {
          value: 'electronics', label: 'Электроника', children: [
            { value: 'phones', label: 'Телефоны', children: [
              { value: 'iphone', label: 'iPhone' },
              { value: 'pixel', label: 'Pixel' },
            ] },
            { value: 'laptops', label: 'Ноутбуки' },
          ],
        },
        {
          value: 'clothing', label: 'Одежда', children: [
            { value: 'mens', label: 'Мужская' },
            { value: 'womens', label: 'Женская' },
          ],
        },
      ]
      return { cats, value: ref<CascaderValue[]>([]) }
    },
    template: `
      <UidCascader
        v-model="value"
        :options="cats"
        label="Категория"
        separator=" › "
        style="width:380px"
      />
    `,
  }),
}
