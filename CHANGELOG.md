# @dskripchenko/ui

## 1.11.0

### Minor Changes

- d9f6f4d: feat(breadcrumb): `collapse` follows the room around the trail and can fold the first crumb
  - `UidBreadcrumb collapse` now also watches its parent element, plus an optional `container` (an element, or a CSS selector matched with `closest()` from the `<nav>`). A trail inside a wrapper that is sized by its content used to shrink together with its collapsed crumbs and never expand again; it now re-measures when the parent or the container changes width. Only width changes trigger a re-measure.
  - New `collapseFirst` prop: when even "first › … › current" does not fit, the first crumb collapses into the "…" too, leaving "… › current". The current crumb stays visible and truncates with an ellipsis; the "…" menu lists the first crumb along with the middle ones. Off by default, so existing trails keep their first crumb.
  - A collapsed trail is checked once more before it settles: siblings that shrank to make room for the full trail while it was measured take that room back, so the trail keeps folding (next middle crumb, then the first with `collapseFirst`) while it still overflows. The "…" probe now measures the button variant when `collapseMenu` is on, so its width matches the rendered "…".

## 1.10.0

### Minor Changes

- b0dba0f: feat(heatmap): `UidHeatmapMatrix` — a rows × columns matrix heatmap

  The calendar `UidHeatmap` computes dates itself, so it cannot show an arbitrary matrix with axis labels. `UidHeatmapMatrix` draws exactly the matrix it is given:
  - `rows`, `cols` and `values[row][col]` (`number | null`); `null` or a missing cell is an empty outlined "no data" cell, distinct from `0`;
  - every column is labelled; labels that do not fit are rotated 45° and thinned (`colLabels: 'auto' | 'horizontal' | 'rotated'`);
  - `colorScale`: `default` (the theme accent), `viridis`, `magma`, `plasma`, `inferno`, `blues`, `greens`, `reds`, a single CSS colour, or custom stops (`string[]`); `min` / `max` fix the domain;
  - a "row × column: value" tooltip (`formatValue`, or the `#tooltip` slot), a min → max legend with a "no data" key;
  - `role="grid"` semantics with row/column headers, per-cell `aria-label`s and arrow-key navigation; cells stretch to the container and scroll below `minCellWidth`.

  Also exported: `heatmapColorScales`, `resolveHeatmapStops`, `heatmapColorAt`. Locale bags gain `heatmap.matrixSummary` and `heatmap.noData`. `UidHeatmap` is unchanged.

## 1.9.0

### Minor Changes

- e9282fa: fix(fields): forward native attributes to the control instead of the wrapper

  `UidInput`, `UidTextarea`, `UidNumberInput`, `UidCheckbox`, `UidSwitch`, `UidRadio`, `UidSlider`, `UidTagsInput`, `UidCombobox`, `UidMention` and `UidPageSize` now use `inheritAttrs: false`. `class` and `style` stay on the root element; every other unknown attribute (`list`, `maxlength`, `minlength`, `pattern`, `inputmode`, `autocomplete`, `name`, `spellcheck`, `data-*`, `aria-*`) and fallthrough listener (`onInput`, `onClick`, ...) now lands on the native `<input>`/`<textarea>`/`<select>`, so they actually take effect. `UidNumberInput` keeps `inputmode="decimal"` as a default that can be overridden.

  Fallthrough listeners (e.g. `@click`) now bind to the native control rather than the root, so they no longer fire on clicks on the label or hint.

## 1.8.0

### Minor Changes

- b2fa5d3: UidStat: `trendPlacement` (`inline` | `below`). `below` puts the trend on its own line under the value, so a row of cards stays uniform whatever the length of each value; `inline` (default) keeps the previous behaviour.

  UidGauge: with `ranges`, the track's round caps no longer peek out as faint dots past the zones' square ends.

## 1.7.0

### Minor Changes

