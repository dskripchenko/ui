---
"@dskripchenko/ui": minor
---

Follow-ups from laravel-admin adopting 1.5:

- `UidSelect`: v-model is typed per mode again. The component is generic over `multiple`, so without it (or with `:multiple="false"`) `modelValue`, `update:modelValue` and `change` are `SelectValue | null`, as before 1.5; with `multiple` / `:multiple="true"` they are `SelectValue[]`; a non-literal boolean gives the union. The new `SelectModelValue<M>` type is exported. Uncontrolled use (no v-model) keeps working.
- `UidBreadcrumb`: new `nowrap` (one line, long crumbs truncate with an ellipsis; parent crumbs give way before the current one) and `collapse` (implies `nowrap`; when the trail overflows, middle crumbs collapse into "…", keeping the first and the last). With `collapse`, the "…" is a button that opens a keyboard-navigable menu of the hidden crumbs (activating an entry clicks the crumb's own link, RouterLink or button); `collapseMenu: false` renders a plain "…". New CSS variables `--uid-breadcrumb-item-max-width` and `--uid-breadcrumb-item-min-width` (default `3em`) and locale key `breadcrumb.showHidden`.
- `UidBreadcrumb`: the separator is now an `aria-hidden` element in the template instead of a `::before` on the item, and the invalid `aria-hidden: true;` declaration is gone from the CSS. `--uid-breadcrumb-sep` and `--uid-breadcrumb-sep-color` work as before; custom CSS that targeted `.uid-breadcrumb__item + .uid-breadcrumb__item::before` should target `.uid-breadcrumb__separator::before` instead.
- `UidTable`: new `selectionFixed` pins the selection column on its own, without any `fixed: 'left'` column. Left unset it keeps the current behaviour (pinned together with left-fixed columns); `false` never pins it.
- `--uid-font-family-mono` adds `'Cascadia Mono'` and `'Roboto Mono'` before `ui-monospace`.
