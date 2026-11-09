# Theming

The kit ships with `light` and `dark` themes out of the box. Anything beyond that is a CSS-variable override.

## Principle

1. **Primitives** (the raw palette) **don't change** between themes.
2. **Semantic tokens** (`--uid-surface-*`, `--uid-text-*`, `--uid-border-*`, …) **are redefined** under `:root[data-theme='light']` and `:root[data-theme='dark']`.
3. Components reference **semantic tokens only**, never primitives directly. Switching the theme requires nothing but flipping the attribute.

## Setup

```ts
// in your app
import '@dskripchenko/ui/styles/tokens.css'   // primitives
import '@dskripchenko/ui/styles/themes.css'   // light + dark
import '@dskripchenko/ui/styles/reset.css'    // optional
```

Set the attribute on the root element:

```html
<html data-theme="light">
```

## Palette

The base themes are built on three pieces:

- **Zinc** — neutral base. Warm grey, not sterile. Sets the "temperature" of the whole UI.
- **Teal** — accent colour. Quiet enough not to shout, distinctive enough to guide the eye.
- **Soft dark** (`#1c1c1e`) — iOS/macOS-style dark theme. Not deep black but a soft charcoal that's easy on the eyes.

Semantic colours (danger / success / warning) are intentionally muted; saturated variants come out only in the dark theme where contrast matters more.

## Theme structure

```css
:root[data-theme='light'] {
  --uid-surface-base:     var(--uid-color-zinc-50);
  --uid-surface-raised:   var(--uid-color-white);
  --uid-surface-overlay:  var(--uid-color-white);

  --uid-text-primary:     var(--uid-color-zinc-900);
  --uid-text-secondary:   var(--uid-color-zinc-500);
  --uid-text-tertiary:    var(--uid-color-zinc-400);
  --uid-text-on-accent:   var(--uid-color-white);

  --uid-border-subtle:    var(--uid-color-zinc-200);
  --uid-border-default:   var(--uid-color-zinc-300);

  --uid-accent:           var(--uid-color-teal-500);
  --uid-accent-hover:     var(--uid-color-teal-600);
  --uid-accent-subtle:    var(--uid-color-teal-50);
  --uid-accent-text:      var(--uid-color-teal-700);
  --uid-accent-solid:       var(--uid-color-teal-700);
  --uid-accent-solid-hover: var(--uid-color-teal-800);

  --uid-danger:           var(--uid-color-rose-600);
  --uid-danger-text:      #bf193d;
  --uid-danger-solid:     var(--uid-color-rose-600);
  --uid-success:          var(--uid-color-emerald-600);
  --uid-success-text:     #04704f;
  --uid-success-solid:    var(--uid-color-emerald-700);
  --uid-warning:          var(--uid-color-amber-600);
  --uid-warning-text:     #985304;
  --uid-warning-solid:    var(--uid-color-amber-700);
  --uid-info-text:        var(--uid-color-blue-700);
  --uid-info-solid:       var(--uid-color-blue-600);
  --uid-neutral-text:     var(--uid-color-zinc-600);

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
  --uid-text-on-accent:   var(--uid-color-zinc-900); /* dark text on light fills */

  --uid-accent:           var(--uid-color-teal-400);
  --uid-accent-hover:     var(--uid-color-teal-300);
  --uid-accent-solid:       var(--uid-color-teal-400);
  --uid-accent-solid-hover: var(--uid-color-teal-300);

  /* semantics brighter for dark backgrounds; -text and -solid match them */
  --uid-danger:           var(--uid-color-rose-400);
  --uid-success:          var(--uid-color-emerald-400);
  --uid-warning:          var(--uid-color-amber-400);
  --uid-neutral-text:     var(--uid-color-zinc-300);
}
```

## Contrast

Text the components put on a fill or a tint keeps WCAG AA contrast (4.5:1) in both themes. Each colour role has tokens for that job:

