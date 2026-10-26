---
'@dskripchenko/ui': minor
---

`UidBoard` — a Kanban board: columns with counts and work-in-progress limits,
swimlanes, drag and drop with the neighbours of the drop point for ranking,
per-card allowed target columns, and a keyboard alternative (Alt+←/→ moves a
card to the nearest allowed column, Enter opens it). The board never mutates
its props: it emits `move` and `open`, the host saves and re-renders.
