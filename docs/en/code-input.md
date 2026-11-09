# Code input

`UidCodeInput` is a field for a one-time code — a sign-in confirmation, a two-factor code, a code from an email — typed into a row of separate cells. Typing moves to the next cell, Backspace goes back, and a pasted or autofilled code is spread over the cells at once. When every cell is filled the field emits `complete`, so the host can verify the code without a submit button.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidCodeInput } from '@dskripchenko/ui'

const code = ref('')
const invalid = ref(false)
const field = ref<InstanceType<typeof UidCodeInput> | null>(null)

async function verify(value: string): Promise<void> {
  invalid.value = !(await checkCode(value)) // your own request
  if (invalid.value) {
    field.value?.clear()
    field.value?.focus()
  }
}
</script>

<template>
  <UidCodeInput
    ref="field"
    v-model="code"
    name="code"
    autofocus
    :invalid="invalid"
    @complete="verify"
  />
</template>
```

## Behaviour

- A typed character fills the cell and moves focus to the next one. Typing into a filled cell replaces its character; a cell selects its content when it gets focus.
- Backspace clears the cell; on an empty cell it clears the previous one and moves there. Delete clears the cell in place.
- ← and → move between cells, Home and End go to the first and the last.
- Pasting into any cell, or the browser's autofill of a whole code, spreads the code over the cells starting at the first; spaces, dashes and characters `mode` does not allow are dropped, so `123 456` and `12-34-56` both give `123456`. A shorter code fills the first cells and clears the rest.
- In `numeric` mode only digits are taken and phones show a numeric keypad (`inputmode="numeric"`); in `alphanumeric` mode Latin letters and digits are taken and letters are uppercased.
- The first cell has `autocomplete="one-time-code"`, so iOS and Android offer a code that arrived by SMS.

The value is the filled characters in order. `complete` fires once per distinct complete value: again if the user changes a character of a full code, never when `v-model` is set from outside.

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `modelValue` | `string` | `''` | The code; use with `v-model`. Characters `mode` does not allow are dropped, the rest is cut to `length`. |
| `length` | `number` | `6` | Number of cells. |
| `mode` | `'numeric' \| 'alphanumeric'` | `'numeric'` | Which characters the cells take. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cell size: 36 × 44, 44 × 52 or 52 × 60 px. |
| `disabled` | `boolean` | `false` | Disables every cell. |
| `invalid` | `boolean` | `false` | Error styling and `aria-invalid="true"` on every cell. |
| `autofocus` | `boolean` | `false` | Focus the first empty cell on mount. |
| `name` | `string` | — | Name of a hidden input with the whole value, so a plain form posts it. The cells themselves have no name. |
| `label` | `string` | locale `label` | The group's accessible name. |
| `id` | `string` | — | id of the first cell, for an outside `<label for>`. |

## Events

| Event | Payload | |
|---|---|---|
| `update:modelValue` | `string` | After every change. |
| `complete` | `string` | All cells are filled. |

## Methods

Through a template ref: `focus()` focuses the first empty cell (the last one when the code is full); `clear()` empties every cell and updates `v-model`, without moving focus.

## Accessibility

The cells sit in a `role="group"` named by `label` ("Verification code" by default). Each cell is an `<input>` labelled "Character 2 of 6". The focused cell gets the accent border and a soft accent ring (the danger colour when `invalid`). Describe the code — where it came from, how many characters — in text next to the field, and show an error message there too: `invalid` only colours the cells.

## Styling

| Variable | Default | |
|---|---|---|
| `--uid-code-input-cell-width` | `44px` | Cell width at `md`; cells shrink when the row does not fit. |
| `--uid-code-input-cell-height` | `52px` | Cell height at `md`. |
| `--uid-code-input-font-size` | `22px` | Character size at `md`. |
| `--uid-code-input-gap` | `--uid-space-sm` | Gap between cells. |
| `--uid-code-input-font` | `--uid-font-family-mono` | Font of the characters. |
| `--uid-code-input-bg`, `--uid-code-input-color` | surface, text | Cell background and text. |
| `--uid-code-input-border`, `--uid-code-input-border-hover`, `--uid-code-input-border-focus` | theme borders, accent | Cell borders. |
| `--uid-code-input-ring` | `--uid-accent` | Colour of the focus ring. |
| `--uid-code-input-radius` | `--uid-radius-md` | Cell corner radius. |

The row is centred in its container. Light and dark themes come from the theme tokens.

Types: `UidCodeInputProps`.

## Texts

Captions come from the locale bag, section `codeInput` (see [i18n](./i18n.md)): `label`, `cell(n, total)`.
