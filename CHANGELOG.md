# @dskripchenko/ui

## 1.50.0

### Minor Changes

- 536d459: UidChart: `bands` — category ranges shaded behind the grid and the marks, with legend entries for labelled ones; `axes: false` for a sparkline without tick labels or an axis line; `ChartSeries.width` for the stroke width; `ChartReference.pill` draws an x reference's label as a filled tag above the line. New UidMilestoneStrip — a few milestones on a month scale with a today line, risk in the warning colour, links or a `select` event; locale keys `milestoneStrip.label` and `milestoneStrip.atRisk`.

## 1.49.0

### Minor Changes

- 6318b2d: UidCalendar: bands across whole days (lanes over the day and week grid, strips in the month), events drawn by shape as well as colour (`variant`) with an accessible `label`, `startHour`/`endHour`, `header`, `gutterLabel`, `allDayLabel`, `dayClass` in the day and week grid, `headInline`, slots `event`, `band` and `day-extra`, `event-hover` and the element in `event-click`. New UidBusyStrip — when people are taken during a day, with the chosen time framed — and `firstFree`. New UidSegmented — one of a few options or several, as a bar, pills or round buttons. UidCalendar `mini`, `bordered` and `--uid-cal-today-bg`; UidCheckbox takes its label from the default slot. UidModal `width`.

## 1.48.0

### Minor Changes

- 64bf6c9: UidObjectCard: an object of another system in a feed — its code, status (a pill, or a button that anchors a menu of moves), title, a link to it, a meta line, quick actions under a divider and a notice; `busy` shows a change under way and makes the actions inert, `invalid` marks a refusal.

## 1.47.2

### Patch Changes

- aa54c92: The kit no longer imports `lucide-vue-next` at run time (since 1.44.0 it did): `UidProductSwitcher`, `UidReactions` and `UidEmojiPicker` took their icons from the `icons` entry, which pulled its `export * from 'lucide-vue-next'` into a chunk the main entry imports — a page loading the kit from a CDN without `lucide-vue-next` in its import map failed to load it. Their icons are bundled again, and the build now fails if any file but the `icons` entry imports `lucide-vue-next`.

## 1.47.1

### Patch Changes

- af58a4e: Markdown: a link or picture destination in angle brackets, as CommonMark allows — `[text](<my notes/plan.md>)` — is read as the address inside the brackets, spaces and all (a space becomes `%20`). Before, the brackets went into the address (`%3Cplan.md%3E`) and a destination with a space was no link at all.

## 1.47.0

### Minor Changes

- 7623018: `UidReactions` — emoji reaction pills with «+», own reaction pressed, a limit; `UidEmojiPicker` — search, categories, recent, skin tones, keyboard grid, Unicode 15.1 data with CLDR names in Russian and English loaded on demand; `UidAvatar` `presence` — online, away, do not disturb, in a call, offline as a corner mark told by shape and colour.

## 1.46.0

### Minor Changes

- 9fa72c5: `UidTabBar` and `UidTabBarItem` — bottom navigation for phones: equal tabs with an icon, a label, a count or a dot; 44 px hit areas, safe-area padding, `fixed` placement.

### Patch Changes

- 9fa72c5: Accessibility: `UidMessageFeed` dividers carry no role (a `feed` may only own `article`s); `UidSidebarGroup` titles use the secondary text colour so they meet WCAG AA contrast (override with `--uid-sidebar-group-title-color`).

## 1.45.0

### Minor Changes

- a0c5ff4: `UidMessageFeed`: a chat-like list of messages — virtualized with measured heights, day dividers, author groups, a "new" divider, loading older messages without moving the reader, and following the bottom.
- a0c5ff4: `UidSidebarGroup`: an `action` slot next to the title, for a control such as "add".

### Patch Changes

- a0c5ff4: `UidMention`: keys the open list takes (arrows, Enter, Tab, Escape) no longer reach the host's `keydown` first, so a host that sends on Enter does not send while an option is being picked. It exposes `focus()`, `field` and `isOpen`.

## 1.44.0

### Minor Changes

- f0d908e: `UidProductSwitcher`: a pattern for moving between sibling applications of one family — segments with the current product marked, or one ⇄ button in a collapsed sidebar; a hint names where a link leads.

