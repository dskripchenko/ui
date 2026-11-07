---
'@dskripchenko/ui': patch
---

Accessible names for combobox controls: `aria-label`, `aria-labelledby` and `aria-describedby` given to `UidSelect`, `UidTreeSelect`, `UidCascader`, `UidDatePicker`, `UidDateRangePicker` or `UidTimePicker` now land on the element with `role="combobox"` (overriding the placeholder-based name), instead of the wrapper — before, a screen reader or `getByRole('combobox', { name })` found no name. `class`, `style`, `data-*` and listeners stay on the root, as before.
