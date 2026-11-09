# Nachrichtenverlauf

`UidMessageFeed` ist ein Nachrichtenverlauf wie in einem Chat: die ältesten oben, die neuesten unten. Gerendert wird nur, was nahe am sichtbaren Bereich liegt, deshalb scrollen auch zehntausende Nachrichten flüssig; Nachrichten dürfen beliebig hoch sein — sie werden beim Rendern gemessen.

- **Tagestrenner** entstehen aus `itemDate`; **Gruppen** von Nachrichten eines Autors aus `continues`, der Slot erhält `grouped`, um den wiederholten Kopf wegzulassen.
- **Der Trenner „Neu“** steht vor der Nachricht, deren Schlüssel `newMarker` nennt.
- **Ältere Nachrichten nachladen** hält die Leseposition: Einträge werden vorne angefügt, und nichts springt — auch wenn die neuen Zeilen höher als geschätzt sind.
- **Am Ende bleiben**: Solange der Leser unten ist, bleiben neue Nachrichten sichtbar; scrollt er nach oben, bleibt der Verlauf stehen.

```vue
<template>
  <UidMessageFeed
    :items="notes"
    :item-key="n => n.id"
    :item-date="n => n.at"
    :continues="(a, b) => a.author === b.author"
    :new-marker="firstUnreadId"
    :has-more-before="more"
    :loading-before="loading"
    label="Team notes"
    style="height: 100%"
    @load-before="loadOlder"
    @visible="range => markRead(range?.last)"
  >
    <template #item="{ item, grouped }">
      <NoteRow :note="item" :compact="grouped" />
    </template>
  </UidMessageFeed>
</template>
```

Der Verlauf braucht eine Höhe: Geben Sie ihm eine, oder setzen Sie ihn in eine Flex-Spalte mit `min-height: 0`.

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `items` | `T[]` | — | Nachrichten, älteste zuerst |
| `itemKey` | `(item) => string \| number` | — | Stabiler Schlüssel |
| `itemDate` | `(item) => Date \| string \| number` | — | Tagestrenner; ohne ihn gibt es keine |
| `continues` | `(previous, item) => boolean` | — | Setzt die Nachricht die Gruppe der vorigen fort? |
| `newMarker` | Schlüssel | `null` | Erste neue Nachricht; der Trenner steht davor |
| `estimatedItemHeight` | `number` | `56` | Angenommene Höhe bis zur Messung |
| `overscan` | `number` | `600` | Pixel, die außerhalb des Sichtbereichs gerendert werden |
| `hasMoreBefore` / `hasMoreAfter` | `boolean` | `false` | Es gibt ältere / neuere Nachrichten |
| `loadingBefore` / `loadingAfter` | `boolean` | `false` | Eine Seite lädt; keine weiteren Anfragen |
| `followOutput` | `boolean` | `true` | Neueste Nachricht sichtbar halten, solange der Leser unten ist |
| `loadThreshold` | `number` | `400` | Abstand zum Rand, ab dem nachgeladen wird |
| `dayLabel` | `(date) => string` | Heute / Gestern / Datum | Text eines Tagestrenners |
| `newLabel` | `string` | Locale | Text des Trenners „Neu“ |
| `label` | `string` | — | Barrierefreier Name |

Ein Trenner unterbricht eine Gruppe: Die erste Nachricht eines Tages und die erste neue zeigen immer ihren Kopf.

## Events

| Event | Daten | |
|---|---|---|
| `loadBefore` | — | Nahe am oberen Rand, solange `hasMoreBefore` |
| `loadAfter` | — | Nahe am unteren Rand, solange `hasMoreAfter` |
| `atBottom` | `boolean` | Leser hat das Ende erreicht oder verlassen — für eine Schaltfläche „Zu den neuesten“ |
| `visible` | `{ first, last } \| null` | Schlüssel der sichtbaren Nachrichten — um sie als gelesen zu markieren |

## Slots

`item` (`{ item, index, grouped }`), `day` (`{ date, label }`), `new` (`{ label }`), `before` und `after` (am oberen / unteren Rand während des Ladens), `empty`.

## Methoden

Über eine Template-Ref: `scrollToBottom()` springt zur neuesten Nachricht und folgt wieder; `scrollToKey(key, 'start' | 'center')` bringt eine Nachricht in den Blick und gibt `false` zurück, wenn sie nicht geladen ist.

Wird der Verlauf in der Mitte geöffnet (`hasMoreAfter`), folgt er dem Ende erst, wenn die neueste Seite geladen ist.

## Barrierefreiheit

Der Verlauf ist ein `role="feed"` mit `aria-busy` während des Ladens; jede Nachricht ist ein `article` mit `aria-posinset` und `aria-setsize` (`-1`, solange nachgeladen werden kann); Trenner sind `separator`. Geben Sie dem Verlauf ein `label`.
