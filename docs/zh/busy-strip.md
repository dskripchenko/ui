# 忙闲条

`UidBusyStrip` 显示人员在一天中的忙碌时段：每人一行，排在小时刻度上；选定时间以边框覆盖所有行。用于安排会议：他人的时段不显示标题，自己的可以显示。

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

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `rows` | `BusyRow[]` | — | 行：`{ id, label, segments }`；时段为 `{ start, end, kind, label? }`，单位为从午夜起的分钟，`kind` 为 `busy`、`away`（斜线）或 `own`（带 `label`）。 |
| `from, to` | `number` | `9, 19` | 刻度的小时范围；时段按此截断。 |
| `labelEvery` | `number` | `2` | 刻度每隔几小时标注一次。 |
| `selection` | `BusySelection | null` | `null` | `{ start, end }`（分钟）：覆盖所有行的 2 px 边框。 |
| `labelWidth` | `string` | `112px` | 行标签的宽度。 |
| `pickStep` | `number` | `0` | 点击轨道发出 `pick`，分钟值向下取整到该步长；`0` —— 不可点选。 |

插槽 `label`（`{ row }`）替换行标签——头像和姓名。每条轨道都有列出其时段的无障碍名称。

## 辅助函数

`firstFree(rows, { from, to, duration, step = 15, after? })` 返回步长网格上所有行都空闲 `duration` 分钟的第一个开始时间，否则为 `null`。缺勤和自己的时段视为占用。

类型：`UidBusyStripProps`、`BusyRow`、`BusySegment`、`BusySelection`、`FirstFreeOptions`。
