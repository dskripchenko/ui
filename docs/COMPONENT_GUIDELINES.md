# Component guidelines

Rules every component in the kit must follow. Read this before adding a new component.

## Folder structure

```
src/components/Button/
├── UidButton.vue          # template + script setup
├── UidButton.css          # styles (imported from <script setup>)
├── UidButton.stories.ts   # Storybook
├── UidButton.spec.ts      # Vitest + @vue/test-utils
└── index.ts               # component + types re-export
```

## Naming

| Entity | Prefix | Example |
|---|---|---|
| Component name | `Uid` (PascalCase) | `UidButton`, `UidInputField` |
| Root CSS class | `uid-` (kebab-case) | `.uid-button`, `.uid-input-field` |
| Modifier class | BEM double-dash | `.uid-button--primary`, `.uid-button--size-sm` |
| Element class | BEM double-underscore | `.uid-button__icon` |
| Component CSS variable | `--uid-{component}-*` | `--uid-button-bg` |
| Props type | `{Component}Props` | `UidButtonProps` |
| Enum variant type | `{Component}{Aspect}` | `UidButtonVariant`, `UidButtonSize` |

## API: props, events, slots

### Props

- Always typed. Defaults via `withDefaults`.
- Sizes — named scale: `'sm' | 'md' | 'lg'`. No raw numbers.
- Variants — finite union: `'primary' | 'secondary' | 'ghost' | 'danger'`.
- No `any`, no `Object` props without an interface.

Form-input components (`UidInput`, `UidSelect`, `UidCheckbox`, …) extend the common `ValidatableProps`:

```ts
interface ValidatableProps {
  rules?: RuleInput   // 'required|email' | RuleFn | (string | RuleFn)[]
  name?:  string      // field name — needed for cross-field rules in useForm
  label?: string      // substituted into error messages
}
```

See [validation](./en/validation.md).

```ts
export type UidButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type UidButtonSize = 'sm' | 'md' | 'lg'

export interface UidButtonProps {
  variant?: UidButtonVariant
  size?: UidButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<UidButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})
```

### Events

- Names — kebab-case, no `on` prefix: `click`, `update:modelValue`, `change`, `close`.
- Typed via `defineEmits` generic.

```ts
const emit = defineEmits<{
  click: [event: MouseEvent]
  'update:modelValue': [value: string]
}>()
```

### Slots

- Default slot — main content.
- Named slots — for optional pieces: `prepend`, `append`, `icon`, `header`, `footer`.
- Typed via `defineSlots` (Vue 3.3+).

```ts
defineSlots<{
  default(): unknown
  prepend?(): unknown
  append?(): unknown
}>()
```

### v-model

- Use `defineModel()` (Vue 3.4+) — shorter and type-safer than the `prop+emit` pair.

```ts
const model = defineModel<string>()
```

## Component radii

The radius scale is intentionally tiny — five values, most components use one.

| Component | Radius |
|---|---|
| `UidButton`, `UidInput`, `UidSelect`, `UidTextarea` | `--uid-radius-md` (6px) |
| `UidDropdown`, `UidMenu`, `UidAlert`, `UidToast` | `--uid-radius-md` (6px) |
| `UidCard`, `UidModal`, `UidDrawer`, `UidPopover` | `--uid-radius-lg` (10px) |
| `UidBadge`, `UidTag`, `UidTooltip`, `UidCheckbox` | `--uid-radius-sm` (3px) |
| `UidAvatar` | `--uid-radius-full` (9999px) |
| Tables, dividers, code blocks | `--uid-radius-none` (0) |

When in doubt — `md`. `full` is intentional, never default.

## Component sizes

Every interactive component supports three sizes via `size: 'sm' | 'md' | 'lg'`.

| Size | Height | Padding-x | Font | Icon |
|---|---|---|---|---|
| `sm` | 32px (`--uid-size-sm`) | `--uid-space-sm` (8px) | `--uid-font-size-sm` (14px) | 16px |
| `md` | 40px (`--uid-size-md`) | `--uid-space-md` (16px) | `--uid-font-size-md` (16px) | 20px |
| `lg` | 48px (`--uid-size-lg`) | `--uid-space-lg` (24px) | `--uid-font-size-lg` (18px) | 20px |

Height uses `min-height`, not `height` — multiline content can grow the element.
Components without text (icons, avatars) use `width` + `height` directly.
Icons in `lg` stay 20px — bumping to 24px throws off visual balance with the text.

## Styles

- `Component.css` is imported from `<script setup>`: `import './UidButton.css'`.
- **No `scoped`.** Isolation via `.uid-{component}` prefix + BEM.
- All knobs go through local CSS variables that fall back to semantic tokens (see [tokens](./en/tokens.md)).
- States — via attributes or modifier classes:
  - `:hover`, `:focus-visible`, `:active` — pseudo-classes.
  - `disabled` — `disabled` attribute or `[aria-disabled="true"]`, not a class.
  - `loading`, `selected`, `expanded` — `data-*` attributes or modifier classes.
- Focus ring — always `:focus-visible` (not `:focus`). One uniform style across the kit:
  ```css
  .uid-button:focus-visible {
    outline: 2px solid var(--uid-accent);
    outline-offset: 2px;
    border-radius: inherit;
  }
  .uid-input--error:focus-visible {
    outline-color: var(--uid-danger);
  }
  ```

### CSS file template

