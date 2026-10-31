---
'@dskripchenko/ui': minor
---

UidCalendar: day, week, year and agenda views besides the month (`v-model:view`, `views` for the switcher, `v-model:anchor` for the shown date), events with a time (`time`, `endTime`) and across days (`endDate`), overlapping events side by side in the time grid, a `range` event with the visible days, and with `editable` drag-to-move, resize and `slot-click` on an empty slot (`event-move`). The month view stays as before when no other view is asked for.

UidBoard: `readonly` — cards open on click and Enter but cannot be dragged or moved with Alt+arrows (for boards shown to people who may not change them).