## 1.43.1

### Patch Changes

- 9e4c3d5: The rest of AA contrast. Accent-coloured text (links, active tabs, sidebar items, selected options and dates, chips, sort headers, anchors) uses `--uid-accent-text`, through the new alias `--uid-color-primary-text`: 5.47:1 on white instead of 2.49. Avatar fills are the 700 steps of the same eight hues, so white initials reach 5.02:1 or more; the name still picks the same hue. A checked checkbox and radio, a switch that is on and the audio play button use `--uid-accent-solid`, so they stand out from the surface at 3:1 or more (WCAG 1.4.11).

## 1.43.0

### Minor Changes

- 23e7cad: Text on fills and tints keeps WCAG AA contrast (4.5:1) in both themes. New tokens: `--uid-accent-solid` and `--uid-accent-solid-hover` for fills that carry text; `--uid-{success,warning,danger,info}-text` for status pills, tags and alerts on their `-subtle` tint; `--uid-{success,warning,danger,info}-solid` for status fills with text; `--uid-neutral-text` for neutral pills; `--uid-color-*` aliases for each. New palette steps: teal-800, emerald-700, amber-700, blue-700. In the dark theme `--uid-text-on-accent` is now zinc-900. Primary and danger buttons, sidebar and notification counters, pagination, steppers, timeline markers, calendar and picker selections, the tour and time picker buttons, the auth layout's brand panel and board avatars use the solid fills; Badge, Tag, Alert, Stat trends, Kanban and Board counters and invalid TagsInput chips use the text tokens. `--uid-accent` itself is unchanged and stays for borders, focus rings and charts.

## 1.42.1

### Patch Changes

- 52fe36c: Markdown: link, image and wiki-link URLs are checked after escapes are restored; unsafe schemes can no longer slip through a backslash escape or a wiki link. The scheme check also decodes character references and ignores whitespace, control characters and letter case, and alt, title and data attributes no longer take markup from code spans or math.

## 1.42.0

### Minor Changes

- ba8f16b: UidCodeInput: a one-time-code field of separate cells with `v-model`, `length` (default 6), `mode` (`numeric` with a numeric keypad, or `alphanumeric`, uppercased), `size`, `disabled`, `invalid` (error styling and `aria-invalid`), `autofocus`, `name` (a hidden input with the whole value) and `label`. Typing moves to the next cell, Backspace on an empty cell clears the previous one and moves there, arrows, Home and End move between cells; a pasted or autofilled code is spread from the first cell, dropping spaces, dashes and characters the mode does not allow. The first cell has `autocomplete="one-time-code"`. Emits `complete` once per distinct full value; exposes `focus()` and `clear()`. A labelled `role="group"`, each cell labelled "Character 2 of 6", the accent focus ring, light and dark themes. No dependencies. Also exports the `codeInput` locale strings (en, ru).
- ba8f16b: UidQrCode: a QR code drawn as one SVG (`role="img"`, one `<path>` for the dark modules, `shape-rendering="crispEdges"`) from `value`, with `size`, `errorCorrection` (L, M, Q, H; default M), `margin` (quiet zone, default 4 modules) and `label`. Dark modules on a white ground in both themes, set by `--uid-qr-code-dark` and `--uid-qr-code-light`; an `error` event when the value does not fit version 40. The encoder is the library's own, after ISO/IEC 18004: numeric, alphanumeric and UTF-8 byte modes, versions 1–40, Reed–Solomon error correction with block interleaving, all eight masks scored by the standard penalty rules. No dependencies. Also exports `encodeQr` (with the `QrCode`, `QrEncodeOptions`, `QrErrorCorrection` types) and the `qrCode` locale strings (en, ru).

## 1.41.0

### Minor Changes

- f7b7fb2: UidChart: stacked areas read as bands — a solid fill (70 %) with a thin top edge, as a cumulative flow diagram needs; a lone area keeps its light fill.

## 1.40.0

### Minor Changes

