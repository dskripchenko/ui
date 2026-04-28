import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidAnchor, { type AnchorItem } from './UidAnchor.vue'

const meta: Meta<typeof UidAnchor> = {
  title: 'Navigation/Anchor',
  component: UidAnchor,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof UidAnchor>

const sections: AnchorItem[] = [
  { key: 'intro', href: '#intro', title: 'Введение' },
  {
    key: 'install',
    href: '#install',
    title: 'Установка',
    children: [
      { key: 'npm', href: '#npm', title: 'npm' },
      { key: 'pnpm', href: '#pnpm', title: 'pnpm' },
      { key: 'bun', href: '#bun', title: 'bun' },
    ],
  },
  { key: 'usage', href: '#usage', title: 'Использование' },
  { key: 'api', href: '#api', title: 'API' },
  { key: 'theming', href: '#theming', title: 'Темизация' },
  { key: 'license', href: '#license', title: 'Лицензия' },
]

export const Default: Story = {
  render: () => ({
    components: { UidAnchor },
    setup: () => ({ sections, current: ref('intro') }),
    template: `
      <div style="display:flex;gap:32px;align-items:flex-start">
        <UidAnchor :items="sections" v-model="current" :offset-top="80" style="position:sticky;top:80px;width:200px;flex-shrink:0" />
        <div style="flex:1">
          <section v-for="s in sections" :key="s.key" :id="s.key" style="min-height:60vh;padding:24px 0;border-bottom:1px solid var(--uid-color-border)">
            <h2 style="margin:0 0 12px">{{ s.title }}</h2>
            <p style="color:var(--uid-color-text-secondary);max-width:600px;line-height:1.6">
              Раздел «{{ s.title }}». Прокрутите страницу — активная ссылка слева подсветится автоматически.
            </p>
          </section>
        </div>
      </div>
    `,
  }),
}

export const FlatList: Story = {
  render: () => ({
    components: { UidAnchor },
    setup: () => ({
      items: sections.filter(s => !s.children),
      current: ref(''),
    }),
    template: `<UidAnchor :items="items" v-model="current" style="width:240px" />`,
  }),
}
