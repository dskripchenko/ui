# @dskripchenko/ui

Eine Bibliothek aus Vue-3-Komponenten, Tokens und Themes auf Basis von CSS Custom Properties.

[English](./README.md) · [Русский](./README.ru.md) · [**Deutsch**](./README.de.md) · [中文](./README.zh.md)

[![npm](https://img.shields.io/npm/v/@dskripchenko/ui.svg)](https://www.npmjs.com/package/@dskripchenko/ui)
[![bundle](https://img.shields.io/bundlephobia/minzip/@dskripchenko/ui)](https://bundlephobia.com/package/@dskripchenko/ui)
[![license](https://img.shields.io/npm/l/@dskripchenko/ui.svg)](./LICENSE)

> **Status:** frühe Entwicklung. Das API ist bis `1.0` instabil.

📖 **Storybook:** [dskripchenko.github.io/ui](https://dskripchenko.github.io/ui/)

## Highlights

- **70+ Komponenten** — Formulare, Navigation, Overlays, Datenanzeige, Charts, Patterns, Layouts
- **Vue 3 + TypeScript** — Composition API, `<script setup>`, vollständig typisiert
- **CSS Custom Properties** — kein CSS-in-JS, kein Tailwind, keine Präprozessoren; alles über Variablen
- **Light / Dark Themes** — Umschalten über `data-theme` auf `:root`, einfach zu überschreiben
- **Tree-shakable** — Import pro Komponente, ESM + CJS Builds
- **A11y** — `:focus-visible`, ARIA-Attribute, Tastatur-Navigation in allen interaktiven Komponenten
- **i18n** — eingebaute `ru` + `en` Locales, `UidLocaleProvider` für partielle Überschreibungen und eigene Locales
- **~1500 Icons** — `lucide-vue-next` unter der Haube + Sub-Export `@dskripchenko/ui/icons`
- **Keine Runtime-Chart-Deps** — eingebaute SVG-Primitive (Sparkline, ProgressRing, Gauge, Heatmap)

## Installation

```bash
pnpm add @dskripchenko/ui
# oder
npm install @dskripchenko/ui
```

## Schnellstart

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
import { UidButton, UidIcon, UidLocaleProvider, en } from '@dskripchenko/ui'
import { Check } from '@dskripchenko/ui/icons'
</script>

<template>
  <UidLocaleProvider :locale="en">
    <UidButton variant="primary">
      <UidIcon :icon="Check" /> Speichern
    </UidButton>
  </UidLocaleProvider>
</template>
```

Theme über Attribut auf `<html>` umschalten:

```html
<html data-theme="dark">
```

## Inhalt

Kurze Auswahl — vollständiger Katalog im [Storybook](https://dskripchenko.github.io/ui/).

**Formulare & Eingabe:** Button, Input, Textarea, NumberInput, Checkbox, Radio, Switch, Label, FormField, Select, Combobox, TagsInput, DatePicker, DateRangePicker, TimePicker, ColorPicker, Slider, Rating, FileUpload, Mention, TreeSelect, Cascader

**Feedback:** Spinner, Skeleton, Badge, Alert, Progress, Toast, Tour

**Overlays:** Modal, Drawer, Tooltip, Popover, Menu, Command

**Navigation:** Tabs, Breadcrumb, Link, Pagination (+ Cursor / LoadMore / InfiniteScroll / PageSize), BackTop, Affix, Anchor

**Datenanzeige:** Card, Avatar, AvatarGroup, Tag, Divider, Accordion, Table, VirtualList, Stat, DescriptionList, Timeline, TreeView, Code, Watermark, Carousel, Calendar, NotificationBadge

**Layout-Helfer:** Stack, Grid, Container, Splitter

**Charts:** Sparkline, ProgressRing, Gauge, Heatmap

**Wizards:** Stepper, Wizard, WizardStep

**Patterns:** Header, Footer, Sidebar, PageHeader, EmptyState, ErrorState, Result

**Layouts:** SimpleLayout, SidebarLayout, AuthLayout, WizardLayout

**Composables:** useTheme, useLocale, useField, useToast, useWizard, useSidebar, useCommandPalette, useFocusTrap, useScrollLock, usePopover

## Dokumentation

Anwender-Dokumentation in vier Sprachen — wähle deine:

- 🇬🇧 **English** (default): [docs/en/](./docs/en/)
- 🇷🇺 **Русский**: [docs/ru/](./docs/ru/)
- 🇩🇪 **Deutsch**: [Erste Schritte](./docs/de/getting-started.md), [Theming](./docs/de/theming.md), [Tokens](./docs/de/tokens.md), [Icons](./docs/de/icons.md), [Patterns](./docs/de/patterns.md), [Validation](./docs/de/validation.md), [Charts](./docs/de/charts.md), [i18n](./docs/de/i18n.md)
- 🇨🇳 **中文**: [docs/zh/](./docs/zh/)

Mitwirkenden-Dokumentation (nur Englisch): [Architecture](./docs/ARCHITECTURE.md), [Component guidelines](./docs/COMPONENT_GUIDELINES.md), [Contributing](./docs/CONTRIBUTING.md), [Roadmap](./docs/ROADMAP.md).

## Theming

Alle Farben, Abstände und Schriften sind CSS-Variablen. Theme überschreiben — Tokens auf `:root` oder einem Container setzen:

```css
:root[data-theme='dark'] {
  --uid-color-primary: #8b5cf6;
  --uid-color-bg: #0a0a0a;
}
```

Mehr in [Theming](./docs/de/theming.md) und [Tokens](./docs/de/tokens.md).

## Icons

Sub-Export `@dskripchenko/ui/icons` re-exportiert alle ~1500 Lucide-Icons:

```ts
import { UidIcon } from '@dskripchenko/ui'
import { Heart, Star } from '@dskripchenko/ui/icons'
```

Mehr in [Icons](./docs/de/icons.md).

## Entwicklung

```bash
pnpm install
pnpm dev               # Storybook auf :6006
pnpm test              # Vitest
pnpm build             # Library-Build
pnpm build-storybook   # Storybook → storybook-static
pnpm build:analyze     # Bundle-Visualizer
pnpm changeset         # Änderung fürs nächste Release beschreiben
```

## Lizenz

MIT
