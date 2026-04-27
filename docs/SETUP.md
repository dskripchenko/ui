# Инициализация проекта

Пошаговый гайд: от пустой папки до работающего Storybook и сборки библиотеки.

## Требования

- Node.js ≥ 20
- pnpm ≥ 9

## 1. Git + pnpm init

```bash
git init
pnpm init
```

Заменить содержимое `package.json` на конфигурацию из [ARCHITECTURE.md](./ARCHITECTURE.md#packagejson-ключевые-поля), добавив блок `scripts`:

```json
{
  "scripts": {
    "dev":          "storybook dev -p 6006",
    "build":        "vue-tsc --noEmit && vite build",
    "test":         "vitest run",
    "test:watch":   "vitest",
    "lint":         "eslint src",
    "typecheck":    "vue-tsc --noEmit",
    "changeset":    "changeset",
    "release":      "pnpm build && changeset publish"
  }
}
```

## 2. Зависимости

```bash
# Рантайм
pnpm add lucide-vue-next

# Vue (peer — не попадает в prod-deps библиотеки)
pnpm add -D vue @vue/compiler-sfc

# TypeScript + сборка
pnpm add -D typescript vue-tsc vite @vitejs/plugin-vue vite-plugin-dts

# Storybook
pnpm add -D storybook @storybook/vue3-vite \
  @storybook/addon-essentials \
  @storybook/addon-a11y \
  @storybook/addon-themes

# Тесты
pnpm add -D vitest @vue/test-utils jsdom

# Линт + форматирование
pnpm add -D eslint @vue/eslint-config-typescript eslint-plugin-vue prettier

# Релиз
pnpm add -D @changesets/cli
```

## 3. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "jsx": "preserve",
    "skipLibCheck": true,
    "noEmit": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 4. vite.config.ts

```ts
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.stories.ts', 'src/**/*.spec.ts'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        icons: resolve(__dirname, 'src/icons/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'lucide-vue-next'],
      output: {
        assetFileNames: 'styles/[name][extname]',
        globals: { vue: 'Vue' },
      },
    },
    cssCodeSplit: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

## 5. .storybook/main.ts

```ts
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
}

export default config
```

## 6. .storybook/preview.ts

```ts
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/vue3'

import '../src/tokens/index.css'
import '../src/styles/themes.css'
import '../src/styles/reset.css'
import '../src/styles/global.css'

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
  },
}

export default preview
```

## 7. eslint.config.js

```js
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
]
```

## 8. .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

## 9. Changesets

```bash
pnpm changeset init
```

В `.changeset/config.json` проверить:

```json
{
  "access": "public",
  "baseBranch": "main"
}
```

## 10. Скелет src/

Создать структуру до написания первого компонента:

```
src/
  tokens/
    colors.css       ← палитра из TOKENS.md
    typography.css   ← шрифты и шкала из TOKENS.md
    spacing.css      ← отступы из TOKENS.md
    sizing.css       ← --uid-size-sm/md/lg
    radius.css       ← скругления из TOKENS.md
    motion.css       ← анимации из TOKENS.md
    z-index.css      ← z-index из TOKENS.md
    index.css        ← @import всех файлов выше
  styles/
    reset.css        ← минимальный reset
    themes.css       ← light/dark из THEMING.md
    global.css       ← font-family + base text на :root
  index.ts           ← пустой barrel
```

Содержимое CSS-файлов — полные блоки из [TOKENS.md](./TOKENS.md) и [THEMING.md](./THEMING.md).

Минимальный `src/styles/reset.css`:

```css
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img, svg { display: block; max-width: 100%; }
button, input, textarea, select { font: inherit; }
p, h1, h2, h3, h4 { margin: 0; overflow-wrap: break-word; }
```

Минимальный `src/styles/global.css`:

```css
:root {
  font-family: var(--uid-font-family-sans);
  font-size: var(--uid-font-size-md);
  line-height: var(--uid-line-height-normal);
  color: var(--uid-text-primary);
  background: var(--uid-surface-base);
}
```

## 11. Проверка

```bash
pnpm dev        # Storybook открывается на localhost:6006
pnpm build      # dist/ собирается без ошибок
pnpm test       # 0 tests, 0 failures
pnpm lint       # 0 errors
pnpm typecheck  # 0 errors
```

Если всё зелёное — фундамент готов. Дальше по [ROADMAP.md](./ROADMAP.md): Phase 0 → токены в Storybook → `UidIcon` → `UidButton`.
