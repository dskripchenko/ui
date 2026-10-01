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
    highlight: { control: 'boolean' },
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

const languageSamples: Record<string, string> = {
  php: `<?php
// Контроллер
final class UserController
{
    public function show(int $id): array
    {
        $user = User::find($id) ?? null;
        return ['id' => $id, 'active' => true];
    }
}`,
  typescript: tsExample,
  json: jsonExample,
  sql: `-- Активные пользователи
SELECT u.id, COUNT(o.id) AS orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = TRUE AND u.name <> 'O''Neil'
GROUP BY u.id
LIMIT 10;`,
  html: `<!-- Карточка -->
<div class="card" data-id="42" hidden>
  <a href="/users?page=2&amp;sort=name">Далее</a>
</div>`,
  css: `@media (prefers-reduced-motion: reduce) {
  .uid-button:hover {
    color: var(--uid-accent);
    margin: 0 4px;
    transition: none !important;
  }
}`,
  bash: `#!/usr/bin/env bash
set -euo pipefail
# Сборка и публикация
for pkg in "$@"; do
  echo "Building \${pkg}..."
  pnpm --filter "$pkg" build --mode production
done`,
}

/** Подсветка синтаксиса для поддерживаемых языков. Для неизвестных языков код выводится как есть. */
export const SyntaxHighlighting: Story = {
  render: () => ({
    components: { UidCode },
    setup: () => ({ languageSamples }),
    template: `
      <div style="display:grid;gap:16px;max-width:640px">
        <UidCode
          v-for="(code, lang) in languageSamples"
          :key="lang"
          :code="code"
          :language="lang"
          line-numbers
        />
        <UidCode code="Неизвестный язык — простой текст" language="text" />
      </div>
    `,
  }),
}

/** \`highlight: false\` отключает подсветку. */
export const WithoutHighlight: Story = {
  render: () => ({
    components: { UidCode },
    setup: () => ({ tsExample }),
    template: `<UidCode :code="tsExample" language="typescript" :highlight="false" style="max-width:560px" />`,
  }),
}
