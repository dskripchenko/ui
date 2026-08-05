# @dskripchenko/ui

## 1.2.1

### Fixed
- **Tabs that did not fit the width were cut off by the edge instead of
  scrolling.** On a phone, a form with seven tabs lost the last four
  altogether — they could not be reached at all. The tab list now scrolls
  horizontally on its own, and tabs no longer shrink into unreadable stubs.
  Vertical tabs are unaffected.

## 1.2.0

### Minor Changes

- UidTreeView: the `virtualRoot` prop — a virtual root node that wraps all `nodes` as its children. A string generates a non-selectable node with that label; a TreeNode is used as given (children are taken from `nodes` when not set). The virtual root is expanded by default.
- UidTreeView: default node icons — Folder/FolderOpen for branches (primary tone), CornerDownRight for leaves (tertiary); `node.icon` still takes precedence.
- UidTreeView: nodes with `selectable: false` cannot be selected by click or keyboard.

### Patch Changes

- UidTreeView: the inherited `list-style` is reset on the root `ul` and on `li` — list markers no longer show through in host projects without a CSS reset.
- UidDescriptionItem: removed an unused `defineSlots` assignment (lint error).

## 1.1.3

### Patch Changes

- useFocusTrap: `activate()` now prefers an `[autofocus]` element inside the container over the first focusable one — a modal focuses the input it should (a search field, say) instead of the close button.

## 1.0.2

### Patch Changes

- 1518201: Build: fixed the CSS `exports` map — the package declared `./styles/{tokens,themes,reset,global}.css`, while `dist/styles/` physically held only the aggregated `index.css` (component styles without themes or primitives). Strict resolvers (Vite, Node 20+) failed with `Missing specifier`, and even a deep import of `index.css` produced a UI with no palette.

  `pnpm build` now additionally emits:
  - `dist/styles/tokens.css` — primitives (palette, typography, spacing, sizing, radius, motion, z-index, breakpoints).
  - `dist/styles/themes.css` — `:root[data-theme="light|dark"]` plus semantic aliases.
  - `dist/styles/reset.css` — HTML normalization.
  - `dist/styles/global.css` — `:root` font-family and base typography.
  - `dist/styles/all.css` — a barrel: tokens + themes + reset + global + components, for a one-line import.
  - `dist/styles/index.css` (unchanged) — component styles only; the path was added to `exports` for backward compatibility with consumers that already hacked a deep import.

  Minimal import in a consumer:

  ```ts
  import '@dskripchenko/ui/styles/all.css'
  ```

  Granular:

  ```ts
  import '@dskripchenko/ui/styles/tokens.css'
  import '@dskripchenko/ui/styles/themes.css'
  import '@dskripchenko/ui/styles/reset.css' // optional
  import '@dskripchenko/ui/styles/global.css' // optional
  import '@dskripchenko/ui/styles/index.css' // components
  ```

## 1.0.1

### Patch Changes

- d3b36b3: `UidGauge`: fixed needle positioning (`showNeedle`). Because of `transform-box: fill-box`, the SVG `rotate(angle x y)` attribute worked relative to the line's bounding box rather than the gauge centre — the needle rendered as a small dot or as a line not starting from the centre.

## 1.0.0

### Major Changes

