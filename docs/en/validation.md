# Form validation

A small built-in validator inspired by Laravel: declarative rules, composable, extensible. Implemented as composables — no wrapper component required.

## Architecture

```
src/utils/validation/
  types.ts        # RuleFn, RuleInput, FieldContext, ValidationMessages
  rules.ts        # built-in rules
  parseRules.ts   # string-notation parser
  messages.ts     # default messages + global registry

src/composables/
  useField.ts     # one-field validation
  useForm.ts      # form-wide validation, context for cross-field rules
```

Components (`UidInput`, `UidSelect`, `UidCheckbox`, …) accept a `rules` prop and use `useField` internally.

## Types

```ts
// Context passed to every rule
interface FieldContext {
  field: string                        // field name (from useForm or `name` prop)
  label?: string                       // substituted into messages
  form?: Record<string, unknown>       // sibling-field values (only inside useForm)
}

// A rule: returns true on success or a string with the error
type RuleFn = (value: unknown, ctx: FieldContext) => true | string

// Three equivalent input formats
type RuleInput = string | RuleFn | (string | RuleFn)[]
```

## Rule formats

```ts
// 1. Pipe-string (Laravel-like)
rules="required|email|max:255"

// 2. String array
:rules="['required', 'email', 'max:255']"

// 3. Function array — for custom and parameterized rules
:rules="[required(), email(), max(255)]"

// 4. Mixed
:rules="['required', email(), max(255), myCustomRule]"
```

Parameterized string rules: `'min:8'`, `'max:255'`, `'min_value:0'`, `'regex:^[a-z]+$'`, `'in:admin,user,guest'`.

## Built-in rules

| Rule | String | Function | Description |
|---|---|---|---|
| Required | `required` | `required()` | Not empty (not `''`, `null`, `undefined`) |
| Nullable | `nullable` | `nullable()` | Skip validation when empty |
| Email | `email` | `email()` | Email format |
| URL | `url` | `url()` | URL format |
| Numeric | `numeric` | `numeric()` | A number (integer or decimal) |
| Integer | `integer` | `integer()` | Integer |
| Min length | `min:n` | `min(n)` | Minimum string/array length |
| Max length | `max:n` | `max(n)` | Maximum string/array length |
| Min value | `min_value:n` | `minValue(n)` | Numeric minimum |
| Max value | `max_value:n` | `maxValue(n)` | Numeric maximum |
| Regex | `regex:pattern` | `regex(pattern)` | Regex match |
| In | `in:a,b,c` | `inList([a, b, c])` | Value within list |
| Same as | `same_as:field` | `sameAs(field)` | Equal to another field (needs `useForm`) |
| Required if | `required_if:field,value` | `requiredIf(field, value)` | Required when another field equals value |
| Required unless | `required_unless:field,value` | `requiredUnless(field, value)` | Required when another field is not value |

## Trigger strategy: eager

The default and the only documented strategy.

1. Until first `blur` — no validation (user is still typing).
2. After `blur` — field becomes "dirty"; validation runs.
3. After the first error — validation runs on every `input` (user sees corrections in real time).
4. On form submit — forced validation of all fields regardless of state.

## `useField`

One-field validation. Use directly with custom controls.

```ts
import { ref } from 'vue'
import { useField } from '@dskripchenko/ui'

const value = ref('')

const { error, isDirty, validate, reset, fieldProps } = useField(value, {
  rules: 'required|email',
  label: 'Email',
  name: 'email',
})
```

```ts
interface UseFieldOptions {
  rules?: RuleInput
  label?: string    // substituted into messages instead of name
  name?: string     // field name, passed in FieldContext
}

interface UseFieldReturn {
  error: Ref<string | null>      // current error
  isDirty: Ref<boolean>          // has been blurred at least once
  validate: () => boolean        // manual run; returns isValid
  reset: () => void              // resets error and isDirty

  // events to bind manually if you don't use a kit component
  fieldProps: ComputedRef<{ onBlur: () => void; onInput: () => void }>
}
```

