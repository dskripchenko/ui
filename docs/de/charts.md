# Diagramme

Das Kit bringt eigene SVG-Diagramme und keine Chart-Bibliothek mit:

1. **`UidChart`** — das eingebaute allgemeine Diagramm: Linien, Flächen, Balken (gruppiert oder gestapelt) und Punkte über einer gemeinsamen Kategorienachse, mit Referenzlinien, Tooltip, Tastaturnavigation und einer versteckten Datentabelle. Reines SVG, ohne Abhängigkeiten.
2. **SVG-Primitive** — `UidSparkline`, `UidProgressRing`, `UidGauge`, `UidHeatmap`, `UidHeatmapMatrix`. Ohne Abhängigkeiten, ~1 KB pro Stück, decken die meisten Dashboard-Kacheln ab.
3. **Was `UidChart` nicht zeichnet** (Kreis, Radar, Karten, Zehntausende Punkte, Zoom) — paaren mit der Chart-Bibliothek deiner Wahl.

## Eingebaute Primitive

| Komponente | Zweck | Beispiel |
|---|---|---|
| **`UidSparkline`** | Mini-Trenddiagramm (line/bar/area) | KPI-Karten, inline im Text |
| **`UidProgressRing`** | Kreisfortschritt mit Label | % Fertigstellung, Bewertung |
| **`UidGauge`** | Halbkreis-Skala mit Bereichen | Tachometer, CPU/Disk-Auslastung |
| **`UidHeatmap`** | Kalender-Heatmap (GitHub-Stil) | Aktivität pro Tag, Beiträge |
| **`UidHeatmapMatrix`** | Matrix-Heatmap: Zeilen × Spalten mit Achsenbeschriftung | Bestellungen nach Wochentag × Monat, Last nach Stunde |
| **`UidChart`** | Linien-, Flächen-, Balken-, Stapel- und Punktdiagramme über Kategorien | Burndown, Velocity, Trends, Verteilungen über die Zeit |

Alle Primitive:
- Reines SVG, kein `canvas`, keine Runtime-Bibs
- Akzeptieren `color` (CSS-Variable oder Hex)
- Haben passende `aria-*`-Attribute für Screenreader
- Tönungen via `tone` (`primary`/`success`/`warning`/`danger`/`info`)

## Matrix-Heatmap

`UidHeatmapMatrix` zeichnet genau die übergebene Matrix — von Datumswerten weiß sie nichts (das ist Aufgabe von `UidHeatmap`).

```vue
<UidHeatmapMatrix
  :rows="['Mon', 'Tue', 'Wed']"
  :cols="['May', 'Jun', 'Jul']"
  :values="[[4, 8, 15], [16, 23, null], [42, 7, 9]]"
  color-scale="viridis"
  :format-value="(v) => `${v} orders`"
/>
```

| Prop | Typ | Standard | |
|---|---|---|---|
| `rows`, `cols` | `string[]` | — | Achsenbeschriftungen. Jede Spalte wird beschriftet; passen die Beschriftungen nicht, werden sie um 45° gedreht und ausgedünnt (`colLabels`: `auto` / `horizontal` / `rotated`). |
| `values` | `(number \| null)[][]` | — | `values[row][col]`. `null` (oder eine fehlende Zelle) wird als leere umrandete Zelle gezeichnet — „keine Daten“, anders als `0`. |
| `colorScale` | Name \| CSS-Farbe \| `string[]` | `'default'` | Benannte Skalen: `default` (Akzentfarbe, folgt dem Theme), `viridis`, `magma`, `plasma`, `inferno`, `blues`, `greens`, `reds`. Eine CSS-Farbe steigt von ihrer Tönung an; eine Liste sind eigene Stützfarben, niedrig → hoch. |
| `min`, `max` | `number` | Min/Max der Daten | Die Farbdomäne. |
| `formatValue` | `(v: number) => string` | `Intl.NumberFormat` der Locale | Für Tooltip, aria-Beschriftungen und Legende. |
| `cellHeight`, `minCellWidth`, `gap` | `number` | `20`, `10`, `2` | Zellen strecken sich auf die Containerbreite; unter `minCellWidth` scrollt das Raster horizontal. |
| `showLegend` | `boolean` | `true` | Der Verlauf Min → Max und ein „keine Daten“-Schlüssel, wenn es `null` gibt. |
| `ariaLabel` | `string` | Zusammenfassung der Locale | |

