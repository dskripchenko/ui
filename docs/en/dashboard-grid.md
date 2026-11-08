# Dashboard grid

`UidDashboardGrid` lays items out on a grid of columns and rows, like a dashboard of widgets. Item `i` sits at column `x` and row `y` (both 0-based) and spans `w` columns and `h` rows; the grid's height follows its lowest item. In edit mode items are dragged by a handle the host renders, resized by a corner grip the grid renders, and moved or resized from the keyboard. The grid does not keep its own copy of the layout: after every finished gesture it emits a new array of items (`v-model:items`), and the host stores it.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidDashboardGrid, type DashboardGridItem } from '@dskripchenko/ui'

type Widget = DashboardGridItem & { title: string }

const editing = ref(false)
const items = ref<Widget[]>([
  { id: 'revenue', title: 'Revenue', x: 0, y: 0, w: 4, h: 2, minW: 2 },
  { id: 'orders', title: 'Orders', x: 4, y: 0, w: 4, h: 2 },
  { id: 'traffic', title: 'Traffic', x: 8, y: 0, w: 4, h: 4, minH: 2 },
  { id: 'notes', title: 'Notes', x: 0, y: 2, w: 8, h: 2, maxH: 3 },
])

function save(layout: DashboardGridItem[]): void {
  // persist the positions: one call per finished drag, resize or key press
}
</script>

<template>
  <UidDashboardGrid
    v-model:items="items"
    :editable="editing"
    :item-label="(item) => (item as Widget).title"
    label="Store overview"
    @change="save"
  >
    <template #item="{ item, editing: canEdit, handle }">
      <section class="widget">
        <header>
          <button v-if="canEdit" type="button" v-bind="handle">⠿</button>
          <h3>{{ (item as Widget).title }}</h3>
        </header>
        …
      </section>
    </template>
  </UidDashboardGrid>
</template>
```

## Items

| Field | Type | |
|---|---|---|
| `id` | `string \| number` | The item's id. |
| `x`, `y` | `number` | Column and row, 0-based. |
| `w`, `h` | `number` | Width in columns and height in rows. |
| `minW`, `minH`, `maxW`, `maxH` | `number` | Size limits, in cells. Width never exceeds `columns`. |

Items may carry any other fields: the emitted array holds the host's own objects with new `x`, `y`, `w`, `h` and everything else kept.

## Editing

With `editable`, the host binds `handle` on its own drag-handle element — usually a button in the item's header. Pressing it and moving the pointer (mouse, pen or touch) lifts the item: it follows the pointer slightly raised, a dashed placeholder with "Drop here · 4 × 2" shows the snapped cell, and the other items make room. Releasing drops it; Escape during the drag cancels it and restores the layout. The grip at the bottom-right corner of every item resizes it the same way.

Layout rules:

- positions and sizes snap to whole cells and are clamped to the columns and to `minW`…`maxH`;
- an item dropped onto others pushes them down; dragging an item down past another swaps them;
- then the layout is compacted vertically: every item floats up as far as it can, in reading order (by row, then by column). The result is deterministic and never overlaps.

`update:items` and `change` fire once per finished gesture, with the same new array, and only when something moved.

Without `editable`, the layout is static: `handle` is an empty object, there are no grips and nothing is draggable.

## Keyboard

The handle and the grip are focusable buttons.

| Keys | On the handle | On the grip |
|---|---|---|
| ←, →, ↑, ↓ | Move by one cell | Change the width or the height by one |
| Shift + arrows | Change the width or the height by one | — |
| Escape | Cancel a pointer drag in progress | Cancel a pointer resize in progress |

Moving down by one row when gravity would bring the item back moves it past the item below instead. Focus stays on the handle after a move. Each change is announced through a visually hidden live region ("Revenue moved to column 5, row 1", "Revenue resized to 6 × 3"); the handle's label carries the item's position and size, and a hidden hint explains the keys.

## Narrow containers

When the grid itself is narrower than `stackBelow` (640 px by default; measured with a `ResizeObserver`), items stack in one column in reading order, each `h × rowHeight` tall, and editing is off (`editing` is `false` in the slot, `handle` is empty).

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `items` | `DashboardGridItem[]` | — | The layout; use with `v-model:items`. |
| `columns` | `number` | `12` | Number of columns. |
| `rowHeight` | `number` | `80` | Height of one row, px. |
| `gap` | `number` | `16` | Gap between cells, px. |
| `editable` | `boolean` | `false` | Items can be moved and resized. |
| `stackBelow` | `number` | `640` | Container width, px, under which items stack in one column. |
| `label` | `string` | locale `label` | The grid's accessible name. |
| `itemLabel` | `(item) => string` | "Item 3" | An item's name in the handle and grip labels and in announcements. |

## Events

| Event | Payload | |
|---|---|---|
| `update:items` | `DashboardGridItem[]` | A new array after a drop, a resize or a key press. |
| `change` | `DashboardGridItem[]` | The same array; fired once per finished gesture. |

## Slots

| Slot | Props | |
|---|---|---|
| `item` | `{ item, editing, dragging, handle }` | The content of a cell. `editing` — the grid is editable and not stacked; `dragging` — this item is being dragged or resized; `handle` — `DashboardGridHandleBindings` to `v-bind` on the drag handle. |
| `placeholder` | `{ w, h }` | The text inside the drop placeholder. |

`handle` holds `onPointerdown`, `onKeydown`, `tabindex: 0`, `role: 'button'`, `aria-roledescription`, `aria-label`, `aria-describedby`, `aria-keyshortcuts` and `data-uid-grid-handle`. The grid gives the handle `cursor: grab` and `touch-action: none`.

Types: `UidDashboardGridProps`, `DashboardGridItem`, `DashboardGridHandleBindings`, `DashboardGridItemSlotProps`.

## Layout helpers

The rules above are pure functions, exported for use on a server or in tests. Each returns new objects in the order of its input and keeps extra fields.

| Function | |
|---|---|
| `collides(a, b)` | Whether two items overlap (never with itself). |
| `clampItem(item, columns)` | Snaps an item to whole cells, its limits and the columns. |
| `compactLayout(items, columns)` | Vertical compaction, resolving overlaps. |
| `moveItem(items, id, x, y, columns)` | Moves an item, resolves collisions and compacts. |
| `resizeItem(items, id, w, h, columns)` | Resizes an item, pushes what it covers and compacts. |
| `layoutHeight(items)` | The number of rows the layout takes. |
| `sortByPosition(items)` | The items in reading order. |
| `sameLayout(a, b)` | Whether two layouts put every item on the same cells. |

## Styling

The item wrapper has no visual style of its own — the host's content draws the card. Variables: `--uid-dashboard-grid-placeholder-bg` and `--uid-dashboard-grid-placeholder-border` (the accent by default). Transitions follow `--uid-duration-base` and are off under `prefers-reduced-motion`. Light and dark themes come from the theme tokens.

## Texts

Captions come from the locale bag, section `dashboardGrid` (see [i18n](./i18n.md)): `label`, `item(n)`, `handleRole`, `handle(title, x, y, w, h)`, `resize(title, w, h)`, `hint`, `dropHere(w, h)`, `moved(title, x, y)`, `resized(title, w, h)`, `cancelled(title)`. Columns and rows in the texts are 1-based.
