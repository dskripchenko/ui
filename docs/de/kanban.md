# Kanban

`UidKanban` ist ein Kanban-Board, das als Klartext-Markup geschrieben und mit [`UidBoard`](./board.md) gezeichnet wird. Das Markup ist die einzige Quelle der Wahrheit: Die Komponente liest es, und jede Bearbeitung (ein Verschieben, eine neue oder geänderte Karte) schreibt nur die betroffenen Zeilen neu und wird als `change` mit dem gesamten neuen Text ausgegeben. Kommentare, Leerzeilen und der übrige Text bleiben unverändert, sodass das Markup in einer Datei, einem Datenbankfeld oder auf einer Seite liegen kann.

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

Das Markup liest sich wie Markdown:

- `# …` — der Titel des Boards.
- `key: value`-Zeilen vor der ersten Spalte — Einstellungen:
  - `lanes` — Swimlanes, durch Kommas getrennt, in Reihenfolge;
  - `tags` — eine Tönung pro Tag: `tag=tone`, durch Kommas getrennt; Tönungen sind `info`, `success`, `warning`, `danger`. Ein Tag ohne Tönung erhält eine stabile, aus seinem Namen abgeleitete.
- `## Column {wip: 3, done}` — eine Spalte. `wip` ist ein Work-in-Progress-Limit (der Zähler wird oberhalb davon rot); `done` markiert die Spalte der erledigten Karten (durchgestrichen, nie überfällig).
- `- Card title #tag !high {lane: …, who: …, due: YYYY-MM-DD, any: value}` — eine Karte (`*` funktioniert ebenso wie `-`):
  - der Titel akzeptiert Inline-Markdown: Links, `code`, **fett**, *kursiv*;
  - `#tag` — Tags (Buchstaben, Ziffern, `_`, `-`);
  - `!high` / `!low` — Priorität;
  - Eigenschaften in geschweiften Klammern am Zeilenende: `lane` (ihre Swimlane; ohne sie — die erste Lane), `who` (die zuständige Person), `due` (das Fälligkeitsdatum) und beliebige eigene. Ein Teil ohne Doppelpunkt ist ein Flag (`{blocked}`); ein Teil, der nicht wie ein Name aussieht, setzt den vorherigen Wert fort (`{links: a, b}`).
- Unter einer Karte eingerückte Zeilen (zwei Leerzeichen oder ein Tab) — die Beschreibung der Karte, in Markdown.
- `<!-- comments -->` (ein- oder mehrzeilig) werden übersprungen und beibehalten.

Zeilen, die nichts davon sind, werden in `parseKanban(source).problems` gemeldet und im Tab **Source** (Quelltext) aufgelistet.

## Verhalten

Ein Klick auf eine Karte (oder Enter auf einer fokussierten) öffnet ihre Details in einem Drawer und gibt `open` aus. Über dem Board gibt es Filter nach Tag und nach Person.

Mit `editable` (und nicht `locked`):

- Karten werden zwischen Spalten und Lanes gezogen (Alt+←/→ verschiebt eine fokussierte Karte);
- `+` in einem Spaltenkopf öffnet das Formular für eine neue Karte;
- der Drawer bearbeitet eine Karte (Titel, Spalte, Lane, Tags, Priorität, Fälligkeitsdatum, zuständige Person, Beschreibung, weitere Eigenschaften als `key: value`-Zeilen) oder löscht sie;
- der Tab **Source** bearbeitet das Markup selbst, mit Problemen pro Zeile; Eingaben werden nach einer Pause von 300 ms als `change` ausgegeben.

`locked` macht das Board schreibgeschützt, unabhängig von `editable`. `lockable` zeigt den Sperr-Button, der `lock` mit dem neuen Zustand ausgibt: Der Host hält ihn und gibt ihn als `locked` zurück, so wie er den Quelltext bei `change` hält.

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `source` | `string` | `''` | Das Markup. Ein neuer Wert ersetzt das Board, sofern es nicht der ist, den die Komponente gerade ausgegeben hat. |
| `editable` | `boolean` | `false` | Verschieben, neue und geänderte Karten, der Quelltext-Tab. |
| `locked` | `boolean` | `false` | Schreibgeschützt, unabhängig von `editable`. |
| `lockable` | `boolean` | `false` | Den Sperr-Button zeigen. |
| `today` | `string` | heute (UTC) | `YYYY-MM-DD`: ein `due`-Datum davor wird als überfällig angezeigt. |

## Events

| Event | Payload | |
|---|---|---|
| `change` | `string` | Das gesamte neue Markup nach einer Bearbeitung. |
| `lock` | `boolean` | Der Sperr-Button wurde gedrückt: der angeforderte `locked`-Zustand. |
| `open` | `{ id, title, column }` | Eine Karte wurde geöffnet (`KanbanOpen`). |

## Funktionen

Die Markup-Funktionen sind rein und werden für die Nutzung ohne die Komponente exportiert — auf einem Server, in einem Skript, in Tests. Karten- und Spalten-IDs sind positionsbasiert (`card-0`, `col-0`, …), nimm sie also aus einem frischen `parseKanban` desselben Textes.

| Funktion | |
|---|---|
| `parseKanban(source)` | → `KanbanDoc`: `title`, `settings`, `lanes`, `tagTones`, `columns` (jede mit ihren `cards`), `problems`. |
| `moveKanbanCard(source, cardId, toColumnId, beforeCardId, lane?)` | Verschiebt eine Karte samt Beschreibung vor eine andere Karte (`null` — ans Ende der Spalte); `lane` ändert ihre Swimlane (`null` entfernt sie). |
| `addKanbanCard(source, columnId, fields)` | Fügt eine Karte am Ende einer Spalte hinzu. |
| `updateKanbanCard(source, cardId, fields)` | Schreibt die Zeilen einer Karte neu. |
| `removeKanbanCard(source, cardId)` | Entfernt eine Karte und ihre Beschreibung. |
| `addKanbanColumn(source, title)` | Fügt am Ende eine Spalte hinzu. |
| `serializeKanbanCard(fields)` | Eine Karte als Markup-Zeilen. |
| `kanbanInlineMarkdown(title)` | Ein Kartentitel als HTML (zuerst maskiert; Links nur zu `http(s)`, `mailto`, `/` und `#`). |
| `parseMarkupProps(inner)`, `serializeMarkupProps(props)`, `splitMarkupProps(text)` | Die `{key: value, flag}`-Eigenschaften (eine `Map<string, string>`, Flags werden auf `''` abgebildet). |

```ts
import { parseKanban, moveKanbanCard } from '@dskripchenko/ui'

const doc = parseKanban(source)
const card = doc.columns[0].cards[0]
const next = moveKanbanCard(source, card.id, doc.columns[2].id, null)
```

Typen: `KanbanDoc`, `KanbanColumn`, `KanbanCard`, `KanbanProblem`, `KanbanPriority`, `KanbanCardFields`, `MarkupProps`, `KanbanOpen`, `UidKanbanProps`.

## Texte

Beschriftungen kommen aus dem Locale-Paket, Abschnitt `kanban` (siehe [i18n](./i18n.md)); eine unvollständige Locale überschreibt nur die Schlüssel, die sie nennt. Problemmeldungen in `problems` sind auf Englisch.