Der Slot `#tooltip="{ cell, formatted }"` ersetzt den Tooltip-Inhalt. Das Raster hat `role="grid"`-Semantik: Zeilen- und Spaltenköpfe, ein `aria-label` „Zeile × Spalte: Wert“ an jeder Zelle und Pfeiltasten-Navigation (Home/End, Strg+Home/End, PageUp/PageDown). Exportierte Helfer: `heatmapColorScales`, `resolveHeatmapStops`, `heatmapColorAt`.

## UidChart

Eine Komponente für Kategoriediagramme: Jede Serie hat einen Wert pro Kategorie, und der Serientyp bestimmt die Markierung. Typen lassen sich frei mischen — Balken nutzen das Kategorieband, Linien und Punkte die Bandmitte.

```vue
<script setup lang="ts">
import { UidChart, type ChartSeries, type ChartReference } from '@dskripchenko/ui'

const days = ['Mo 3', 'Di 4', 'Mi 5', 'Do 6', 'Fr 7', 'Mo 10', 'Di 11', 'Mi 12']
const series: ChartSeries[] = [
  { key: 'remaining', label: 'Verbleibend', data: [40, 38, 35, 41, 36, 30, null, null] },
  { key: 'ideal', label: 'Ideal', tone: 'neutral', dashed: true, data: [40, 34.3, 28.6, 22.9, 17.1, 11.4, 5.7, 0] },
  { key: 'added', label: 'Umfang ergänzt', type: 'dots', tone: 'warning', data: [null, null, null, 41, null, null, null, null] },
]
const references: ChartReference[] = [{ axis: 'x', value: 5, label: 'Heute', dashed: true }]
</script>

<template>
  <!-- Ein Burndown: verbleibende Arbeit, Ideallinie, Umfangserweiterungen und heute. -->
  <UidChart
    :categories="days"
    :series="series"
    :references="references"
    :format-value="(v) => `${Math.round(v)} SP`"
    aria-label="Burndown"
  />
</template>
```

Gruppierte Balken — Balkenserien ohne `stack` stehen innerhalb einer Kategorie nebeneinander:

```vue
<UidChart
  :categories="['Q1', 'Q2', 'Q3', 'Q4']"
  :series="[
    { key: 'plan', label: 'Geplant', type: 'bar', tone: 'neutral', data: [34, 36, 30, 40] },
    { key: 'done', label: 'Erledigt', type: 'bar', tone: 'accent', data: [30, 37, 28, null] },
  ]"
/>
```

Gestapelte Balken — Serien mit derselben `stack`-ID stapeln sich (Flächen stapeln sich genauso):

```vue
<UidChart
  :categories="['Jan', 'Feb', 'Mär']"
  :series="[
    { key: 'bugs', label: 'Bugs', type: 'bar', stack: 'kind', data: [12, 9, 14] },
    { key: 'features', label: 'Features', type: 'bar', stack: 'kind', data: [20, 24, 18] },
  ]"
  legend="top"
/>
```

### Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `categories` | `string[]` | — | Die x-Achse, gleichmäßig verteilt. |
| `series` | `ChartSeries[]` | — | Siehe unten. |
| `references` | `ChartReference[]` | `[]` | Vertikale und horizontale Referenzlinien. y-Referenzen fließen in den automatischen y-Bereich ein. |
| `height` | `number` | `240` | Höhe in px. Die Breite folgt dem Container (`ResizeObserver`); 600 px, wenn sie nicht messbar ist. |
| `yMin` | `number` | `min(0, Datenminimum)` | |
| `yMax` | `number` | ein „runder“ Datenmaximalwert | Stapel werden summiert. |
| `yTicks` | `number` | `4` | Ungefähre Anzahl der Intervalle; Teilstriche sind „runde“ Zahlen (1, 2, 2,5, 5 × 10ⁿ). |
| `formatValue` | `(v: number) => string` | `Intl.NumberFormat` der Locale | y-Teilstriche, Tooltip und Datentabelle. |
| `formatCategory` | `(category: string, index: number) => string` | die Kategorie | x-Beschriftungen, Tooltip-Titel und Datentabelle. |
| `legend` | `boolean \| 'top' \| 'bottom'` | `'bottom'` bei 2+ Legendenserien, sonst ausgeblendet | `true` bedeutet `'bottom'`. |
| `grid` | `boolean` | `true` | Horizontale Gitterlinien. |
| `tooltip` | `boolean` | `true` | |
| `xLabels` | `'auto' \| 'all' \| 'none'` | `'auto'` | `auto` dünnt die Beschriftungen aus, damit sie sich nie überlappen. |
| `ariaLabel` | `string` | Zusammenfassung aus der Locale („Chart: 2 series, 10 points“) | |

Ereignis `hover(index: number | null)` — die aktive Kategorie wechselt (Zeiger oder Tastatur). Der Slot `#tooltip="{ index, category, items }"` ersetzt den Tooltip-Inhalt; jedes Element ist `{ series, value, formatted, color }`.

### Serien und Referenzlinien

```ts
interface ChartSeries {
  key: string
  label: string
  type?: 'line' | 'area' | 'bar' | 'dots'   // Standard 'line'
  data: (number | null)[]                   // ein Wert pro Kategorie; null = kein Wert
  color?: string                            // beliebige CSS-Farbe; hat Vorrang vor tone und Palette
  tone?: 'accent' | 'info' | 'warning' | 'danger' | 'success' | 'neutral'
  dashed?: boolean                          // line / area: gestrichelt (Pläne, Ideallinien)
  stack?: string                            // bar- / area-Serien mit derselben ID stapeln sich
  legend?: boolean                          // Standard true
}

interface ChartReference {
  axis: 'x' | 'y'
  value: number      // y: ein Wert; x: ein Kategorieindex, Brüche erlaubt (3.5 = zwischen 3 und 4)
  label?: string     // x: oben; y: am rechten Ende
  tone?: ChartTone
  color?: string
  dashed?: boolean
}
```

`null` bedeutet „kein Wert“: eine Lücke in Linie oder Fläche, kein Balken, kein Punkt; Tooltip und Tabelle zeigen „—“. Ein einzelner Wert zwischen Lücken wird als kleiner Punkt gezeichnet.

### Farben

Serien ohne `color` oder `tone` belegen Palettenplätze in der Reihenfolge des `series`-Arrays: `--uid-chart-1` … `--uid-chart-6`. Der Platz gehört zur Position der Serie, daher färbt das Ausblenden einer anderen Serie sie nie um. Mehr als sechs solcher Serien wiederholen die Palette — fasse den Rest besser zu „Sonstige“ zusammen. Töne kommen aus dem Theme: `accent`, `info`, `warning`, `danger`, `success` entsprechen `--uid-accent`, `--uid-info`, …, und `neutral` entspricht `--uid-chart-neutral` (Pläne, Basislinien). Die Palette hat eigene Werte für hell und dunkel (`:root[data-theme='dark']`) und lässt sich wie jedes Token überschreiben. `--uid-chart-surface` (Standard `--uid-color-surface`) ist die Farbe der Lücken zwischen gestapelten Balken und des Rings um Punkte: setze sie auf den Hintergrund, auf dem das Diagramm steht.

