---
"@dskripchenko/ui": minor
---

Fill several component gaps:

- `UidSubMenu`: nested submenus inside `UidMenu`, to any depth. They open on hover or click with a mouse and on tap with touch. On the keyboard, ArrowRight/Enter/Space opens a submenu and focuses its first item, and ArrowLeft/Escape closes it and returns focus to its trigger. The trigger carries `aria-haspopup="menu"` and `aria-expanded`. The panel flips to the left and is clamped vertically to stay inside the viewport.
- `UidButton`: `icon` (a Lucide component) and `iconPosition: 'start' | 'end'`. With no label the button becomes a square icon-only button (`uid-button--icon-only`); give it an `aria-label`, otherwise a development warning is logged. The `#prepend` and `#append` slots work as before.
- `UidDateRangePicker`: `withTime` adds start and end time inputs, and values become `'YYYY-MM-DDTHH:mm'`. `presets` takes custom `{ label, range: () => DateRange }` entries; when omitted, the 7/30/90-day presets stay, and `false` or `[]` hides them.
- `UidCascader`: `searchable` searches across all levels and lists matches as full paths. `changeOnSelect` lets an intermediate level be selected.
- `UidSlider`: `marks` puts labelled ticks under given values; clicking a mark moves the slider there.
- `UidTreeSelect`: `checkable` shows checkboxes that cascade between parents and children, with indeterminate parents. `checkStrictly` turns the cascading off. `UidTreeView` also gets `checkStrictly`, and its cascading now skips disabled nodes.
- `UidCode`: dependency-free syntax highlighting for php, js/ts, json, sql, html/xml, css and bash. Token colors are CSS variables (`--uid-code-tok-*`) that follow the light and dark themes. Unknown languages render as plain text, and `highlight: false` turns highlighting off. Line numbers now line up with the code lines. `tokenize()` is exported.
- `UidColorPicker`: accepts `#rgb`, `#rgba`, `rgb()`/`rgba()` and `hsl()`/`hsla()` values as well as 6- and 8-digit hex, and normalises them to hex. `parseColor()` and `normalizeColor()` are exported.
- New `UidImage`: lazy loading, a fallback image or placeholder when loading fails, and an optional `preview` that opens the full image in a modal.
