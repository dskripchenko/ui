# Kalender

`UidCalendar` ist ein Kalender mit Tages-, Wochen-, Monats-, Jahres- und Agenda-Ansicht. Er zeigt Termine, wählt ein Datum (`v-model`) und lässt mit `editable` Termine verschieben und in der Länge ändern. Wie das Board ändert er die Termine nicht selbst: Er gibt `event-move` aus, und der Host wendet es an. [`UidEventCalendar`](./event-calendar.md) ist ein darauf aufbauender Kalender aus Markup.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidCalendar, type CalendarEvent, type CalendarEventMove, type CalendarSlot, type CalendarView } from '@dskripchenko/ui'

const events = ref<CalendarEvent[]>([
  { id: 1, date: '2026-11-03', time: '10:00', endTime: '11:00', title: 'Release-Demo' },
  { id: 2, date: '2026-11-10', endDate: '2026-11-14', title: 'Code-Freeze' },
  { id: 3, date: '2026-11-20', title: 'Importierter Feiertag', editable: false },
])
const view = ref<CalendarView>('month')

function onMove(m: CalendarEventMove): void {
  events.value = events.value.map((e) => (e === m.event
    ? { ...e, date: m.date, endDate: m.endDate, time: m.time ?? e.time, endTime: m.endTime ?? e.endTime }
    : e))
}

