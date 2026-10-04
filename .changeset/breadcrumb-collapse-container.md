---
'@dskripchenko/ui': minor
---

feat(breadcrumb): `collapse` follows the room around the trail and can fold the first crumb

- `UidBreadcrumb collapse` now also watches its parent element, plus an optional `container` (an element, or a CSS selector matched with `closest()` from the `<nav>`). A trail inside a wrapper that is sized by its content used to shrink together with its collapsed crumbs and never expand again; it now re-measures when the parent or the container changes width. Only width changes trigger a re-measure.
- New `collapseFirst` prop: when even "first › … › current" does not fit, the first crumb collapses into the "…" too, leaving "… › current". The current crumb stays visible and truncates with an ellipsis; the "…" menu lists the first crumb along with the middle ones. Off by default, so existing trails keep their first crumb.
