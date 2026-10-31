---
'@dskripchenko/ui': minor
---

UidBoard and UidCalendar: paging, card fields, per-event editing and month-grid resize. Everything is opt-in; existing props, events and slots behave as before.

- **UidBoard**: `BoardColumn.total` — the real count when only some cards are loaded (the header count, the WIP check and its styling use it); a `column-footer` slot `{ column }` at the bottom of each column (with lanes — once, below the last lane), e.g. for «Load more»; card fields `assignee` (name, or `{ name, avatar?, color? }`, shown as initials or the picture), `due` (formatted in the kit's locale, overdue before `today`) and `done` (muted, never overdue); a `today` prop. New type `BoardAssignee`.
- **UidCalendar**: `CalendarEvent.editable: false` keeps one event from being dragged or resized in an editable calendar; all-day and multi-day events get a resize handle at their end in the month grid and the all-day row, emitting `event-move` with the new inclusive `endDate`; a `selectable` prop (defaults to `editable`) makes `slot-click` work in a read-only calendar. `CalendarEventMove`, `CalendarSlot`, `CalendarRange` and `CalendarView` are now exported from the package.
- New locale keys: `board.due`, `board.overdue`, `board.assignee`, `calendar.resize`.
- New docs pages: board and calendar, in English, Russian, German and Chinese.
