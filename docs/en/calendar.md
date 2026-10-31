# Calendar

`UidCalendar` is a calendar with day, week, month, year and agenda views. It shows events, picks a date (`v-model`) and, when `editable`, lets events be dragged and resized. Like the board, it does not change the events itself: it emits `event-move` and the host applies it. [`UidEventCalendar`](./event-calendar.md) is a markup-driven calendar built on it.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidCalendar, type CalendarEvent, type CalendarEventMove, type CalendarSlot, type CalendarView } from '@dskripchenko/ui'

const events = ref<CalendarEvent[]>([
  { id: 1, date: '2026-11-03', time: '10:00', endTime: '11:00', title: 'Release demo' },
  { id: 2, date: '2026-11-10', endDate: '2026-11-14', title: 'Code freeze' },
  { id: 3, date: '2026-11-20', title: 'Imported holiday', editable: false },
])
const view = ref<CalendarView>('month')

function onMove(m: CalendarEventMove): void {
  events.value = events.value.map((e) => (e === m.event
    ? { ...e, date: m.date, endDate: m.endDate, time: m.time ?? e.time, endTime: m.endTime ?? e.endTime }
    : e))
}

function onSlot(s: CalendarSlot): void {
  // open a "new event" form for s.date (and s.time)
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

## Events

| Field | Type | |
|---|---|---|
| `id` | `string \| number` | Optional id (used as the key). |
| `date` | `string` | `YYYY-MM-DD`: the first day. |
| `endDate` | `string` | The last day, **inclusive**: `date: '2026-11-10', endDate: '2026-11-14'` covers five days. Omitted or equal to `date` — one day. |
| `time`, `endTime` | `string` | `HH:MM`. Without `time` the event is all-day. |
| `title` | `string` | The title. |
| `color` | `string` | Any CSS colour. |
| `editable` | `boolean` | `false` — the event is neither draggable nor resizable (no handle) even when the calendar is `editable`; it still opens on click. `true` or omitted — it follows the calendar. |

## Behaviour

With `editable`:

- an event is dragged to another day (month, all-day row) or another day and time (day and week grid);
- a timed event is resized by its bottom edge in the day and week grid — the new `endTime`;
- an all-day or multi-day event is resized by the handle at its end (its right edge on its last day) in the month grid and in the all-day row — dragged across days it gives the new `endDate`, inclusive; it never goes before `date`.

Each finished drag emits `event-move` once; Escape cancels it.

`selectable` (by default the value of `editable`) makes a click on an empty slot emit `slot-click`: a time in the day and week grid (rounded down to half an hour), a day in the all-day row. So a read-only calendar can still offer "create here" with `selectable` alone. The cell cursor follows `selectable`.

A click on a day in the month view selects it: `update:modelValue`, `date-click`, `change`. In the year view a click on a day first opens it — `update:anchor`, and `update:view` to `day` when `views` offers it — and then selects it the same way, `date-click` included. Because the view changes first, a `date-click` listener that reads the current view (for example `v-model:view`) can tell this jump from a click in the month. A click on a month name in the year view only opens that month; a click on a day in the week header only opens that day.

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `events` | `CalendarEvent[]` | `[]` | The events. |
| `views` | `CalendarView[]` | `['month']` | The views offered; with more than one, a switcher is shown. |
| `editable` | `boolean` | `false` | Drag and resize events. |
| `selectable` | `boolean` | `editable` | Emit `slot-click` for clicks on empty slots. |
| `min`, `max` | `string` | — | `YYYY-MM-DD`: days outside cannot be selected. |
| `compact` | `boolean` | `false` | A smaller month grid. |
| `maxEventsPerDay` | `number` | `3` | Chips per day in the month; the rest go under "+N". |
| `todayLabel` | `string` | locale | The caption of the Today button. |
| `hourHeight` | `number` | `48` | Pixels per hour in the day and week grid. |
| `scrollToHour` | `number` | `8` | The hour the day and week grid scrolls to. |

`v-model` is the selected date, `v-model:view` the view, `v-model:anchor` the date the view is built around.

## Emitted events

| Event | Payload | |
|---|---|---|
| `event-click` | `CalendarEvent` | An event was clicked. |
| `event-move` | `CalendarEventMove` | `{ event, date, endDate?, time?, endTime? }`: the original event and where it goes. A move gives the new `date` (plus `endDate` for a multi-day event, `time`/`endTime` for a timed one); a resize in the time grid gives the new `endTime`; a resize in the month grid or the all-day row gives the new `endDate`. |
| `slot-click` | `CalendarSlot` | `{ date, time? }`: an empty slot was clicked (with `selectable`). |
| `date-click` | `string` | A day was selected. |
| `change` | `string \| null` | The selected date. |
| `range` | `CalendarRange` | `{ view, start, end }`: the days on screen changed — load the events for them. |

Types: `UidCalendarProps`, `CalendarEvent`, `CalendarEventMove`, `CalendarSlot`, `CalendarRange`, `CalendarView`.

## Texts

Captions come from the locale bag, sections `calendar` and `datePicker` (see [i18n](./i18n.md)); `calendar.resize` is the title of the resize handles.
