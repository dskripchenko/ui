# Design-Tokens

Jeder visuelle Wert im Kit ist als CSS Custom Property exponiert. Das ergibt Theming ohne Rebuild, Runtime-Anpassung und eine einzige Quelle der Wahrheit.

## Drei Ebenen

```
primitive  →  semantic  →  component
```

### 1. Primitive

Rohwerte ohne "wo verwenden"-Semantik. Theme-unabhängig.

```css
:root {
  /* Zinc — neutrale Basis */
  --uid-color-zinc-50:   #fafafa;
  --uid-color-zinc-100:  #f4f4f5;
  --uid-color-zinc-200:  #e4e4e7;
  --uid-color-zinc-300:  #d4d4d8;
  --uid-color-zinc-400:  #a1a1aa;
  --uid-color-zinc-500:  #71717a;
  --uid-color-zinc-600:  #52525b;
  --uid-color-zinc-700:  #3f3f46;
  --uid-color-zinc-800:  #27272a;
  --uid-color-zinc-900:  #18181b;
  --uid-color-zinc-950:  #09090b;

  /* Teal — Akzent */
  --uid-color-teal-400:  #2dd4bf;
  --uid-color-teal-500:  #14b8a6;
  --uid-color-teal-600:  #0d9488;
  /* … */

  /* Rose / Emerald / Amber für danger / success / warning */
}
```

Diese Werte werden **niemals direkt in Komponenten verwendet**.

### 2. Semantic

