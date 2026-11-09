---
'@dskripchenko/ui': minor
---

UidCodeInput: a one-time-code field of separate cells with `v-model`, `length` (default 6), `mode` (`numeric` with a numeric keypad, or `alphanumeric`, uppercased), `size`, `disabled`, `invalid` (error styling and `aria-invalid`), `autofocus`, `name` (a hidden input with the whole value) and `label`. Typing moves to the next cell, Backspace on an empty cell clears the previous one and moves there, arrows, Home and End move between cells; a pasted or autofilled code is spread from the first cell, dropping spaces, dashes and characters the mode does not allow. The first cell has `autocomplete="one-time-code"`. Emits `complete` once per distinct full value; exposes `focus()` and `clear()`. A labelled `role="group"`, each cell labelled "Character 2 of 6", the accent focus ring, light and dark themes. No dependencies. Also exports the `codeInput` locale strings (en, ru).
