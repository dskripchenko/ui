---
'@dskripchenko/ui': minor
---

Menu choices: `UidMenuItem` takes a `hint` (a second line under the label), `type="radio"` (a check mark when `checked`) and `type="switch"` (a switch at the end; keeps the menu open, as `keepOpen` does for any item), with the `menuitemradio` / `menuitemcheckbox` roles and `aria-checked`. New `UidMenuLabel` (a group's title) and `UidMenuNote` (a footnote at the bottom). A menu with hints is wider (`--uid-menu-rich-min-width`, 260px by default). The arrow keys go over every kind of item.
