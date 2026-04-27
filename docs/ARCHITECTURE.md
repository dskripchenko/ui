# Архитектура

## Стек

| Слой | Инструмент |
|---|---|
| Фреймворк | Vue 3 (`<script setup>`, Composition API) |
| Язык | TypeScript (strict) |
| Стили | Plain CSS + CSS Custom Properties |
| Сборка библиотеки | Vite (library mode) |
| Типы | `vite-plugin-dts` |
| Документация / dev | Storybook 8 (framework `@storybook/vue3-vite`) |
| Тесты | Vitest + `@vue/test-utils` |
| Линт / формат | ESLint (flat config) + Prettier |
| Версионирование | Changesets |
| Менеджер пакетов | pnpm |

## Структура репозитория

```
.
├── src/
│   ├── tokens/                # дизайн-токены как CSS-переменные
│   │   ├── colors.css         # primitives: палитра без семантики
│   │   ├── typography.css
│   │   ├── spacing.css
│   │   ├── radius.css
│   │   ├── shadow.css
│   │   ├── motion.css
│   │   ├── z-index.css
│   │   └── index.css          # импортирует всё выше
│   │
│   ├── styles/
│   │   ├── reset.css          # минимальный reset
│   │   ├── themes.css         # :root[data-theme="light|dark"] — семантические токены
│   │   └── global.css         # глобальные стили (font-family, base text)
│   │
│   ├── icons/                 # UidIcon + registry + реэкспорт lucide-vue-next
│   │   ├── UidIcon.vue
│   │   ├── UidIcon.css
│   │   ├── UidIcon.stories.ts
│   │   ├── UidIcon.spec.ts
│   │   ├── registry.ts        # registerIcons + getRegisteredIcon
│   │   └── index.ts           # экспорт + re-export всего lucide-vue-next
│   │
│   ├── components/            # атомарные компоненты (Button, Input, Modal…)
│   │   └── Button/
│   │       ├── UidButton.vue
│   │       ├── UidButton.css
│   │       ├── UidButton.stories.ts
│   │       ├── UidButton.spec.ts
│   │       └── index.ts       # реэкспорт компонента и его типов
│   │
│   ├── patterns/              # составные блоки (Header, Footer, Sidebar, PageHeader…)
│   │   └── Header/
│   │       ├── UidHeader.vue
│   │       ├── UidHeader.css
│   │       ├── UidHeader.stories.ts
│   │       └── index.ts
│   │
│   ├── layouts/               # шаблоны страниц (Simple, Sidebar, Auth, Wizard)
│   │   └── SidebarLayout/
│   │       ├── UidSidebarLayout.vue
│   │       ├── UidSidebarLayout.css
│   │       ├── UidSidebarLayout.stories.ts
│   │       └── index.ts
│   │
│   ├── composables/           # useFocusTrap, useId, useTheme, useSidebar, useWizard…
│   ├── utils/                 # чистые утилиты без Vue
│   ├── types/                 # общие типы (Size, Variant, Tone…)
│   └── index.ts               # публичный barrel
│
├── docs/                      # проектная документация (этот файл и др.)
├── .storybook/                # конфиг Storybook
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Сборка

Vite в library mode, два формата:

- `dist/index.mjs` — ESM
- `dist/index.cjs` — CJS (на случай legacy-проектов; можно отказаться позже)
- `dist/index.d.ts` — типы

Внешними зависимостями (`external`) объявляются `vue` и любые peer-deps. Stylesheets отдаются отдельными файлами и не инлайнятся в JS.

### `package.json` (ключевые поля)

```json
{
  "name": "@dskripchenko/ui",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./icons": {
      "types": "./dist/icons/index.d.ts",
      "import": "./dist/icons/index.mjs",
      "require": "./dist/icons/index.cjs"
    },
    "./styles/tokens.css": "./dist/styles/tokens.css",
    "./styles/themes.css": "./dist/styles/themes.css",
    "./styles/reset.css": "./dist/styles/reset.css"
  },
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "peerDependencies": {
    "vue": "^3.4.0"
  },
  "dependencies": {
    "lucide-vue-next": "^0.460.0"
  }
}
```

`sideEffects: ["**/*.css"]` — критично: разрешает tree-shaking JS, но защищает CSS от удаления бандлерами.

## Стратегия CSS

- Один компонент → один `.css`-файл рядом, импортируется из `<script setup>`:
  ```ts
  import './UidButton.css'
  ```
- Без `scoped`. Изоляция — за счёт префикса класса `uid-<component>` и BEM-подобной вложенности (`uid-button__icon`, `uid-button--primary`).
- Все «переменные» компонента (цвета, отступы) задаются через локальные CSS custom properties с фолбэком на семантические токены. Это даёт пользователю возможность переопределить компонент без `!important`.

Подробнее — [`TOKENS.md`](./TOKENS.md) и [`THEMING.md`](./THEMING.md).

## Слои API

В kit'е три слоя сущностей — границы между ними важны:

| Слой | Что | Пример | Где живёт |
|---|---|---|---|
| Components | Атомарные UI-элементы | `UidButton`, `UidInput`, `UidModal` | `src/components/` |
| Patterns | Составные блоки страницы | `UidHeader`, `UidSidebar`, `UidPageHeader`, `UidEmptyState` | `src/patterns/` |
| Layouts | Шаблоны целых страниц | `UidSimpleLayout`, `UidSidebarLayout`, `UidAuthLayout`, `UidWizardLayout` | `src/layouts/` |

Дополнительно — иконки (`UidIcon` + ~1500 Lucide-иконок), живут отдельно в `src/icons/` и доступны через sub-export `@dskripchenko/ui/icons`.

Подробно про слои patterns/layouts — в [`PATTERNS.md`](./PATTERNS.md). Про иконки — в [`ICONS.md`](./ICONS.md).

## Публичный API

`src/index.ts` — единственная точка входа. Реэкспортирует:

- все компоненты с префиксом `Uid` (из `components/`, `patterns/`, `layouts/`)
- их типы пропсов (`UidButtonProps`, `UidSidebarLayoutProps` и т.д.)
- composables, помеченные как стабильные (`useTheme`, `useSidebar`, `useWizard`, `useToast`…)
- общие типы из `src/types/`

Экспериментальные сущности живут в `src/{components,patterns,layouts}/_experimental/` и **не реэкспортируются** из `index.ts` — пользователь может импортировать напрямую, осознавая риск.

## Совместимость с SSR

Компоненты не должны обращаться к `window`/`document` в `setup`. Любой DOM-доступ — внутри `onMounted` или composable, который сам это инкапсулирует (например `useFocusTrap`).

## Тулинг (минимум на старте)

- `eslint` + `@vue/eslint-config-typescript` + `eslint-plugin-vue`
- `prettier` (только форматирование, без правил линтера)
- `vitest` с jsdom-окружением
- `@storybook/vue3-vite`, аддоны: `@storybook/addon-essentials`, `@storybook/addon-a11y`, `@storybook/addon-themes` (для переключения light/dark)
