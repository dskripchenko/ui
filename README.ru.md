# @dskripchenko/ui

Набор Vue 3 компонентов, токенов и тем на CSS custom properties.

[English](./README.md) · [**Русский**](./README.ru.md) · [Deutsch](./README.de.md) · [中文](./README.zh.md)

[![npm](https://img.shields.io/npm/v/@dskripchenko/ui.svg)](https://www.npmjs.com/package/@dskripchenko/ui)
[![bundle](https://img.shields.io/bundlephobia/minzip/@dskripchenko/ui)](https://bundlephobia.com/package/@dskripchenko/ui)
[![license](https://img.shields.io/npm/l/@dskripchenko/ui.svg)](./LICENSE)

> **Статус:** стабильно. Действуют гарантии SemVer — ломающие изменения только в major-версиях.

📖 **Storybook:** [dskripchenko.github.io/ui](https://dskripchenko.github.io/ui/)

## Особенности

- **70+ компонентов** — формы, навигация, оверлеи, отображение данных, графики, паттерны, лейауты
- **Vue 3 + TypeScript** — Composition API, `<script setup>`, полная типизация
- **CSS custom properties** — никакого CSS-in-JS, Tailwind или препроцессоров; всё через переменные
- **Light / Dark темы** — через `data-theme` на `:root`, легко переопределяются
- **Tree-shakeable** — импорт по компонентам, ESM + CJS сборки
- **A11y** — `:focus-visible`, ARIA-атрибуты, keyboard-навигация во всех интерактивных компонентах
- **i18n** — встроенные `ru` + `en` локали, `UidLocaleProvider` для частичных переопределений и кастомных локалей
- **~1500 иконок** — `lucide-vue-next` под капотом + sub-export `@dskripchenko/ui/icons`
- **Zero runtime chart deps** — встроенные SVG-примитивы (Sparkline, ProgressRing, Gauge, Heatmap)

## Установка

```bash
pnpm add @dskripchenko/ui
# или
npm install @dskripchenko/ui
```

## Быстрый старт

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

import '@dskripchenko/ui/styles/tokens.css'
import '@dskripchenko/ui/styles/themes.css'

createApp(App).mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { UidButton, UidIcon } from '@dskripchenko/ui'
import { Check } from '@dskripchenko/ui/icons'
</script>

<template>
  <UidButton variant="primary">
    <UidIcon :icon="Check" /> Сохранить
  </UidButton>
</template>
```

Переключение темы — атрибут на `<html>`:

```html
<html data-theme="dark">
```

## Что внутри

Краткий список — полный каталог в [Storybook](https://dskripchenko.github.io/ui/).

**Формы и ввод:** Button, Input, Textarea, NumberInput, Checkbox, Radio, Switch, Label, FormField, Select, Combobox, TagsInput, DatePicker, DateRangePicker, TimePicker, ColorPicker, Slider, Rating, FileUpload, Mention, TreeSelect, Cascader

**Обратная связь:** Spinner, Skeleton, Badge, Alert, Progress, Toast, Tour

**Оверлеи:** Modal, Drawer, Tooltip, Popover, Menu, Command

**Навигация:** Tabs, Breadcrumb, Link, Pagination (+ Cursor / LoadMore / InfiniteScroll / PageSize), BackTop, Affix, Anchor

**Отображение данных:** Card, Avatar, AvatarGroup, Tag, Divider, Accordion, Table, VirtualList, Stat, DescriptionList, Timeline, TreeView, Code, Watermark, Carousel, Calendar, NotificationBadge

**Layout-помощники:** Stack, Grid, Container, Splitter

**Графики:** Sparkline, ProgressRing, Gauge, Heatmap

**Wizards:** Stepper, Wizard, WizardStep

**Patterns:** Header, Footer, Sidebar, PageHeader, EmptyState, ErrorState, Result

**Layouts:** SimpleLayout, SidebarLayout, AuthLayout, WizardLayout

**Composables:** useTheme, useLocale, useField, useToast, useWizard, useSidebar, useCommandPalette, useFocusTrap, useScrollLock, usePopover

## Документация

Пользовательская документация переведена на 4 языка — выбери свой:

- 🇬🇧 **English** (default): [docs/en/](./docs/en/)
- 🇷🇺 **Русский**: [getting-started](./docs/ru/getting-started.md), [тема](./docs/ru/theming.md), [токены](./docs/ru/tokens.md), [иконки](./docs/ru/icons.md), [патерны](./docs/ru/patterns.md), [валидация](./docs/ru/validation.md), [графики](./docs/ru/charts.md), [i18n](./docs/ru/i18n.md)
- 🇩🇪 **Deutsch**: [docs/de/](./docs/de/)
- 🇨🇳 **中文**: [docs/zh/](./docs/zh/)

Документация для контрибьюторов (только английская): [Architecture](./docs/ARCHITECTURE.md), [Component guidelines](./docs/COMPONENT_GUIDELINES.md), [Contributing](./docs/CONTRIBUTING.md), [Roadmap](./docs/ROADMAP.md).

## Темизация

Все цвета, отступы, шрифты — CSS-переменные. Переопределить тему — задать токены на `:root` или контейнере:

```css
:root[data-theme='dark'] {
  --uid-color-primary: #8b5cf6;
  --uid-color-bg: #0a0a0a;
}
```

Подробнее — [темизация](./docs/ru/theming.md) и [токены](./docs/ru/tokens.md).

## Иконки

Sub-export `@dskripchenko/ui/icons` реэкспортирует все ~1500 иконок Lucide:

```ts
import { UidIcon } from '@dskripchenko/ui'
import { Heart, Star } from '@dskripchenko/ui/icons'
```

Подробнее — [иконки](./docs/ru/icons.md).

## Разработка

```bash
pnpm install
pnpm dev               # Storybook на :6006
pnpm test              # Vitest
pnpm build             # Сборка библиотеки
pnpm build-storybook   # Сборка Storybook → storybook-static
pnpm build:analyze     # Bundle visualizer
pnpm changeset         # Описать изменения для следующего релиза
```

## Лицензия

MIT
