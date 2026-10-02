---
"@dskripchenko/ui": patch
---

Fix real-browser defects found while reviewing the admin showcase:

- `UidSidebar` and `UidDrawer` set `border-style: solid` without a `border-width`, so every side got the browser default `medium` (3px) — a grey strip on the sidebar's left, top and bottom. The base rules now reset `border-width: 0` and only the side modifiers draw a border.
- `UidGauge` and `UidRating` printed their value with `toFixed`, ignoring the kit locale ("83.0" in a Russian panel). They now format through `Intl` in the active kit locale, and accept a `locale` prop like `UidStat`.
- `UidFileUpload` printed file sizes with hard-coded Russian units ("1.5 КБ") in every locale. Sizes now use `Intl` unit formatting in the kit locale ("1.5 kB", "1,5 КБ").
