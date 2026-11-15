---
'@dskripchenko/ui': minor
---

Fill gaps found while building dense admin screens:

- `UidBadge`: `marker` puts a dot of the tone before the text; new `accent` variant; `info` now uses the info (blue) tokens instead of the accent.
- `UidAlert`: `size="sm"` for a compact line inside a card or a form; `info` now uses the info tokens.
- `UidButton`: `href`, `to` (the app's RouterLink, or `<a>` without a router) and `external` render a link that looks like the button; a disabled link loses its target.
- `UidModal`: `subtitle` (wired to `aria-describedby`), `icon` and `iconTone` in the header.
- `UidStat`: `size="sm"` — a 20px value and a smaller icon for a dense strip of figures.
- `UidPageHeader`: actions wrap instead of overflowing on narrow screens.
- `UidDescriptionList`: the list no longer inherits the browser's `<dl>` margins.
- New `UidHistoryStrip`: a row of history cells (runs, checks, days), the oldest first.
