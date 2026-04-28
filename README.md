# @dskripchenko/ui

Набор Vue 3 компонентов, токенов и тем на CSS custom properties.

[![npm](https://img.shields.io/npm/v/@dskripchenko/ui.svg)](https://www.npmjs.com/package/@dskripchenko/ui)
[![bundle](https://img.shields.io/bundlephobia/minzip/@dskripchenko/ui)](https://bundlephobia.com/package/@dskripchenko/ui)
[![license](https://img.shields.io/npm/l/@dskripchenko/ui.svg)](./LICENSE)

> **Статус:** ранняя разработка. API нестабилен до `1.0`.

📖 **Storybook:** [dskripchenko.github.io/ui](https://dskripchenko.github.io/ui/)

## Особенности

- **59 компонентов** — формы, навигация, оверлеи, отображение данных, паттерны и лейауты
- **Vue 3 + TypeScript** — Composition API, `<script setup>`, полная типизация
- **CSS custom properties** — никакого CSS-in-JS, Tailwind или препроцессоров; всё через переменные
- **Light / Dark темы** — через `data-theme` на `:root`, легко переопределяются
- **Tree-shakeable** — импорт по компонентам, ESM + CJS сборки
- **A11y** — `:focus-visible`, ARIA-атрибуты, keyboard-навигация во всех интерактивных компонентах
- **~1500 иконок** — `lucide-vue-next` под капотом + sub-export `@dskripchenko/ui/icons`

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
    <UidIcon :icon="Check" /> Привет
  </UidButton>
</template>
```

Переключение темы — атрибут на `<html>`:

```html
<html data-theme="dark">
```

## Состав библиотеки

### Базовые формы и ввод

`UidButton`, `UidInput`, `UidTextarea`, `UidNumberInput`, `UidCheckbox`, `UidRadio`, `UidRadioGroup`, `UidSwitch`, `UidLabel`, `UidFormField`, `UidSelect`, `UidCombobox`, `UidTagsInput`, `UidDatePicker`, `UidDateRangePicker`, `UidTimePicker`, `UidColorPicker`, `UidSlider`, `UidRating`, `UidFileUpload`, `UidMention`, `UidTreeSelect`

### Обратная связь

`UidSpinner`, `UidSkeleton`, `UidBadge`, `UidAlert`, `UidProgress`, `UidToast`, `UidToastProvider`, `UidTour`

### Оверлеи

`UidModal`, `UidDrawer`, `UidTooltip`, `UidPopover`, `UidMenu`, `UidMenuItem`, `UidCommand`

### Навигация

`UidTabs`, `UidTab`, `UidTabPanel`, `UidBreadcrumb`, `UidLink`, `UidPagination`, `UidPaginationCursor`, `UidLoadMore`, `UidInfiniteScroll`, `UidPageSize`, `UidBackTop`, `UidAffix`, `UidAnchor`

### Отображение данных

`UidCard`, `UidAvatar`, `UidAvatarGroup`, `UidTag`, `UidDivider`, `UidAccordion`, `UidTable`, `UidVirtualList`, `UidStat`, `UidDescriptionList`, `UidDescriptionItem`, `UidTimeline`, `UidTimelineItem`, `UidTreeView`, `UidCode`, `UidWatermark`

### Layout-помощники

`UidStack`, `UidGrid`, `UidContainer`, `UidSplitter`

### Wizards

`UidStepper`, `UidWizard`, `UidWizardStep`

### Patterns

`UidHeader`, `UidFooter`, `UidSidebar`, `UidPageHeader`, `UidEmptyState`, `UidErrorState`, `UidResult`

### Layouts

`UidSimpleLayout`, `UidSidebarLayout`, `UidAuthLayout`, `UidWizardLayout`

### Composables

`useTheme`, `useField`, `useToast`, `useWizard`, `useSidebar`, `useCommandPalette`, `useFocusTrap`, `useScrollLock`, `usePopover`

Полный каталог с интерактивными примерами — в **[Storybook](https://dskripchenko.github.io/ui/)**.

## Темизация

Все цвета, отступы, шрифты — CSS-переменные. Переопределить тему — задать токены на `:root` или контейнере:

```css
:root[data-theme='dark'] {
  --uid-color-primary: #8b5cf6;
  --uid-color-bg: #0a0a0a;
}
```

Подробнее — [`docs/THEMING.md`](./docs/THEMING.md) и [`docs/TOKENS.md`](./docs/TOKENS.md).

## Иконки

Sub-export `@dskripchenko/ui/icons` реэкспортирует все ~1500 иконок Lucide:

```ts
import { UidIcon } from '@dskripchenko/ui'
import { Heart, Star } from '@dskripchenko/ui/icons'
```

Подробнее — [`docs/ICONS.md`](./docs/ICONS.md).

## Документация

- [Архитектура](./docs/ARCHITECTURE.md) — структура пакета, сборка, экспорт
- [Дизайн-токены](./docs/TOKENS.md) — система CSS-переменных
- [Темизация](./docs/THEMING.md) — light/dark и кастомизация
- [Иконки](./docs/ICONS.md) — `UidIcon` и реестр Lucide
- [Валидация форм](./docs/VALIDATION.md) — `useField`, правила
- [Patterns и Layouts](./docs/PATTERNS.md) — составные блоки и шаблоны страниц
- [Гайдлайны компонентов](./docs/COMPONENT_GUIDELINES.md) — конвенции
- [Roadmap](./docs/ROADMAP.md) — план развития
- [Контрибьютинг](./docs/CONTRIBUTING.md) — workflow

## Разработка

```bash
pnpm install
pnpm dev              # Storybook на :6006
pnpm test             # Vitest
pnpm build            # Сборка библиотеки
pnpm build-storybook  # Сборка Storybook → storybook-static
pnpm changeset        # Описать изменения для следующего релиза
```

## Лицензия

MIT
