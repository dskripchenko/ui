# Formularvalidierung

Ein kleiner eingebauter Validator nach Laravel-Vorbild: deklarative Regeln, kombinierbar, erweiterbar. Als Composables umgesetzt — keine Wrapper-Komponente nötig.

## Architektur

```
src/utils/validation/
  types.ts        # RuleFn, RuleInput, FieldContext, ValidationMessages
  rules.ts        # eingebaute Regeln
  parseRules.ts   # Parser für die String-Notation
  messages.ts     # Default-Nachrichten + globales Register

src/composables/
  useField.ts     # Validierung eines Feldes
  useForm.ts      # Formularweite Validierung, Context für Cross-Field-Regeln
```

Komponenten (`UidInput`, `UidSelect`, `UidCheckbox`, …) akzeptieren einen `rules`-Prop und nutzen `useField` intern.

## Typen

```ts
// Context, den jede Regel erhält
interface FieldContext {
  field: string                        // Feldname (aus useForm oder `name`-Prop)
  label?: string                       // wird in Nachrichten substituiert
  form?: Record<string, unknown>       // Geschwisterwerte (nur in useForm)
}

// Regel: gibt true bei Erfolg oder einen String mit dem Fehler zurück
type RuleFn = (value: unknown, ctx: FieldContext) => true | string

// Drei austauschbare Eingabeformate
type RuleInput = string | RuleFn | (string | RuleFn)[]
```

## Regelformate

```ts
// 1. Pipe-String (Laravel-ähnlich)
rules="required|email|max:255"

// 2. String-Array
:rules="['required', 'email', 'max:255']"

// 3. Funktions-Array — für eigene und parametrisierte Regeln
:rules="[required(), email(), max(255)]"

// 4. Gemischt
:rules="['required', email(), max(255), myCustomRule]"
```

Parametrisierte String-Regeln: `'min:8'`, `'max:255'`, `'min_value:0'`, `'regex:^[a-z]+$'`, `'in:admin,user,guest'`.

## Eingebaute Regeln

| Regel | String | Funktion | Beschreibung |
|---|---|---|---|
| Required | `required` | `required()` | Nicht leer (nicht `''`, `null`, `undefined`) |
| Nullable | `nullable` | `nullable()` | Validierung überspringen, wenn leer |
| Email | `email` | `email()` | E-Mail-Format |
| URL | `url` | `url()` | URL-Format |
| Numeric | `numeric` | `numeric()` | Zahl (ganzzahlig oder dezimal) |
| Integer | `integer` | `integer()` | Ganzzahl |
| Min length | `min:n` | `min(n)` | Mindestlänge String/Array |
| Max length | `max:n` | `max(n)` | Höchstlänge String/Array |
| Min value | `min_value:n` | `minValue(n)` | Numerisches Minimum |
| Max value | `max_value:n` | `maxValue(n)` | Numerisches Maximum |
| Regex | `regex:pattern` | `regex(pattern)` | Regex-Match |
| In | `in:a,b,c` | `inList([a, b, c])` | Wert aus Liste |
| Same as | `same_as:field` | `sameAs(field)` | Gleich einem anderen Feld (braucht `useForm`) |
| Required if | `required_if:field,value` | `requiredIf(field, value)` | Pflicht, wenn anderes Feld == Wert |
| Required unless | `required_unless:field,value` | `requiredUnless(field, value)` | Pflicht, wenn anderes Feld ≠ Wert |

## Trigger-Strategie: eager

Standard und einzige öffentlich dokumentierte Strategie.

1. Bis zum ersten `blur` — keine Validierung (User tippt noch).
2. Nach `blur` — Feld wird "dirty"; Validierung läuft.
3. Nach erstem Fehler — Validierung bei jedem `input` (User sieht Korrektur in Echtzeit).
4. Bei Submit — erzwungene Validierung aller Felder.

## `useField`

Validierung eines einzelnen Feldes. Direkt mit eigenen Controls verwendbar.

```ts
import { ref } from 'vue'
import { useField } from '@dskripchenko/ui'

const value = ref('')

const { error, isDirty, validate, reset, fieldProps } = useField(value, {
  rules: 'required|email',
  label: 'E-Mail',
  name: 'email',
})
```

