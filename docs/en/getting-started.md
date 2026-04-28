# Getting started

## Install

```bash
pnpm add @dskripchenko/ui
# or npm install @dskripchenko/ui
```

Vue 3.4+ is a peer dependency. Lucide icons come bundled.

## Set up styles

Import the kit's stylesheets at your app entry point:

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

import '@dskripchenko/ui/styles/tokens.css'   // primitive design tokens
import '@dskripchenko/ui/styles/themes.css'   // light + dark semantic tokens
import '@dskripchenko/ui/styles/reset.css'    // optional minimal reset

createApp(App).mount('#app')
```

You can skip `reset.css` if your app already has a CSS reset. `tokens.css` and `themes.css` are required.

## First component

```vue
<script setup lang="ts">
import { UidButton, UidIcon } from '@dskripchenko/ui'
import { Check } from '@dskripchenko/ui/icons'
</script>

<template>
  <UidButton variant="primary">
    <UidIcon :icon="Check" /> Save
  </UidButton>
</template>
```

That's it — no global registration, no plugin install. Each component is a standalone Vue component.

## Theme

The kit ships with `light` and `dark` themes, switched via the `data-theme` attribute on `<html>` (or any ancestor):

```html
<html data-theme="dark">
```

Without the attribute, the light theme applies. See [theming](./theming.md) for theme switching, custom themes, and `useTheme()`.

## Locale

By default, all built-in component strings are in Russian. To switch to English (or another locale), wrap your app in `UidLocaleProvider`:

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

See [i18n](./i18n.md) for partial overrides and custom locales.

## Forms

The kit has a tiny built-in validator (`useField`, `useForm`) so you don't need a separate form library for simple cases. See [validation](./validation.md).

```vue
<UidInput v-model="email" rules="required|email" label="Email" />
```

## What's next

- **[Theming](./theming.md)** — colors, themes, custom palettes
- **[Tokens](./tokens.md)** — design tokens reference (spacing, typography, radii…)
- **[Icons](./icons.md)** — `UidIcon` and 1500+ Lucide icons
- **[Patterns & Layouts](./patterns.md)** — Header, Sidebar, Wizard, page templates
- **[Validation](./validation.md)** — form validation
- **[Charts](./charts.md)** — Sparkline, ProgressRing, Gauge, Heatmap
- **[i18n](./i18n.md)** — multi-language support

A live catalog is available at the [Storybook site](https://dskripchenko.github.io/ui/).
