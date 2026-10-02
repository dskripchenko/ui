---
"@dskripchenko/ui": minor
---

Floating layers work inside modals and drawers.

- `UidDatePicker`, `UidDateRangePicker`, `UidTimePicker`, `UidTreeSelect`, `UidCascader`, `UidCombobox`, `UidColorPicker` and `UidMention` rendered their panel in place, so inside a `UidModal`/`UidDrawer` it was clipped by the body's overflow and sat under the footer. Their panels are now teleported to the body and positioned `fixed` (new internal `useFloatingPanel`): they follow the anchor on scroll and resize, flip above it when there is no room below, and cap their height (scrolling) when there is room on neither side.
- One stacking scale: `base < sticky < dropdown < overlay < drawer = modal < popover < toast < tooltip`. New tokens `--uid-z-popover` (450) and `--uid-z-drawer` (400); `--uid-z-sticky` and `--uid-z-dropdown` swap places (100 / 200). Every teleported layer — select, menu, popover, breadcrumb overflow and the pickers — stacks at `--uid-z-popover`, above modals, drawers and the command palette.
- Escape closes only the top layer: a picker or menu inside a modal closes alone, and a drawer opened from a modal closes without the modal (`UidModal`, `UidDrawer`, `UidCommand` keep an overlay stack and ignore an Escape already handled).
- Focus rings use `--uid-color-focus-ring` everywhere: a zero-specificity `:focus-visible` rule in `global.css` replaces the browser's default blue ring (e.g. the date picker's day cells), and component rings that used `--uid-color-primary`/`--uid-accent` now use the focus-ring token.
- `UidTable` emits `row-click` with the `MouseEvent` as the second argument, and no longer emits it for clicks on interactive elements inside a cell (links, buttons, inputs, `role="checkbox|switch|button|…"`, `[contenteditable]`, `[data-row-click-ignore]`) or at the end of a text selection.
- `UidColorPicker` takes its placeholder from the locale (new `placeholder` prop) instead of a hard-coded Russian string.
