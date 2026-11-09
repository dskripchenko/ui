---
"@dskripchenko/ui": patch
---

`UidMention`: keys the open list takes (arrows, Enter, Tab, Escape) no longer reach the host's `keydown` first, so a host that sends on Enter does not send while an option is being picked. It exposes `focus()`, `field` and `isOpen`.
