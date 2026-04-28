# Design tokens

Every visual value in the kit is exposed as a CSS Custom Property. That gives you theming without rebuilds, runtime customization, and a single source of truth.

## Three levels

```
primitive  →  semantic  →  component
```

### 1. Primitive

Raw values with no "where to use" semantics. Theme-agnostic.

```css
:root {
  /* Zinc — neutral base */
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

  /* Teal — accent */
  --uid-color-teal-400:  #2dd4bf;
  --uid-color-teal-500:  #14b8a6;
  --uid-color-teal-600:  #0d9488;
  /* … */

  /* Rose / Emerald / Amber for danger / success / warning */
}
```

These values are **never used directly in components.**

### 2. Semantic

Describe the meaning, not the colour: "raised surface", "primary text", "subtle border". They change between themes.

```css
:root[data-theme='light'] {
  --uid-surface-base:     var(--uid-color-zinc-50);    /* page background */
  --uid-surface-raised:   var(--uid-color-white);      /* cards, panels */
  --uid-surface-overlay:  var(--uid-color-white);      /* modals, popovers */

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

This is the layer themes redefine.

### 3. Component

Per-component knobs. Always have a fallback to a semantic token. Override these to customize a single component.

```css
.uid-button {
  --uid-button-bg:       var(--uid-accent);
  --uid-button-bg-hover: var(--uid-accent-hover);
  --uid-button-color:    var(--uid-text-on-accent);
  --uid-button-radius:   var(--uid-radius-md);
  /* … */
}
```

Outside override — no `!important` needed:

```css
.my-page .uid-button {
  --uid-button-radius: 999px;
}
```

## Categories

| Category | Prefix | File | Notes |
|---|---|---|---|
| Colour (primitive) | `--uid-color-*` | `tokens/colors.css` | Zinc / Teal / Rose / Emerald / Amber |
| Colour (semantic) | `--uid-surface-*`, `--uid-text-*`, `--uid-border-*`, `--uid-accent-*`, `--uid-danger-*`, `--uid-success-*`, `--uid-warning-*` | `styles/themes.css` | Different per theme |
| Typography | `--uid-font-family-*`, `--uid-font-size-*`, `--uid-font-weight-*`, `--uid-line-height-*` | `tokens/typography.css` | Inter by default |
| Spacing | `--uid-space-*` | `tokens/spacing.css` | xs/sm/md/lg/xl/2xl/3xl, 4px step |
| Sizing | `--uid-size-*` | `tokens/sizing.css` | sm=32 / md=40 / lg=48 — interactive heights |
| Breakpoints | `--uid-bp-*` | `tokens/breakpoints.css` | sm/md/lg/xl/2xl, mobile-first |
| Radius | `--uid-radius-*` | `tokens/radius.css` | none/sm/md/lg/full |
| Shadow | `--uid-shadow-*` | `styles/themes.css` | sm/md/lg, theme-aware |
| Motion | `--uid-duration-*`, `--uid-ease-*` | `tokens/motion.css` | fast/base/slow + easings |
| Z-index | `--uid-z-*` | `tokens/z-index.css` | dropdown/sticky/overlay/modal/toast/tooltip |

## Naming conventions

- Always `--uid-` prefix.
- Category follows the prefix: `--uid-{category}-{variant}-{tone?}`.
- States are suffixes: `-hover`, `-active`, `-disabled`, `-focus`.
- Sizes use a t-shirt scale (`xs/sm/md/lg/xl`), not numbers — to avoid pixel coupling.

Good: `--uid-color-blue-500`, `--uid-text-primary`, `--uid-button-bg-hover`.
Bad: `--blue`, `--main-color`, `--btn-h-bg`.

## Spacing

Step is **4px**, naming is t-shirt. Numbers are not used.

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

12px and 20px are not tokens — when needed inside a component, use a local CSS variable with an explicit value.

## Sizing

Single height scale for all interactive elements:

```css
:root {
  --uid-size-sm:  32px;
  --uid-size-md:  40px;  /* default */
  --uid-size-lg:  48px;
}
```

In components:
```css
.uid-button       { min-height: var(--uid-button-height, var(--uid-size-md)); }
.uid-button--sm   { --uid-button-height: var(--uid-size-sm); }
.uid-button--lg   { --uid-button-height: var(--uid-size-lg); }
```

## Radii

The scale is intentionally small — five values, most components use one.

| Token | Value | Where |
|---|---|---|
| `--uid-radius-none` | 0 | Tables, dividers, code blocks |
| `--uid-radius-sm` | 3px | Badge, tag, tooltip, checkbox |
| `--uid-radius-md` | 6px | **Default** — buttons, inputs, selects, dropdowns |
| `--uid-radius-lg` | 10px | Cards, modals, popovers, drawers |
| `--uid-radius-full` | 9999px | Avatars, pill tags — only deliberately |

## Breakpoints

**Mobile-first** (`min-width`). Base styles are unprefixed, overrides go small → large.

```css
:root {
  --uid-bp-sm:   480px;
  --uid-bp-md:   768px;
  --uid-bp-lg:   1024px;
  --uid-bp-xl:   1280px;
  --uid-bp-2xl:  1536px;
}
```

CSS custom properties **don't work in `@media`** queries — values are duplicated as documentation constants and applied directly:

```css
@media (min-width: 768px) { … }            /* OK */
@media (min-width: var(--uid-bp-md)) { … }  /* WRONG */
```

## Typography

Default font — **Inter**. Picked for neutrality, screen readability, and excellent Cyrillic + Latin coverage.

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

  --uid-line-height-tight:   1.25;
  --uid-line-height-snug:    1.375;
  --uid-line-height-normal:  1.5;
}
```

The kit **does not load Inter for you** — that's the consumer's responsibility:

```bash
pnpm add @fontsource-variable/inter
```
```ts
import '@fontsource-variable/inter'
```

The `system-ui` fallback in `--uid-font-family-sans` keeps the UI presentable if Inter doesn't load.

## Motion

Three durations and three curves. The UI moves predictably, no surprises.

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

Rule: things **enter slower than they exit** — that's what makes the UI feel responsive.

## Z-index

Fixed scale prevents layer fights. Multiples of 100 leave room within each layer.

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

## What's not a token

- One-off values used only in a single component.
- Magic numbers from designs that haven't settled — keep them inline with a TODO; promote to a token when you see them repeat.
