# Board

`UidBoard` ist ein Board aus Spalten mit Karten, auf Wunsch in Swimlanes aufgeteilt. Karten werden zwischen Spalten gezogen (oder mit Alt+←/→ verschoben); das Board verschiebt sie nicht selbst — es gibt `move` mit den Nachbarn an der Ablagestelle aus, und der Host wendet die Verschiebung auf seine Daten an (gern erst nach dem Speichern). [`UidKanban`](./kanban.md) ist ein darauf aufbauendes Board aus Markup.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidBoard, UidButton, type BoardColumn, type BoardMove } from '@dskripchenko/ui'

const columns = ref<BoardColumn[]>([
  { key: 'todo', title: 'Zu erledigen', total: 42, cards: [
    { key: 1, title: 'Anmeldeseite', assignee: 'Anna Schmidt', due: '2026-11-15', tags: [{ label: 'backend', tone: 'info' }] },
    { key: 2, title: 'CSV-Export', assignee: { name: 'Boris', avatar: '/avatars/boris.png' } },
  ] },
  { key: 'doing', title: 'In Arbeit', wip: 3, cards: [] },
  { key: 'done', title: 'Erledigt', cards: [{ key: 3, title: 'Suchfilter', due: '2026-11-01', done: true }] },
])

function onMove(move: BoardMove): void {
  // speichern, dann move.card in move.to vor move.beforeKey einfügen (null — ans Ende)
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
        Mehr laden
      </UidButton>
    </template>
  </UidBoard>
</template>
```

## Spalten

| Feld | Typ | |
|---|---|---|
| `key` | `string \| number` | Die Kennung der Spalte. |
| `title` | `string` | Die Überschrift. |
| `cards` | `BoardCard[]` | Die angezeigten Karten, in Reihenfolge. |
| `total` | `number` | Die tatsächliche Kartenzahl der Spalte, wenn nur ein Teil geladen ist. Der Zähler im Kopf, die WIP-Prüfung, die Hervorhebung bei Überschreitung und `count` des Slots `column-header` verwenden ihn; fehlt er — `cards.length`. Eine Spalte mit `total` über null ohne geladene Karten wird nicht als leer angezeigt. |
| `wip` | `number \| null` | Das WIP-Limit: der Standardkopf zeigt den Zähler als `count/wip` auf einem Chip, über dem Limit rot mit dem Hinweis „Limit überschritten“. Während eine Karte gezogen wird, ist eine Spalte, die der Abwurf über das Limit bringt, in der Warnfarbe umrandet, und ihr Abwurfhinweis sagt es. |
| `muted` | `boolean` | Eine Spalte erledigter Arbeit: Kopf, Karten und Fuß sind abgeblendet (`--uid-board-muted-opacity`, 0.5). |

## Karten

| Feld | Typ | |
|---|---|---|
| `key` | `string \| number` | Die Kennung der Karte. |
| `title` | `string` | Der Titel. |
| `subtitle` | `string` | Eine zweite Zeile. |
| `tags` | `{ label, tone? }[]` | Tags; `tone` ist `info`, `success`, `warning`, `danger` oder `default`. |
| `assignee` | `string \| { name, avatar?, color? }` | Im Fuß der Karte als Avatarbild oder als Initialen auf `color` (beliebige CSS-Farbe; standardmäßig die Akzentfarbe). Der Name ist Tooltip und zugängliche Beschriftung des Avatars. |
| `due` | `string` | `YYYY-MM-DD`: das Fälligkeitsdatum, im Fuß im Locale des Kits angezeigt (das Jahr nur, wenn es nicht das Jahr von `today` ist). Vor `today` ist es überfällig: in der Gefahrenfarbe und als „Überfällig“ angesagt. |
| `done` | `boolean` | Eine erledigte Karte: gedämpft (Titel durchgestrichen) und nie überfällig. |
| `lane` | `string \| number` | Die Swimlane der Karte. |
| `targets` | `(string \| number)[]` | Die Spalten, in die die Karte darf; fehlt es — jede. |
| `reasons` | `Record<string \| number, string>` | Warum die Karte nicht in eine Spalte darf, nach Spaltenschlüssel. Während die Karte gezogen wird, zeigt eine gesperrte Spalte mit Grund ihn über den Karten mit einem Schloss (die Spalte selbst bleibt abgeblendet). |

Der Slot `card` ersetzt die ganze Karte, einschließlich des Fußes mit `assignee` und `due`.

## Ziehen

Während eine Karte gezogen wird, sind die Spalten, in die sie darf, in der Akzentfarbe umrandet, die anderen abgeblendet. Die Spalte unter dem Zeiger zeigt oben einen gestrichelten Hinweis — „Drop: → Review“ — mit dem Zusatz „über dem Limit von 8“, wenn der Abwurf sie über `wip` bringt; ein Abwurf auf den Hinweis setzt die Karte an den Anfang. Eine gesperrte Spalte unter dem Zeiger zeigt den Grund der Karte, wenn `reasons` einen hat.

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `columns` | `BoardColumn[]` | — | Die Spalten mit ihren Karten. |
| `lanes` | `BoardLane[]` | `[]` | Swimlanes `{ key, title }`; jede Lane ist eine Zeile aus allen Spalten. |
| `busy` | `boolean` | `false` | Das Board einfrieren, während eine Verschiebung gespeichert wird. |
| `readonly` | `boolean` | `false` | Karten öffnen sich, bewegen sich aber nicht. |
| `today` | `string` | das lokale Datum | `YYYY-MM-DD`: ein `due` davor ist überfällig. |

## Events

| Event | Payload | |
|---|---|---|
| `move` | `BoardMove` | `{ card, from, to, beforeKey, afterKey, lane }`: eine Karte wurde abgelegt; `beforeKey`/`afterKey` sind ihre neuen Nachbarn (`null` am Rand). |
| `open` | `BoardCard` | Auf eine Karte wurde geklickt oder Enter gedrückt. |

## Slots

| Slot | Props | |
|---|---|---|
| `card` | `{ card, column }` | Die ganze Karte. |
| `column-header` | `{ column, count, over }` | Der Spaltenkopf; `count` ist `total ?? cards.length`, `over` — über `wip`. |
| `column-footer` | `{ column }` | Das untere Ende einer Spalte unter ihren Karten — etwa eine Schaltfläche „Mehr laden“. Mit Lanes wird er einmal pro Spalte gerendert, unten in der letzten Lane (der Kopf sitzt in der ersten). Ohne den Slot gibt es kein Fußelement. |

Typen: `UidBoardProps`, `BoardColumn`, `BoardCard`, `BoardCardTag`, `BoardAssignee`, `BoardLane`, `BoardMove`, `BoardKey`.

## Gestaltung

Spalten und Karten nehmen CSS-Variablen, sonst gilt das Theme: `--uid-board-column-bg`, `--uid-board-column-border`, `--uid-board-column-radius`, `--uid-board-card-bg`, `--uid-board-card-border`, `--uid-board-card-radius`, `--uid-board-card-padding`, `--uid-board-muted-opacity`, `--uid-board-reason-bg`, `--uid-board-reason-top`, `--uid-board-wip-bg`, `--uid-board-wip-over-bg`.

## Texte

Beschriftungen kommen aus dem Locale, Abschnitt `board` (siehe [i18n](./i18n.md)): `label`, `empty`, `wipExceeded`, `due`, `overdue`, `assignee(name)`, `dropHere(title)`, `overWip(limit)`. Datumsangaben werden mit dem `code` des Locales formatiert.
