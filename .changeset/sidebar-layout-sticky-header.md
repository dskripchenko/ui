---
"@dskripchenko/ui": minor
---

UidSidebarLayout: a `stickyHeader` prop (default `false`) — the whole `header` slot, a banner plus a top bar say, stays at the top while the page scrolls, on phones too. The header wrapper itself sticks (`position: sticky; top: 0; z-index: var(--uid-z-sticky)`), with the modifier class `uid-layout-sidebar--sticky-header`: a sticky child of the slot could not, its parent being only as tall as itself.
