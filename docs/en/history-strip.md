# History strip

`UidHistoryStrip` shows a history as a row of small cells, the oldest on the left: the last runs of a job, the checks of a service, the days of a quarter. Each cell is passed, partly failed, failed or unknown; the strip as a whole is one image with a label for screen readers.

```vue
<script setup lang="ts">
import { UidHistoryStrip, type HistoryCell } from '@dskripchenko/ui'

const days: HistoryCell[] = [
  { key: '2026-11-13', tone: 'success', title: 'Nov 13: up' },
  { key: '2026-11-14', tone: 'danger', title: 'Nov 14: down 12 min' },
  { key: '2026-11-15', tone: 'none', title: 'Nov 15: no data' },
]
</script>

<template>
  <UidHistoryStrip
    :cells="days"
    label="3 days, 99.4% up"
    fit="fill"
    :height="28"
  />
</template>
```

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `cells` | `HistoryCell[]` | — | Cells, the oldest first: `{ key, tone, title? }`, `tone` — `success`, `warning`, `danger` or `none`; `title` is shown on hover. |
| `label` | `string` | — | What the strip says as a whole, read by screen readers. |
| `fit` | `'fixed' \| 'fill'` | `'fixed'` | `fixed` — narrow cells of one width, aligned to the newest end; cells that do not fit are cut from the oldest. `fill` — the cells share the whole width. |
| `height` | `number` | `16` | Height in pixels. |

Types: `UidHistoryStripProps`, `HistoryCell`.
