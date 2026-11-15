# Полоса истории

`UidHistoryStrip` показывает историю рядом мелких ячеек, старые слева: последние прогоны задания, проверки сервиса, дни квартала. Каждая ячейка — успех, частичный сбой, сбой или нет данных; вся полоса для экранных читалок — одно изображение с подписью.

```vue
<script setup lang="ts">
import { UidHistoryStrip, type HistoryCell } from '@dskripchenko/ui'

const days: HistoryCell[] = [
  { key: '2026-11-13', tone: 'success', title: '13 ноя: работал' },
  { key: '2026-11-14', tone: 'danger', title: '14 ноя: недоступен 12 мин' },
  { key: '2026-11-15', tone: 'none', title: '15 ноя: нет данных' },
]
</script>

<template>
  <UidHistoryStrip
    :cells="days"
    label="3 дня, доступность 99,4%"
    fit="fill"
    :height="28"
  />
</template>
```

## Props

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `cells` | `HistoryCell[]` | — | Ячейки, старые первыми: `{ key, tone, title? }`, `tone` — `success`, `warning`, `danger` или `none`; `title` видна при наведении. |
| `label` | `string` | — | Что говорит полоса целиком; её читают экранные читалки. |
| `fit` | `'fixed' \| 'fill'` | `'fixed'` | `fixed` — узкие ячейки одной ширины, прижаты к новому краю; не поместившиеся срезаются со старого. `fill` — ячейки делят всю ширину. |
| `height` | `number` | `16` | Высота в пикселях. |

Типы: `UidHistoryStripProps`, `HistoryCell`.