function onSlot(s: CalendarSlot): void {
  // ein Formular für einen neuen Termin an s.date (und s.time) öffnen
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

## Termine

| Feld | Typ | |
|---|---|---|
| `id` | `string \| number` | Optionale Kennung (dient als Key). |
| `date` | `string` | `YYYY-MM-DD`: der erste Tag. |
| `endDate` | `string` | Der letzte Tag, **einschließlich**: `date: '2026-11-10', endDate: '2026-11-14'` umfasst fünf Tage. Fehlt er oder ist gleich `date` — ein Tag. |
| `time`, `endTime` | `string` | `HH:MM`. Ohne `time` ist der Termin ganztägig. |
| `title` | `string` | Der Titel. |
| `color` | `string` | Beliebige CSS-Farbe. |
| `editable` | `boolean` | `false` — der Termin lässt sich weder verschieben noch in der Länge ändern (kein Griff), auch wenn der Kalender `editable` ist; per Klick öffnet er sich weiterhin. `true` oder fehlend — wie der Kalender. |
| `variant` | `CalendarEventVariant` | Wie er gezeichnet wird — durch Form, nicht nur Farbe: `solid` (gefüllt), `tentative` (schraffiert, gestrichelter Rand), `declined` (gedämpft, durchgestrichen), `outline` (nur Umriss), `cancelled` (gestrichelt, durchgestrichen). Fehlend — normales Aussehen. |
| `label` | `string` | Der zugängliche Name, z. B. „Daily, Dienstag 10:00–10:15, Sie kommen“; fehlend — nur der Titel. |

## Verhalten

Mit `editable`:

- ein Termin wird auf einen anderen Tag gezogen (Monat, Ganztagszeile) oder auf einen anderen Tag und eine andere Uhrzeit (Tages- und Wochenraster);
- ein Termin mit Uhrzeit wird im Tages- und Wochenraster an seiner Unterkante verlängert — die neue `endTime`;
- ein ganztägiger oder mehrtägiger Termin wird im Monatsraster und in der Ganztagszeile am Griff an seinem Ende (rechter Rand am letzten Tag) verlängert — über Tage gezogen ergibt das das neue `endDate`, einschließlich; vor `date` geht es nie.

Jedes beendete Ziehen gibt `event-move` einmal aus; Escape bricht es ab.

`selectable` (standardmäßig der Wert von `editable`) lässt einen Klick auf eine leere Stelle `slot-click` ausgeben: eine Uhrzeit im Tages- und Wochenraster (auf die halbe Stunde abgerundet), einen Tag in der Ganztagszeile. So kann ein schreibgeschützter Kalender allein mit `selectable` „hier anlegen“ anbieten. Der Zellen-Cursor folgt `selectable`.

Ein Klick auf einen Tag in der Monatsansicht wählt ihn aus: `update:modelValue`, `date-click`, `change`. In der Jahresansicht öffnet ein Klick auf einen Tag ihn zuerst — `update:anchor` und `update:view` auf `day`, wenn `views` es anbietet — und wählt ihn dann genauso aus, `date-click` eingeschlossen. Da die Ansicht zuerst wechselt, kann ein `date-click`-Listener, der die aktuelle Ansicht liest (etwa über `v-model:view`), diesen Sprung von einem Klick im Monat unterscheiden. Ein Klick auf einen Monatsnamen in der Jahresansicht öffnet nur diesen Monat; ein Klick auf einen Tag im Wochenkopf öffnet nur diesen Tag.

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `events` | `CalendarEvent[]` | `[]` | Die Termine. |
| `views` | `CalendarView[]` | `['month']` | Die angebotenen Ansichten; bei mehr als einer erscheint ein Umschalter. |
| `editable` | `boolean` | `false` | Termine verschieben und in der Länge ändern. |
| `selectable` | `boolean` | `editable` | `slot-click` für Klicks auf leere Stellen ausgeben. |
| `min`, `max` | `string` | — | `YYYY-MM-DD`: Tage außerhalb sind nicht wählbar. |
| `compact` | `boolean` | `false` | Ein kleineres Monatsraster. |
| `maxEventsPerDay` | `number` | `3` | Termine pro Tag im Monat; der Rest unter „+N“. |
| `todayLabel` | `string` | Locale | Die Beschriftung der Heute-Schaltfläche. |
| `hourHeight` | `number` | `48` | Pixel pro Stunde im Tages- und Wochenraster. |
| `scrollToHour` | `number` | `8` | Die Stunde, zu der das Tages- und Wochenraster scrollt. |
| `dayClass` | `(iso: string) => CalendarDayClass` | — | Klassen für einen Tag nach seinem `YYYY-MM-DD` (alles, was `:class` annimmt): Wochenenden, Feiertage, freie Tage — an der Monatszelle und im Tages- und Wochenraster an der Spalte und ihrem Kopf. |
| `todayButton` | `boolean` | `true` | Die Heute-Schaltfläche zwischen den Pfeilen anzeigen. |
| `header` | `boolean` | `true` | Den eingebauten Kopf zeigen. Aus, wenn der Host eine eigene Leiste zeichnet und den Kalender über `go(±1)`, `goToday()`, `setView(view)` steuert. |
| `startHour`, `endHour` | `number` | `0`, `24` | Die Stunden des Tages- und Wochenrasters; Termine außerhalb werden abgeschnitten. |
| `gutterLabel` | `string` | `''` | Die Ecke über den Stunden, z. B. die Zeitzone. |
| `allDayLabel` | `string` | Locale | Die Beschriftung der Ganztagszeile; `''` — keine. |
| `bands` | `CalendarBand[]` | `[]` | Balken über ganze Tage — siehe unten. |
| `headInline` | `boolean` | `false` | Tagesköpfe im Tages- und Wochenraster in einer Zeile (Wochentag, Datum, `day-extra`); die Tagesansicht nennt den Wochentag dann ausgeschrieben. |
| `mini` | `boolean` | `false` | Ein kleiner Monat zur Datumswahl: nur Daten, einbuchstabige Wochentage, keine Termine oder Balken (mit `header: false` neben einem großen Kalender). |

Slots: `title` (`{ title, view, range }`) ersetzt den Text des Titels; `event` (`{ event, view, short }`) ersetzt, was ein Termin zeigt — `short` ist wahr bei einzeiligen Blöcken (kürzer als 36 px) und bei Chips; `band` (`{ band }`) — der Inhalt eines Balkens über dem Raster; `day-extra` (`{ iso }`) — neben dem Datum einer Monatszelle und am Ende eines Tageskopfs im Tages- und Wochenraster, z. B. ein Feiertags-Tag.

Die Spalte von heute im Tages- und Wochenraster ist mit `--uid-cal-today-bg` getönt; `transparent` nimmt die Tönung weg.

## Balken

`bands` sind Balken über ganze Tage: ein Sprint, eine Abwesenheit, ein Zeitraum. Jeder ist `{ id?, start, end, label, tone? }` — `start` und `end` als `YYYY-MM-DD`, `end` inklusive; `tone` ist `neutral` (Standard), `info`, `success`, `warning` oder `danger`. Über dem Tages- und Wochenraster spannt ein Balken seine Spalten; überlappende kommen in Bahnen. Im Monat ist ein Balken ein 16-px-Streifen in jeder seiner Zellen, beschriftet am Anfang und montags; die Bahn bleibt die ganze Woche. `bandLanes(bands)` liefert die Bahnen für ein eigenes Layout.

`v-model` ist das gewählte Datum, `v-model:view` die Ansicht, `v-model:anchor` das Datum, um das die Ansicht aufgebaut wird.

## Ausgegebene Events

| Event | Payload | |
|---|---|---|
| `event-click` | `CalendarEvent`, `HTMLElement` | Ein Termin wurde angeklickt oder mit Enter geöffnet; sein Element, um ein Popover anzuheften. |
| `event-hover` | `CalendarEvent \| null`, `HTMLElement \| null` | Zeiger oder Fokus kam zu einem Termin oder verließ ihn (`null`) — für eine Vorschau. |
| `event-move` | `CalendarEventMove` | `{ event, date, endDate?, time?, endTime? }`: der ursprüngliche Termin und wohin er geht. Ein Verschieben liefert das neue `date` (plus `endDate` bei mehrtägigen, `time`/`endTime` bei Terminen mit Uhrzeit); eine Längenänderung im Zeitraster die neue `endTime`; eine Längenänderung im Monatsraster oder in der Ganztagszeile das neue `endDate`. |
| `slot-click` | `CalendarSlot` | `{ date, time? }`: auf eine leere Stelle wurde geklickt (mit `selectable`). |
| `date-click` | `string` | Ein Tag wurde gewählt. |
| `change` | `string \| null` | Das gewählte Datum. |
| `range` | `CalendarRange` | `{ view, start, end }`: die sichtbaren Tage haben sich geändert — Termine dafür laden. |

Typen: `UidCalendarProps`, `CalendarEvent`, `CalendarEventVariant`, `CalendarBand`, `CalendarEventMove`, `CalendarSlot`, `CalendarRange`, `CalendarView`.

## Texte

Beschriftungen kommen aus dem Locale, Abschnitte `calendar` und `datePicker` (siehe [i18n](./i18n.md)); `calendar.resize` ist der Tooltip der Griffe zum Verlängern.
