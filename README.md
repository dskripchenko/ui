# @dskripchenko/ui

Набор Vue 3 компонентов, токенов и тем на CSS custom properties.

> **Статус:** ранняя разработка. API нестабилен.

## Стек

- Vue 3 + TypeScript
- Стилизация — собственные CSS-переменные (design tokens)
- Темы — `light` / `dark` через `data-theme` на `:root`
- Документация и demo — Storybook
- Сборка библиотеки — Vite (library mode)

## Установка

```bash
npm install @dskripchenko/ui
# или
pnpm add @dskripchenko/ui
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

```html
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

Иконки — ~1500 [Lucide](https://lucide.dev/icons) «из коробки», подробно в [`docs/ICONS.md`](./docs/ICONS.md).

Переключение темы:

```html
<html data-theme="dark">
```

## Документация

Вся проектная документация — в [`docs/`](./docs):

- [Архитектура](./docs/ARCHITECTURE.md) — структура пакета, сборка, экспорт
- [Дизайн-токены](./docs/TOKENS.md) — система CSS-переменных
- [Темизация](./docs/THEMING.md) — light/dark и кастомизация
- [Гайдлайны компонентов](./docs/COMPONENT_GUIDELINES.md) — правила и шаблон
- [Иконки](./docs/ICONS.md) — `UidIcon` + ~1500 Lucide-иконок «из коробки»
- [Валидация форм](./docs/VALIDATION.md) — useField, useForm, встроенные правила
- [Patterns и Layouts](./docs/PATTERNS.md) — составные блоки и шаблоны страниц
- [Roadmap](./docs/ROADMAP.md) — план разработки по фазам
- [Контрибьютинг](./docs/CONTRIBUTING.md) — workflow разработки и релизов
- [Инициализация проекта](./docs/SETUP.md) — от нуля до работающего Storybook

## Лицензия

MIT