- af81cbc: UidDashboardGrid: a dashboard grid of items placed by column and row (`x`, `y`, `w`, `h`, with min/max sizes) and edited through `v-model:items`. In edit mode items are dragged by a handle the host binds (`v-bind="handle"`, pointer events for mouse, pen and touch), resized by a corner grip, and moved or resized from the keyboard (arrows, Shift+arrows) with live announcements; a dashed placeholder shows the snapped target, Escape cancels a drag. Collisions push items down, then the layout is compacted vertically. Under `stackBelow` the items stack in one column. No dependencies. Also exports the pure layout helpers (`collides`, `clampItem`, `compactLayout`, `moveItem`, `resizeItem`, `layoutHeight`, `sortByPosition`, `sameLayout`) and the `dashboardGrid` locale strings (en, ru).

## 1.39.0

### Minor Changes

- 63f3813: UidTable: a `header-<key>` slot puts any content in a column's header instead of its label — a weekday over a date, a hint, a mark; it gets the `column`, and a sortable column keeps its sort icon next to it. Cell slots get their `column` too.

## 1.38.0

### Minor Changes

- d0aa81c: UidChart: a general SVG chart — line, area, bar (grouped or stacked) and dot series over a shared category axis, x and y reference lines, a fixed colour-blind-safe palette (`--uid-chart-1` … `--uid-chart-6`, `--uid-chart-neutral`) with light and dark values, semantic tones, a tooltip on hover and from the keyboard, a legend, a visually hidden data table and an empty state. No dependencies. Also exports the `niceTicks(min, max, count)` helper and the `chart` locale strings (en, ru).

## 1.37.0

### Minor Changes

- 299f6be: UidBoard: a dragged card's `reasons` tell, on a column it may not go to, why not when the pointer is over it; the column under the pointer shows a «Drop: → Review» hint, warning when the drop takes it over its `wip`; the WIP count sits on a chip; a `muted` column (finished work) is faded.

## 1.36.0

### Minor Changes

- bdf0b96: UidQueryInput: a one-line field for a query language — coloured tokens from a `tokenize` function, words offered at the caret from `suggest` (arrows, Enter or Tab to take one), an underlined error with its reason, a prefix and a suffix slot, `submit` on Enter.
- bdf0b96: UidTable: `groupBy` (a column key or a function) puts a header row across the table wherever the group of a row changes, with a `group` slot (`row.value`, `row.rows`, `row.count`); the data comes sorted by the group.

## 1.35.1

### Patch Changes

- 4cdf753: UidHeatmap: a day's level colour shows — the cell's CSS fill (the empty colour) no longer covers it.

## 1.35.0

### Minor Changes

- baf4170: UidCalendar: a `dayClass` prop (`(iso) => CalendarDayClass`, anything `:class` takes) adds classes to a day cell of the month grid — weekends, holidays, days off of a working calendar; a `title` slot (`{ title, view, range }`) replaces the text of the header's title, the arrows and the view switcher stay; a `todayButton` prop (default `true`) hides the Today button. The `CalendarDayClass` type is exported.
- baf4170: UidTreeView: a node's `suffix` (`string | number`) is shown quietly at the right edge of its row (`uid-tree-item__suffix`) — the number of people in a department, the size of a folder.

## 1.34.0

### Minor Changes

- e253df8: UidMenu: a `placement` prop (`'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'`, default `'bottom-start'`) — a row menu at the right edge of a table opens with `'bottom-end'` and aligns to the trigger's right edge. An open menu follows a changed placement. The `UidMenuProps` type is exported.
- e253df8: UidSidebarLayout: a `stickyHeader` prop (default `false`) — the whole `header` slot, a banner plus a top bar say, stays at the top while the page scrolls, on phones too. The header wrapper itself sticks (`position: sticky; top: 0; z-index: var(--uid-z-sticky)`), with the modifier class `uid-layout-sidebar--sticky-header`: a sticky child of the slot could not, its parent being only as tall as itself.
- e253df8: UidTable: expandable rows and a footer row.
  - `v-model:expanded` (`expanded?: Set<string | number>` of ids by `rowKey`, empty by default) with the slot `expanded` (`{ row }`): an expanded row is followed by a `uid-table__row-expansion` row with one full-width `uid-table__td--expansion` cell holding the slot. The row gets `uid-table__row--expanded` and, while the slot is given, `aria-expanded`. The table never expands rows by itself: the host updates the set (on `row-click`, say) or calls the exposed `toggleExpanded(id)`, which emits `update:expanded`. The tint comes from `--uid-table-row-bg-expanded` (the raised surface by default).
  - Slots `footer-<column key>`: once any is given, a `<tfoot class="uid-table__foot">` with one `uid-table__foot-row` puts each in its column's `uid-table__td--foot` cell; other columns and the selection column get empty cells. The footer has a top border and semibold text.

