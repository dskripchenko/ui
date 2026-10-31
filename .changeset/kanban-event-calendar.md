---
'@dskripchenko/ui': minor
---

New `UidKanban` and `UidEventCalendar`: a kanban board and an event calendar driven by plain-text markup. Cards move between columns and lanes, events repeat (`every 2 weeks fri`, `every month last fri`, RRULE), an event builder and a source tab edit the markup, and every edit is emitted as `change` with the new text, touching only the lines it changes. The markup functions (`parseKanban`, `moveKanbanCard`, `parseEventCalendar`, `expandEventCalendar`, …) are exported for use without the components. Captions live in the new `kanban` and `eventCalendar` locale sections.
