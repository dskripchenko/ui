---
"@dskripchenko/ui": minor
---

`UidModal`: `size="full"` (a dialog that fills the viewport) and `closeOnEsc` to keep a dialog that must be answered open on Escape. `UidDrawer`: `side="top"` and `closeOnEsc`. `UidStepper`: `selectable` (`'none'` by default, `'completed'` or `'all'`) renders the selectable steps as buttons and emits `select` with the step index — so a wizard can be navigated by click and by keyboard.
