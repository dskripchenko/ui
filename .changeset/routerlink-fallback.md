---
'@dskripchenko/ui': patch
---

Fix `UidLink` and `UidSidebarItem` rendering a broken `<routerlink>` element when `to` is set and vue-router is not installed. They now share the `UidBreadcrumbItem` approach via an internal `useRouterLink` helper: use the globally registered `RouterLink` when present, otherwise fall back to `<a href>` (explicit `href`, or a string `to`).
