/**
 * Pure layout helpers of UidDashboardGrid: a grid of `columns` columns and
 * unbounded rows; an item sits at column `x`, row `y` (both 0-based) and
 * spans `w` columns and `h` rows. Every helper returns new objects in the
 * order of its input and keeps any extra fields of the items.
 */

export interface DashboardGridItem {
  id: string | number
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

function int(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.round(value) : fallback
}

/** Whether two items overlap. An item never collides with itself (same id). */
export function collides(a: DashboardGridItem, b: DashboardGridItem): boolean {
  if (a.id === b.id) return false
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

/** Snaps an item to whole cells, its min/max size and the column count. */
export function clampItem<T extends DashboardGridItem>(item: T, columns: number): T {
  const cols = Math.max(1, Math.floor(columns))
  const minW = Math.min(Math.max(1, item.minW ?? 1), cols)
  const maxW = Math.max(minW, Math.min(item.maxW ?? cols, cols))
  const minH = Math.max(1, item.minH ?? 1)
  const maxH = Math.max(minH, item.maxH ?? Infinity)
  const w = Math.min(Math.max(int(item.w, minW), minW), maxW)
  const h = Math.min(Math.max(int(item.h, minH), minH), maxH)
  const x = Math.min(Math.max(int(item.x, 0), 0), cols - w)
  const y = Math.max(int(item.y, 0), 0)
  return { ...item, x, y, w, h }
}

/** The number of rows the layout takes: the bottom edge of its lowest item. */
export function layoutHeight(items: readonly DashboardGridItem[]): number {
  return items.reduce((max, item) => Math.max(max, item.y + item.h), 0)
}

/** The items in reading order: by row, then by column. */
export function sortByPosition<T extends DashboardGridItem>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.y - b.item.y || a.item.x - b.item.x || a.index - b.index)
    .map(({ item }) => item)
}

function inInputOrder<T extends DashboardGridItem>(input: readonly T[], placed: readonly T[]): T[] {
  const byId = new Map(placed.map(item => [item.id, item]))
  return input.map(item => byId.get(item.id) ?? item)
}

/**
 * Vertical compaction: in reading order, every item floats up as far as it
 * can without overlapping the items placed before it; an item that still
 * overlaps one of them drops below it. The result never overlaps.
 */
export function compactLayout<T extends DashboardGridItem>(items: readonly T[], columns: number): T[] {
  const clamped = items.map(item => clampItem(item, columns))
  const placed: T[] = []
  for (const source of sortByPosition(clamped)) {
    const item = { ...source }
    while (item.y > 0 && !placed.some(other => collides({ ...item, y: item.y - 1 }, other))) item.y -= 1
    let hit = placed.find(other => collides(item, other))
    while (hit) {
      item.y = hit.y + hit.h
      hit = placed.find(other => collides(item, other))
    }
    placed.push(item)
  }
  return inInputOrder(clamped, placed)
}

/** Moves item `index` to row `y` and pushes whatever it then overlaps further down. */
function pushDown<T extends DashboardGridItem>(layout: T[], index: number, y: number, fixed: T['id']): void {
  const moved = { ...(layout[index] as T), y }
  layout[index] = moved
  for (const { id } of sortByPosition(layout)) {
    const at = layout.findIndex(item => item.id === id)
    if (id === fixed || !collides(moved, layout[at] as T)) continue
    pushDown(layout, at, moved.y + moved.h, fixed)
  }
}

/**
 * Places item `id` on its new cell and resolves the overlaps: an item it
 * lands on moves up above it when that spot is free (so dragging an item
 * down past another swaps them), otherwise it is pushed down, along with
 * whatever it then overlaps. The layout is compacted afterwards.
 */
function settle<T extends DashboardGridItem>(items: readonly T[], target: T, columns: number, allowSwap: boolean): T[] {
  const layout = items.map(item => (item.id === target.id ? target : clampItem(item, columns)))
  for (const { id } of sortByPosition(layout)) {
    const at = layout.findIndex(item => item.id === id)
    const current = layout[at] as T
    if (!collides(target, current)) continue
    const above = { ...current, y: target.y - current.h }
    if (allowSwap && above.y >= 0 && !layout.some(item => collides(above, item))) {
      layout[at] = above
      continue
    }
    pushDown(layout, at, target.y + target.h, target.id)
  }
  return compactLayout(layout, columns)
}

/** Moves item `id` to column `x`, row `y` (clamped), then resolves overlaps and compacts. */
export function moveItem<T extends DashboardGridItem>(
  items: readonly T[],
  id: T['id'],
  x: number,
  y: number,
  columns: number,
): T[] {
  const item = items.find(i => i.id === id)
  if (!item) return compactLayout(items, columns)
  return settle(items, clampItem({ ...item, x, y }, columns), columns, true)
}

/**
 * Resizes item `id` to `w` × `h` (clamped to its min/max and to the columns
 * right of it), pushes the items it now overlaps down and compacts.
 */
export function resizeItem<T extends DashboardGridItem>(
  items: readonly T[],
  id: T['id'],
  w: number,
  h: number,
  columns: number,
): T[] {
  const item = items.find(i => i.id === id)
  if (!item) return compactLayout(items, columns)
  const start = clampItem(item, columns)
  const cols = Math.max(1, Math.floor(columns))
  const sized = clampItem({ ...start, w: Math.min(w, cols - start.x), h }, columns)
  return settle(items, { ...sized, x: start.x }, columns, false)
}

/** Whether two layouts put every item on the same cells. */
export function sameLayout(a: readonly DashboardGridItem[], b: readonly DashboardGridItem[]): boolean {
  if (a.length !== b.length) return false
  const byId = new Map(b.map(item => [item.id, item]))
  return a.every((item) => {
    const other = byId.get(item.id)
    return !!other && other.x === item.x && other.y === item.y && other.w === item.w && other.h === item.h
  })
}
