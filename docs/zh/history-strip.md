# 历史条

`UidHistoryStrip` 用一排小格展示历史，最早的在左边：一个任务的最近几次运行、一个服务的检查、一个季度的每一天。每一格表示成功、部分失败、失败或未知；整条对屏幕阅读器来说是一张带说明的图像。

```vue
<script setup lang="ts">
import { UidHistoryStrip, type HistoryCell } from '@dskripchenko/ui'

const days: HistoryCell[] = [
  { key: '2026-11-13', tone: 'success', title: '11月13日：正常' },
  { key: '2026-11-14', tone: 'danger', title: '11月14日：中断 12 分钟' },
  { key: '2026-11-15', tone: 'none', title: '11月15日：无数据' },
]
</script>

<template>
  <UidHistoryStrip
    :cells="days"
    label="3 天，可用率 99.4%"
    fit="fill"
    :height="28"
  />
</template>
```

## Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `cells` | `HistoryCell[]` | — | 各格，最早的在前：`{ key, tone, title? }`，`tone` 为 `success`、`warning`、`danger` 或 `none`；`title` 在悬停时显示。 |
| `label` | `string` | — | 整条要表达的内容，供屏幕阅读器朗读。 |
| `fit` | `'fixed' \| 'fill'` | `'fixed'` | `fixed`：等宽的窄格，靠最新一端对齐，放不下的从最早一端截去。`fill`：各格平分整个宽度。 |
| `height` | `number` | `16` | 高度（像素）。 |

类型：`UidHistoryStripProps`、`HistoryCell`。
