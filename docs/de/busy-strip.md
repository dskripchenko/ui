# Belegungsleiste

`UidBusyStrip` zeigt, wann Personen an einem Tag belegt sind: eine Zeile pro Person auf einer Stundenskala, die gewählte Zeit als Rahmen über allen Zeilen. Für die Planung eines Termins: Abschnitte anderer tragen keine Titel, eigene dürfen.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { UidBusyStrip, firstFree, type BusyRow } from '@dskripchenko/ui'

const rows: BusyRow[] = [
  { id: 1, label: 'Anna Lee', segments: [{ start: 12 * 60, end: 13 * 60, kind: 'own', label: 'Lunch' }] },
  { id: 2, label: 'Tom Hart', segments: [{ start: 15 * 60 + 30, end: 16 * 60, kind: 'busy' }] },
  { id: 3, label: 'Mia Chen', segments: [{ start: 0, end: 24 * 60, kind: 'away' }] },
]
const start = ref(15 * 60)
const selection = computed(() => ({ start: start.value, end: start.value + 60 }))
const free = computed(() => firstFree(rows.slice(0, 2), { from: 9 * 60, to: 19 * 60, duration: 60 }))
</script>

<template>
  <UidBusyStrip
    :rows="rows"
    :from="9"
    :to="19"
    :selection="selection"
    :pick-step="30"
    @pick="start = $event"
  />
</template>
```

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `rows` | `BusyRow[]` | — | Zeilen: `{ id, label, segments }`; ein Abschnitt ist `{ start, end, kind, label? }` in Minuten ab Mitternacht, `kind` — `busy`, `away` (schraffiert) oder `own` (mit `label`). |
| `from, to` | `number` | `9, 19` | Die Stunden der Skala; Abschnitte werden darauf zugeschnitten. |
| `labelEvery` | `number` | `2` | Alle wie viele Stunden die Skala beschriftet ist. |
| `selection` | `BusySelection | null` | `null` | `{ start, end }` in Minuten: ein 2-px-Rahmen über allen Zeilen. |
| `labelWidth` | `string` | `112px` | Die Breite der Zeilenbeschriftungen. |
| `pickStep` | `number` | `0` | Ein Klick auf eine Spur gibt `pick` mit der Minute aus, abgerundet auf diesen Schritt; `0` — keine Auswahl. |

Der Slot `label` (`{ row }`) ersetzt die Beschriftung einer Zeile — Avatar und Name. Jede Spur hat einen zugänglichen Namen mit ihren Abschnitten.

## Hilfsfunktion

`firstFree(rows, { from, to, duration, step = 15, after? })` liefert den ersten Beginn im Schrittraster, an dem alle Zeilen `duration` Minuten frei sind, oder `null`. Abwesenheiten und eigene Abschnitte zählen als belegt.

Typen: `UidBusyStripProps`, `BusyRow`, `BusySegment`, `BusySelection`, `FirstFreeOptions`.
