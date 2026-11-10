# Busy strip

`UidBusyStrip` shows when people are taken during a day: a row per person on an hour scale, the chosen time as a frame over every row. It is for planning a meeting: stretches of others carry no titles; one's own may.

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

| Prop | Type | Default | |
|---|---|---|---|
| `rows` | `BusyRow[]` | — | Rows: `{ id, label, segments }`; a segment is `{ start, end, kind, label? }` in minutes from midnight, `kind` — `busy`, `away` (hatched) or `own` (with its `label`). |
| `from, to` | `number` | `9, 19` | The hours of the scale; stretches are cut to it. |
| `labelEvery` | `number` | `2` | Every how many hours the scale is labelled. |
| `selection` | `BusySelection | null` | `null` | `{ start, end }`, minutes: drawn as a 2 px frame over all rows. |
| `labelWidth` | `string` | `112px` | The width of the row labels. |
| `pickStep` | `number` | `0` | A click on a track emits `pick` with the minute, rounded down to this step; `0` — no picking. |

Slot `label` (`{ row }`) replaces a row's label — an avatar and a name. Each track has an accessible name listing its stretches.

## Helper

`firstFree(rows, { from, to, duration, step = 15, after? })` gives the first start on the step grid when every row is free for `duration` minutes, or `null`. Away and own stretches count as taken.

Types: `UidBusyStripProps`, `BusyRow`, `BusySegment`, `BusySelection`, `FirstFreeOptions`.
