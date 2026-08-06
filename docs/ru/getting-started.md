# Быстрый старт

## Установка

```bash
pnpm add @dskripchenko/ui
# либо npm install @dskripchenko/ui
```

Vue 3.4+ — peer-зависимость. Иконки Lucide идут в комплекте.

## Подключение стилей

Импортируйте таблицы стилей набора в точке входа приложения:

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

import '@dskripchenko/ui/styles/tokens.css'   // примитивные дизайн-токены
import '@dskripchenko/ui/styles/themes.css'   // семантические токены: светлая и тёмная тема
import '@dskripchenko/ui/styles/reset.css'    // минимальный reset, необязателен

createApp(App).mount('#app')
```

`reset.css` можно не подключать, если в приложении уже есть свой сброс стилей. `tokens.css` и `themes.css` обязательны.

## Первый компонент

```vue
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

Это всё — ни глобальной регистрации, ни установки плагина. Каждый компонент самостоятелен.

## Тема

В наборе есть темы `light` и `dark`, переключаются атрибутом `data-theme` на `<html>` (или на любом предке):

```html
<html data-theme="dark">
```

Без атрибута действует светлая тема. Про переключение, свои темы и `useTheme()` — в [теминге](./theming.md).

## Локаль

По умолчанию все встроенные строки компонентов — на русском. Чтобы перейти на английский (или другой язык), оберните приложение в `UidLocaleProvider`:

```vue
<script setup lang="ts">
import { UidLocaleProvider, en } from '@dskripchenko/ui'
</script>

<template>
  <UidLocaleProvider :locale="en">
    <App />
  </UidLocaleProvider>
</template>
```

Про частичные переопределения и свои локали — в [i18n](./i18n.md).

## Формы

В набор встроен маленький валидатор (`useField`, `useForm`), поэтому для простых случаев отдельная библиотека форм не нужна. Подробности — в [валидации](./validation.md).

```vue
<UidInput v-model="email" rules="required|email" label="Email" />
```

## Что дальше

- **[Теминг](./theming.md)** — цвета, темы, свои палитры
- **[Токены](./tokens.md)** — справочник дизайн-токенов (отступы, типографика, скругления…)
- **[Иконки](./icons.md)** — `UidIcon` и 1500+ иконок Lucide
- **[Паттерны и лейауты](./patterns.md)** — Header, Sidebar, Wizard, шаблоны страниц
- **[Валидация](./validation.md)** — проверка форм
- **[Графики](./charts.md)** — Sparkline, ProgressRing, Gauge, Heatmap
- **[i18n](./i18n.md)** — многоязычность

Живой каталог компонентов — на [сайте Storybook](https://dskripchenko.github.io/ui/).