Beschreiben Bedeutung, nicht Farbe: "erhabene Oberfläche", "Primärtext", "subtiler Rahmen". Sie ändern sich pro Theme.

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
  --uid-danger:           var(--uid-color-rose-600);
  --uid-success:          var(--uid-color-emerald-600);
  --uid-warning:          var(--uid-color-amber-600);
}
```

Diese Schicht überschreiben Themes.

### 3. Component

Komponenten-spezifische Stellschrauben. Mit Fallback auf semantische Tokens. Überschreibe sie, um eine Komponente anzupassen.

```css
.uid-button {
  --uid-button-bg:       var(--uid-accent);
  --uid-button-bg-hover: var(--uid-accent-hover);
  --uid-button-color:    var(--uid-text-on-accent);
  --uid-button-radius:   var(--uid-radius-md);
}
```

Externe Anpassung — ohne `!important`:

```css
.my-page .uid-button {
  --uid-button-radius: 999px;
}
```

## Kategorien

| Kategorie | Präfix | Datei | Inhalt |
|---|---|---|---|
| Farbe (primitive) | `--uid-color-*` | `tokens/colors.css` | Zinc / Teal / Rose / Emerald / Amber |
| Farbe (semantic) | `--uid-surface-*`, `--uid-text-*`, `--uid-border-*`, `--uid-accent-*`, `--uid-danger-*`, `--uid-success-*`, `--uid-warning-*` | `styles/themes.css` | pro Theme unterschiedlich |
| Typografie | `--uid-font-*` | `tokens/typography.css` | Inter standardmäßig |
| Abstände | `--uid-space-*` | `tokens/spacing.css` | xs/sm/md/lg/xl/2xl/3xl, 4-px-Schritte |
| Größen | `--uid-size-*` | `tokens/sizing.css` | sm=32 / md=40 / lg=48 |
| Breakpoints | `--uid-bp-*` | `tokens/breakpoints.css` | sm/md/lg/xl/2xl, mobile-first |
| Radius | `--uid-radius-*` | `tokens/radius.css` | none/sm/md/lg/full |
| Schatten | `--uid-shadow-*` | `styles/themes.css` | sm/md/lg, theme-abhängig |
| Motion | `--uid-duration-*`, `--uid-ease-*` | `tokens/motion.css` | fast/base/slow + Easings |
| Z-Index | `--uid-z-*` | `tokens/z-index.css` | dropdown/sticky/overlay/modal/toast/tooltip |

## Namenskonventionen

- Immer `--uid-`-Präfix.
- Kategorie folgt: `--uid-{category}-{variant}-{tone?}`.
- Zustände als Suffixe: `-hover`, `-active`, `-disabled`, `-focus`.
- Größen mit T-Shirt-Skala (`xs/sm/md/lg/xl`), keine Zahlen.

## Abstände

Schritt **4 px**, T-Shirt-Benennung. Keine Zahlen.

```css
:root {
  --uid-space-0:    0;
  --uid-space-2xs:  2px;
  --uid-space-xs:   4px;
  --uid-space-sm:   8px;
  --uid-space-md:   16px;
  --uid-space-lg:   24px;
  --uid-space-xl:   32px;
  --uid-space-2xl:  48px;
  --uid-space-3xl:  64px;
}
```

12 px und 20 px sind keine Tokens — wenn nötig, lokale CSS-Variable mit explizitem Wert.

## Größen

Einheitliche Höhenskala für alle interaktiven Elemente:

```css
:root {
  --uid-size-sm:  32px;
  --uid-size-md:  40px;  /* Standard */
  --uid-size-lg:  48px;
}
```

## Radien

Die Skala ist klein — fünf Werte, die meisten Komponenten nutzen einen.

| Token | Wert | Wo |
|---|---|---|
| `--uid-radius-none` | 0 | Tabellen, Trenner, Codeblöcke |
| `--uid-radius-sm` | 3 px | Badge, Tag, Tooltip, Checkbox |
| `--uid-radius-md` | 6 px | **Standard** — Buttons, Inputs, Selects |
| `--uid-radius-lg` | 10 px | Cards, Modals, Popovers |
| `--uid-radius-full` | 9999 px | Avatare, Pill-Tags — bewusst |

## Breakpoints

**Mobile-first** (`min-width`). Basisstile ohne Media Query, Overrides klein → groß.

```css
:root {
  --uid-bp-sm:   480px;
  --uid-bp-md:   768px;
  --uid-bp-lg:   1024px;
  --uid-bp-xl:   1280px;
  --uid-bp-2xl:  1536px;
}
```

CSS Custom Properties **funktionieren nicht in `@media`** — Werte werden als Doku-Konstanten dupliziert und direkt verwendet:

```css
@media (min-width: 768px) { … }            /* OK */
@media (min-width: var(--uid-bp-md)) { … }  /* funktioniert nicht */
```

## Typografie

Standardschrift — **Inter**. Gewählt wegen Neutralität, Bildschirm-Lesbarkeit und Cyrillic+Latin-Abdeckung.

```css
:root {
  --uid-font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --uid-font-family-mono: 'IBM Plex Mono', 'Fira Code', ui-monospace, monospace;

  --uid-font-size-xs:   12px;
  --uid-font-size-sm:   14px;
  --uid-font-size-md:   16px;
  --uid-font-size-lg:   18px;
  --uid-font-size-xl:   20px;
  --uid-font-size-2xl:  24px;

  --uid-font-weight-regular:   400;
  --uid-font-weight-medium:    500;
  --uid-font-weight-semibold:  600;
  --uid-font-weight-bold:      700;
}
```

Das Kit lädt Inter **nicht selbst** — das ist Aufgabe des Konsumenten:

```bash
pnpm add @fontsource-variable/inter
```
```ts
import '@fontsource-variable/inter'
```

Der Fallback `system-ui` hält das UI ansehnlich, falls Inter nicht lädt.

## Motion

Drei Dauern, drei Kurven. Das UI bewegt sich vorhersagbar.

```css
:root {
  --uid-duration-fast:  100ms;
  --uid-duration-base:  200ms;
  --uid-duration-slow:  350ms;

  --uid-ease-out:    cubic-bezier(0, 0, 0.2, 1);
  --uid-ease-in:     cubic-bezier(0.4, 0, 1, 1);
  --uid-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Regel: Dinge **erscheinen langsamer als sie verschwinden** — so wirkt das UI reaktionsschnell.

## Z-Index

Feste Skala verhindert Schichtenkonflikte. Vielfache von 100 lassen Platz innerhalb jeder Schicht.

```css
:root {
  --uid-z-base:      0;
  --uid-z-raised:    1;
  --uid-z-dropdown:  100;
  --uid-z-sticky:    200;
  --uid-z-overlay:   300;
  --uid-z-modal:     400;
  --uid-z-toast:     500;
  --uid-z-tooltip:   600;
}
```

## Was kein Token ist

- Einmalige Werte, die nur in einer Komponente vorkommen.
- Magic Numbers aus Designs, die noch nicht stabil sind — inline mit TODO. Erst zu Token erheben, wenn Wiederholung sichtbar wird.