| Token | Use | Light | Dark |
|---|---|---|---|
| `--uid-accent` | borders, focus rings, charts — no text on it, not a control's state | teal-500 | teal-400 |
| `--uid-accent-solid` (`-hover`) | fills that carry text (primary buttons, counters, selected days) and control states (checked checkbox and radio, switch on, play button) | teal-700 / teal-800 | teal-400 / teal-300 |
| `--uid-text-on-accent` | text on any `-solid` fill | white | zinc-900 |
| `--uid-accent-text` (`--uid-color-primary-text`) | accent-coloured text anywhere: links, active tabs, selected options, accent text on `--uid-accent-subtle` or a 15% accent tint | teal-700 | teal-300 |
| `--uid-{success,warning,danger,info}-text` | text of a status pill, tag or alert on its `-subtle` tint | `#04704f` / `#985304` / `#bf193d` / blue-700 | emerald-400 / amber-400 / rose-400 / blue-400 |
| `--uid-{success,warning,danger,info}-solid` | status fills that carry text: counters, timeline markers, danger button | emerald-700 / amber-700 / rose-600 / blue-600 | the `-400` steps |
| `--uid-neutral-text` | text of a neutral pill on a grey tint (up to 8% of itself) | zinc-600 | zinc-300 |

Computed ratios:

| Pair | Light | Dark |
|---|---|---|
| `text-on-accent` on `accent-solid` | 5.47 | 9.52 |
| `text-on-accent` on `accent-solid-hover` | 7.58 | 11.98 |
| `success-text` on `success-subtle` | 5.80 | 7.88 |
| `warning-text` on `warning-subtle` | 5.67 | 8.97 |
| `danger-text` on `danger-subtle` | 5.59 | 5.81 |
| `info-text` on `info-subtle` | 6.16 | 5.78 |
| `text-on-accent` on `success-solid` / `warning-solid` / `danger-solid` / `info-solid` | 5.48 / 5.02 / 4.70 / 5.17 | 9.22 / 10.61 / 6.58 / 6.97 |
| `neutral-text` on itself at 8% over `surface-raised` | 7.03 | 7.79 |
| `accent-text` on `surface-raised` / `surface-base` | 5.47 / 5.24 | 9.42 / 11.50 |
| `accent-solid` against `surface-raised` / `surface-base` (controls, 3:1 needed) | 5.47 / 5.24 | 7.49 / 9.14 |

Avatar initials are white on a fill picked from the name: the palette is the 700 steps of indigo, violet, pink, orange, green, teal, blue and red, 5.02:1 (green) to 7.90:1 (indigo), the same in both themes.

`--uid-text-tertiary` stays below 4.5:1 on purpose (placeholders, disabled text, decoration). Text that carries meaning uses `--uid-text-secondary` or stronger.

A custom theme that changes these colours should keep the pairs above 4.5:1; `src/__guards__/contrast.spec.ts` checks the built-in themes.

## Default and `prefers-color-scheme`

The kit **doesn't pick a theme for you**. With no `data-theme` attribute, the `:root` defaults equivalent to `light` apply.

To follow the system preference, do it on the app side:

```ts
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light'
```

The kit ships a `useTheme()` composable that wraps reading/writing the attribute and subscribing to system changes.

## Custom themes

Define your own theme — it's just another selector:

```css
:root[data-theme='midnight'] {
  --uid-surface-base:   #0d0b1f;
  --uid-text-primary:   #e0d8ff;
  --uid-accent:         #b794f4;
  /* the rest can mirror dark */
}
```

```html
<html data-theme="midnight">
```

The rule: redefine **semantic variables only**, leave primitives alone.

## Per-component overrides

Every component has local variables that fall back to semantics. Override them in scope:

```css
.landing-cta .uid-button {
  --uid-button-radius: 999px;
  --uid-button-bg: linear-gradient(90deg, #f43f5e, #f59e0b);
}
```

This doesn't break theming — the override only applies inside the selector.

A denser table, for example, takes smaller cell paddings:

```css
.issues .uid-table {
  --uid-table-head-padding-y: 8px;
  --uid-table-cell-padding-y: 6px;
  --uid-table-cell-padding-x: 12px;
}
```

## Print

On paper (`@media print`) the components that live inside pages print as
content, not as controls: the kanban's filters, actions, lock and add
buttons, the calendar's view switch and arrows, the event calendar's actions, the code block's copy button and the
video's controls are hidden; the board's columns share the page's width
instead of scrolling sideways, and a card is not split across sheets; a
markdown document prints in one column without its table of contents, a
heading stays with what follows it; a code block shows every line, wrapped.

## Storybook

The `@storybook/addon-themes` toolbar toggles `data-theme` on the story iframe's `<html>`:

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

Every component in Storybook should look correct in both themes — that's part of the definition of done.

## Anti-patterns

- ❌ Hardcoded colours in component styles (`color: #333`).
- ❌ Using primitives directly in components (`color: var(--uid-color-neutral-900)`).
- ❌ Theme switching via `class="dark"` — we use `data-theme`, don't mix.
- ❌ JS theming logic inside components. Themes are CSS; the component knows nothing about them.