- fa72557: Form controls of one size share one height, so a select next to an input lines up in a form row. Every control box takes its height from `--uid-size-sm|md|lg` (32/40/48px): UidSelect's trigger was 31/42/50px, the date, date-range and time picker triggers 42px, UidColorPicker 39px, UidTagsInput sm 38px, UidCombobox sm 34px. UidDatePicker, UidDateRangePicker, UidTimePicker, UidTreeSelect, UidCascader and UidColorPicker gain a `size` prop (`sm` | `md` | `lg`, default `md`). A guard spec keeps literal heights out of the control boxes.
- b3c0e3e: Floating layers work inside modals and drawers.
  - `UidDatePicker`, `UidDateRangePicker`, `UidTimePicker`, `UidTreeSelect`, `UidCascader`, `UidCombobox`, `UidColorPicker` and `UidMention` rendered their panel in place, so inside a `UidModal`/`UidDrawer` it was clipped by the body's overflow and sat under the footer. Their panels are now teleported to the body and positioned `fixed` (new internal `useFloatingPanel`): they follow the anchor on scroll and resize, flip above it when there is no room below, and cap their height (scrolling) when there is room on neither side.
  - One stacking scale: `base < sticky < dropdown < overlay < drawer = modal < popover < toast < tooltip`. New tokens `--uid-z-popover` (450) and `--uid-z-drawer` (400); `--uid-z-sticky` and `--uid-z-dropdown` swap places (100 / 200). Every teleported layer — select, menu, popover, breadcrumb overflow and the pickers — stacks at `--uid-z-popover`, above modals, drawers and the command palette.
  - Escape closes only the top layer: a picker or menu inside a modal closes alone, and a drawer opened from a modal closes without the modal (`UidModal`, `UidDrawer`, `UidCommand` keep an overlay stack and ignore an Escape already handled).
  - Focus rings use `--uid-color-focus-ring` everywhere: a zero-specificity `:focus-visible` rule in `global.css` replaces the browser's default blue ring (e.g. the date picker's day cells), and component rings that used `--uid-color-primary`/`--uid-accent` now use the focus-ring token.
  - `UidTable` emits `row-click` with the `MouseEvent` as the second argument, and no longer emits it for clicks on interactive elements inside a cell (links, buttons, inputs, `role="checkbox|switch|button|…"`, `[contenteditable]`, `[data-row-click-ignore]`) or at the end of a text selection.
  - `UidColorPicker` takes its placeholder from the locale (new `placeholder` prop) instead of a hard-coded Russian string.

- 8297b3f: Every caption follows the kit locale, and number inputs keep their value readable.
  - Hard-coded Russian captions, aria-labels and defaults moved into the locale bags (`ru`/`en`, typed in `UidLocale`) and read through `useLocale()`; the props stay as overrides. New sections: `sidebar`, `header`, `pageHeader`, `emptyState`, `errorState`, `wizard`, `calendar`, `carousel`, `stepper`, `transfer`, `sparkline`, `table`, `avatarGroup`, `command`, `anchor`, `heatmap`, `validation`; new keys in `datePicker`, `dateRangePicker`, `timePicker`, `colorPicker`, `rating`, `pagination`, `breadcrumb`. Affected: UidTable (empty text, select-all and row labels), UidPagination/UidPaginationCursor/UidPageSize/UidLoadMore, UidEmptyState, UidErrorState presets, UidCalendar "today", UidSpinner, UidCommand, UidBreadcrumb, UidSidebar, UidHeader, UidPageHeader, UidWizardStep, UidCarousel, UidStepper, UidTransfer, UidSparkline, UidHeatmap, UidAvatarGroup, UidAnchor, UidRating, and the picker dialogs' labels. Props whose defaults were Russian strings now default to `undefined` and fall back to the locale.
  - Default validation messages follow the locale too: `provideLocale()` switches them; `setValidationLocale()` is exported for use outside Vue. `setMessages()` overrides still win.
  - A guard spec fails on any Cyrillic outside `src/locales` in components, patterns, layouts, composables and utils (comments, stories and specs excepted).
  - `UidNumberInput` drops its steppers when disabled or readonly, and hides them through a container query when the control is too narrow for the steppers and the value (a 95px column showed "82" for 82.99).