```css
.uid-button {
  --uid-button-bg:        var(--uid-accent);
  --uid-button-bg-hover:  var(--uid-accent-hover);
  --uid-button-color:     var(--uid-text-on-accent);
  --uid-button-radius:    var(--uid-radius-md);
  --uid-button-height:    var(--uid-size-md);
  --uid-button-padding-x: var(--uid-space-md);
  --uid-button-padding-y: var(--uid-space-sm);

  display: inline-flex;
  align-items: center;
  gap: var(--uid-space-xs);
  min-height: var(--uid-button-height);
  padding: var(--uid-button-padding-y) var(--uid-button-padding-x);
  border: 0;
  border-radius: var(--uid-button-radius);
  background: var(--uid-button-bg);
  color: var(--uid-button-color);
  font: inherit;
  cursor: pointer;
  transition: background var(--uid-duration-fast) var(--uid-ease-out);
}

.uid-button:hover { background: var(--uid-button-bg-hover); }

.uid-button:focus-visible {
  outline: 2px solid var(--uid-accent);
  outline-offset: 2px;
}

.uid-button[disabled],
.uid-button[aria-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}

.uid-button--secondary {
  --uid-button-bg:       var(--uid-surface-raised);
  --uid-button-bg-hover: var(--uid-border-subtle);
  --uid-button-color:    var(--uid-text-primary);
}

.uid-button--sm { --uid-button-height: var(--uid-size-sm); --uid-button-padding-x: var(--uid-space-sm); font-size: var(--uid-font-size-sm); }
.uid-button--lg { --uid-button-height: var(--uid-size-lg); --uid-button-padding-x: var(--uid-space-lg); font-size: var(--uid-font-size-lg); }
```

## States

### Hover

Components with a semantic `-hover` token use it directly:
```css
.uid-button:hover { background: var(--uid-button-bg-hover); }
```

Surfaces without a `-hover` token (menu items, table rows, nav items) use a translucent overlay:
```css
.uid-menu-item:hover { background: rgb(0 0 0 / 0.04); }
:root[data-theme='dark'] .uid-menu-item:hover { background: rgb(255 255 255 / 0.06); }
```

Always `transition: <prop> var(--uid-duration-fast) var(--uid-ease-out)`.

### Active / Pressed

```css
.uid-button:active { transform: scale(0.98); }
```

### Disabled

```css
.uid-button[disabled],
.uid-button[aria-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

`pointer-events: none` is **avoided** — it kills tooltips on disabled elements that explain why they're disabled.

### Error

For form controls (`UidInput`, `UidSelect`, `UidTextarea`):
```css
.uid-input--error { border-color: var(--uid-danger); }
.uid-input--error:focus-visible { outline-color: var(--uid-danger); }
```

An error always comes with text — colour alone isn't enough for a11y.

### Loading

```css
.uid-button[data-loading='true'] {
  opacity: 0.7;
  cursor: wait;
  pointer-events: none;
}
```

## Accessibility

Minimum every component must meet:

- Native semantic elements first (`<button>`, `<input>`, `<dialog>`). If there's no native element, use the right `role`.
- All interactive elements reachable via keyboard (Tab/Shift+Tab, Enter/Space, Esc to close).
- States surfaced via ARIA: `aria-disabled`, `aria-expanded`, `aria-selected`, `aria-invalid`, `aria-describedby`.
- Form controls have a label (slot, prop, `aria-label`/`aria-labelledby`).
- Focus ring visible — never strip `outline` without replacing it via `:focus-visible`.
- Don't use colour alone to convey meaning (error = colour + text/icon, not just a red border).

Storybook ships with `@storybook/addon-a11y`. A component must pass it without critical violations before the PR.

## Tests

Unit tests are required for:

- prop → classes/attributes
- event emission
- v-model two-way binding
- a11y invariants (e.g. `aria-disabled` when `disabled`)

Visual cases live in Storybook.

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidButton from './UidButton.vue'

describe('UidButton', () => {
  it('emits click', async () => {
    const wrapper = mount(UidButton, { slots: { default: 'OK' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(UidButton, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
```

## Storybook

One `.stories.ts` per component, with at minimum:

- `Default` — bare, no props.
- One story per `variant`.
- One story per `size` (or a single `Sizes` showing them side-by-side).
- `Disabled`, `Loading` — if applicable.
- `Playground` — all args as `argTypes` to poke at.

Story template:

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import UidButton from './UidButton.vue'

const meta: Meta<typeof UidButton> = {
  title: 'Inputs/Button',
  component: UidButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size:    { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading:  { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidButton>

export const Playground: Story = {
  args: { variant: 'primary', size: 'md' },
  render: (args) => ({
    components: { UidButton },
    setup: () => ({ args }),
    template: `<UidButton v-bind="args">Button</UidButton>`,
  }),
}
```

## Definition of Done

- [ ] Folder layout matches the convention above.
- [ ] Props/Events/Slots typed; JSDoc where the meaning isn't obvious from the name.
- [ ] Styles use semantic tokens or local variables fallbacking to them only.
- [ ] Works in both light and dark in Storybook.
- [ ] Storybook covers Default + Variants + States.
- [ ] `addon-a11y` shows no critical violations.
- [ ] Unit tests cover props → render and events.
- [ ] Component exported from `src/index.ts`.
- [ ] Changeset added (`pnpm changeset`).

See also the template at [`templates/COMPONENT.md`](./templates/COMPONENT.md).
