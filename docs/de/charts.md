# Diagramme

Das Kit liefert bewusst keine vollständige Chart-Engine. Stattdessen:

1. **SVG-Primitive** — `UidSparkline`, `UidProgressRing`, `UidGauge`, `UidHeatmap`. Ohne Abhängigkeiten, ~1 KB pro Stück, decken die meisten Dashboard-Szenarien ab.
2. **Vollständige Diagramme (Line/Bar/Pie/Area)** — empfohlenes Muster: paaren mit der Chart-Bibliothek deiner Wahl.

## Eingebaute Primitive

| Komponente | Zweck | Beispiel |
|---|---|---|
| **`UidSparkline`** | Mini-Trenddiagramm (line/bar/area) | KPI-Karten, inline im Text |
| **`UidProgressRing`** | Kreisfortschritt mit Label | % Fertigstellung, Bewertung |
| **`UidGauge`** | Halbkreis-Skala mit Bereichen | Tachometer, CPU/Disk-Auslastung |
| **`UidHeatmap`** | Kalender-Heatmap (GitHub-Stil) | Aktivität pro Tag, Beiträge |

Alle Primitive:
- Reines SVG, kein `canvas`, keine Runtime-Bibs
- Akzeptieren `color` (CSS-Variable oder Hex)
- Haben passende `aria-*`-Attribute für Screenreader
- Tönungen via `tone` (`primary`/`success`/`warning`/`danger`/`info`)

## Vollständige Diagramme

Für Line/Bar/Pie/Area-Diagramme: paaren mit einer dedizierten Bibliothek. Wir bündeln keine, um das Gewicht für Projekte gering zu halten, die sie nicht brauchen.

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
- **Multi-Serien, Achsen, Legenden, Zoom** → externe Bibliothek
- **Echtzeit-Stream (WebSocket)** → ECharts (beste Performance)
- **Einfacher statischer Bericht** → Chart.js (leichter, einfachere API)
