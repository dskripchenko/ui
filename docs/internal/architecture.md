# Architecture

## Stack

| Layer | Tool |
|---|---|
| Framework | Vue 3 (`<script setup>`, Composition API) |
| Language | TypeScript (strict) |
| Styles | Plain CSS + CSS Custom Properties |
| Library build | Vite (library mode) |
| Types | `vite-plugin-dts` |
| Docs / dev | Storybook 8 (`@storybook/vue3-vite`) |
| Tests | Vitest + `@vue/test-utils` |
| Lint / format | ESLint (flat config) + Prettier |
| Versioning | Changesets |
| Package manager | pnpm |

## Repository layout

```
.
├── src/
│   ├── tokens/                # design tokens as CSS variables
│   │   ├── colors.css         # primitive palette, no semantics
│   │   ├── typography.css
│   │   ├── spacing.css
│   │   ├── radius.css
│   │   ├── shadow.css
│   │   ├── motion.css
│   │   ├── z-index.css
│   │   └── index.css          # imports everything above
│   │
│   ├── styles/
│   │   ├── reset.css          # minimal reset
│   │   ├── themes.css         # :root[data-theme="light|dark"] — semantic tokens
│   │   └── global.css         # global styles (font-family, base text)
│   │
│   ├── locales/               # built-in localizations (ru, en) + UidLocale type
│   ├── icons/                 # UidIcon + registry + lucide-vue-next re-export
│   │
│   ├── components/            # atomic components (Button, Input, Modal…)
│   │   └── Button/
│   │       ├── UidButton.vue
│   │       ├── UidButton.css
│   │       ├── UidButton.stories.ts
│   │       ├── UidButton.spec.ts
│   │       └── index.ts       # component + types re-export
│   │
│   ├── patterns/              # composite blocks (Header, Footer, Sidebar, …)
│   ├── layouts/               # page templates (Simple, Sidebar, Auth, Wizard)
│   ├── composables/           # useFocusTrap, useTheme, useLocale, …
│   ├── utils/                 # framework-free utilities
│   ├── types/                 # shared types (Size, Variant, Tone…)
│   └── index.ts               # public barrel
│
├── docs/                      # project documentation (this file et al.)
├── .storybook/                # Storybook config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Build

Vite library mode produces two formats:

- `dist/index.mjs` — ESM
- `dist/index.cjs` — CJS (legacy)
- `dist/index.d.ts` — types

`vue` and any peer-deps are marked external. Stylesheets are emitted as separate files and never inlined into JS.

### `package.json` essentials

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
    "./styles/reset.css": "./dist/styles/reset.css",
    "./styles/global.css": "./dist/styles/global.css"
  },
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "peerDependencies": { "vue": "^3.4.0" },
  "dependencies": { "lucide-vue-next": "^0.460.0" }
}
```

`sideEffects: ["**/*.css"]` is critical: it allows JS tree-shaking while preventing bundlers from dropping CSS.

## CSS strategy

- One component → one `.css` file next to it, imported from `<script setup>`:
  ```ts
  import './UidButton.css'
  ```
- No `scoped`. Isolation comes from the `uid-<component>` class prefix and BEM-style nesting (`uid-button__icon`, `uid-button--primary`).
- All "knobs" of a component are exposed as local CSS custom properties with a fallback to semantic tokens. This lets users override a component without `!important`.

See [`docs/en/tokens.md`](../en/tokens.md) and [`docs/en/theming.md`](../en/theming.md) for details.

## API tiers

The kit has three tiers — the boundaries between them matter:

| Tier | What | Example | Lives in |
|---|---|---|---|
| Components | Atomic UI elements | `UidButton`, `UidInput`, `UidModal` | `src/components/` |
| Patterns | Composite page blocks | `UidHeader`, `UidSidebar`, `UidPageHeader`, `UidEmptyState` | `src/patterns/` |
| Layouts | Whole-page templates | `UidSimpleLayout`, `UidSidebarLayout`, `UidAuthLayout`, `UidWizardLayout` | `src/layouts/` |

Icons (`UidIcon` + ~1500 Lucide icons) live separately in `src/icons/` and are exposed via the `@dskripchenko/ui/icons` sub-export.

## Public API

`src/index.ts` is the only entry point. It re-exports:

- All `Uid*` components (from `components/`, `patterns/`, `layouts/`)
- Their prop types (`UidButtonProps`, etc.)
- Stable composables (`useTheme`, `useLocale`, `useToast`, `useSidebar`, `useWizard`, …)
- Shared types from `src/types/`
- Built-in locales (`ru`, `en`)

## SSR compatibility

Components must not access `window`/`document` in `setup`. Any DOM access goes inside `onMounted` or a composable that encapsulates it (e.g. `useFocusTrap`).

## Tooling

- `eslint` + `@vue/eslint-config-typescript` + `eslint-plugin-vue`
- `prettier` (formatting only, no lint rules)
- `vitest` with jsdom environment
- `@storybook/vue3-vite`, addons: `@storybook/addon-essentials`, `@storybook/addon-a11y`, `@storybook/addon-themes`
- `rollup-plugin-visualizer` (optional, via `pnpm build:analyze`)