## 1.33.0

### Minor Changes

- b1146df: UidCommand: slots `item` (`{ command, active }`) for the inside of a row — the row stays an option of the list, with the keyboard and the click as before — and `header` / `footer` for what goes below the search field and below the list (filters, key hints).

## 1.32.0

### Minor Changes

- ec8ad6f: UidBoard: columns and cards take CSS variables for their look — `--uid-board-column-border`, `--uid-board-column-radius`, `--uid-board-card-bg`, `--uid-board-card-border`, `--uid-board-card-radius` and `--uid-board-card-padding`, next to the existing `--uid-board-column-bg`. The defaults are unchanged.
- ec8ad6f: UidTable: cell paddings are CSS variables — `--uid-table-head-padding-y`, `--uid-table-cell-padding-y` and `--uid-table-cell-padding-x` — so a host can make a table denser without overriding its classes. The defaults are unchanged.

### Patch Changes

- ec8ad6f: UidCommand and the drawer mode of UidSidebarLayout dim the page behind them again. Their backdrop took `--uid-color-overlay`, which the themes map to an opaque surface, so the page behind turned white (or dark grey). They now use their own `--uid-command-overlay` and `--uid-layout-sidebar-overlay`, half-transparent black by default, like UidModal and UidDrawer.

## 1.31.2

### Patch Changes

- e1470a7: Accessible names for combobox controls: `aria-label`, `aria-labelledby` and `aria-describedby` given to `UidSelect`, `UidTreeSelect`, `UidCascader`, `UidDatePicker`, `UidDateRangePicker` or `UidTimePicker` now land on the element with `role="combobox"` (overriding the placeholder-based name), instead of the wrapper — before, a screen reader or `getByRole('combobox', { name })` found no name. `class`, `style`, `data-*` and listeners stay on the root, as before.

## 1.31.1

### Patch Changes

- c2168b0: Sidebar: in `UidSidebarLayout` the sidebar spans the window and stays while the page scrolls, and a `UidSidebar` in it fills it — before, its border and footer ended where its items ended. A `UidSidebarItem` rendered as a `<button>` (an action, not a page) looks like the links around it instead of a browser button.

## 1.31.0

### Minor Changes

- 450f49b: `UidCommand`: `v-model:query` gives the host the typed text, and `filter: false` shows `commands` as given — so a palette can search a server and pass the results back. By default it filters as before.

## 1.30.0

### Minor Changes

- dca633e: `renderMarkdown` / `UidMarkdown`: block ids, as Obsidian writes them. ` ^id` at the end of a paragraph, a heading, a list item or a quote is hidden, the block gets the anchor `^id` (`id` and `data-block-id`), and `[[note#^id]]` links to it (`#%5Eid`) — before, the `^` was dropped and the link pointed at a heading-like `#id`. An id needs at least one letter, so `x ^2` stays text; `blockIds: false` turns it off.

## 1.29.1

### Patch Changes

- ba9cd1c: `UidTable`: the cell slots are typed as they are called — `<template #name="{ row }">` — instead of `(row?: Record<string, unknown>)`. Templates that destructured `{ row }` failed `vue-tsc` with "Property 'row' does not exist"; the `empty` slot is typed separately.

## 1.29.0

### Minor Changes

- 90eea20: Markdown: `![[picture.png|300]]` and `|300x200` size an embedded picture as in Obsidian (`width`/`height`, `data-size`), and the picture carries its name in `data-embed` (class `uid-markdown__embed-image`) so a host can find the file by name — the `src` is only a guess beside the document. An embed of a note or a video gets `data-size` too. `.ico` and `.apng` count as pictures.

## 1.28.0

### Minor Changes

- a4b366a: Markdown: `![[note]]` and `![[note#heading]]` are embeds — `<span class="uid-markdown__embed" data-embed>` around the note's link, for the host to fill (styled as a quoted frame with `is-filled`); without a host the link stays.

