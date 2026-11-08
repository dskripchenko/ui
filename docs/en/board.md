# Board

`UidBoard` is a board of columns with cards, optionally split into swimlanes. Cards are dragged between columns (or moved with Alt+←/→); the board does not move them itself — it emits `move` with the neighbours at the drop point, and the host applies the move to its data (after saving it, if it likes). [`UidKanban`](./kanban.md) is a markup-driven board built on it.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidBoard, UidButton, type BoardColumn, type BoardMove } from '@dskripchenko/ui'

const columns = ref<BoardColumn[]>([
  { key: 'todo', title: 'To do', total: 42, cards: [
    { key: 1, title: 'Sign-in page', assignee: 'Anna Smirnova', due: '2026-11-15', tags: [{ label: 'backend', tone: 'info' }] },
    { key: 2, title: 'Export to CSV', assignee: { name: 'Boris', avatar: '/avatars/boris.png' } },
  ] },
  { key: 'doing', title: 'In progress', wip: 3, cards: [] },
  { key: 'done', title: 'Done', cards: [{ key: 3, title: 'Search filters', due: '2026-11-01', done: true }] },
])

function onMove(move: BoardMove): void {
  // save, then move move.card into move.to before move.beforeKey (null — at the end)
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
        Load more
      </UidButton>
    </template>
  </UidBoard>
</template>
```

## Columns

| Field | Type | |
|---|---|---|
| `key` | `string \| number` | The column's id. |
| `title` | `string` | The header. |
| `cards` | `BoardCard[]` | The cards shown, in order. |
| `total` | `number` | The column's real number of cards when only some of them are loaded. The header count, the WIP check, the over-limit styling and the `count` of the `column-header` slot use it; omitted — `cards.length`. A column with `total` above zero and no cards loaded is not shown as empty. |
| `wip` | `number \| null` | The work-in-progress limit: the default header shows the count as `count/wip` on a chip, red above the limit with the "limit exceeded" title. While a card is dragged, a column it would take over the limit is outlined in the warning colour and its drop hint says so. |
| `muted` | `boolean` | A column of finished work: its header, cards and footer are faded (`--uid-board-muted-opacity`, 0.5). |

## Cards

| Field | Type | |
|---|---|---|
| `key` | `string \| number` | The card's id. |
| `title` | `string` | The title. |
| `subtitle` | `string` | A second line. |
| `tags` | `{ label, tone? }[]` | Tags; `tone` is `info`, `success`, `warning`, `danger` or `default`. |
| `assignee` | `string \| { name, avatar?, color? }` | Shown in the card's footer as the avatar picture, or as initials on `color` (any CSS colour; the accent by default). The name is the avatar's title and accessible label. |
| `due` | `string` | `YYYY-MM-DD`: the due date, shown in the footer in the kit's locale (the year only when it is not the year of `today`). Before `today` it is overdue: shown in the danger colour and announced as "Overdue". |
| `done` | `boolean` | A finished card: muted (the title struck through) and never overdue. |
| `lane` | `string \| number` | The swimlane the card sits in. |
| `targets` | `(string \| number)[]` | The columns the card may move to; omitted — any. |
| `reasons` | `Record<string \| number, string>` | Why the card may not move to a column, by column key. While the card is dragged, a blocked column with a reason shows it over its cards with a lock icon (the column itself stays dimmed). |

The `card` slot replaces the whole card, including the footer with `assignee` and `due`.

## Dragging

While a card is dragged, the columns it may go to are outlined in the accent colour and the others are dimmed. The column under the pointer shows a dashed hint at the top of its cards — "Drop: → Review" — with "over the limit of 8" added when the drop takes it above its `wip`; dropping on the hint puts the card first. A blocked column under the pointer shows the card's reason for it, if `reasons` has one.

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `columns` | `BoardColumn[]` | — | The columns with their cards. |
| `lanes` | `BoardLane[]` | `[]` | Swimlanes `{ key, title }`; each lane is a row of all the columns. |
| `busy` | `boolean` | `false` | Freeze the board while a move is being saved. |
| `readonly` | `boolean` | `false` | Cards open but do not move. |
| `today` | `string` | the local date | `YYYY-MM-DD`: a card `due` before it is overdue. |

## Events

| Event | Payload | |
|---|---|---|
| `move` | `BoardMove` | `{ card, from, to, beforeKey, afterKey, lane }`: a card was dropped; `beforeKey`/`afterKey` are its new neighbours (`null` at an end). |
| `open` | `BoardCard` | A card was clicked or Enter was pressed on it. |

## Slots

| Slot | Props | |
|---|---|---|
| `card` | `{ card, column }` | The whole card. |
| `column-header` | `{ column, count, over }` | The column header; `count` is `total ?? cards.length`, `over` — above `wip`. |
| `column-footer` | `{ column }` | The bottom of a column, below its cards — for example a "Load more" button. With lanes it is rendered once per column, at the bottom of the last lane (the header sits in the first one). Without the slot there is no footer element. |

Types: `UidBoardProps`, `BoardColumn`, `BoardCard`, `BoardCardTag`, `BoardAssignee`, `BoardLane`, `BoardMove`, `BoardKey`.

## Styling

Columns and cards take CSS variables, falling back to the theme: `--uid-board-column-bg`, `--uid-board-column-border`, `--uid-board-column-radius`, `--uid-board-card-bg`, `--uid-board-card-border`, `--uid-board-card-radius`, `--uid-board-card-padding`, `--uid-board-muted-opacity`, `--uid-board-reason-bg`, `--uid-board-reason-top`, `--uid-board-wip-bg`, `--uid-board-wip-over-bg`.

## Texts

Captions come from the locale bag, section `board` (see [i18n](./i18n.md)): `label`, `empty`, `wipExceeded`, `due`, `overdue`, `assignee(name)`, `dropHere(title)`, `overWip(limit)`. Dates are formatted with the locale's `code`.
