# Code-Eingabe

`UidCodeInput` ist ein Feld für einen Einmalcode — eine Anmeldebestätigung, einen Zwei-Faktor-Code, einen Code aus einer E-Mail —, der in eine Reihe einzelner Zellen getippt wird. Die Eingabe springt zur nächsten Zelle, Backspace geht zurück, und ein eingefügter oder automatisch ausgefüllter Code wird sofort auf die Zellen verteilt. Sind alle Zellen gefüllt, sendet das Feld `complete`, sodass der Host den Code ohne Absende-Button prüfen kann.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidCodeInput } from '@dskripchenko/ui'

const code = ref('')
const invalid = ref(false)
const field = ref<InstanceType<typeof UidCodeInput> | null>(null)

async function verify(value: string): Promise<void> {
  invalid.value = !(await checkCode(value)) // Ihre eigene Anfrage
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

## Verhalten

- Ein getipptes Zeichen füllt die Zelle, der Fokus springt zur nächsten. Tippen in eine gefüllte Zelle ersetzt ihr Zeichen; beim Fokussieren wird der Inhalt der Zelle markiert.
- Backspace leert die Zelle; in einer leeren Zelle leert es die vorherige und springt dorthin. Entf leert die Zelle an Ort und Stelle.
- ← und → wechseln zwischen den Zellen, Pos1 und Ende springen zur ersten und letzten.
- Einfügen in eine beliebige Zelle oder das Ausfüllen eines ganzen Codes durch den Browser verteilt den Code ab der ersten Zelle; Leerzeichen, Bindestriche und von `mode` nicht erlaubte Zeichen werden verworfen, sodass `123 456` und `12-34-56` beide `123456` ergeben. Ein kürzerer Code füllt die ersten Zellen und leert die übrigen.
- Im Modus `numeric` werden nur Ziffern angenommen, und Telefone zeigen eine Zifferntastatur (`inputmode="numeric"`); im Modus `alphanumeric` lateinische Buchstaben und Ziffern, Buchstaben werden großgeschrieben.
- Die erste Zelle hat `autocomplete="one-time-code"`, sodass iOS und Android einen per SMS erhaltenen Code anbieten.

Der Wert sind die gefüllten Zeichen in ihrer Reihenfolge. `complete` feuert einmal pro neuem vollständigem Wert: erneut, wenn der Nutzer ein Zeichen eines vollständigen Codes ändert, nie, wenn `v-model` von außen gesetzt wird.

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `modelValue` | `string` | `''` | Der Code; mit `v-model` verwenden. Von `mode` nicht erlaubte Zeichen werden verworfen, der Rest wird auf `length` gekürzt. |
| `length` | `number` | `6` | Anzahl der Zellen. |
| `mode` | `'numeric' \| 'alphanumeric'` | `'numeric'` | Welche Zeichen die Zellen annehmen. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Zellgröße: 36 × 44, 44 × 52 oder 52 × 60 px. |
| `disabled` | `boolean` | `false` | Deaktiviert alle Zellen. |
| `invalid` | `boolean` | `false` | Fehlerdarstellung und `aria-invalid="true"` an jeder Zelle. |
| `autofocus` | `boolean` | `false` | Fokussiert beim Mounten die erste leere Zelle. |
| `name` | `string` | — | Name eines versteckten Feldes mit dem ganzen Wert, damit ein normales Formular ihn sendet. Die Zellen selbst haben keinen Namen. |
| `label` | `string` | Locale `label` | Der zugängliche Name der Gruppe. |
| `id` | `string` | — | id der ersten Zelle, für ein äußeres `<label for>`. |

## Events

| Event | Nutzlast | |
|---|---|---|
| `update:modelValue` | `string` | Nach jeder Änderung. |
| `complete` | `string` | Alle Zellen sind gefüllt. |

## Methoden

Über eine Template-Ref: `focus()` fokussiert die erste leere Zelle (die letzte, wenn der Code vollständig ist); `clear()` leert alle Zellen und aktualisiert `v-model`, ohne den Fokus zu bewegen.

## Barrierefreiheit

Die Zellen liegen in einer `role="group"`, benannt durch `label` (standardmäßig „Verification code“ bzw. der Text der aktiven Locale). Jede Zelle ist ein `<input>` mit der Beschriftung „Character 2 of 6“. Die fokussierte Zelle erhält einen Rahmen in Akzentfarbe und einen weichen Ring (bei `invalid` in der Fehlerfarbe). Beschreiben Sie den Code — woher er kommt, wie viele Zeichen — als Text neben dem Feld und zeigen Sie dort auch eine Fehlermeldung: `invalid` färbt nur die Zellen.

## Gestaltung

| Variable | Standard | |
|---|---|---|
| `--uid-code-input-cell-width` | `44px` | Zellbreite bei `md`; passt die Reihe nicht, werden die Zellen schmaler. |
| `--uid-code-input-cell-height` | `52px` | Zellhöhe bei `md`. |
| `--uid-code-input-font-size` | `22px` | Zeichengröße bei `md`. |
| `--uid-code-input-gap` | `--uid-space-sm` | Abstand zwischen den Zellen. |
| `--uid-code-input-font` | `--uid-font-family-mono` | Schrift der Zeichen. |
| `--uid-code-input-bg`, `--uid-code-input-color` | Fläche, Text | Hintergrund und Text der Zelle. |
| `--uid-code-input-border`, `--uid-code-input-border-hover`, `--uid-code-input-border-focus` | Theme-Rahmen, Akzent | Rahmen der Zelle. |
| `--uid-code-input-ring` | `--uid-accent` | Farbe des Fokusrings. |
| `--uid-code-input-radius` | `--uid-radius-md` | Eckenradius der Zelle. |

Die Reihe ist in ihrem Container zentriert. Helles und dunkles Theme kommen aus den Theme-Tokens.

Typen: `UidCodeInputProps`.

## Texte

Beschriftungen stammen aus dem Locale-Bündel, Abschnitt `codeInput` (siehe [i18n](./i18n.md)): `label`, `cell(n, total)`.
