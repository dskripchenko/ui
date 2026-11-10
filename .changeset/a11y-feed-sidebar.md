---
"@dskripchenko/ui": patch
---

Accessibility: `UidMessageFeed` dividers carry no role (a `feed` may only own `article`s); `UidSidebarGroup` titles use the secondary text colour so they meet WCAG AA contrast (override with `--uid-sidebar-group-title-color`).
