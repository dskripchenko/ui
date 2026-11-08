---
"@dskripchenko/ui": patch
---

UidCommand and the drawer mode of UidSidebarLayout dim the page behind them again. Their backdrop took `--uid-color-overlay`, which the themes map to an opaque surface, so the page behind turned white (or dark grey). They now use their own `--uid-command-overlay` and `--uid-layout-sidebar-overlay`, half-transparent black by default, like UidModal and UidDrawer.
