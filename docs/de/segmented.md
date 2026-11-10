# Segmentierte Auswahl

`UidSegmented` wählt eine von wenigen Optionen — eine Ansicht, eine Dauer — oder mehrere (`multiple`), z. B. Wochentage. `joined` zeichnet eine Leiste aus Schaltflächen; `chips` — einzelne Pillen; `shape="round"` — gleich große runde Schaltflächen. Eine Einfachauswahl ist eine Radiogruppe: Pfeile bewegen und wählen; eine Mehrfachauswahl — Umschalter (`aria-pressed`).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidSegmented } from '@dskripchenko/ui'

const view = ref('week')
const days = ref([1, 3])
</script>

<template>
  <UidSegmented v-model="view" label="View" :options="[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]" />
  <UidSegmented v-model="days" multiple variant="chips" shape="round" size="sm" label="Days"
    :options="[1, 2, 3, 4, 5].map((d) => ({ value: d, label: String(d) }))" />
</template>
```

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `options` | `SegmentedOption[]` | — | `{ value, label, ariaLabel?, disabled? }`. |
| `v-model` | `T | T[] | null` | `null` | Die Auswahl; ein Array mit `multiple`. |
| `label` | `string` | — | Der zugängliche Name der Gruppe. |
| `variant` | `'joined' | 'chips'` | `'joined'` | Eine Leiste oder einzelne Pillen. |
| `shape` | `'default' | 'round'` | `'default'` | Runde, gleich große Schaltflächen. |
| `size` | `'sm' | 'md'` | `'md'` | 28 oder 36 px hoch. |
| `multiple` | `boolean` | `false` | Mehrere wählbar. |
| `disabled` | `boolean` | `false` | Das ganze Element. |

Gibt `change` mit dem neuen Wert aus, ebenso `update:modelValue`. Typen: `UidSegmentedProps`, `SegmentedOption`.
