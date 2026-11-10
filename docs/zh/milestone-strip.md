# 里程碑条

`UidMilestoneStrip` 在月份刻度上展示少量里程碑(三到五个最易读)：顶部是月份名称，每个里程碑一行，在其日期处画一个菱形，旁边是标题和说明，可选一条表示今天的竖线。它是一目了然的路线图，而不是甘特图：没有时长，只有日期。

```vue
<script setup lang="ts">
import { UidMilestoneStrip, type Milestone } from '@dskripchenko/ui'

const items: Milestone[] = [
  { key: 'design', label: '设计已批准', date: '2026-09-12', caption: '已完成' },
  { key: 'beta', label: '公开测试版', date: '2026-10-20', caption: '两个阻塞问题', risk: true },
  { key: 'docs', label: '文档完成', date: '2026-11-18', caption: '按计划' },
  { key: 'release', label: '发布 2.0', date: '2026-12-15', caption: '已计划', href: '/releases/2.0' },
]

function open(item: Milestone) {
  // 显示里程碑详情
}
</script>

<template>
  <UidMilestoneStrip
    :items="items"
    today="2026-11-10"
    today-label="今天，11 月 10 日"
    @select="open"
  />
</template>
```

## Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `items` | `Milestone[]` | — | `{ key, label, date, caption?, risk?, href? }`；`date` 为 `YYYY-MM-DD`。 |
| `start` | `string` | 最早月份的第一天 | `YYYY-MM-DD`，刻度的第一天。最早月份按里程碑和 `today` 计算。 |
| `end` | `string` | 最晚月份的最后一天 | `YYYY-MM-DD`，刻度的最后一天(含)。 |
| `today` | `string` | — | `YYYY-MM-DD`：一条贯穿所有行的 2 px danger 颜色竖线。 |
| `todayLabel` | `string` | — | 条下方的脚注，带一个同色短标记。若要用自己的标记说明这条线，请省略。 |
| `monthFormat` | `'short' \| 'long'` | `'short'` | 表头中的月份名称，完全按 `Intl.DateTimeFormat` 对该 locale 的输出(`10月` / `十月`)。 |
| `ariaLabel` | `string` | 取自 locale(`Milestones`) | 列表的无障碍名称。 |

事件 `select(item: Milestone)` — 没有 `href` 的里程碑被激活(点击、Enter 或空格)。带 `href` 的里程碑是普通链接 `<a :href>`，不触发事件。没有插槽。

## 布局

- 里程碑的位置是其日期在刻度上的起点：`(date − start) / (end − start + 1)`。刻度之外的日期固定在边缘。
- 月份名称位于每月第一天；不完整的首月(自定义 `start`)只有足够宽时才显示名称。
- 每行至少 44 px 高，下方有一条细线。菱形是旋转 45° 的 12 px 方块，2 px `--uid-accent` 边框、无填充；`risk` 时边框变为 `--uid-warning`，说明文字变为 `--uid-color-warning-text`。
- 标题(14 px 半粗)和说明(12 px 次要色)位于菱形右侧。从宽度的 70 % 开始，它们移到菱形左侧并右对齐，因此不会超出边缘。长标题会换行 — 在 390 px 下通常为两行。
- 今天竖线穿过文字的地方，文字下方垫着 `--uid-milestone-surface`(默认 `--uid-color-surface`)：请设为条所在的背景色。

CSS 变量：`--uid-milestone-marker`、`--uid-milestone-risk`、`--uid-milestone-today`、`--uid-milestone-surface`、`--uid-milestone-row-h`。只使用主题 token，因此浅色和深色主题可直接使用。

## 无障碍

- 里程碑是一个有序列表(`<ol>`)，名称来自 `ariaLabel`；月份表头和今天竖线是装饰性的(`aria-hidden`)。
- 每个里程碑是链接或按钮，名称为"标题, 日期, 说明" — 日期按 locale 完整写出 — `risk` 时还会附上 locale 的 `milestoneStrip.atRisk`。
- 里程碑在 Tab 顺序中，并显示套件的焦点环。

Locale 键：`milestoneStrip.label`、`milestoneStrip.atRisk`。类型：`UidMilestoneStripProps`、`UidMilestoneStripMonthFormat`、`Milestone`。
