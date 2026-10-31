# 事件日历

`UidEventCalendar` 在 [`UidCalendar`](./calendar.md) 中显示以纯文本标记编写的事件 —— 提供日、周、月、年和日程（agenda）视图。重复事件只针对屏幕上显示的日期展开。与 [`UidKanban`](./kanban.md) 一样，标记是唯一的事实来源：每次编辑改写一行（当重复事件的某次发生被拆分出来时改写两行），并以 `change` 事件发出完整的新文本。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidEventCalendar } from '@dskripchenko/ui'

const source = ref(`# Releases and duty
tags: release=danger

2026-11-03 10:00-11:00 Release demo #release {where: Room 4}
2026-11-10..2026-11-14 Code freeze #release
every mon 11:00-11:30 Sprint planning {from: 2026-11-02, until: 2026-12-28, except: 2026-11-30}
every 2 weeks fri 16:00-17:00 Retro {from: 2026-11-06}
every month last fri Release to production #release
every year 12-31 New year freeze
`)
</script>

<template>
  <UidEventCalendar
    :source="source"
    view="month"
    editable
    @change="source = $event"
  />
</template>
```

## 标记

首先是可选的 `# Title` 和设置（`key: value`）：

- `view` —— 初始显示的视图：`day`、`week`、`month`、`year` 或 `agenda`；
- `date` —— 初始显示的日期（`YYYY-MM-DD`）；
- `tags` —— 每个标签的色调：`tag=tone`，以逗号分隔（`info`、`success`、`warning`、`danger`，或任意 CSS 颜色）。

然后每行一个事件：

- **时间**：日期 `2026-11-03` 或范围 `2026-11-10..2026-11-14`，之后是可选的时间 `10:00` 或 `10:00-11:00`（省略 —— 全天）。
- **内容**：标题、`#tags`（第一个标签决定颜色）、行尾的 `{properties}` —— `where`、`description`（Markdown，显示在详情中）或自定义属性。
- **重复**以 `every` 代替日期开头 —— 用文字表达的 RFC 5545 RRULE 子集：

  | 行 | 重复方式 |
  |---|---|
  | `every day`、`every 3 days` | 每天（每三天） |
  | `every mon,wed`、`every 2 weeks fri` | 在这些星期几，每周（隔周） |
  | `every month 15`、`every month last` | 在每月的这一天、每月最后一天 |
  | `every month 2nd tue`、`every month last fri` | 在每月第 n 个 / 最后一个星期几 |
  | `every year 12-31` | 每年的这一日期 |

  星期几写作 `mon` … `sun`、完整英文名称，或 `пн` … `вс`。边界和例外写在属性中：`from`（首个日期；`count` 和"每 N"形式需要它）、`until`、`count`、`except`（日期，以逗号分隔）。`{rrule: FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=2}` 按原样接受规则，适用于从 iCal 复制的规则（`FREQ`、`INTERVAL`、`BYDAY`、`BYMONTHDAY`、`BYMONTH`、`COUNT`、`UNTIL`）；写在它前面的日期成为 `from`。

`<!-- comments -->` 会被跳过并保留。不是事件的行会报告在 `parseEventCalendar(source).problems` 中，并列在 **Source**（源码）标签页下。

## 行为

点击事件会在抽屉中打开其详情，并发出 `open`。

启用 `editable`（且未 `locked`）时：可将事件拖到另一天或另一小时，在日视图和周视图中拉伸事件，点击空白时段（或月视图中的某一天，或 **+ Event**（新建事件））来创建新事件。**事件构建器**通过选项组合出一个事件 —— 日期或范围、全天或某个时间、重复方式（"每 2 周的周一和周三"、"每月最后一个周五"、直到某日期 / 共 N 次）、跳过的日期 —— 并显示它写入的那一行。编辑重复事件的某次发生时，会询问是只修改这一次还是整个系列：选择这一次时，它成为一个独立事件，而系列跳过该日期（拖动某次发生也是如此）；**Skip this date**（跳过此日期）只把该日期添加到 `except`。**Source** 标签页编辑标记，并按行显示问题。

