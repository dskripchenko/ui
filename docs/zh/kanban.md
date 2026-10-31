# 看板

`UidKanban` 是一个用纯文本标记编写、由 `UidBoard` 绘制的看板。标记是唯一的事实来源：组件读取它，每次编辑（移动、新增或修改卡片）只改写涉及的行，并以 `change` 事件发出完整的新文本。注释、空行和其余文本保持原样，因此标记可以保存在文件、数据库字段或页面中。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidKanban } from '@dskripchenko/ui'

const source = ref(`# Release 3.0
lanes: Payments, Refunds
tags: payments=info, refunds=warning

## Backlog
- Instant payments #payments {lane: Payments, who: Anna, due: 2026-11-15}
- Partial refunds over the API #refunds !high {lane: Refunds}
  Merchants ask to refund part of an amount without a call.

## In progress {wip: 3}
- [ACME-398](https://example.com/ACME-398) Antifraud v2 {who: Oleg}

## Done {done}
- Signed webhooks #payments
`)
const locked = ref(false)
</script>

<template>
  <UidKanban
    :source="source"
    editable
    lockable
    :locked="locked"
    @change="source = $event"
    @lock="locked = $event"
  />
</template>
```

## 标记

标记读起来就像 Markdown：

- `# …` —— 看板标题。
- 第一列之前的 `key: value` 行 —— 设置：
  - `lanes` —— 泳道，以逗号分隔，按顺序排列；
  - `tags` —— 每个标签的色调：`tag=tone`，以逗号分隔；色调为 `info`、`success`、`warning`、`danger`。未指定色调的标签会根据名称获得一个固定的色调。
- `## Column {wip: 3, done}` —— 一列。`wip` 是在制品（work-in-progress）上限（超过时计数器变红）；`done` 标记已完成卡片所在的列（卡片显示删除线，永不逾期）。
- `- Card title #tag !high {lane: …, who: …, due: YYYY-MM-DD, any: value}` —— 一张卡片（`*` 与 `-` 同样可用）：
  - 标题支持行内 Markdown：链接、`code`、**粗体**、*斜体*；
  - `#tag` —— 标签（字母、数字、`_`、`-`）；
  - `!high` / `!low` —— 优先级；
  - 行尾花括号中的属性：`lane`（所属泳道；省略时为第一个泳道）、`who`（负责人）、`due`（截止日期），以及任意自定义属性。不含冒号的部分是标志（`{blocked}`）；看起来不像名称的部分会接续上一个值（`{links: a, b}`）。
- 在卡片下方缩进的行（两个空格或一个制表符）—— 卡片的描述，使用 Markdown。
- `<!-- comments -->`（单行或多行）会被跳过并保留。

不属于以上任何一种的行会报告在 `parseKanban(source).problems` 中，并列在 **Source**（源码）标签页下。

## 行为

点击卡片（或在聚焦的卡片上按 Enter）会在抽屉中打开其详情，并发出 `open`。看板上方有按标签和按人员的筛选器。

启用 `editable`（且未 `locked`）时：

- 卡片可以在列和泳道之间拖动（Alt+←/→ 移动聚焦的卡片）；
- 列标题中的 `+` 打开新卡片表单；
- 抽屉可编辑卡片（标题、列、泳道、标签、优先级、截止日期、负责人、描述、以 `key: value` 行表示的其他属性）或删除卡片；
- **Source** 标签页直接编辑标记本身，并按行显示问题；输入在停顿 300 ms 后以 `change` 发出。

`locked` 使看板变为只读，无论 `editable` 如何设置。`lockable` 显示锁定按钮，按下时以新状态发出 `lock`：宿主保存该状态并作为 `locked` 传回，就像它在 `change` 时保存源文本一样。

## Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `source` | `string` | `''` | 标记。新值会替换看板，除非它正是组件刚刚发出的那个值。 |
| `editable` | `boolean` | `false` | 移动、新增和修改卡片、源码标签页。 |
| `locked` | `boolean` | `false` | 只读，无论 `editable` 如何设置。 |
| `lockable` | `boolean` | `false` | 显示锁定按钮。 |
| `today` | `string` | 今天（UTC） | `YYYY-MM-DD`：早于该日期的 `due` 显示为逾期。 |

## 事件

| 事件 | 负载 | |
|---|---|---|
| `change` | `string` | 编辑后完整的新标记。 |
| `lock` | `boolean` | 锁定按钮被按下：请求的 `locked` 状态。 |
| `open` | `{ id, title, column }` | 打开了一张卡片（`KanbanOpen`）。 |

## 函数

标记函数是纯函数，并已导出，可在不使用组件的情况下调用 —— 在服务端、脚本或测试中。卡片和列的 id 是按位置生成的（`card-0`、`col-0`、…），因此应从同一文本的最新 `parseKanban` 结果中获取。

| 函数 | |
|---|---|
| `parseKanban(source)` | → `KanbanDoc`：`title`、`settings`、`lanes`、`tagTones`、`columns`（各自带有 `cards`）、`problems`。 |
| `moveKanbanCard(source, cardId, toColumnId, beforeCardId, lane?)` | 将卡片连同其描述移动到另一张卡片之前（`null` —— 移到列末尾）；`lane` 更改其泳道（`null` 移除泳道）。 |
| `addKanbanCard(source, columnId, fields)` | 在列末尾添加一张卡片。 |
| `updateKanbanCard(source, cardId, fields)` | 改写卡片的行。 |
| `removeKanbanCard(source, cardId)` | 移除卡片及其描述。 |
| `addKanbanColumn(source, title)` | 在末尾添加一列。 |
| `serializeKanbanCard(fields)` | 将卡片转换为标记行。 |
| `kanbanInlineMarkdown(title)` | 将卡片标题转换为 HTML（先转义；链接只允许 `http(s)`、`mailto`、`/` 和 `#`）。 |
| `parseMarkupProps(inner)`、`serializeMarkupProps(props)`、`splitMarkupProps(text)` | `{key: value, flag}` 属性（`Map<string, string>`，标志映射为 `''`）。 |

```ts
import { parseKanban, moveKanbanCard } from '@dskripchenko/ui'

const doc = parseKanban(source)
const card = doc.columns[0].cards[0]
const next = moveKanbanCard(source, card.id, doc.columns[2].id, null)
```

类型：`KanbanDoc`、`KanbanColumn`、`KanbanCard`、`KanbanProblem`、`KanbanPriority`、`KanbanCardFields`、`MarkupProps`、`KanbanOpen`、`UidKanbanProps`。

## 文本

界面文字来自语言包的 `kanban` 部分（见 [i18n](./i18n.md)）；部分 locale 只覆盖其中列出的键。`problems` 中的问题消息为英文。