### Custom-control example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useField } from '@dskripchenko/ui'

const value = ref('')
const { error, fieldProps } = useField(value, { rules: 'required|min:3' })
</script>

<template>
  <div>
    <input v-model="value" v-bind="fieldProps" />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
```

## `useForm`

Coordinates multiple fields and provides context for cross-field rules.

```ts
import { ref } from 'vue'
import { useForm, sameAs } from '@dskripchenko/ui'

const password = ref('')
const confirm  = ref('')

const form = useForm({
  fields: {
    email:    { value: ref(''), rules: 'required|email', label: 'Email' },
    password: { value: password, rules: 'required|min:8', label: 'Password' },
    confirm:  { value: confirm,  rules: ['required', sameAs('password')], label: 'Confirm' },
  },
})

async function submit() {
  if (!form.validate()) return
  // all fields valid
}
```

```ts
interface UseFormReturn {
  errors:  ComputedRef<Record<string, string | null>>
  isValid: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>

  validate: () => boolean   // validates all, marks all dirty
  reset:    () => void

  field: (name: string) => UseFieldReturn
}
```

## Custom rules

A rule is a function `(value, ctx) => true | string`. Returns `true` on success, an error string otherwise.

```ts
// Plain rule
const noSpaces: RuleFn = (value) =>
  !String(value).includes(' ') || 'Spaces are not allowed'

// Parameterized (factory)
const startsWith = (prefix: string): RuleFn => (value) =>
  String(value).startsWith(prefix) || `Must start with "${prefix}"`

// Use
:rules="[required(), noSpaces, startsWith('https')]"
```

### Cross-field rule

```ts
const sameAs = (fieldName: string): RuleFn => (value, ctx) => {
  if (!ctx.form) return true  // outside useForm — skip
  return value === ctx.form[fieldName] || 'Values do not match'
}
```

### Nullable — chain stop

`nullable` short-circuits further validation if the value is empty:

```ts
// email is optional, but if filled — must be valid
:rules="'nullable|email|max:255'"
```

## Messages

### Defaults

Default messages live in `src/utils/validation/messages.ts`. They support parameter substitution:

```ts
const defaultMessages: ValidationMessages = {
  required:  ({ label }) => `Field "${label ?? 'value'}" is required`,
  email:     () => 'Enter a valid email',
  min:       ({ params }) => `At least ${params[0]} characters`,
  max:       ({ params }) => `At most ${params[0]} characters`,
  min_value: ({ params }) => `Value must be ≥ ${params[0]}`,
  max_value: ({ params }) => `Value must be ≤ ${params[0]}`,
  same_as:   () => 'Values do not match',
}
```

### Per-rule override

```ts
:rules="[required('Please fill the field'), max(100, 'Too long')]"
```

**Priority:** rule > global registry > default.

## Component integration

Form-input components accept the same shape as `useField`:

```ts
interface ValidatableProps {
  rules?: RuleInput
  name?:  string     // for cross-field rules in useForm
  label?: string     // substituted into messages
}
```

The error renders below the field via `UidFormField` — a wrapper with label, hint, and error slot.

When used with `useForm`, the component should receive a `name` matching the form field key — cross-field rules then work automatically through provide/inject.

```vue
<form @submit.prevent="submit">
  <UidInput v-model="form.field('email').value"    name="email"    rules="required|email" label="Email" />
  <UidInput v-model="form.field('password').value" name="password" rules="required|min:8" label="Password" />
  <UidInput v-model="form.field('confirm').value"  name="confirm"
    :rules="['required', sameAs('password')]" label="Confirm" />

  <UidButton type="submit" :disabled="!form.isValid">Submit</UidButton>
</form>
```

## Not in v1

- **Async rules** (uniqueness check via API) — to be added without API change: `RuleFn` already returns `true | string`; extending to `Promise<true | string>` is backward-compatible.
- **Schema validation** (Zod, Yup) — adapt via a wrapper into `RuleFn` if needed.
- **Server errors** — set manually via `field('email').setError('Already taken')` (helper to be added on demand).
