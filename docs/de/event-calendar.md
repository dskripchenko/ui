# Terminkalender

`UidEventCalendar` zeigt Termine, die als Klartext-Markup geschrieben sind, in [`UidCalendar`](./calendar.md) an — Tages-, Wochen-, Monats-, Jahres- und Agenda-Ansicht. Wiederholungen werden nur für die sichtbaren Tage aufgelöst. Wie bei [`UidKanban`](./kanban.md) ist das Markup die einzige Quelle der Wahrheit: Jede Bearbeitung schreibt eine Zeile neu (zwei, wenn ein Vorkommen einer Wiederholung abgelöst wird) und wird als `change` mit dem gesamten neuen Text ausgegeben.

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

## Markup

Zuerst ein optionaler `# Title` und Einstellungen (`key: value`):

- `view` — die zuerst gezeigte Ansicht: `day`, `week`, `month`, `year` oder `agenda`;
- `date` — das zuerst gezeigte Datum (`YYYY-MM-DD`);
- `tags` — eine Tönung pro Tag: `tag=tone`, durch Kommas getrennt (`info`, `success`, `warning`, `danger` oder eine beliebige CSS-Farbe).

Dann ein Termin pro Zeile:

- **Wann**: ein Datum `2026-11-03` oder ein Zeitraum `2026-11-10..2026-11-14`, danach eine optionale Uhrzeit `10:00` oder `10:00-11:00` (keine — ganztägig).
- **Was**: der Titel, `#tags` (der erste bestimmt die Farbe), `{properties}` am Ende — `where`, `description` (Markdown, in den Details angezeigt) oder eigene.
- **Wiederholungen** beginnen mit `every` statt mit einem Datum — eine Teilmenge der RFC-5545-RRULE in Worten:

  | Zeile | Wiederholt sich |
  |---|---|
  | `every day`, `every 3 days` | jeden (dritten) Tag |
  | `every mon,wed`, `every 2 weeks fri` | an diesen Wochentagen, jede (zweite) Woche |
  | `every month 15`, `every month last` | an diesem Tag des Monats, an seinem letzten Tag |
  | `every month 2nd tue`, `every month last fri` | am n-ten / letzten Wochentag |
  | `every year 12-31` | jedes Jahr an diesem Datum |

  Wochentage sind `mon` … `sun`, die vollen englischen Namen oder `пн` … `вс`. Grenzen und Ausnahmen stehen in den Eigenschaften: `from` (das erste Datum; nötig für `count` und für „alle N“), `until`, `count`, `except` (Daten, durch Kommas getrennt). `{rrule: FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=2}` übernimmt eine Regel unverändert, etwa eine aus iCal kopierte (`FREQ`, `INTERVAL`, `BYDAY`, `BYMONTHDAY`, `BYMONTH`, `COUNT`, `UNTIL`); ein Datum davor wird zu `from`.

`<!-- comments -->` werden übersprungen und beibehalten. Zeilen, die keine Termine sind, werden in `parseEventCalendar(source).problems` gemeldet und im Tab **Source** (Quelltext) aufgelistet.

## Verhalten

Ein Klick auf einen Termin öffnet seine Details in einem Drawer und gibt `open` aus.

Mit `editable` (und nicht `locked`): einen Termin auf einen anderen Tag oder eine andere Stunde ziehen, ihn in der Tages- und Wochenansicht in die Länge ziehen, auf einen freien Slot klicken (oder in der Monatsansicht auf einen Tag, oder auf **+ Event** (neuer Termin)) für einen neuen Termin. Der **Termin-Baukasten** stellt einen Termin aus Auswahlmöglichkeiten zusammen — Datum oder Zeitraum, ganztägig oder mit Uhrzeit, die Wiederholung („alle 2 Wochen am Mo und Mi“, „am letzten Freitag jedes Monats“, bis zu einem Datum / N-mal), ausgelassene Daten — und zeigt die Zeile, die er schreibt. Beim Bearbeiten eines Vorkommens einer Wiederholung wird gefragt, ob nur dieses oder die ganze Serie geändert werden soll: Dieses wird zu einem eigenständigen Termin, und die Serie lässt sein Datum aus (Ziehen eines Vorkommens bewirkt dasselbe); **Skip this date** (dieses Datum auslassen) fügt das Datum nur zu `except` hinzu. Der Tab **Source** bearbeitet das Markup mit Problemen pro Zeile.