### Patch Changes

- ca02c99: - `UidDateRangePicker` no longer crashes on a `null` or `undefined` v-model (a form field with no value yet): it reads as an empty range. Clearing still emits `{ start: null, end: null }`.
  - Control text follows the control's size like `UidInput` (sm 14px, md 16px, lg 18px) in UidSelect, UidCombobox, UidTagsInput, the date, date-range and time pickers, UidTreeSelect, UidCascader and UidColorPicker. TreeSelect and Cascader stayed 16px at sm, the lg sizes stayed 16px, and UidColorPicker was 14px at every size.
- 5f31385: Fix real-browser defects found while reviewing the admin showcase:
  - `UidSidebar` and `UidDrawer` set `border-style: solid` without a `border-width`, so every side got the browser default `medium` (3px) — a grey strip on the sidebar's left, top and bottom. The base rules now reset `border-width: 0` and only the side modifiers draw a border.
  - `UidGauge` and `UidRating` printed their value with `toFixed`, ignoring the kit locale ("83.0" in a Russian panel). They now format through `Intl` in the active kit locale, and accept a `locale` prop like `UidStat`.
  - `UidFileUpload` printed file sizes with hard-coded Russian units ("1.5 КБ") in every locale. Sizes now use `Intl` unit formatting in the kit locale ("1.5 kB", "1,5 КБ").

- e217c55: Tokens the components used but no token file defined now exist, so their declarations no longer silently fall back:
  - `--uid-font-size-base` (= `--uid-font-size-md`, 16px): UidPageHeader, UidEmptyState, UidErrorState and UidAccordion used it with no fallback; Select, DatePicker and Command already fell back to 16px, so sizes are unchanged.
  - `--uid-shadow-xl` (light `0 20px 60px rgb(0 0 0 / 0.3)`, dark `… / 0.6`): UidCommand had no shadow; Modal and Drawer keep their former fallback value in light.
  - `--uid-focus-ring` (the 3px primary-subtle halo the fallbacks already drew).
  - `--uid-z-affix` (100) and `--uid-z-fixed` (150) join the stacking scale: UidBackTop no longer floats above modals and toasts at 1000.
  - UidTooltip referenced the non-existent `--uid-color-neutral-900/50`, so a tooltip had a transparent background; it now uses the zinc scale.
  - A guard spec fails on any `var(--uid-…)` without a fallback that neither `src/tokens`, `src/styles` nor the component's own stylesheet defines.

## 1.6.2

### Patch Changes

- cf55d97: UidGrid: the default `var(--uid-space-md)` gap was lost in the browser. The grid wrote `gap` together with unset `rowGap`/`columnGap` keys, Vue cleared those longhands with `''`, and clearing a longhand of a shorthand that holds a `var()` drops the whole shorthand. The gaps are now always written as `row-gap`/`column-gap`, and unset keys are left out of the style.

## 1.6.1

### Patch Changes

- 22a2d2d: `UidStat` no longer hard-codes `ru-RU` for number formatting. It now follows the active kit locale (via `UidLocaleProvider` / `provideLocale`), so an English panel shows `2.9%` instead of `2,9%`. A new optional `locale` prop (BCP 47 tag) overrides it per component. `UidLocale` gains an optional `code` field (`ru` is `ru-RU`, `en` is `en-US`) that custom locales can set; without it the previous `ru-RU` behavior is kept.

## 1.6.0

### Minor Changes

