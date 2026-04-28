# Erste Schritte

## Installation

```bash
pnpm add @dskripchenko/ui
# oder npm install @dskripchenko/ui
```

Vue 3.4+ ist eine Peer-Dependency. Lucide-Icons sind im Paket enthalten.

## Stylesheets einbinden

Importiere die Stylesheets des Kits am Einstiegspunkt deiner App:

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

import '@dskripchenko/ui/styles/tokens.css'   // Primitive Design-Tokens
import '@dskripchenko/ui/styles/themes.css'   // Light- und Dark-Tokens
import '@dskripchenko/ui/styles/reset.css'    // optionaler Mini-Reset

createApp(App).mount('#app')
```

`reset.css` kannst du weglassen, wenn deine App bereits ein CSS-Reset hat. `tokens.css` und `themes.css` sind erforderlich.

## Erste Komponente

```vue
<script setup lang="ts">
import { UidButton, UidIcon } from '@dskripchenko/ui'
import { Check } from '@dskripchenko/ui/icons'
</script>

<template>
  <UidButton variant="primary">
    <UidIcon :icon="Check" /> Speichern
  </UidButton>
</template>
```

Das war's — keine globale Registrierung, kein Plugin. Jede Komponente ist eine eigenständige Vue-Komponente.

## Theme

Das Kit liefert `light` und `dark` Themes, umschaltbar über das Attribut `data-theme` auf `<html>` (oder einem beliebigen Vorfahren):

```html
<html data-theme="dark">
```

Ohne Attribut gilt das Light-Theme. Mehr in [Theming](./theming.md) zu Theme-Wechsel, eigenen Themes und `useTheme()`.

## Locale

Standardmäßig sind alle eingebauten Komponenten-Texte auf Russisch. Um auf Englisch (oder eine andere Sprache) zu wechseln, umschließe deine App mit `UidLocaleProvider`:

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

Mehr in [i18n](./i18n.md) zu partiellen Überschreibungen und eigenen Locales.

## Formulare

Das Kit hat einen kleinen eingebauten Validator (`useField`, `useForm`) — für einfache Fälle brauchst du keine separate Formularbibliothek. Siehe [Validation](./validation.md).

```vue
<UidInput v-model="email" rules="required|email" label="E-Mail" />
```

## Wie weiter

- **[Theming](./theming.md)** — Farben, Themes, eigene Paletten
- **[Tokens](./tokens.md)** — Design-Tokens-Referenz (Abstände, Typografie, Radien…)
- **[Icons](./icons.md)** — `UidIcon` und 1500+ Lucide-Icons
- **[Patterns & Layouts](./patterns.md)** — Header, Sidebar, Wizard, Seitenvorlagen
- **[Validation](./validation.md)** — Formularvalidierung
- **[Charts](./charts.md)** — Sparkline, ProgressRing, Gauge, Heatmap
- **[i18n](./i18n.md)** — Mehrsprachigkeit

Ein Live-Katalog steht im [Storybook](https://dskripchenko.github.io/ui/) bereit.
