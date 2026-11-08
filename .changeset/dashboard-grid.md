---
'@dskripchenko/ui': minor
---

UidDashboardGrid: a dashboard grid of items placed by column and row (`x`, `y`, `w`, `h`, with min/max sizes) and edited through `v-model:items`. In edit mode items are dragged by a handle the host binds (`v-bind="handle"`, pointer events for mouse, pen and touch), resized by a corner grip, and moved or resized from the keyboard (arrows, Shift+arrows) with live announcements; a dashed placeholder shows the snapped target, Escape cancels a drag. Collisions push items down, then the layout is compacted vertically. Under `stackBelow` the items stack in one column. No dependencies. Also exports the pure layout helpers (`collides`, `clampItem`, `compactLayout`, `moveItem`, `resizeItem`, `layoutHeight`, `sortByPosition`, `sameLayout`) and the `dashboardGrid` locale strings (en, ru).
