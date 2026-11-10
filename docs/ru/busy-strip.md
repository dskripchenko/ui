# Полоса занятости

`UidBusyStrip` показывает, когда люди заняты в течение дня: строка на человека на шкале часов, выбранное время — рамкой поверх всех строк. Для планирования встречи: у чужих интервалов нет названий, у своих — могут быть.

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

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `rows` | `BusyRow[]` | — | Строки: `{ id, label, segments }`; интервал — `{ start, end, kind, label? }` в минутах от полуночи, `kind` — `busy`, `away` (штриховка) или `own` (со своим `label`). |
| `from, to` | `number` | `9, 19` | Часы шкалы; интервалы обрезаются по ней. |
| `labelEvery` | `number` | `2` | Через сколько часов подписана шкала. |
| `selection` | `BusySelection | null` | `null` | `{ start, end }` в минутах: рамка 2 px поверх всех строк. |
| `labelWidth` | `string` | `112px` | Ширина подписей строк. |
| `pickStep` | `number` | `0` | Клик по дорожке отдаёт `pick` с минутой, округлённой вниз до этого шага; `0` — без выбора. |

Слот `label` (`{ row }`) заменяет подпись строки — аватар и имя. У каждой дорожки есть имя для чтения с экрана со списком интервалов.

## Помощник

`firstFree(rows, { from, to, duration, step = 15, after? })` даёт первое начало на сетке шага, когда все строки свободны `duration` минут, или `null`. Отсутствие и свои интервалы считаются занятыми.

Типы: `UidBusyStripProps`, `BusyRow`, `BusySegment`, `BusySelection`, `FirstFreeOptions`.