`locked` 和 `lockable` 的作用与 [`UidKanban`](./kanban.md) 中相同：`locked` 为只读，无论 `editable` 如何设置；锁定按钮发出 `lock`。

## Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `source` | `string` | `''` | 标记。新值会替换事件，除非它正是组件刚刚发出的那个值。 |
| `editable` | `boolean` | `false` | 拖动、调整大小、事件构建器、源码标签页。 |
| `locked` | `boolean` | `false` | 只读，无论 `editable` 如何设置。 |
| `lockable` | `boolean` | `false` | 显示锁定按钮。 |
| `view` | `CalendarView \| ''` | `''` | 初始显示的视图；为空 —— 使用标记中的 `view:`，否则为 `month`。 |
| `date` | `string` | `''` | 初始显示的日期；为空 —— 使用标记中的 `date:`，否则为今天。 |
| `views` | `CalendarView[]` | 全部五种 | 可供选择的视图。 |

标记中的 `view:` 和 `date:` 在标记于首次渲染之后才到达时同样生效，除非 props 已设置它们或用户已经切换过位置。

## 事件

| 事件 | 负载 | |
|---|---|---|
| `change` | `string` | 编辑后完整的新标记。 |
| `lock` | `boolean` | 锁定按钮被按下：请求的 `locked` 状态。 |
| `open` | `{ id, date, title }` | 打开了一个事件（`EventCalendarOpen`）；`id` 是该行的事件，`date` 是那次发生的日期。 |
| `range` | `{ view, start, end }` | 屏幕上显示的日期发生了变化。 |

## 函数

纯函数，已导出，可在不使用组件的情况下调用。事件 id 按位置生成（`ev-0`、`ev-1`、…）；重复事件的某次发生为 `<id>@<date>`。

| 函数 | |
|---|---|
| `parseEventCalendar(source)` | → `EventCalendarDoc`：`title`、`settings`、`tagTones`、`items`、`problems`。 |
| `parseEventLine(line)` | 一行事件 → `EventCalendarItem`，或不是事件的原因（字符串）。 |
| `parseEventRRule(text)` | `FREQ=…;…` → `EventCalendarRule`，或 `null`。 |
| `expandEventCalendar(doc, start, end)` | 与 `start` … `end` 这些日期相交的所有事件和发生 → `EventCalendarOccurrence[]`。 |
| `eventOccurrences(rule, start, end)` | 规则在某个范围内产生的日期。 |
| `eventRuleText(rule)` | 将规则还原为文字（`every 2 weeks fri`）。 |
| `serializeCalendarEvent(fields)` | 将事件转换为其标记行。 |
| `addCalendarEvent(source, fields)` | 追加一个事件。 |
| `updateCalendarEvent(source, id, fields)` | 改写事件所在的行。 |
| `removeCalendarEvent(source, id)` | 移除事件所在的行。 |
| `detachCalendarOccurrence(source, id, date, fields)` | 系列跳过 `date`；在其下方添加一个单独事件（`fields`）。 |

```ts
import { parseEventCalendar, expandEventCalendar } from '@dskripchenko/ui'

const shown = expandEventCalendar(parseEventCalendar(source), '2026-11-01', '2026-11-30')
```

类型：`EventCalendarDoc`、`EventCalendarItem`、`EventCalendarRule`、`EventCalendarByDay`、`EventCalendarFreq`、`EventCalendarOccurrence`、`EventCalendarFields`、`EventCalendarProblem`、`EventCalendarOpen`、`UidEventCalendarProps`。

## 文本

界面文字来自语言包的 `eventCalendar` 部分（见 [i18n](./i18n.md)）；日历网格本身使用 `calendar` 和 `datePicker`。`problems` 中的问题消息为英文。
