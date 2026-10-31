# 看板组件（Board）

`UidBoard` 是由列和卡片组成的看板，可按需划分为泳道（swimlanes）。卡片可在列之间拖动（或用 Alt+←/→ 移动）；看板本身不移动卡片——它发出带有放置点相邻卡片的 `move` 事件，由宿主把移动应用到自己的数据上（如有需要，先保存）。[`UidKanban`](./kanban.md) 是在它之上构建的标记驱动看板。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidBoard, UidButton, type BoardColumn, type BoardMove } from '@dskripchenko/ui'

const columns = ref<BoardColumn[]>([
  { key: 'todo', title: '待办', total: 42, cards: [
    { key: 1, title: '登录页', assignee: 'Anna Smirnova', due: '2026-11-15', tags: [{ label: 'backend', tone: 'info' }] },
    { key: 2, title: '导出 CSV', assignee: { name: 'Boris', avatar: '/avatars/boris.png' } },
  ] },
  { key: 'doing', title: '进行中', wip: 3, cards: [] },
  { key: 'done', title: '已完成', cards: [{ key: 3, title: '搜索筛选', due: '2026-11-01', done: true }] },
])

function onMove(move: BoardMove): void {
  // 保存，然后把 move.card 放到 move.to 中 move.beforeKey 之前（null —— 放到末尾）
}
</script>

<template>
  <UidBoard
    :columns="columns"
    @move="onMove"
    @open="(card) => console.log(card.key)"
  >
    <template #column-footer="{ column }">
      <UidButton
        v-if="column.total && column.cards.length < column.total"
        variant="ghost"
        size="sm"
      >
        加载更多
      </UidButton>
    </template>
  </UidBoard>
</template>
```

## 列

| 字段 | 类型 | |
|---|---|---|
| `key` | `string \| number` | 列的标识。 |
| `title` | `string` | 标题。 |
| `cards` | `BoardCard[]` | 显示的卡片，按顺序。 |
| `total` | `number` | 只加载了部分卡片时该列的真实卡片数。标题中的计数、WIP 检查、超限样式以及 `column-header` 插槽的 `count` 都使用它；省略时为 `cards.length`。`total` 大于零但没有已加载卡片的列不会显示为空。 |
| `wip` | `number \| null` | 在制品（WIP）上限：超过时计数变红，并带有“已超限”提示。 |

## 卡片

| 字段 | 类型 | |
|---|---|---|
| `key` | `string \| number` | 卡片的标识。 |
| `title` | `string` | 标题。 |
| `subtitle` | `string` | 第二行。 |
| `tags` | `{ label, tone? }[]` | 标签；`tone` 为 `info`、`success`、`warning`、`danger` 或 `default`。 |
| `assignee` | `string \| { name, avatar?, color? }` | 在卡片底部显示为头像图片，或显示为 `color`（任意 CSS 颜色，默认为强调色）上的姓名首字母。姓名作为头像的提示和无障碍标签。 |
| `due` | `string` | `YYYY-MM-DD`：截止日期，按组件库的语言区域显示在卡片底部（仅当年份与 `today` 不同时显示年份）。早于 `today` 即为逾期：以危险色显示，并朗读为“已逾期”。 |
| `done` | `boolean` | 已完成的卡片：弱化显示（标题加删除线），且永不逾期。 |
| `lane` | `string \| number` | 卡片所在的泳道。 |
| `targets` | `(string \| number)[]` | 卡片可移入的列；省略时为任意列。 |

`card` 插槽会替换整张卡片，包括带有 `assignee` 和 `due` 的底部。

## Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `columns` | `BoardColumn[]` | — | 列及其卡片。 |
| `lanes` | `BoardLane[]` | `[]` | 泳道 `{ key, title }`；每条泳道是一行，包含所有列。 |
| `busy` | `boolean` | `false` | 保存移动期间冻结看板。 |
| `readonly` | `boolean` | `false` | 卡片可以打开，但不能移动。 |
| `today` | `string` | 本地日期 | `YYYY-MM-DD`：早于它的卡片 `due` 即为逾期。 |

## 事件

| 事件 | 载荷 | |
|---|---|---|
| `move` | `BoardMove` | `{ card, from, to, beforeKey, afterKey, lane }`：卡片被放下；`beforeKey`/`afterKey` 是它的新邻居（在两端为 `null`）。 |
| `open` | `BoardCard` | 点击了卡片或在其上按下 Enter。 |

## 插槽

| 插槽 | Props | |
|---|---|---|
| `card` | `{ card, column }` | 整张卡片。 |
| `column-header` | `{ column, count, over }` | 列标题；`count` 为 `total ?? cards.length`，`over` 表示超过 `wip`。 |
| `column-footer` | `{ column }` | 列底部、卡片下方——例如“加载更多”按钮。有泳道时每列只渲染一次，位于最后一条泳道的底部（标题位于第一条）。没有该插槽时不会生成底部元素。 |

类型：`UidBoardProps`、`BoardColumn`、`BoardCard`、`BoardCardTag`、`BoardAssignee`、`BoardLane`、`BoardMove`、`BoardKey`。

## 文本

文案来自语言包的 `board` 部分（见 [i18n](./i18n.md)）：`label`、`empty`、`wipExceeded`、`due`、`overdue`、`assignee(name)`。日期按语言包的 `code` 格式化。
