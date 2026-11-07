---
'@dskripchenko/ui': patch
---

Sidebar: in `UidSidebarLayout` the sidebar spans the window and stays while the page scrolls, and a `UidSidebar` in it fills it — before, its border and footer ended where its items ended. A `UidSidebarItem` rendered as a `<button>` (an action, not a page) looks like the links around it instead of a browser button.
