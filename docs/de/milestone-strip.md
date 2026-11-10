# Meilensteinleiste

`UidMilestoneStrip` zeigt einige Meilensteine (drei bis fünf lesen sich am besten) auf einer Monatsskala: Monatsnamen oben, eine Zeile pro Meilenstein mit einer Raute an seinem Datum, Label und Untertitel daneben und optional eine senkrechte Linie für heute. Eine Roadmap auf einen Blick, kein Gantt-Diagramm: es gibt keine Dauern, nur Daten.

```vue
<script setup lang="ts">
import { UidMilestoneStrip, type Milestone } from '@dskripchenko/ui'

const items: Milestone[] = [
  { key: 'design', label: 'Design freigegeben', date: '2026-09-12', caption: 'Erledigt' },
  { key: 'beta', label: 'Öffentliche Beta', date: '2026-10-20', caption: 'Zwei Blocker offen', risk: true },
  { key: 'docs', label: 'Doku fertig', date: '2026-11-18', caption: 'Im Plan' },
  { key: 'release', label: 'Release 2.0', date: '2026-12-15', caption: 'Geplant', href: '/releases/2.0' },
]

function open(item: Milestone) {
  // Details des Meilensteins zeigen
}
</script>

<template>
  <UidMilestoneStrip
    :items="items"
    today="2026-11-10"
    today-label="Heute, 10. November"
    @select="open"
  />
</template>
```

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `items` | `Milestone[]` | — | `{ key, label, date, caption?, risk?, href? }`; `date` ist `YYYY-MM-DD`. |
| `start` | `string` | erster Tag des frühesten Monats | `YYYY-MM-DD`, der erste Tag der Skala. Der früheste Monat wird über die Meilensteine und `today` bestimmt. |
| `end` | `string` | letzter Tag des spätesten Monats | `YYYY-MM-DD`, der letzte Tag der Skala (inklusive). |
| `today` | `string` | — | `YYYY-MM-DD`: eine 2-px-Linie in der Danger-Farbe über alle Zeilen. |
| `todayLabel` | `string` | — | Eine Fußnote unter der Leiste mit einer kurzen Marke in derselben Farbe. Weglassen, um die Linie im eigenen Markup zu erklären. |
| `monthFormat` | `'short' \| 'long'` | `'short'` | Monatsnamen im Kopf, genau wie `Intl.DateTimeFormat` sie für die Locale liefert (`Okt.` / `Oktober`). |
| `ariaLabel` | `string` | aus der Locale (`Milestones`) | Der zugängliche Name der Liste. |

Event `select(item: Milestone)` — ein Meilenstein ohne `href` wurde aktiviert (Klick, Enter oder Leertaste). Ein Meilenstein mit `href` ist ein normaler Link `<a :href>` und sendet nichts. Slots gibt es keine.

## Layout

- Die Position eines Meilensteins ist der Beginn seines Tages auf der Skala: `(date − start) / (end − start + 1)`. Daten außerhalb der Skala werden an ihre Ränder gesetzt.
- Monatsnamen stehen am ersten Tag jedes Monats; ein angeschnittener erster Monat (eigener `start`) wird nur benannt, wenn er breit genug ist.
- Jede Zeile ist mindestens 44 px hoch mit einer dünnen Linie darunter. Die Raute ist ein um 45° gedrehtes 12-px-Quadrat mit 2-px-Rand in `--uid-accent` ohne Füllung; `risk` färbt den Rand `--uid-warning` und den Untertitel `--uid-color-warning-text`.
- Label (14 px, halbfett) und Untertitel (12 px, sekundär) stehen rechts von der Raute. Ab 70 % der Breite wandern sie nach links und werden rechtsbündig, damit sie nie über den Rand laufen. Lange Labels brechen um — bei 390 px meist zweizeilig.
- Wo die Heute-Linie den Text kreuzt, liegt unter dem Text `--uid-milestone-surface` (Standard `--uid-color-surface`): setze es auf den Hintergrund, auf dem die Leiste steht.

CSS-Variablen: `--uid-milestone-marker`, `--uid-milestone-risk`, `--uid-milestone-today`, `--uid-milestone-surface`, `--uid-milestone-row-h`. Es werden nur Theme-Tokens verwendet, helles und dunkles Theme funktionieren daher ohne Weiteres.

## Barrierefreiheit

- Die Meilensteine sind eine geordnete Liste (`<ol>`) mit dem Namen aus `ariaLabel`; Monatskopf und Heute-Linie sind dekorativ (`aria-hidden`).
- Jeder Meilenstein ist ein Link oder Button mit dem Namen „Label, Datum, Untertitel“ — das Datum ausgeschrieben für die Locale (`20. Oktober 2026`) — und bei `risk` zusätzlich `milestoneStrip.atRisk` der Locale.
- Meilensteine sind in der Tab-Reihenfolge und zeigen den Fokusring des Kits.

Locale-Schlüssel: `milestoneStrip.label`, `milestoneStrip.atRisk`. Typen: `UidMilestoneStripProps`, `UidMilestoneStripMonthFormat`, `Milestone`.