`locked` und `lockable` funktionieren wie bei [`UidKanban`](./kanban.md): `locked` ist schreibgeschützt, unabhängig von `editable`, der Sperr-Button gibt `lock` aus.

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `source` | `string` | `''` | Das Markup. Ein neuer Wert ersetzt die Termine, sofern es nicht der ist, den die Komponente gerade ausgegeben hat. |
| `editable` | `boolean` | `false` | Ziehen, Größe ändern, der Termin-Baukasten, der Quelltext-Tab. |
| `locked` | `boolean` | `false` | Schreibgeschützt, unabhängig von `editable`. |
| `lockable` | `boolean` | `false` | Den Sperr-Button zeigen. |
| `view` | `CalendarView \| ''` | `''` | Die zuerst gezeigte Ansicht; leer — `view:` aus dem Markup, sonst `month`. |
| `date` | `string` | `''` | Das zuerst gezeigte Datum; leer — `date:` aus dem Markup, sonst heute. |
| `views` | `CalendarView[]` | alle fünf | Die angebotenen Ansichten. |

`view:` und `date:` aus dem Markup gelten auch, wenn das Markup erst nach dem ersten Rendern ankommt, es sei denn, die Props setzen sie oder der Betrachter hat bereits navigiert.

## Events

| Event | Payload | |
|---|---|---|
| `change` | `string` | Das gesamte neue Markup nach einer Bearbeitung. |
| `lock` | `boolean` | Der Sperr-Button wurde gedrückt: der angeforderte `locked`-Zustand. |
| `open` | `{ id, date, title }` | Ein Termin wurde geöffnet (`EventCalendarOpen`); `id` ist der Termin der Zeile, `date` das Vorkommen. |
| `range` | `{ view, start, end }` | Die sichtbaren Tage haben sich geändert. |

## Funktionen

Rein und für die Nutzung ohne die Komponente exportiert. Termin-IDs sind positionsbasiert (`ev-0`, `ev-1`, …); ein Vorkommen einer Wiederholung ist `<id>@<date>`.

| Funktion | |
|---|---|
| `parseEventCalendar(source)` | → `EventCalendarDoc`: `title`, `settings`, `tagTones`, `items`, `problems`. |
| `parseEventLine(line)` | Eine Terminzeile → `EventCalendarItem` oder der Grund, warum sie keine ist (ein String). |
| `parseEventRRule(text)` | `FREQ=…;…` → `EventCalendarRule` oder `null`. |
| `expandEventCalendar(doc, start, end)` | Jeder Termin und jedes Vorkommen, das die Tage `start` … `end` berührt → `EventCalendarOccurrence[]`. |
| `eventOccurrences(rule, start, end)` | Die Daten, die eine Regel in einem Zeitraum erzeugt. |
| `eventRuleText(rule)` | Eine Regel zurück in Worten (`every 2 weeks fri`). |
| `serializeCalendarEvent(fields)` | Ein Termin als seine Markup-Zeile. |
| `addCalendarEvent(source, fields)` | Hängt einen Termin an. |
| `updateCalendarEvent(source, id, fields)` | Schreibt die Zeile eines Termins neu. |
| `removeCalendarEvent(source, id)` | Entfernt die Zeile eines Termins. |
| `detachCalendarOccurrence(source, id, date, fields)` | Die Serie lässt `date` aus; ein Einzeltermin (`fields`) wird darunter hinzugefügt. |

```ts
import { parseEventCalendar, expandEventCalendar } from '@dskripchenko/ui'

const shown = expandEventCalendar(parseEventCalendar(source), '2026-11-01', '2026-11-30')
```

Typen: `EventCalendarDoc`, `EventCalendarItem`, `EventCalendarRule`, `EventCalendarByDay`, `EventCalendarFreq`, `EventCalendarOccurrence`, `EventCalendarFields`, `EventCalendarProblem`, `EventCalendarOpen`, `UidEventCalendarProps`.

## Texte

Beschriftungen kommen aus dem Locale-Paket, Abschnitt `eventCalendar` (siehe [i18n](./i18n.md)); das Kalenderraster selbst nutzt `calendar` und `datePicker`. Problemmeldungen in `problems` sind auf Englisch.
