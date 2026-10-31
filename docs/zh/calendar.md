# 日历组件（Calendar）

`UidCalendar` 是带有日、周、月、年和日程（agenda）视图的日历。它显示事件、选择日期（`v-model`），并在 `editable` 时允许拖动事件和调整其长度。与看板一样，它本身不修改事件：它发出 `event-move`，由宿主应用。[`UidEventCalendar`](./event-calendar.md) 是在它之上构建的标记驱动日历。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidCalendar, type CalendarEvent, type CalendarEventMove, type CalendarSlot, type CalendarView } from '@dskripchenko/ui'

const events = ref<CalendarEvent[]>([
  { id: 1, date: '2026-11-03', time: '10:00', endTime: '11:00', title: '发布演示' },
  { id: 2, date: '2026-11-10', endDate: '2026-11-14', title: '代码冻结' },
  { id: 3, date: '2026-11-20', title: '导入的节假日', editable: false },
])
const view = ref<CalendarView>('month')

function onMove(m: CalendarEventMove): void {
  events.value = events.value.map((e) => (e === m.event
    ? { ...e, date: m.date, endDate: m.endDate, time: m.time ?? e.time, endTime: m.endTime ?? e.endTime }
    : e))
}

function onSlot(s: CalendarSlot): void {
  // 为 s.date（和 s.time）打开“新建事件”表单
}
</script>

<template>
  <UidCalendar
    v-model:view="view"
    :views="['day', 'week', 'month', 'year', 'agenda']"
    :events="events"
    editable
    @event-move="onMove"
    @slot-click="onSlot"
  />
</template>
```

## 日历事件

| 字段 | 类型 | |
|---|---|---|
| `id` | `string \| number` | 可选标识（用作 key）。 |
| `date` | `string` | `YYYY-MM-DD`：第一天。 |
| `endDate` | `string` | 最后一天，**包含在内**：`date: '2026-11-10', endDate: '2026-11-14'` 覆盖五天。省略或等于 `date` —— 一天。 |
| `time`、`endTime` | `string` | `HH:MM`。没有 `time` 时为全天事件。 |
| `title` | `string` | 标题。 |
| `color` | `string` | 任意 CSS 颜色。 |
| `editable` | `boolean` | `false` —— 即使日历是 `editable`，该事件也不能拖动或调整长度（没有手柄）；点击仍可打开它。`true` 或省略 —— 跟随日历。 |

## 行为

开启 `editable` 时：

- 事件可拖到另一天（月视图、全天行），或另一天和另一时间（日视图和周视图网格）；
- 带时间的事件可在日视图和周视图网格中拖动其下边缘调整长度 —— 得到新的 `endTime`；
- 全天或多天事件可在月视图网格和全天行中拖动其末端的手柄（最后一天的右边缘）调整长度 —— 跨天拖动得到新的 `endDate`（包含在内），且不会早于 `date`。

每次完成的拖动只发出一次 `event-move`；按 Escape 取消。

`selectable`（默认等于 `editable`）使点击空白位置时发出 `slot-click`：日视图和周视图网格中的时间（向下取整到半小时），或全天行中的某一天。因此只读日历仅凭 `selectable` 也能提供“在此创建”。单元格光标跟随 `selectable`。

在月视图中点击某天会选中它：`update:modelValue`、`date-click`、`change`。在年视图中点击某天会先打开它 —— `update:anchor`，以及在 `views` 提供 `day` 时 `update:view` 切换到 `day` —— 然后以同样方式选中它，包括 `date-click`。由于视图先切换，读取当前视图（例如通过 `v-model:view`）的 `date-click` 监听器可以把这种跳转与月视图中的点击区分开。年视图中点击月份名称只会打开该月；周视图表头中点击某天只会打开该天。

## Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `events` | `CalendarEvent[]` | `[]` | 事件。 |
| `views` | `CalendarView[]` | `['month']` | 提供的视图；多于一个时显示切换器。 |
| `editable` | `boolean` | `false` | 拖动事件并调整其长度。 |
| `selectable` | `boolean` | `editable` | 点击空白位置时发出 `slot-click`。 |
| `min`、`max` | `string` | — | `YYYY-MM-DD`：范围外的日期不可选。 |
| `compact` | `boolean` | `false` | 更小的月视图网格。 |
| `maxEventsPerDay` | `number` | `3` | 月视图中每天显示的事件数；其余显示在“+N”下。 |
| `todayLabel` | `string` | 来自语言包 | “今天”按钮的文字。 |
| `hourHeight` | `number` | `48` | 日视图和周视图网格中每小时的像素数。 |
| `scrollToHour` | `number` | `8` | 日视图和周视图网格滚动到的小时。 |

`v-model` 是选中的日期，`v-model:view` 是视图，`v-model:anchor` 是构建视图所围绕的日期。

## 发出的事件

| 事件 | 载荷 | |
|---|---|---|
| `event-click` | `CalendarEvent` | 点击了某个事件。 |
| `event-move` | `CalendarEventMove` | `{ event, date, endDate?, time?, endTime? }`：原始事件及其去向。移动给出新的 `date`（多天事件另有 `endDate`，带时间的事件另有 `time`/`endTime`）；在时间网格中调整长度给出新的 `endTime`；在月视图网格或全天行中调整长度给出新的 `endDate`。 |
| `slot-click` | `CalendarSlot` | `{ date, time? }`：点击了空白位置（需 `selectable`）。 |
| `date-click` | `string` | 选中了某天。 |
| `change` | `string \| null` | 选中的日期。 |
| `range` | `CalendarRange` | `{ view, start, end }`：屏幕上的日期变化了 —— 为这些日期加载事件。 |

类型：`UidCalendarProps`、`CalendarEvent`、`CalendarEventMove`、`CalendarSlot`、`CalendarRange`、`CalendarView`。

## 文本

文案来自语言包的 `calendar` 和 `datePicker` 部分（见 [i18n](./i18n.md)）；`calendar.resize` 是调整长度手柄的提示。