```ts
interface UseFieldOptions {
  rules?: RuleInput
  label?: string
  name?: string
}

interface UseFieldReturn {
  error: Ref<string | null>
  isDirty: Ref<boolean>
  validate: () => boolean
  reset: () => void
  fieldProps: ComputedRef<{ onBlur: () => void; onInput: () => void }>
}
```

### Beispiel mit eigenem Control

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

Koordiniert mehrere Felder, liefert Context für Cross-Field-Regeln.

```ts
import { ref } from 'vue'
import { useForm, sameAs } from '@dskripchenko/ui'

const password = ref('')
const confirm  = ref('')

const form = useForm({
  fields: {
    email:    { value: ref(''), rules: 'required|email', label: 'E-Mail' },
    password: { value: password, rules: 'required|min:8', label: 'Passwort' },
    confirm:  { value: confirm,  rules: ['required', sameAs('password')], label: 'Bestätigung' },
  },
})

async function submit() {
  if (!form.validate()) return
  // alle Felder gültig
}
```

```ts
interface UseFormReturn {
  errors:  ComputedRef<Record<string, string | null>>
  isValid: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>

  validate: () => boolean
  reset:    () => void

  field: (name: string) => UseFieldReturn
}
```

## Eigene Regeln

Eine Regel ist eine Funktion `(value, ctx) => true | string`. Gibt `true` bei Erfolg, einen Fehlerstring sonst.

```ts
// Einfache Regel
const noSpaces: RuleFn = (value) =>
  !String(value).includes(' ') || 'Leerzeichen sind nicht erlaubt'

// Parametrisiert (Factory)
const startsWith = (prefix: string): RuleFn => (value) =>
  String(value).startsWith(prefix) || `Muss mit "${prefix}" beginnen`

:rules="[required(), noSpaces, startsWith('https')]"
```

### Cross-Field-Regel

```ts
const sameAs = (fieldName: string): RuleFn => (value, ctx) => {
  if (!ctx.form) return true  // außerhalb useForm — überspringen
  return value === ctx.form[fieldName] || 'Werte stimmen nicht überein'
}
```

### Nullable — Kettenstopp

`nullable` bricht weitere Validierung ab, wenn der Wert leer ist:

```ts
:rules="'nullable|email|max:255'"
```

## Nachrichten

### Defaults

Default-Nachrichten leben in `src/utils/validation/messages.ts`. Sie unterstützen Parameter-Substitution:

```ts
const defaultMessages: ValidationMessages = {
  required:  ({ label }) => `Das Feld "${label ?? 'Wert'}" ist erforderlich`,
  email:     () => 'Geben Sie eine gültige E-Mail ein',
  min:       ({ params }) => `Mindestens ${params[0]} Zeichen`,
  max:       ({ params }) => `Maximal ${params[0]} Zeichen`,
}
```

### Per-Regel-Override

```ts
:rules="[required('Bitte das Feld ausfüllen'), max(100, 'Zu lang')]"
```

**Priorität:** Regel > globales Register > Default.

## Komponenten-Integration

Form-Input-Komponenten akzeptieren dieselbe Form wie `useField`:

```ts
interface ValidatableProps {
  rules?: RuleInput
  name?:  string
  label?: string
}
```

Der Fehler wird unter dem Feld via `UidFormField` gerendert — Wrapper mit Label, Hint und Error-Slot.

Bei Verwendung mit `useForm` muss die Komponente einen `name` erhalten, der zum Form-Field-Schlüssel passt — Cross-Field-Regeln funktionieren dann automatisch via provide/inject.

```vue
<form @submit.prevent="submit">
  <UidInput v-model="form.field('email').value"    name="email"    rules="required|email" label="E-Mail" />
  <UidInput v-model="form.field('password').value" name="password" rules="required|min:8" label="Passwort" />
  <UidInput v-model="form.field('confirm').value"  name="confirm"
    :rules="['required', sameAs('password')]" label="Bestätigung" />

  <UidButton type="submit" :disabled="!form.isValid">Senden</UidButton>
</form>
```

## Nicht in v1

- **Async-Regeln** (Eindeutigkeitsprüfung via API) — wird ohne API-Bruch ergänzt: `RuleFn` gibt schon `true | string` zurück; Erweiterung auf `Promise<true | string>` ist abwärtskompatibel.
- **Schema-Validierung** (Zod, Yup) — bei Bedarf via Wrapper in `RuleFn` adaptierbar.
- **Server-Fehler** — manuell setzbar via `field('email').setError('Bereits vergeben')` (Helper bei Bedarf).