## 1.27.0

### Minor Changes

- cd91946: Markdown: `#tags` as `<span class="uid-markdown__tag" data-tag>` chips (`tags: false` turns them off), and a YAML front matter at the start of a document as a table of properties (`UidMarkdown` reads it; `renderMarkdown(source, { frontMatter: true })`; `readFrontMatter(source)` gives it as data).

## 1.26.1

### Patch Changes

- 15c05a9: `@dskripchenko/syntax` 0.4: code blocks in LaTeX (`latex`, `tex`, `math`), and TeX math and `==highlights==` in Markdown sources, are highlighted.

## 1.26.0

### Minor Changes

- 43da262: Markdown: TeX math — `$…$`, `\(…\)`, `$$…$$`, `\[…\]` and ```math blocks — drawn as MathML by `@dskripchenko/math`(a math font stack in the styles;`math: false`turns it off), and`==highlighted==`text as`<mark>`.

## 1.25.0

### Minor Changes

- e8ff893: Markdown reads internal links as note-taking apps write them: `[[note]]`, `[[note#heading]]`, `[[note|text]]` become links with `data-wikilink` (the host resolves where a note is; the address is the note's file beside the document, with the heading's anchor) and the class `uid-markdown__wikilink`; `![[picture.png]]` is the picture. `wikiLinks: false` turns it off. A link the host marks `is-missing` is drawn muted.

## 1.24.1

### Patch Changes

- d0e1e87: Markdown: a list item wrapped in the source — the next line indented under it, no blank line between — continues the item's paragraph, as in CommonMark; it used to start a paragraph of its own (and a list written back from it became a loose one).

## 1.24.0

### Minor Changes

- 179dba7: `UidCode` highlights through `@dskripchenko/syntax`: some 35 languages and formats instead of 17 (Rust, C/C++, Ruby, Lua, TOML, INI, Dockerfile, Makefile, diff, logs, Markdown, GraphQL, protobuf and more), nested code read properly (a variable inside a string, a script inside HTML, interpolation in template strings). `tokenize` and `isHighlightable` keep their signatures; `UidCodeTokenType` gains the new kinds (`type`, `operator`, `regex`, `meta`, `escape`, `heading`, `emphasis`, `strong`, `link`, `inserted`, `deleted`, `date`, `error`, `warning`, `info`, `debug`), each with a `uid-code__tok--*` class. Some tokens are split differently: a tag's name is `tag` and its brackets `punctuation`; PHP's `<?php`, Python's decorators and HTTP's version are `meta`; an HTML entity is `escape`.

## 1.23.1

### Patch Changes

- fadbc65: UidCalendar on paper: the view switch and the navigation arrows are hidden, the period shown stays.

## 1.23.0

### Minor Changes

- 66bc86e: Print styles: on paper the kanban, event calendar, code block and video hide their controls; the board's columns share the page width and cards are not split across sheets; markdown prints in one column without its table of contents, headings stay with what follows; code blocks wrap every line.

## 1.22.0

### Minor Changes

- 566f378: Markdown: GitHub task lists. `- [ ] item` and `- [x] item` render as disabled checkboxes (in bullet, ordered and nested lists); a list of tasks only goes without bullets. The checkboxes are named for screen readers from the locale (`markdown.taskDone`, `markdown.taskOpen`; `taskLabels` option of `renderMarkdown`).

  A block renderer's context carries the markdown's `imageBase` and `linkBase` (`UidMarkdownBlockRenderContext`), so a block that names files — a ```video with `src: intro.mp4` — resolves relative paths as the markdown's own images and links do.

## 1.21.0

### Minor Changes

- 92bc40a: UidBoard and UidCalendar: paging, card fields, per-event editing and month-grid resize. Everything is opt-in; existing props, events and slots behave as before.
  - **UidBoard**: `BoardColumn.total` — the real count when only some cards are loaded (the header count, the WIP check and its styling use it); a `column-footer` slot `{ column }` at the bottom of each column (with lanes — once, below the last lane), e.g. for «Load more»; card fields `assignee` (name, or `{ name, avatar?, color? }`, shown as initials or the picture), `due` (formatted in the kit's locale, overdue before `today`) and `done` (muted, never overdue); a `today` prop. New type `BoardAssignee`.
  - **UidCalendar**: `CalendarEvent.editable: false` keeps one event from being dragged or resized in an editable calendar; all-day and multi-day events get a resize handle at their end in the month grid and the all-day row, emitting `event-move` with the new inclusive `endDate`; a `selectable` prop (defaults to `editable`) makes `slot-click` work in a read-only calendar. `CalendarEventMove`, `CalendarSlot`, `CalendarRange` and `CalendarView` are now exported from the package.
  - New locale keys: `board.due`, `board.overdue`, `board.assignee`, `calendar.resize`.
  - New docs pages: board and calendar, in English, Russian, German and Chinese.

## 1.20.0

### Minor Changes

- 0458085: New `UidKanban` and `UidEventCalendar`: a kanban board and an event calendar driven by plain-text markup. Cards move between columns and lanes, events repeat (`every 2 weeks fri`, `every month last fri`, RRULE), an event builder and a source tab edit the markup, and every edit is emitted as `change` with the new text, touching only the lines it changes. The markup functions (`parseKanban`, `moveKanbanCard`, `parseEventCalendar`, `expandEventCalendar`, …) are exported for use without the components. Captions live in the new `kanban` and `eventCalendar` locale sections.

## 1.19.1

### Patch Changes

- 53edf3c: Markdown: a code fence closes only with a fence indented at most three spaces more than the opening one (and with nothing after it), in `renderMarkdown` and `splitMarkdown` — an indented ``` inside a code block (an HTML example with a Markdown script in it) no longer ends the block early.

## 1.19.0

### Minor Changes

- 309900e: `renderMarkdown` / UidMarkdown follow CommonMark in more places: backslash escapes of punctuation (`\*`, `\_`, `\[`, `\#` at a line start — and nothing else, so `C:\Users` stays as written), code spans of several backticks with their padding space (``` `` a ` b `` ```), hard breaks with `\` or two spaces at the end of a line, `title` on links and images, and code fences longer than three characters (a fence closes only with one at least as long, so a ``block can hold` ones).

## 1.18.1

### Patch Changes

- 0135cff: UidBoard: while a card is dragged, `dragover` and `drop` stay with the board — they no longer bubble to the page, whose own drop handlers (a wiki's file upload, for one) took the card for a file.

## 1.18.0

### Minor Changes

- 60ab760: UidCalendar: day, week, year and agenda views besides the month (`v-model:view`, `views` for the switcher, `v-model:anchor` for the shown date), events with a time (`time`, `endTime`) and across days (`endDate`), overlapping events side by side in the time grid, a `range` event with the visible days, and with `editable` drag-to-move, resize and `slot-click` on an empty slot (`event-move`). The month view stays as before when no other view is asked for.

  UidBoard: `readonly` — cards open on click and Enter but cannot be dragged or moved with Alt+arrows (for boards shown to people who may not change them).

## 1.17.0

### Minor Changes

- 5102c7f: `UidBoard` — a Kanban board: columns with counts and work-in-progress limits,
  swimlanes, drag and drop with the neighbours of the drop point for ranking,
  per-card allowed target columns, and a keyboard alternative (Alt+←/→ moves a
  card to the nearest allowed column, Enter opens it). The board never mutates
  its props: it emits `move` and `open`, the host saves and re-renders.
- 0fbd508: Bundled typefaces, opt-in: `@dskripchenko/ui/styles/fonts.css` brings Inter (variable, with italics), Inter Display and IBM Plex Mono (Latin and Cyrillic) — the families the typography tokens name. New token `--uid-font-family-display` for large headings.

## 1.16.0

### Minor Changes

- 9b6d77c: Embed support. `provideAppLocale(app, source)` provides the kit locale on a whole app (`app.provide`) for widgets and embed scripts without a wrapping `UidLocaleProvider`: the source is a locale, a ref/computed or a getter, partial locales merge over `en`, validation messages follow it; returns `stop()` and stops on `app.unmount()` (Vue 3.5+). The injection key is exported as `uidLocaleKey`; `provideLocale` now also accepts a ref or a getter. UidVideo exposes the chapters track: `chapters` (`UidMediaChapter[]`, `{ start, end, title }`), `chapterIndex`, `seekToChapter(index | title)` and a `chapterchange` event. `@dskripchenko/ui/package.json` is exported. The main entry no longer imports `lucide-vue-next` at runtime: the ~45 icons the kit's components use are bundled (ISC notice kept), so the kit loads from an ESM CDN without lucide in the import map; `@dskripchenko/ui/icons` still re-exports `lucide-vue-next`.

## 1.15.1

### Patch Changes

- 7ecfde2: UidVideo: no dark hairline around the rounded corners over light video (the player clips its whole subtree with `clip-path`; the letterbox is painted by the media element in `--uid-video-bg`, centred with `object-fit: contain`), the focus ring is drawn inset. The control bar follows the player's own width (ResizeObserver): under 440 px subtitles and picture-in-picture fold into the settings menu, under 360 px the time shows only the position; play, settings and full screen always stay inside the player. HLS quality menu: the current level is a muted hint of "Auto" ("Auto · 720p"), and levels with the same label are told apart by bitrate.

## 1.15.0

### Minor Changes

- b460c1f: Локаль по умолчанию — английская. Без `UidLocaleProvider` компоненты показывают английские строки и форматы (раньше — русские), сообщения валидации тоже. Чтобы вернуть русский, оберните приложение в `<UidLocaleProvider :locale="ru">`; частичные переопределения теперь сливаются поверх `en`.
- eb410ec: Media players without dependencies. `UidVideo` — native `<video>` with the kit's controls: scrub bar with buffered ranges, chapters and sprite thumbnails, volume, speed and quality menus, WebVTT subtitles drawn by the player, full screen (iOS fallback), picture-in-picture, resume position, hotkeys, double-tap seek, auto-hiding controls. `UidAudio` — compact row, `mini` variant for tables, waveform decoded in the browser (chunked, cached, size-capped) or from `peaks`, playlist with auto-advance and Media Session. `useMediaController` is the shared core (one active player per page, normalised state, readable localised errors; `media` locale bag in `en`/`ru`). New lazily loaded entry `@dskripchenko/ui/hls`: native HLS where available, otherwise MSE with fMP4/CMAF and MPEG-TS (built-in H.264/AAC → fMP4 transmuxer), AES-128, live playlists, discontinuities, alternate audio renditions in their own SourceBuffer (fMP4, MPEG-TS or packed AAC; audio-track menu in UidVideo), ABR with manual quality selection, retries. UidAudio plays HLS sources too.
- 9806528: UidMenu: управляемый режим через `v-model:open` и `openAt(x, y)` для контекстного меню; меню можно использовать без слота `trigger`. UidTooltip: подсказка встаёт у описываемого элемента — раньше обёртка с `display: contents` давала пустой прямоугольник, и подсказка уезжала в левый верхний угол.

## 1.14.0

### Minor Changes

- 94489b9: UidMarkdown: live blocks. A block renderer may return `mount(el, ctx)` instead of `html` — the host's widget (an API console, a chart with controls) is mounted into the block. A changed source goes to the widget's `update`, `destroy` runs when the block goes away; rendered markdown mounts with `editable: false`. New types `UidMarkdownBlockMountContext` and `UidMarkdownBlockMountHandle`; the contract matches the WYSIWYG editor's live blocks.

## 1.13.0

### Minor Changes

- 643a4cc: `UidCode` highlights Python, Go, Java, C#, Kotlin, Swift, PowerShell, raw HTTP and YAML (aliases `py`, `golang`, `cs`, `c#`, `kt`, `ps1`, `pwsh`, `yml`, `curl`). They are the languages an API reference shows its request samples in.

## 1.12.0

### Minor Changes

- 679200e: Добавлен `UidMarkdown` — markdown-документ без зависимостей: безопасный рендерер (исходник экранируется до разметки, ссылки только http(s)/mailto/относительные), код через `UidCode`, оглавление, `linkBase`, врезки `[!NOTE]`. Блоки кода выбранных языков можно отдать своим рендерерам (`blockRenderers` или `provideMarkdownBlockRenderers`) — так подключаются диаграммы.

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
