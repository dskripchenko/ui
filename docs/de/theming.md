# Theming

Das Kit liefert `light` und `dark` Themes von Haus aus. Alles darüber hinaus ist eine CSS-Variable-Überschreibung.

## Prinzip

1. **Primitive** (die Rohpalette) **ändern sich nicht** zwischen Themes.
2. **Semantische Tokens** (`--uid-surface-*`, `--uid-text-*`, `--uid-border-*`, …) **werden überschrieben** unter `:root[data-theme='light']` und `:root[data-theme='dark']`.
3. Komponenten verweisen **nur** auf semantische Tokens, niemals direkt auf Primitive. Theme-Wechsel braucht nichts außer dem Attribut umzulegen.

## Setup

```ts
import '@dskripchenko/ui/styles/tokens.css'   // Primitive
import '@dskripchenko/ui/styles/themes.css'   // Light + Dark
import '@dskripchenko/ui/styles/reset.css'    // optional
```

Attribut auf dem Root-Element:

```html
<html data-theme="light">
```

## Palette

Die Basis-Themes bauen auf drei Säulen:

- **Zinc** — neutrale Basis. Warmes Grau, nicht steril. Bestimmt die "Temperatur" des UI.
- **Teal** — Akzentfarbe. Leise genug, um nicht zu schreien, markant genug, um den Blick zu führen.
- **Soft Dark** (`#1c1c1e`) — Dark-Theme im iOS/macOS-Stil. Kein tiefes Schwarz, sondern sanfte Kohle, augenfreundlich.

Semantische Farben (danger / success / warning) sind absichtlich gedämpft; gesättigte Varianten kommen nur im Dark-Theme zum Einsatz, wo Kontrast wichtiger ist.

## Theme-Struktur

```css
:root[data-theme='light'] {
  --uid-surface-base:     var(--uid-color-zinc-50);
  --uid-surface-raised:   var(--uid-color-white);
  --uid-surface-overlay:  var(--uid-color-white);

  --uid-text-primary:     var(--uid-color-zinc-900);
  --uid-text-secondary:   var(--uid-color-zinc-500);
  --uid-text-tertiary:    var(--uid-color-zinc-400);

  --uid-border-subtle:    var(--uid-color-zinc-200);
  --uid-border-default:   var(--uid-color-zinc-300);

  --uid-accent:           var(--uid-color-teal-500);
  --uid-accent-hover:     var(--uid-color-teal-600);
  --uid-accent-subtle:    var(--uid-color-teal-50);

  --uid-danger:           var(--uid-color-rose-600);
  --uid-success:          var(--uid-color-emerald-600);
  --uid-warning:          var(--uid-color-amber-600);

  --uid-shadow-sm:  0 1px 2px rgb(0 0 0 / 0.05);
  --uid-shadow-md:  0 4px 12px rgb(0 0 0 / 0.08);
  --uid-shadow-lg:  0 8px 24px rgb(0 0 0 / 0.12);
}

:root[data-theme='dark'] {
  --uid-surface-base:     #1c1c1e;
  --uid-surface-raised:   #2c2c2e;
  --uid-surface-overlay:  #3a3a3c;

  --uid-text-primary:     var(--uid-color-zinc-100);
  --uid-text-secondary:   var(--uid-color-zinc-400);
  --uid-text-tertiary:    var(--uid-color-zinc-600);

  --uid-accent:           var(--uid-color-teal-400);
  --uid-danger:           var(--uid-color-rose-400);
  --uid-success:          var(--uid-color-emerald-400);
  --uid-warning:          var(--uid-color-amber-400);
}
```

## Standard und `prefers-color-scheme`

Das Kit **wählt kein Theme für dich aus**. Ohne `data-theme` greifen die `:root`-Defaults, die `light` entsprechen.

Um die Systempräferenz zu folgen, mach das auf App-Seite:

```ts
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light'
```

Das Kit liefert `useTheme()` als Composable, das das Lesen/Schreiben des Attributs und das Abonnieren der Systempräferenz kapselt.

## Eigene Themes

Definiere dein eigenes Theme — es ist nur ein weiterer Selektor:

```css
:root[data-theme='midnight'] {
  --uid-surface-base:   #0d0b1f;
  --uid-text-primary:   #e0d8ff;
  --uid-accent:         #b794f4;
  /* der Rest wie in dark */
}
```

```html
<html data-theme="midnight">
```

Regel: Überschreibe **nur semantische Variablen**, lass Primitive in Ruhe.

## Per-Komponente-Überschreibungen

Jede Komponente hat lokale Variablen mit Fallback auf Semantik. Überschreibe sie scoped:

```css
.landing-cta .uid-button {
  --uid-button-radius: 999px;
  --uid-button-bg: linear-gradient(90deg, #f43f5e, #f59e0b);
}
```

Das bricht das Theming nicht — die Überschreibung gilt nur innerhalb des Selektors.

## Storybook

Die Toolbar von `@storybook/addon-themes` schaltet `data-theme` auf dem Story-iframe um:

```ts
import { withThemeByDataAttribute } from '@storybook/addon-themes'

export const decorators = [
  withThemeByDataAttribute({
    themes: { light: 'light', dark: 'dark' },
    defaultTheme: 'light',
    attributeName: 'data-theme',
  }),
]
```

Jede Komponente in Storybook muss in beiden Themes korrekt aussehen — das gehört zur Definition of Done.

## Anti-Patterns

- ❌ Hardcodierte Farben in Komponentenstilen (`color: #333`).
- ❌ Primitive direkt in Komponenten verwenden (`color: var(--uid-color-neutral-900)`).
- ❌ Theme-Wechsel über `class="dark"` — wir nutzen `data-theme`, nicht mischen.
- ❌ JS-Theming-Logik in Komponenten. Themes sind CSS; die Komponente weiß nichts davon.