- 40b453d: Follow-ups from laravel-admin adopting 1.5:
  - `UidSelect`: v-model is typed per mode again. The component is generic over `multiple`, so without it (or with `:multiple="false"`) `modelValue`, `update:modelValue` and `change` are `SelectValue | null`, as before 1.5; with `multiple` / `:multiple="true"` they are `SelectValue[]`; a non-literal boolean gives the union. The new `SelectModelValue<M>` type is exported. Uncontrolled use (no v-model) keeps working.
  - `UidBreadcrumb`: new `nowrap` (one line, long crumbs truncate with an ellipsis; parent crumbs give way before the current one) and `collapse` (implies `nowrap`; when the trail overflows, middle crumbs collapse into "…", keeping the first and the last). With `collapse`, the "…" is a button that opens a keyboard-navigable menu of the hidden crumbs (activating an entry clicks the crumb's own link, RouterLink or button); `collapseMenu: false` renders a plain "…". New CSS variables `--uid-breadcrumb-item-max-width` and `--uid-breadcrumb-item-min-width` (default `3em`) and locale key `breadcrumb.showHidden`.
  - `UidBreadcrumb`: the separator is now an `aria-hidden` element in the template instead of a `::before` on the item, and the invalid `aria-hidden: true;` declaration is gone from the CSS. `--uid-breadcrumb-sep` and `--uid-breadcrumb-sep-color` work as before; custom CSS that targeted `.uid-breadcrumb__item + .uid-breadcrumb__item::before` should target `.uid-breadcrumb__separator::before` instead.
  - `UidTable`: new `selectionFixed` pins the selection column on its own, without any `fixed: 'left'` column. Left unset it keeps the current behaviour (pinned together with left-fixed columns); `false` never pins it.
  - `--uid-font-family-mono` adds `'Cascadia Mono'` and `'Roboto Mono'` before `ui-monospace`.

## 1.5.1

### Patch Changes

- 6104f6f: Fix `UidLink` and `UidSidebarItem` rendering a broken `<routerlink>` element when `to` is set and vue-router is not installed. They now share the `UidBreadcrumbItem` approach via an internal `useRouterLink` helper: use the globally registered `RouterLink` when present, otherwise fall back to `<a href>` (explicit `href`, or a string `to`).

## 1.5.0

### Minor Changes

- 47e1412: Close component gaps found while building laravel-admin:
  - `UidMenuItem`: the `icon` prop is now rendered (16px, before the label, class `uid-menu-item__icon`). `UidSubMenu` icons use the same class.
  - `UidSelect`: new `multiple` mode. v-model becomes an array, selected options show as removable chips, picking an option toggles it and keeps the dropdown open, Backspace on the trigger removes the last chip, `clearable` resets to `[]`, and the listbox gets `aria-multiselectable`. `maxTagCount` collapses extra chips into "+N". The `SelectValue` type is exported. Single-value behaviour is unchanged.
  - New `UidCheckboxGroup`: renders `options` (`{ value, label, disabled? }`) as checkboxes with an array v-model (kept in options order), plus `label`, `hint`, `error`, `required`, `disabled`, `direction` and `name`, and a `change` event. `CheckboxGroupOption` and `CheckboxGroupValue` are exported.
  - `UidTable`: columns accept `fixed: 'left' | 'right'` to stay pinned while the table scrolls horizontally. Offsets are measured from the header cells (falling back to px `width`), the selection column pins along with left-fixed columns, fixed cells paint the current row background (hover, selected, striped) over an opaque base in both themes, and edge shadows appear only while content is scrolled under them. Tables with fixed columns size to their content (`width: max-content; min-width: 100%`). Selected rows now keep their highlight in striped tables.
  - `UidSlider`: `ariaLabel` and `ariaLabelledby` set the handle's accessible name separately from the visible `label`. The visible label is now associated with the input, and `formatValue` also feeds `aria-valuetext`.
  - `UidBreadcrumbItem`: `to` renders through the app's globally registered `RouterLink` (falling back to `href`, or a string `to`, without vue-router), and a `click` event is emitted. A crumb with only a click listener renders as a button. `current` is now optional: when omitted only the last crumb is the current page (`aria-current="page"`), so a middle crumb without a link is plain text instead of being styled as current; `current: false` keeps the last crumb a regular one.
  - `--uid-font-family-mono` now lists concrete system monospace fonts (SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, DejaVu Sans Mono, Courier New) before the generic, so Cyrillic no longer falls back to a serif face in Chrome. `UidColorPicker` and `UidCommand` now use this token (they referenced an undefined `--uid-font-mono`).

## 1.4.0

### Minor Changes

- 190db5f: Fill several component gaps:
  - `UidSubMenu`: nested submenus inside `UidMenu`, to any depth. They open on hover or click with a mouse and on tap with touch. On the keyboard, ArrowRight/Enter/Space opens a submenu and focuses its first item, and ArrowLeft/Escape closes it and returns focus to its trigger. The trigger carries `aria-haspopup="menu"` and `aria-expanded`. The panel flips to the left and is clamped vertically to stay inside the viewport.
  - `UidButton`: `icon` (a Lucide component) and `iconPosition: 'start' | 'end'`. With no label the button becomes a square icon-only button (`uid-button--icon-only`); give it an `aria-label`, otherwise a development warning is logged. The `#prepend` and `#append` slots work as before.
  - `UidDateRangePicker`: `withTime` adds start and end time inputs, and values become `'YYYY-MM-DDTHH:mm'`. `presets` takes custom `{ label, range: () => DateRange }` entries; when omitted, the 7/30/90-day presets stay, and `false` or `[]` hides them.
  - `UidCascader`: `searchable` searches across all levels and lists matches as full paths. `changeOnSelect` lets an intermediate level be selected.
  - `UidSlider`: `marks` puts labelled ticks under given values; clicking a mark moves the slider there.
  - `UidTreeSelect`: `checkable` shows checkboxes that cascade between parents and children, with indeterminate parents. `checkStrictly` turns the cascading off. `UidTreeView` also gets `checkStrictly`, and its cascading now skips disabled nodes.
  - `UidCode`: dependency-free syntax highlighting for php, js/ts, json, sql, html/xml, css and bash. Token colors are CSS variables (`--uid-code-tok-*`) that follow the light and dark themes. Unknown languages render as plain text, and `highlight: false` turns highlighting off. Line numbers now line up with the code lines. `tokenize()` is exported.
  - `UidColorPicker`: accepts `#rgb`, `#rgba`, `rgb()`/`rgba()` and `hsl()`/`hsla()` values as well as 6- and 8-digit hex, and normalises them to hex. `parseColor()` and `normalizeColor()` are exported.
  - New `UidImage`: lazy loading, a fallback image or placeholder when loading fails, and an optional `preview` that opens the full image in a modal.

## 1.3.0

### Minor Changes

- dd4626e: `UidModal`: `size="full"` (a dialog that fills the viewport) and `closeOnEsc` to keep a dialog that must be answered open on Escape. `UidDrawer`: `side="top"` and `closeOnEsc`. `UidStepper`: `selectable` (`'none'` by default, `'completed'` or `'all'`) renders the selectable steps as buttons and emits `select` with the step index — so a wizard can be navigated by click and by keyboard.

## 1.2.2

### Fixed

- **A menu trigger nested one button inside another.** The wrapper carried
  `role="button"` and a tabindex of its own while the trigger slot normally
  holds a real button — a screen reader announced two nested controls and the
  keyboard landed on one or the other. The wrapper now steps aside when the
  slot already holds a control, handing its `aria-haspopup`, `aria-expanded`
  and `aria-controls` to it; when the slot holds something inert — a plain
  avatar, say — the wrapper stays the button, so the menu is still reachable
  from the keyboard.

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

## 1.1.2

### Patch Changes

- Version bump with no code changes: the release line was realigned.

## 1.1.1

### Patch Changes

- UidSelect: the dropdown is teleported to `body`, so the popover is no longer clipped by a parent's `overflow`.

## 1.1.0

### Minor Changes

- UidTable: three-state sorting and a native selection column.

## 1.0.4

### Patch Changes

- UidMenu: the popover anchors to the trigger's first child, which is the element actually rendered.

## 1.0.3

### Patch Changes

- Version bump with no code changes: the release line was realigned.

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
