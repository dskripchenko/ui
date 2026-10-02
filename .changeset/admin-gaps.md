---
"@dskripchenko/ui": minor
---

Close component gaps found while building laravel-admin:

- `UidMenuItem`: the `icon` prop is now rendered (16px, before the label, class `uid-menu-item__icon`). `UidSubMenu` icons use the same class.
- `UidSelect`: new `multiple` mode. v-model becomes an array, selected options show as removable chips, picking an option toggles it and keeps the dropdown open, Backspace on the trigger removes the last chip, `clearable` resets to `[]`, and the listbox gets `aria-multiselectable`. `maxTagCount` collapses extra chips into "+N". The `SelectValue` type is exported. Single-value behaviour is unchanged.
- New `UidCheckboxGroup`: renders `options` (`{ value, label, disabled? }`) as checkboxes with an array v-model (kept in options order), plus `label`, `hint`, `error`, `required`, `disabled`, `direction` and `name`, and a `change` event. `CheckboxGroupOption` and `CheckboxGroupValue` are exported.
- `UidTable`: columns accept `fixed: 'left' | 'right'` to stay pinned while the table scrolls horizontally. Offsets are measured from the header cells (falling back to px `width`), the selection column pins along with left-fixed columns, fixed cells paint the current row background (hover, selected, striped) over an opaque base in both themes, and edge shadows appear only while content is scrolled under them. Tables with fixed columns size to their content (`width: max-content; min-width: 100%`). Selected rows now keep their highlight in striped tables.
- `UidSlider`: `ariaLabel` and `ariaLabelledby` set the handle's accessible name separately from the visible `label`. The visible label is now associated with the input, and `formatValue` also feeds `aria-valuetext`.
- `UidBreadcrumbItem`: `to` renders through the app's globally registered `RouterLink` (falling back to `href`, or a string `to`, without vue-router), and a `click` event is emitted. A crumb with only a click listener renders as a button. `current` is now optional: when omitted only the last crumb is the current page (`aria-current="page"`), so a middle crumb without a link is plain text instead of being styled as current; `current: false` keeps the last crumb a regular one.
- `--uid-font-family-mono` now lists concrete system monospace fonts (SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, DejaVu Sans Mono, Courier New) before the generic, so Cyrillic no longer falls back to a serif face in Chrome. `UidColorPicker` and `UidCommand` now use this token (they referenced an undefined `--uid-font-mono`).
