# Verlaufsleiste

`UidHistoryStrip` zeigt einen Verlauf als Reihe kleiner Zellen, die ältesten links: die letzten Läufe eines Jobs, die Prüfungen eines Dienstes, die Tage eines Quartals. Jede Zelle ist erfolgreich, teilweise fehlgeschlagen, fehlgeschlagen oder unbekannt; die ganze Leiste ist für Screenreader ein Bild mit Beschriftung.

```vue
<script setup lang="ts">
import { UidHistoryStrip, type HistoryCell } from '@dskripchenko/ui'

const days: HistoryCell[] = [
  { key: '2026-11-13', tone: 'success', title: '13. Nov.: erreichbar' },
  { key: '2026-11-14', tone: 'danger', title: '14. Nov.: 12 Min. ausgefallen' },
  { key: '2026-11-15', tone: 'none', title: '15. Nov.: keine Daten' },
]
</script>

<template>
  <UidHistoryStrip
    :cells="days"
    label="3 Tage, 99,4 % erreichbar"
    fit="fill"
    :height="28"
  />
</template>
```

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `cells` | `HistoryCell[]` | — | Zellen, die ältesten zuerst: `{ key, tone, title? }`, `tone` — `success`, `warning`, `danger` oder `none`; `title` erscheint beim Überfahren. |
| `label` | `string` | — | Was die Leiste als Ganzes aussagt; wird von Screenreadern gelesen. |
| `fit` | `'fixed' \| 'fill'` | `'fixed'` | `fixed` — schmale Zellen gleicher Breite am neuesten Ende; was nicht passt, wird am ältesten Ende abgeschnitten. `fill` — die Zellen teilen sich die ganze Breite. |
| `height` | `number` | `16` | Höhe in Pixeln. |

Typen: `UidHistoryStripProps`, `HistoryCell`.