Markierungen: 2-px-Linien mit runden Verbindungen, Striche `4 4`, Flächen mit 15 % Deckkraft (gestapelte Flächen — Bänder mit 70 % und 1 px Oberkante), 8-px-Punkte mit 2-px-Ring, Balken mit 4 px gerundetem Datenende und 2-px-Lücken. Text nutzt immer die Textfarben, nie eine Serienfarbe.

### Barrierefreiheit

- Die Wurzel ist `role="figure"` mit dem `ariaLabel` (oder der Zusammenfassung aus der Locale); das SVG ist `aria-hidden`.
- Eine visuell versteckte `<table>` enthält die Daten: Kategorien als Zeilen, Serien als Spalten, formatierte Werte.
- Der Plot ist fokussierbar: ←/→ bewegen die aktive Kategorie, Home/End springen an die Enden, Esc blendet den Tooltip aus. Die aktiven Werte werden zusätzlich über eine höfliche Live-Region angesagt.
- Die Legende ist Text mit einem Farbschlüssel, dessen Form der Markierung folgt (Linie, gestrichelte Linie, Punkt, Quadrat) — die Zuordnung hängt nie allein an der Farbe.

Der reine Helfer `niceTicks(min, max, count)` → `{ min, max, ticks }` wird für eigene Achsen exportiert.

## Kreis, Radar, Karten und große Datenmengen

Für das, was `UidChart` nicht zeichnet — Kreis- und Ringdiagramme, Radar, Karten, Zoom und Brushing, Zehntausende Punkte oder Echtzeit-Streams — paaren mit einer dedizierten Bibliothek. Wir bündeln keine, um das Gewicht für Projekte gering zu halten, die sie nicht brauchen.

### Mit Chart.js

```bash
pnpm add chart.js vue-chartjs
```

```vue
<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
import { UidCard } from '@dskripchenko/ui'

Chart.register(...registerables)

const data = {
  labels: ['Jan', 'Feb', 'Mär', 'Apr'],
  datasets: [{
    label: 'Umsatz',
    data: [120, 190, 180, 240],
    borderColor: 'var(--uid-color-primary)',
    tension: 0.3,
  }],
}
</script>

<template>
  <UidCard>
    <Line :data="data" :options="{ responsive: true, maintainAspectRatio: false }" />
  </UidCard>
</template>
```

### Mit ECharts

```bash
pnpm add echarts vue-echarts
```

```vue
<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const option = {
  xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mär', 'Apr'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [120, 190, 180, 240], smooth: true }],
}
</script>

<template>
  <UidCard>
    <VChart :option="option" style="height: 320px" />
  </UidCard>
</template>
```

### Dark-Theme

Chart-Bibliotheken kennen unser `data-theme` nicht. Abonniere Theme-Wechsel und baue Optionen neu auf:

```ts
import { useTheme } from '@dskripchenko/ui'

const theme = useTheme()
const chartColors = computed(() => ({
  text: theme.value === 'dark' ? '#e5e7eb' : '#1f2937',
  grid: theme.value === 'dark' ? '#374151' : '#e5e7eb',
}))
```

## Wann was

- **KPI-Delta/Trend in einer Karte** → eingebauter `UidSparkline`
- **% Fertigstellung, Bewertung, KPI-Ring** → `UidProgressRing`
- **Tachometer, schwellenwertbasierte Last** → `UidGauge` mit `ranges`
- **Aktivität über Zeit (Jahr/Monate)** → `UidHeatmap`
- **Eine Matrix Zeilen × Spalten (Wochentag × Stunde, Region × Quartal)** → `UidHeatmapMatrix`
- **Trends, Plan vs. Ist, Burndown, gestapelte Verteilungen über Kategorien** → `UidChart`
- **Kreis, Radar, Karten, Zoom, riesige Serien** → externe Bibliothek
- **Echtzeit-Stream (WebSocket)** → ECharts (beste Performance)
- **Einfacher statischer Bericht** → Chart.js (leichter, einfachere API)
