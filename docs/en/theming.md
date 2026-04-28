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
  --uid-accent-hover:     var(--uid-color-teal-300);

  /* semantics brighter for dark backgrounds */
  --uid-danger:           var(--uid-color-rose-400);
  --uid-success:          var(--uid-color-emerald-400);
  --uid-warning:          var(--uid-color-amber-400);
}
```

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
