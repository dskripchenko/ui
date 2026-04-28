# Icons

The kit ships with extensive iconography — ~1500 [Lucide](https://lucide.dev/) icons available out of the box, no extra installation. A thin `UidIcon` wrapper sits on top of Lucide for a unified API around size, color, theming, and a11y.

## Approach

- **Source** — `lucide-vue-next` (MIT). Installed automatically as a regular `dependency`.
- **No custom set.** Maintaining ~1500 SVGs is unnecessary overhead.
- **No bundling.** All icons are tree-shakable: what you don't import doesn't ship.
- **No CSS classes.** Icons are Vue components, not a sprite sheet or webfont. Inline SVGs in the DOM with full tree-shaking.

## Two ways to use

The kit supports two paths. They complement each other — pick by task.

### A. Static import (the main path)

Standard. Import the icon as a Vue component and pass it to `<UidIcon :icon>`. The bundler sees an explicit dependency — only used icons end up in the bundle.

```vue
<script setup lang="ts">
import { UidIcon, UidButton } from '@dskripchenko/ui'
import { Check, X, ChevronRight } from 'lucide-vue-next'
</script>

<template>
  <UidIcon :icon="Check" />
  <UidIcon :icon="X" size="sm" />

  <UidButton variant="primary">
    <UidIcon :icon="ChevronRight" /> Next
  </UidButton>
</template>
```

Equivalent import via the kit (same set, single mental namespace):

```ts
import { Check, X, ChevronRight } from '@dskripchenko/ui/icons'
```

`@dskripchenko/ui/icons` is a sub-export that simply re-exports everything from `lucide-vue-next`.

### B. Dynamic registry

When the icon name comes from data (menu config, DB row, external prop) — the compiler can't see the concrete component. Register the needed icons once and look them up by string name.

```ts
// app-bootstrap.ts (run once at startup)
import { registerIcons } from '@dskripchenko/ui'
import { Check, X, Home, Settings, User, Bell } from 'lucide-vue-next'

registerIcons({
  check: Check,
  close: X,
  home: Home,
  settings: Settings,
  user: User,
  bell: Bell,
})
```

```vue
<script setup lang="ts">
import { UidIcon } from '@dskripchenko/ui'

const menu = [
  { label: 'Home', icon: 'home' },
  { label: 'Profile', icon: 'user' },
  { label: 'Settings', icon: 'settings' },
]
</script>

<template>
  <ul>
    <li v-for="item in menu" :key="item.label">
      <UidIcon :name="item.icon" /> {{ item.label }}
    </li>
  </ul>
</template>
```

If the registry has no icon by that name — `console.warn` in dev, nothing rendered in prod. **The dynamic registry is a deliberate trade-off:** you explicitly enumerate icons that may be referenced by string. This preserves tree-shaking — anything not registered doesn't ship.

### When to use which

| Scenario | Method |
|---|---|
| Icon is known at template authoring time | **A** |
| Inside kit components (Button slot, Input prefix) | **A** |
| Icon name comes from data (menu, config, props.iconName) | **B** |
| 90% of cases | **A** |

## `UidIcon` component

### Props

| Name | Type | Default | Description |
|---|---|---|---|
| `icon` | `Component` | — | Lucide component. Method A. |
| `name` | `string` | — | Name from the registry. Method B. |
| `size` | `UidIconSize` | `'md'` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` or a number (px) |
| `strokeWidth` | `number \| string` | `2` | Lucide stroke thickness (1–3 reasonable) |
| `color` | `string` | `'currentColor'` | Override colour (usually unnecessary — inherits from text) |
| `title` | `string` | — | Makes the icon "spoken": `role="img" + aria-label`. Without `title` the icon is decorative (`aria-hidden`). |
| `spin` | `boolean` | `false` | Infinite rotation (loaders) |

### Sizes

The size scale lives in CSS variables — override anywhere.

| Size | Default |
|---|---|
| `xs` | 12px |
| `sm` | 16px |
| `md` | 20px |
| `lg` | 24px |
| `xl` | 32px |
| number | `${value}px` |

If you want the icon to scale with text — don't set `size`. By default it's `1em` and follows the parent's `font-size`. Handy for inline icons in buttons and copy:

```html
<UidButton size="sm">  <!-- font-size: 14px -->
  <UidIcon :icon="Check" /> <!-- icon also 14px -->
  Save
</UidButton>
```

## Color and theming

The icon inherits the parent's `color` via `currentColor`. So in `<UidButton variant="primary">` it becomes white automatically; in `<UidButton variant="ghost">` it's text-coloured.

Per-icon override:

```html
<!-- via CSS variable (preferred) -->
<UidIcon :icon="AlertTriangle" style="--uid-icon-color: var(--uid-warning)" />

<!-- via prop (shorter, equivalent) -->
<UidIcon :icon="AlertTriangle" color="var(--uid-warning)" />
```

In dark theme, icons automatically become light because `--uid-text-primary` shifts in `themes.css`. No icon-side logic required.

## Accessibility

Icons are of two kinds — the kit splits them explicitly via `title`.

### Decorative (no title)

The icon duplicates the meaning of adjacent text. To a screen reader it's noise.

```html
<UidButton>
  <UidIcon :icon="Save" />  <!-- aria-hidden="true", screen reader skips -->
  Save
</UidButton>
<!-- announced as "Save, button" -->
```

### Spoken (with title)

The icon carries meaning by itself (icon-only button). Then `title` is required.

```html
<UidButton variant="ghost" aria-label="Close">
  <UidIcon :icon="X" title="Close" />
</UidButton>
```

Inside `UidIcon` it becomes:

```html
<svg role="img" aria-label="Close"> ... </svg>
```

If the icon is the only content of a clickable element, also duplicate the `aria-label` on the button (as above) — better compatibility with older screen readers.

### Rule of thumb

- Icon next to text → no `title` (decorative).
- Icon alone → `title` or `aria-label` on the parent button.

## Loading state (spin)

```html
<UidIcon :icon="Loader" spin />
<UidIcon :icon="RefreshCw" spin size="sm" />
```

CSS animation, no JS. Speed is governed by `--uid-icon-spin-duration` (default `1s`).

## Custom icons

Sometimes you need an icon Lucide doesn't have (a logo, project-specific). A simple Vue component that renders an SVG works — and is passed to `UidIcon` like any Lucide icon.

```vue
<!-- src/icons/MyLogo.vue in your app -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="..." />
  </svg>
</template>
```

```vue
<script setup lang="ts">
import { UidIcon } from '@dskripchenko/ui'
import MyLogo from './icons/MyLogo.vue'
</script>

<template>
  <UidIcon :icon="MyLogo" size="lg" />
</template>
```

Key requirement: SVG must use `fill="none" stroke="currentColor"` (or `fill="currentColor"`), otherwise the icon won't follow the parent's colour and won't switch on theme change.

For the dynamic registry, custom icons are registered the same way:

```ts
import { registerIcons } from '@dskripchenko/ui'
import MyLogo from './icons/MyLogo.vue'

registerIcons({ 'my-logo': MyLogo })
```

## Categories cheatsheet

Full searchable catalog: [lucide.dev/icons](https://lucide.dev/icons). Common names by category:

- **Arrows / navigation:** `ChevronUp/Down/Left/Right`, `ArrowUp/Down/Left/Right`, `MoveLeft`, `Undo2`, `Redo2`
- **Actions:** `Plus`, `Minus`, `X`, `Check`, `Edit`, `Pencil`, `Trash2`, `Save`, `Copy`, `Download`, `Upload`, `Search`, `Filter`, `RefreshCw`, `Lock`, `Unlock`
- **Status:** `CheckCircle2`, `XCircle`, `AlertCircle`, `AlertTriangle`, `Info`, `HelpCircle`, `Loader2`, `Star`, `Heart`
- **App nav:** `Home`, `Menu`, `MoreHorizontal`, `Settings`, `User`, `Users`, `LogIn`, `LogOut`, `Bell`, `Globe`
- **Files:** `File`, `FileText`, `FileCode`, `Folder`, `FolderOpen`, `Archive`, `Paperclip`
- **Communication:** `Mail`, `MessageCircle`, `Phone`, `Send`, `AtSign`, `Inbox`
- **Media:** `Play`, `Pause`, `Volume2`, `Image`, `Video`, `Mic`, `Camera`
- **Layout:** `LayoutGrid`, `LayoutDashboard`, `PanelLeft`, `Sidebar`, `Eye`, `EyeOff`
- **Time:** `Calendar`, `Clock`, `Timer`, `History`
- **Charts:** `BarChart3`, `LineChart`, `TrendingUp`, `TrendingDown`, `Activity`, `Database`
- **Theme:** `Sun`, `Moon`, `Palette`, `Paintbrush`

## Anti-patterns

- ❌ Hardcoding sizes in SVGs (`width="24"`). `UidIcon` drives width/height from CSS — hardcoded attributes break the `size` prop.
- ❌ Hardcoding colours in SVGs (`fill="#000"`). Use `currentColor`.
- ❌ Icon-only without `title`/`aria-label`. Screen reader misses the meaning.
- ❌ `import * as icons from 'lucide-vue-next'` — kills tree-shaking. Import only what you need.
- ❌ Registering all 1500 icons "just in case". Register only what's actually referenced by string.
- ❌ Using `UidIcon name="..."` for statically known icons. `:icon=` is type-safer and tree-shakable.
