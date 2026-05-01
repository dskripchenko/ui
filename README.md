# @dskripchenko/ui

A Vue 3 component, token, and theme library on CSS custom properties.

[**English**](./README.md) · [Русский](./README.ru.md) · [Deutsch](./README.de.md) · [中文](./README.zh.md)

[![npm](https://img.shields.io/npm/v/@dskripchenko/ui.svg)](https://www.npmjs.com/package/@dskripchenko/ui)
[![bundle](https://img.shields.io/bundlephobia/minzip/@dskripchenko/ui)](https://bundlephobia.com/package/@dskripchenko/ui)
[![license](https://img.shields.io/npm/l/@dskripchenko/ui.svg)](./LICENSE)

> **Status:** stable. SemVer guarantees apply — breaking changes only on a major bump.

📖 **Storybook:** [dskripchenko.github.io/ui](https://dskripchenko.github.io/ui/)

## Highlights

- **70+ components** — forms, navigation, overlays, data display, charts, patterns, layouts
- **Vue 3 + TypeScript** — Composition API, `<script setup>`, fully typed
- **CSS custom properties** — no CSS-in-JS, no Tailwind, no preprocessors; everything is variables
- **Light / Dark themes** — toggled via `data-theme` on `:root`, easy to override
- **Tree-shakable** — per-component imports, ESM + CJS builds
- **A11y** — `:focus-visible`, ARIA attributes, keyboard navigation across every interactive component
- **i18n** — built-in `ru` + `en` locales, `UidLocaleProvider` for partial overrides or custom locales
- **~1500 icons** — `lucide-vue-next` under the hood + `@dskripchenko/ui/icons` sub-export
- **Zero runtime chart deps** — built-in SVG primitives (Sparkline, ProgressRing, Gauge, Heatmap)

## Install

```bash
pnpm add @dskripchenko/ui
# or
npm install @dskripchenko/ui
```

## Quick start

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

// Everything in one line: tokens + themes + reset + base typography + components.
import '@dskripchenko/ui/styles/all.css'

createApp(App).mount('#app')
```

Prefer granular imports? Use the per-file entries instead — order matters (tokens → themes → component styles):

```ts
import '@dskripchenko/ui/styles/tokens.css'   // primitives (colors, spacing, radius…)
import '@dskripchenko/ui/styles/themes.css'   // :root[data-theme="light|dark"] + semantic aliases
import '@dskripchenko/ui/styles/reset.css'    // optional: minimal HTML reset
import '@dskripchenko/ui/styles/global.css'   // optional: :root font-family + base typography
import '@dskripchenko/ui/styles/index.css'    // component styles
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { UidButton, UidIcon, UidLocaleProvider, en } from '@dskripchenko/ui'
import { Check } from '@dskripchenko/ui/icons'
</script>

<template>
  <UidLocaleProvider :locale="en">
    <UidButton variant="primary">
      <UidIcon :icon="Check" /> Save
    </UidButton>
  </UidLocaleProvider>
</template>
```

Switch theme by attribute on `<html>`:

```html
<html data-theme="dark">
```

## What's inside

A short selection — the full catalog is in [Storybook](https://dskripchenko.github.io/ui/).

**Forms & input:** Button, Input, Textarea, NumberInput, Checkbox, Radio, Switch, Label, FormField, Select, Combobox, TagsInput, DatePicker, DateRangePicker, TimePicker, ColorPicker, Slider, Rating, FileUpload, Mention, TreeSelect, Cascader

**Feedback:** Spinner, Skeleton, Badge, Alert, Progress, Toast, Tour

**Overlays:** Modal, Drawer, Tooltip, Popover, Menu, Command

**Navigation:** Tabs, Breadcrumb, Link, Pagination (+ Cursor / LoadMore / InfiniteScroll / PageSize), BackTop, Affix, Anchor

**Data display:** Card, Avatar, AvatarGroup, Tag, Divider, Accordion, Table, VirtualList, Stat, DescriptionList, Timeline, TreeView, Code, Watermark, Carousel, Calendar, NotificationBadge

**Layout helpers:** Stack, Grid, Container, Splitter

**Charts:** Sparkline, ProgressRing, Gauge, Heatmap

**Wizards:** Stepper, Wizard, WizardStep

**Patterns:** Header, Footer, Sidebar, PageHeader, EmptyState, ErrorState, Result

**Layouts:** SimpleLayout, SidebarLayout, AuthLayout, WizardLayout

**Composables:** useTheme, useLocale, useField, useToast, useWizard, useSidebar, useCommandPalette, useFocusTrap, useScrollLock, usePopover

## Documentation

User docs are translated into four languages — pick yours:

- 🇬🇧 **English** (default): [getting-started](./docs/en/getting-started.md), [theming](./docs/en/theming.md), [tokens](./docs/en/tokens.md), [icons](./docs/en/icons.md), [patterns](./docs/en/patterns.md), [validation](./docs/en/validation.md), [charts](./docs/en/charts.md), [i18n](./docs/en/i18n.md)
- 🇷🇺 **Русский**: [docs/ru/](./docs/ru/)
- 🇩🇪 **Deutsch**: [docs/de/](./docs/de/)
- 🇨🇳 **中文**: [docs/zh/](./docs/zh/)

Contributor docs (English only): [Architecture](./docs/ARCHITECTURE.md), [Component guidelines](./docs/COMPONENT_GUIDELINES.md), [Contributing](./docs/CONTRIBUTING.md), [Roadmap](./docs/ROADMAP.md).

## Theming

Every colour, spacing, and font is a CSS variable. Override the theme by setting tokens on `:root` or on a container:

```css
:root[data-theme='dark'] {
  --uid-color-primary: #8b5cf6;
  --uid-color-bg: #0a0a0a;
}
```

See [theming](./docs/en/theming.md) and [tokens](./docs/en/tokens.md) for details.

## Icons

The `@dskripchenko/ui/icons` sub-export re-exports all ~1500 Lucide icons:

```ts
import { UidIcon } from '@dskripchenko/ui'
import { Heart, Star } from '@dskripchenko/ui/icons'
```

See [icons](./docs/en/icons.md).

## Development

```bash
pnpm install
pnpm dev               # Storybook on :6006
pnpm test              # Vitest
pnpm build             # Library build
pnpm build-storybook   # Storybook → storybook-static
pnpm build:analyze     # Bundle visualizer
pnpm changeset         # Describe a change for the next release
```

## License

MIT