- 5ffd6ad: 🎉 **Version 1.0 — stable release**

  Public commitment to API stability. From now on:
  - All breaking changes (renamed/removed props, changed default behaviour, removed components/composables) will only ship in major bumps.
  - New features and components — `minor`.
  - Bug fixes, doc tweaks, internal refactors that don't change the API — `patch`.

  No code changes from `0.6.x`; this release simply formalizes the API surface as stable.

  Library highlights at 1.0:
  - 70+ components: forms, navigation, overlays, data display, charts, patterns, layouts
  - Light + Dark themes via `data-theme`, full design-token system
  - i18n via `UidLocaleProvider` + built-in `ru` / `en` locales
  - A11y: roving tabindex, keyboard nav, ARIA across all interactive components
  - Built-in SVG charts (Sparkline, ProgressRing, Gauge, Heatmap) — no runtime chart deps
  - Multi-language docs (en / ru / de / zh)
  - Storybook deployed at [dskripchenko.github.io/ui](https://dskripchenko.github.io/ui/)

### Patch Changes

- 8b580b9: `package.json`: added metadata for the npm page — `description`, `keywords`, `homepage`, `repository`, `bugs`, `license`, `author`, `engines`, `packageManager`, `publishConfig.access: public`. An MIT `LICENSE` file referenced by the README was added as well.

## 0.6.0

### Minor Changes

- 286f079: Round 5 — charts (SVG primitives, no runtime dependencies):
  - **UidSparkline** — a miniature trend chart: line/bar/area, smoothing, dots, zero line; for KPI cards and inline insertions
  - **UidProgressRing** — circular progress on SVG `stroke-dasharray`, an indeterminate mode, a custom label/slot
  - **UidGauge** — a semicircular dial with colour `ranges` and an optional needle; aria-meter
  - **UidHeatmap** — a GitHub-style calendar heatmap with automatic level bucketing, a legend and a tooltip through `<title>`

  Full charts (Line/Bar/Pie/Area) are deliberately out of the kit — guidance on pairing with Chart.js / ECharts lives in `docs/CHARTS.md`.

### Patch Changes

- 1ee3a22: The remainder of the a11y audit is closed:
  - **TreeView** — roving tabindex (only the active node is in the Tab order, the rest are `-1`) and full keyboard navigation: ArrowUp/Down between visible siblings, ArrowRight expands or descends, ArrowLeft collapses or returns to the parent, Home/End jump to the first/last visible node.
  - **TimePicker** — every column now carries `role="listbox"` and an `aria-label`, cells carry `role="option"` and `aria-selected`. ArrowUp/Down/Home/End move through the values inside a column with smooth scrolling, Enter confirms the choice, Escape closes.
  - **ColorPicker** — the hue and alpha tracks now carry `role="slider"`, `aria-valuemin/max/now` and a `tabindex`. Arrows adjust the value (Shift = step of 10), Home/End jump to the extremes. The saturation/brightness area is a `role="application"` with two-dimensional arrow navigation.

## 0.5.0

### Minor Changes

- 81c1186: Round 4 — five new components:
  - **UidCalendar** — a full-size month calendar with events, month navigation, a "Today" button, a compact variant and `min`/`max`
  - **UidCarousel** — a slider with autoplay, indicators, arrows, horizontal/vertical modes and keyboard navigation; generic typing for items
  - **UidCascader** — level-by-level cascading selection (country → city → district) with a hover/click expand trigger, path display and a custom separator
  - **UidTransfer** — two lists with items moved between them, optional search and select-all within the current filter
  - **UidNotificationBadge** — a counter or dot over any element (an icon, an avatar, a button) with configurable placement, tone, max and offset

- 22f2c82: **i18n**: every string in the components has been moved into locales and can be overridden.

  New exports:
  - `UidLocaleProvider` — a wrapper component with the `locale: UidLocale | UidPartialLocale` prop
  - `useLocale()` — a composable that reads the current locale
  - `provideLocale(source)` — programmatic locale provision
  - Bundled locales: `ru` (default) and `en`
  - Types: `UidLocale`, `UidPartialLocale`

  String overrides are supported in every key component: Select, Combobox, DatePicker, DateRangePicker, TimePicker, TreeSelect, NumberInput, TagsInput, FileUpload, Mention, BackTop, Tour, TreeView, Pagination, Modal, Drawer, Toast, Alert, Tag, Code, DescriptionList.

  Usage:

  ```vue
  <UidLocaleProvider :locale="en">
    <App />
  </UidLocaleProvider>
  ```

  Or a partial override:

  ```vue
  <UidLocaleProvider :locale="{ tour: { next: 'Forward' } }">
    <App />
  </UidLocaleProvider>
  ```

  The default is still `ru` — without the wrapper everything works as before.

### Patch Changes

- a7c0e6b: A11y improvements and a bundle-size analysis tool:
  - **Bundle visualizer** — `rollup-plugin-visualizer` is wired in; the new `pnpm build:analyze` script generates an interactive treemap in `stats.html`
  - **DatePicker** — full keyboard navigation across the day grid (arrows, PageUp/Down, Home/End, Enter, Escape) with roving tabindex; the trigger gained `role="combobox"`, `aria-haspopup="dialog"` and an `aria-label`
  - **Picker triggers** in DateRangePicker, TimePicker and TreeSelect — added `role="combobox"`/`aria-haspopup`/`aria-controls`/`aria-label`
  - **UidMenu trigger** — `tabindex="0"`, `role="button"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`
  - **UidPopover trigger** — `role="button"`, `tabindex`, `aria-haspopup="dialog"`, Enter/Space; the popover carries `role="dialog"`
  - **UidCombobox** — `role="combobox"` moved from the wrapper onto the `<input>` (per WAI-ARIA 1.2)
  - **UidCard** with `clickable` — gains `role="button"`, a `tabindex`, Enter/Space handling and a `click` event
  - **UidTable** — sortable headers gained a `tabindex`, `role="button"` and Enter/Space handling
  - **UidAnchor** — the active link gains `aria-current="location"`
  - **UidTour** — Escape closes the tour, ArrowLeft/Right switch steps, focus moves into the popup on open and returns to the originating element on close
  - **UidFileUpload** — the double tab stop is gone (the input gained `tabindex="-1"` and `aria-hidden`)

## 0.4.0

### Minor Changes

- cfb6467: Seven low-priority components added:
  - **UidBackTop** — a "back to top" button that appears once a scroll threshold is passed, with a smooth return
  - **UidAffix** — a sticky wrapper with `offsetTop`/`offsetBottom` through `position: sticky` plus IntersectionObserver, emitting `change(affixed)`
  - **UidWatermark** — a diagonal watermark drawn through canvas into a data URL, with configurable font, colour, tilt and step
  - **UidAnchor** — anchor navigation that highlights the active section through IntersectionObserver, with smooth scrolling
  - **UidTour** — guided tooltips over the UI: a spotlight on the target element, steps, a centred modal mode and a mask
  - **UidMention** — a textarea with @-mentions: a trigger character or characters, a popup list, ↑↓ Enter/Tab navigation
  - **UidTreeSelect** — a TreeView + Select hybrid: a trigger showing the selected value, single/multiple modes, chips with maxTagCount

## 0.3.0

### Minor Changes

- 5e93139: Five medium-priority components added:
  - **UidRating** — a five-star (or N-star) rating with half steps, custom icons, tones and keyboard navigation
  - **UidSplitter** — resizable panels, horizontal or vertical, with min/max, step, dragging and keyboard control
  - **UidStat** — a KPI card with a number, a delta (up/down/flat), formatting through a locale or a formatter, a tone-coloured icon and a loading state
  - **UidResult** — a pattern page for success/info/warning/error with a title, a description, extra content and actions
  - **UidDescriptionList** / **UidDescriptionItem** — a key-value list with horizontal/vertical modes, a multi-column grid, a bordered variant and copy-to-clipboard

## 0.2.0

### Minor Changes

- ede4523: Nine new components added:
  - **UidNumberInput** — numeric input with +/− buttons, a step, precision and clamping to min/max
  - **UidTimePicker** — HH:MM(:SS) time selection, 12/24-hour mode, a configurable step
  - **UidDateRangePicker** — date-range selection with two months and presets
  - **UidTagsInput** — a field that turns input into chips on Enter/comma/paste, with validation
  - **UidCombobox** — a Select with search over the typed text and optional allow-create
  - **UidTreeView** — a hierarchical tree with expand/collapse, single/multiple selection and checkboxes propagating state between parents and children
  - **UidTimeline** / **UidTimelineItem** — an event feed with tones and an alternating layout
  - **UidFileUpload** — uploads with drag-and-drop, progress and accept/maxSize/maxFiles
  - **UidCode** — a code block and an inline variant with copying, line numbers and max-height

## 0.1.0

### Minor Changes

- eba13c8: Initial release of the component library.

  Components: Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, ColorPicker, Command, Container, DatePicker, Divider, Drawer, FormField, Grid, Input, Link, Menu, Modal, Pagination, Popover, Progress, Radio, Select, Skeleton, Slider, Spinner, Stack, Stepper, Switch, Table, Tabs, Tag, Textarea, Toast, Tooltip, VirtualList.

  Patterns: EmptyState, ErrorState, Footer, Header, PageHeader, Sidebar, Wizard.

  Layouts: Auth, Sidebar, Simple, Wizard.
