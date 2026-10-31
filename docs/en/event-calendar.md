# Event calendar

`UidEventCalendar` shows events written as plain-text markup in [`UidCalendar`](./calendar.md) — day, week, month, year and agenda views. Repeats are expanded only for the days on screen. As with [`UidKanban`](./kanban.md), the markup is the single source of truth: every edit rewrites one line (two when one occurrence of a repeat is detached) and is emitted as `change` with the whole new text.

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

First an optional `# Title` and settings (`key: value`):

- `view` — the view shown first: `day`, `week`, `month`, `year` or `agenda`;
- `date` — the date shown first (`YYYY-MM-DD`);
- `tags` — a tone per tag: `tag=tone`, comma-separated (`info`, `success`, `warning`, `danger`, or any CSS colour).

Then one event per line:

- **When**: a date `2026-11-03` or a range `2026-11-10..2026-11-14`, then an optional time `10:00` or `10:00-11:00` (none — all day).
- **What**: the title, `#tags` (the first one gives the colour), `{properties}` at the end — `where`, `description` (markdown, shown in the details) or your own.
- **Repeats** start with `every` instead of a date — a subset of the RFC 5545 RRULE in words:

  | Line | Repeats |
  |---|---|
  | `every day`, `every 3 days` | every (third) day |
  | `every mon,wed`, `every 2 weeks fri` | on those weekdays, every (other) week |
  | `every month 15`, `every month last` | on that day of the month, on its last day |
  | `every month 2nd tue`, `every month last fri` | on the n-th / last weekday |
  | `every year 12-31` | every year on that date |

  Weekdays are `mon` … `sun`, full English names, or `пн` … `вс`. Bounds and exceptions go in the properties: `from` (the first date; needed for `count` and for "every N"), `until`, `count`, `except` (dates, comma-separated). `{rrule: FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=2}` takes a rule as it is, for one copied from iCal (`FREQ`, `INTERVAL`, `BYDAY`, `BYMONTHDAY`, `BYMONTH`, `COUNT`, `UNTIL`); a date before it becomes `from`.

`<!-- comments -->` are skipped and kept. Lines that are not events are reported in `parseEventCalendar(source).problems` and listed under the **Source** tab.

## Behaviour

A click on an event opens its details in a drawer and emits `open`.

With `editable` (and not `locked`): drag an event to another day or hour, stretch it in the day and week views, click an empty slot (or a day in the month view, or **+ Event**) for a new event. The **event builder** puts an event together from choices — date or range, all day or a time, the repeat ("every 2 weeks on Mon and Wed", "the last Friday of every month", until a date / N times), skipped dates — and shows the line it writes. Editing one occurrence of a repeat asks whether to change that one or the whole series: that one becomes an event of its own and the series skips its date (dragging an occurrence does the same); **Skip this date** only adds the date to `except`. The **Source** tab edits the markup with problems by line.

`locked` and `lockable` work as in [`UidKanban`](./kanban.md): `locked` is read-only whatever `editable` says, the lock button emits `lock`.

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `source` | `string` | `''` | The markup. A new value replaces the events unless it is the one the component has just emitted. |
| `editable` | `boolean` | `false` | Drag, resize, the event builder, the source tab. |
| `locked` | `boolean` | `false` | Read-only, whatever `editable` says. |
| `lockable` | `boolean` | `false` | Show the lock button. |
| `view` | `CalendarView \| ''` | `''` | The view shown first; empty — the markup's `view:`, else `month`. |
| `date` | `string` | `''` | The date shown first; empty — the markup's `date:`, else today. |
| `views` | `CalendarView[]` | all five | The views offered. |

The markup's `view:` and `date:` also apply when the markup arrives after the first render, unless the props set them or the reader has already moved.

## Events

| Event | Payload | |
|---|---|---|
| `change` | `string` | The whole new markup after an edit. |
| `lock` | `boolean` | The lock button was pressed: the requested `locked` state. |
| `open` | `{ id, date, title }` | An event was opened (`EventCalendarOpen`); `id` is the line's event, `date` the occurrence. |
| `range` | `{ view, start, end }` | The days on screen changed. |

## Functions

Pure and exported for use without the component. Event ids are positional (`ev-0`, `ev-1`, …); an occurrence of a repeat is `<id>@<date>`.

| Function | |
|---|---|
| `parseEventCalendar(source)` | → `EventCalendarDoc`: `title`, `settings`, `tagTones`, `items`, `problems`. |
| `parseEventLine(line)` | One event line → `EventCalendarItem`, or the reason it is not one (a string). |
| `parseEventRRule(text)` | `FREQ=…;…` → `EventCalendarRule`, or `null`. |
| `expandEventCalendar(doc, start, end)` | Every event and occurrence touching the days `start` … `end` → `EventCalendarOccurrence[]`. |
| `eventOccurrences(rule, start, end)` | The dates a rule produces in a range. |
| `eventRuleText(rule)` | A rule back in words (`every 2 weeks fri`). |
| `serializeCalendarEvent(fields)` | An event as its markup line. |
| `addCalendarEvent(source, fields)` | Appends an event. |
| `updateCalendarEvent(source, id, fields)` | Rewrites an event's line. |
| `removeCalendarEvent(source, id)` | Removes an event's line. |
| `detachCalendarOccurrence(source, id, date, fields)` | The series skips `date`; a single event (`fields`) is added under it. |

```ts
import { parseEventCalendar, expandEventCalendar } from '@dskripchenko/ui'

const shown = expandEventCalendar(parseEventCalendar(source), '2026-11-01', '2026-11-30')
```

Types: `EventCalendarDoc`, `EventCalendarItem`, `EventCalendarRule`, `EventCalendarByDay`, `EventCalendarFreq`, `EventCalendarOccurrence`, `EventCalendarFields`, `EventCalendarProblem`, `EventCalendarOpen`, `UidEventCalendarProps`.

## Texts

Captions come from the locale bag, section `eventCalendar` (see [i18n](./i18n.md)); the calendar grid itself uses `calendar` and `datePicker`. Problem messages in `problems` are in English.
