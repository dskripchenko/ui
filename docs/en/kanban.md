# Kanban

`UidKanban` is a kanban board written as plain-text markup and drawn with `UidBoard`. The markup is the single source of truth: the component reads it, and every edit (a move, a new or changed card) rewrites only the lines it touches and is emitted as `change` with the whole new text. Comments, blank lines and the rest of the text stay as they were, so the markup can be kept in a file, a database field or a page.

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

## Markup

The markup reads like markdown:

- `# …` — the board's title.
- `key: value` lines before the first column — settings:
  - `lanes` — swimlanes, comma-separated, in order;
  - `tags` — a tone per tag: `tag=tone`, comma-separated; tones are `info`, `success`, `warning`, `danger`. A tag without a tone gets a stable one from its name.
- `## Column {wip: 3, done}` — a column. `wip` is a work-in-progress limit (the counter turns red above it); `done` marks the column of finished cards (struck through, never overdue).
- `- Card title #tag !high {lane: …, who: …, due: YYYY-MM-DD, any: value}` — a card (`*` works as well as `-`):
  - the title takes inline markdown: links, `code`, **bold**, *italics*;
  - `#tag` — tags (letters, digits, `_`, `-`);
  - `!high` / `!low` — priority;
  - properties in braces at the end of the line: `lane` (its swimlane; without it — the first lane), `who` (the assignee), `due` (the due date), and any of your own. A part without a colon is a flag (`{blocked}`); a part that does not look like a name continues the previous value (`{links: a, b}`).
- Lines indented under a card (two spaces or a tab) — the card's description, in markdown.
- `<!-- comments -->` (one line or several) are skipped and kept.

Lines that are none of these are reported in `parseKanban(source).problems` and listed under the **Source** tab.

## Behaviour

A click on a card (or Enter on a focused one) opens its details in a drawer and emits `open`. Above the board are filters by tag and by person.

With `editable` (and not `locked`):

- cards are dragged between columns and lanes (Alt+←/→ moves a focused card);
- `+` in a column header opens the form for a new card;
- the drawer edits a card (title, column, lane, tags, priority, due date, assignee, description, other properties as `key: value` lines) or deletes it;
- the **Source** tab edits the markup itself, with problems by line; typing is emitted as `change` after a 300 ms pause.

`locked` makes the board read-only whatever `editable` says. `lockable` shows the lock button, which emits `lock` with the new state: the host keeps it and passes it back as `locked`, just as it keeps the source on `change`.

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `source` | `string` | `''` | The markup. A new value replaces the board unless it is the one the component has just emitted. |
| `editable` | `boolean` | `false` | Moves, new and changed cards, the source tab. |
| `locked` | `boolean` | `false` | Read-only, whatever `editable` says. |
| `lockable` | `boolean` | `false` | Show the lock button. |
| `today` | `string` | today (UTC) | `YYYY-MM-DD`: a `due` date before it is shown as overdue. |

## Events

| Event | Payload | |
|---|---|---|
| `change` | `string` | The whole new markup after an edit. |
| `lock` | `boolean` | The lock button was pressed: the requested `locked` state. |
| `open` | `{ id, title, column }` | A card was opened (`KanbanOpen`). |

## Functions

The markup functions are pure and exported for use without the component — on a server, in a script, in tests. Card and column ids are positional (`card-0`, `col-0`, …), so take them from a fresh `parseKanban` of the same text.

| Function | |
|---|---|
| `parseKanban(source)` | → `KanbanDoc`: `title`, `settings`, `lanes`, `tagTones`, `columns` (each with its `cards`), `problems`. |
| `moveKanbanCard(source, cardId, toColumnId, beforeCardId, lane?)` | Moves a card with its description before another card (`null` — to the end of the column); `lane` changes its swimlane (`null` removes it). |
| `addKanbanCard(source, columnId, fields)` | Adds a card at the end of a column. |
| `updateKanbanCard(source, cardId, fields)` | Rewrites a card's lines. |
| `removeKanbanCard(source, cardId)` | Removes a card and its description. |
| `addKanbanColumn(source, title)` | Adds a column at the end. |
| `serializeKanbanCard(fields)` | A card as markup lines. |
| `kanbanInlineMarkdown(title)` | A card title as HTML (escaped first; links only to `http(s)`, `mailto`, `/` and `#`). |
| `parseMarkupProps(inner)`, `serializeMarkupProps(props)`, `splitMarkupProps(text)` | The `{key: value, flag}` properties (a `Map<string, string>`, flags map to `''`). |

```ts
import { parseKanban, moveKanbanCard } from '@dskripchenko/ui'

const doc = parseKanban(source)
const card = doc.columns[0].cards[0]
const next = moveKanbanCard(source, card.id, doc.columns[2].id, null)
```

Types: `KanbanDoc`, `KanbanColumn`, `KanbanCard`, `KanbanProblem`, `KanbanPriority`, `KanbanCardFields`, `MarkupProps`, `KanbanOpen`, `UidKanbanProps`.

## Texts

Captions come from the locale bag, section `kanban` (see [i18n](./i18n.md)); a partial locale overrides only the keys it names. Problem messages in `problems` are in English.
