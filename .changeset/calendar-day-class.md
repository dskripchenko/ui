---
"@dskripchenko/ui": minor
---

UidCalendar: a `dayClass` prop (`(iso) => CalendarDayClass`, anything `:class` takes) adds classes to a day cell of the month grid — weekends, holidays, days off of a working calendar; a `title` slot (`{ title, view, range }`) replaces the text of the header's title, the arrows and the view switcher stay; a `todayButton` prop (default `true`) hides the Today button. The `CalendarDayClass` type is exported.
