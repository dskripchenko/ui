import type { Meta, StoryObj } from '@storybook/vue3'
import UidMarkdown from './UidMarkdown.vue'
import type { UidMarkdownBlockRenderer } from './blockRenderers.js'

const meta: Meta<typeof UidMarkdown> = {
  title: 'Data Display/Markdown',
  component: UidMarkdown,
  tags: ['autodocs'],
  argTypes: {
    toc: { control: 'boolean' },
    tocDepth: { control: { type: 'number', min: 2, max: 4 } },
    linkBase: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof UidMarkdown>

const guide = `# Руководство

Короткий документ: **жирный**, *курсив*, \`inline code\`, ~~зачёркнутый~~ и [ссылка](https://example.com).

## Установка

1. Установите пакет:

   \`\`\`bash
   pnpm add @dskripchenko/ui
   \`\`\`

2. Подключите стили.

> [!NOTE]
> Темы переключаются атрибутом \`data-theme\`.

> [!WARNING]
> Не используйте \`scoped\`-стили.

## Таблица

| Компонент | Назначение |
|:---|---:|
| \`UidCode\` | код с подсветкой |
| \`UidMarkdown\` | документ целиком |

## Схема

\`\`\`fake-diagram
Клиент -> API -> База
\`\`\`

---

### Сломанная схема

\`\`\`fake-diagram
error: стрелка без цели
\`\`\`
`

// Draws "A -> B -> C" as boxes; "error:" lines fail. Escapes every label.
const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const fakeDiagram: UidMarkdownBlockRenderer = async (code) => {
  await new Promise((r) => setTimeout(r, 300))
  if (code.startsWith('error:')) return { error: code.slice(6).trim() }
  const parts = code.split('->').map((p) => p.trim())
  const boxes = parts
    .map((p, i) => `<g><rect x="${i * 160}" y="0" width="120" height="40" rx="6" fill="var(--uid-accent-subtle)" stroke="var(--uid-accent)"/><text x="${i * 160 + 60}" y="25" text-anchor="middle" fill="currentColor">${escape(p)}</text></g>`)
    .join('')
  const arrows = parts
    .slice(1)
    .map((_, i) => `<line x1="${i * 160 + 120}" y1="20" x2="${i * 160 + 160}" y2="20" stroke="currentColor"/>`)
    .join('')
  return { html: `<svg viewBox="-2 -2 ${parts.length * 160} 44" width="${parts.length * 160}" height="44">${arrows}${boxes}</svg>` }
}

export const Default: Story = {
  args: { source: guide, toc: true, blockRenderers: { 'fake-diagram': fakeDiagram } },
  render: (args: Record<string, unknown>) => ({
    components: { UidMarkdown },
    setup: () => ({ args }),
    template: `<UidMarkdown v-bind="args" style="max-width:900px" />`,
  }),
}

export const WithoutToc: Story = {
  args: { source: guide, blockRenderers: { 'fake-diagram': fakeDiagram } },
  render: Default.render,
}
