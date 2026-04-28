# Component description template

Use this template when adding a new component — copy into `src/components/{Name}/README.md` (optional) or use as a checklist in your PR description.

---

## `Uid{Name}`

> One or two lines: what it is and why.

### API

#### Props

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size |
| `disabled` | `boolean` | `false` | Disables interaction |

#### Events

| Name | Payload | When |
|---|---|---|
| `click` | `MouseEvent` | User clicks the component |
| `update:modelValue` | `string` | Value changed (v-model) |

#### Slots

| Name | Content |
|---|---|
| `default` | Main content |
| `prepend` | Content before main (e.g. icon) |
| `append` | Content after main |

#### v-model

- Plain `v-model` binds to `modelValue` / `update:modelValue` — value of type `…`.

### CSS API (variables)

Local component variables, available for outside override:

| Variable | Default (token fallback) | Controls |
|---|---|---|
| `--uid-{name}-bg` | `var(--uid-accent)` | Background |
| `--uid-{name}-bg-hover` | `var(--uid-accent-hover)` | Hover background |
| `--uid-{name}-color` | `var(--uid-text-on-accent)` | Text color |
| `--uid-{name}-radius` | `var(--uid-radius-md)` | Border radius |
| `--uid-{name}-height` | `var(--uid-size-md)` | Height (interactive elements) |
| `--uid-{name}-padding-x` | `var(--uid-space-md)` | Horizontal padding |
| `--uid-{name}-padding-y` | `var(--uid-space-sm)` | Vertical padding |

### Accessibility

- Semantic root element: `<button>` / `<input>` / `<role="…">`.
- Supported keys: `Tab`, `Enter`, `Space`, `Esc` (where applicable).
- Auto-applied ARIA: `aria-disabled`, `aria-invalid`, …
- Consumer responsibility: provide `aria-label` / `label` when there's no visible text.

### Examples

```html
<UidFoo variant="primary" size="md" @click="handleClick">
  Button
</UidFoo>
```

```html
<UidFoo v-model="value" :disabled="loading">
  <template #prepend><Icon name="check" /></template>
  Save
</UidFoo>
```

### Definition of Done

- [ ] Folder matches structure from [COMPONENT_GUIDELINES](../COMPONENT_GUIDELINES.md)
- [ ] Props/Events/Slots typed
- [ ] Styles via tokens / local variables only
- [ ] Works in light and dark
- [ ] Storybook: Default + Variants + States + Playground
- [ ] `addon-a11y` clean
- [ ] Unit tests for props → render + events
- [ ] Exported from `src/index.ts`
- [ ] Changeset added
