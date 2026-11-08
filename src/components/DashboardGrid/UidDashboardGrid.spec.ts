import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import UidDashboardGrid from './UidDashboardGrid.vue'
import type { DashboardGridItemSlotProps } from './UidDashboardGrid.vue'
import {
  clampItem,
  collides,
  compactLayout,
  layoutHeight,
  moveItem,
  resizeItem,
  sameLayout,
  sortByPosition,
  type DashboardGridItem,
} from './dashboardGridMath.js'

type Item = DashboardGridItem & { title?: string }

function overlaps(items: readonly DashboardGridItem[]): boolean {
  return items.some((a, i) => items.some((b, j) => i < j && collides(a, b)))
}

function at(items: readonly DashboardGridItem[], id: DashboardGridItem['id']) {
  const i = items.find(item => item.id === id)
  return i ? { x: i.x, y: i.y, w: i.w, h: i.h } : null
}

/** Three full-width rows: a (row 0), b (row 1), c (row 2). */
const rows: Item[] = [
  { id: 'a', x: 0, y: 0, w: 12, h: 1 },
  { id: 'b', x: 0, y: 1, w: 12, h: 1 },
  { id: 'c', x: 0, y: 2, w: 12, h: 1 },
]

describe('dashboardGridMath', () => {
  it('collides only on a real overlap, never with itself', () => {
    const a = { id: 1, x: 0, y: 0, w: 2, h: 2 }
    expect(collides(a, { id: 2, x: 1, y: 1, w: 2, h: 2 })).toBe(true)
    expect(collides(a, { id: 2, x: 2, y: 0, w: 2, h: 2 })).toBe(false)
    expect(collides(a, { id: 2, x: 0, y: 2, w: 2, h: 2 })).toBe(false)
    expect(collides(a, { ...a })).toBe(false)
  })

  it('clamps to the columns, min/max sizes and whole cells', () => {
    expect(clampItem({ id: 1, x: 10, y: -2, w: 4, h: 1 }, 12)).toMatchObject({ x: 8, y: 0, w: 4, h: 1 })
    expect(clampItem({ id: 1, x: 0, y: 0, w: 20, h: 0 }, 12)).toMatchObject({ w: 12, h: 1 })
    expect(clampItem({ id: 1, x: 0, y: 0, w: 1, h: 9, minW: 3, maxH: 4 }, 12)).toMatchObject({ w: 3, h: 4 })
    expect(clampItem({ id: 1, x: 1.4, y: 2.6, w: 2.5, h: 1.2 }, 12)).toMatchObject({ x: 1, y: 3, w: 3, h: 1 })
    // A minimum wider than the grid gives way to the grid.
    expect(clampItem({ id: 1, x: 0, y: 0, w: 2, h: 1, minW: 8 }, 4)).toMatchObject({ w: 4 })
  })

  it('keeps extra fields and the input order', () => {
    const items: Item[] = [{ id: 'b', x: 0, y: 5, w: 2, h: 1, title: 'B' }, { id: 'a', x: 0, y: 0, w: 2, h: 1 }]
    const out = compactLayout(items, 12)
    expect(out.map(i => i.id)).toEqual(['b', 'a'])
    expect(out[0]).toMatchObject({ title: 'B', y: 1 })
    expect(out[0]).not.toBe(items[0])
  })

  it('compacts vertically: items float up as far as they can', () => {
    const out = compactLayout([
      { id: 1, x: 0, y: 3, w: 6, h: 2 },
      { id: 2, x: 6, y: 7, w: 6, h: 1 },
      { id: 3, x: 0, y: 9, w: 12, h: 1 },
    ], 12)
    expect(out.map(i => i.y)).toEqual([0, 0, 2])
  })

  it('compaction resolves overlaps deterministically', () => {
    const out = compactLayout([
      { id: 1, x: 0, y: 0, w: 6, h: 2 },
      { id: 2, x: 3, y: 0, w: 6, h: 1 },
      { id: 3, x: 0, y: 0, w: 2, h: 1 },
    ], 12)
    expect(overlaps(out)).toBe(false)
    expect(out.map(i => [i.x, i.y])).toEqual([[0, 0], [3, 2], [0, 2]])
    expect(compactLayout(out, 12)).toEqual(out)
  })

  it('moves an item down past another: they swap', () => {
    const out = moveItem(rows, 'a', 0, 1, 12)
    expect(out.map(i => i.y)).toEqual([1, 0, 2])
  })

  it('moves an item up: the one in the way is pushed down', () => {
    const out = moveItem(rows, 'c', 0, 0, 12)
    expect(out.map(i => [i.id, i.y])).toEqual([['a', 1], ['b', 2], ['c', 0]])
  })

  it('pushes a chain of items down', () => {
    const items = [
      { id: 'big', x: 0, y: 0, w: 4, h: 2 },
      { id: 'p', x: 4, y: 0, w: 4, h: 1 },
      { id: 'q', x: 4, y: 1, w: 4, h: 3 },
    ]
    const out = moveItem(items, 'big', 4, 0, 12)
    expect(at(out, 'big')).toEqual({ x: 4, y: 0, w: 4, h: 2 })
    expect(at(out, 'p')!.y).toBe(2)
    expect(at(out, 'q')!.y).toBe(3)
    expect(overlaps(out)).toBe(false)
  })

  it('clamps a move to the grid', () => {
    const out = moveItem([{ id: 1, x: 0, y: 0, w: 4, h: 1 }], 1, 20, -3, 12)
    expect(at(out, 1)).toEqual({ x: 8, y: 0, w: 4, h: 1 })
  })

  it('moves sideways into an empty spot and keeps the rest', () => {
    const items = [
      { id: 1, x: 0, y: 0, w: 4, h: 2 },
      { id: 2, x: 4, y: 0, w: 4, h: 2 },
    ]
    const out = moveItem(items, 2, 8, 0, 12)
    expect(out.map(i => [i.x, i.y])).toEqual([[0, 0], [8, 0]])
  })

  it('resizes within limits and pushes what it now covers', () => {
    const items = [
      { id: 1, x: 0, y: 0, w: 4, h: 1, maxW: 6 },
      { id: 2, x: 4, y: 0, w: 4, h: 1 },
    ]
    const out = resizeItem(items, 1, 10, 2, 12)
    expect(at(out, 1)).toEqual({ x: 0, y: 0, w: 6, h: 2 })
    expect(at(out, 2)).toEqual({ x: 4, y: 2, w: 4, h: 1 })
    // Not wider than the columns right of the item.
    expect(at(resizeItem([{ id: 1, x: 9, y: 0, w: 2, h: 1 }], 1, 8, 1, 12), 1)!.w).toBe(3)
    expect(at(resizeItem([{ id: 1, x: 0, y: 0, w: 2, h: 2, minH: 2 }], 1, 2, 1, 12), 1)!.h).toBe(2)
  })

  it('never overlaps after random moves and resizes', () => {
    let seed = 7
    const rand = (n: number) => { seed = (seed * 16807) % 2147483647; return seed % n }
    let items: DashboardGridItem[] = Array.from({ length: 10 }, (_, i) => ({ id: i, x: rand(10), y: rand(8), w: 1 + rand(4), h: 1 + rand(3) }))
    items = compactLayout(items, 12)
    for (let step = 0; step < 200; step++) {
      const id = rand(10)
      items = step % 3 === 0
        ? resizeItem(items, id, 1 + rand(6), 1 + rand(4), 12)
        : moveItem(items, id, rand(12), rand(10), 12)
      expect(overlaps(items)).toBe(false)
      expect(compactLayout(items, 12)).toEqual(items)
    }
  })

  it('reports the height, reading order and equal layouts', () => {
    expect(layoutHeight(rows)).toBe(3)
    expect(layoutHeight([])).toBe(0)
    expect(sortByPosition([{ id: 2, x: 6, y: 0, w: 1, h: 1 }, { id: 1, x: 0, y: 0, w: 1, h: 1 }, { id: 0, x: 0, y: 1, w: 1, h: 1 }]).map(i => i.id))
      .toEqual([1, 2, 0])
    expect(sameLayout(rows, rows.map(i => ({ ...i })))).toBe(true)
    expect(sameLayout(rows, moveItem(rows, 'a', 0, 1, 12))).toBe(false)
  })
})

// ---------- component ----------

const cards: Item[] = [
  { id: 'a', x: 0, y: 0, w: 6, h: 2, title: 'Alpha' },
  { id: 'b', x: 6, y: 0, w: 6, h: 2, title: 'Beta' },
  { id: 'c', x: 0, y: 2, w: 12, h: 1, title: 'Gamma' },
]

function make(props: Record<string, unknown> = {}) {
  return mount(UidDashboardGrid, {
    props: { items: cards, ...props },
    attachTo: document.body,
    slots: {
      item: ({ item, handle, editing, dragging }: DashboardGridItemSlotProps) =>
        h('article', { class: 'card', 'data-editing': String(editing), 'data-dragging': String(dragging) }, [
          h('button', { class: 'handle', type: 'button', ...handle }, '⠿'),
          h('span', (item as Item).title),
        ]),
    },
  })
}

/** Gives the grid a width (and the ResizeObserver a tick) so pixel deltas map to cells. */
function stubWidth(width: number) {
  const observers: (() => void)[] = []
  vi.stubGlobal('ResizeObserver', class {
    constructor(cb: () => void) { observers.push(cb) }
    observe() {}
    disconnect() {}
  })
  return {
    apply(el: Element) {
      (el as HTMLElement).getBoundingClientRect = () => ({ width } as DOMRect)
      observers.forEach(cb => cb())
    },
  }
}

function pointer(target: EventTarget, type: string, x: number, y: number) {
  target.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0 }))
}

function vars(el: Element) {
  const s = (el as HTMLElement).style
  const v = (k: string) => s.getPropertyValue(`--uid-dashboard-grid-${k}`)
  return { x: v('x'), y: v('y'), w: v('w'), h: v('h') }
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('UidDashboardGrid', () => {
  it('places every item on its cell and sizes the grid to the lowest item', () => {
    const w = make({ columns: 12, rowHeight: 90, gap: 10, label: 'Sales' })
    const items = w.findAll('.uid-dashboard-grid__item')
    expect(items.map(i => i.attributes('data-id'))).toEqual(['a', 'b', 'c'])
    expect(vars(items[1]!.element)).toEqual({ x: '6', y: '0', w: '6', h: '2' })
    expect(vars(items[2]!.element)).toEqual({ x: '0', y: '2', w: '12', h: '1' })
    const root = w.element as HTMLElement
    expect(root.style.getPropertyValue('--uid-dashboard-grid-rows')).toBe('3')
    expect(root.style.getPropertyValue('--uid-dashboard-grid-row')).toBe('90px')
    expect(root.style.getPropertyValue('--uid-dashboard-grid-gap')).toBe('10px')
    expect(w.attributes('role')).toBe('group')
    expect(w.attributes('aria-label')).toBe('Sales')
  })

  it('is static when not editable: inert handles, no corners', () => {
    const w = make()
    const handle = w.find('.handle')
    expect(handle.attributes('tabindex')).toBeUndefined()
    expect(handle.attributes('data-uid-grid-handle')).toBeUndefined()
    expect(w.find('.uid-dashboard-grid__grip').exists()).toBe(false)
    expect(w.find('.card').attributes('data-editing')).toBe('false')
    pointer(handle.element, 'pointerdown', 0, 0)
    pointer(window, 'pointermove', 500, 300)
    pointer(window, 'pointerup', 500, 300)
    expect(w.emitted('update:items')).toBeUndefined()
  })

  it('binds the handle when editable', () => {
    const w = make({ editable: true })
    const handle = w.find('.handle')
    expect(handle.attributes('tabindex')).toBe('0')
    expect(handle.attributes('role')).toBe('button')
    expect(handle.attributes('data-uid-grid-handle')).toBe('a')
    expect(handle.attributes('aria-roledescription')).toBe('перемещаемый элемент')
    expect(handle.attributes('aria-label')).toBe('Переместить «Элемент 1»: столбец 1, строка 1, 6 × 2')
    expect(handle.attributes('aria-keyshortcuts')).toContain('Shift+ArrowRight')
    expect(w.findAll('.uid-dashboard-grid__grip')).toHaveLength(3)
    expect(w.find('.card').attributes('data-editing')).toBe('true')
  })

  it('drags an item by its handle and emits the new layout once', async () => {
    const size = stubWidth(1200 - 16) // a cell plus a gap is 100px wide
    const w = make({ editable: true, gap: 16, rowHeight: 84 }) // a row plus a gap is 100px high
    size.apply(w.element)
    const handle = w.find('[data-uid-grid-handle="c"]').element
    pointer(handle, 'pointerdown', 10, 10)
    pointer(window, 'pointermove', 10, -190) // two rows up
    await nextTick()
    const dragged = w.find('[data-id="c"]')
    expect(dragged.classes()).toContain('uid-dashboard-grid__item--dragging')
    expect((dragged.element as HTMLElement).style.transform).toBe('translate(0px, -200px)')
    expect(dragged.find('.card').attributes('data-dragging')).toBe('true')
    const placeholder = w.find('.uid-dashboard-grid__placeholder')
    expect(placeholder.text()).toBe('Отпустите здесь · 12 × 1')
    expect(vars(placeholder.element)).toMatchObject({ x: '0', y: '0' })
    // The others make room in the preview.
    expect(vars(w.find('[data-id="a"]').element).y).toBe('1')
    expect(w.emitted('update:items')).toBeUndefined()

    pointer(window, 'pointerup', 10, -190)
    await nextTick()
    const [payload] = w.emitted('update:items')![0] as [Item[]]
    expect(payload.map(i => [i.id, i.x, i.y])).toEqual([['a', 0, 1], ['b', 6, 1], ['c', 0, 0]])
    expect(payload[0]!.title).toBe('Alpha')
    expect(w.emitted('change')).toEqual([[payload]])
    expect(w.find('.uid-dashboard-grid__placeholder').exists()).toBe(false)
    expect(w.find('[aria-live]').text()).toBe('«Элемент 3» перемещён: столбец 1, строка 1')
  })

  it('drags sideways to a column', async () => {
    const size = stubWidth(1200 - 16)
    const w = make({ editable: true, items: [{ id: 'a', x: 0, y: 0, w: 4, h: 1 }] })
    size.apply(w.element)
    pointer(w.find('.handle').element, 'pointerdown', 0, 0)
    pointer(window, 'pointermove', 340, 20)
    pointer(window, 'pointerup', 340, 20)
    expect((w.emitted('update:items')![0]![0] as Item[])[0]).toMatchObject({ x: 3, y: 0 })
  })

  it('cancels a drag with Escape and restores the layout', async () => {
    const size = stubWidth(1200 - 16)
    const w = make({ editable: true, gap: 16, rowHeight: 84 })
    size.apply(w.element)
    pointer(w.find('[data-uid-grid-handle="c"]').element, 'pointerdown', 0, 0)
    pointer(window, 'pointermove', 0, -200)
    await nextTick()
    expect(vars(w.find('[data-id="a"]').element).y).toBe('1')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(vars(w.find('[data-id="a"]').element).y).toBe('0')
    expect(w.find('.uid-dashboard-grid__placeholder').exists()).toBe(false)
    pointer(window, 'pointerup', 0, -200)
    expect(w.emitted('update:items')).toBeUndefined()
    expect(w.find('[aria-live]').text()).toBe('«Элемент 3»: перемещение отменено')
  })

  it('does not emit when a drag ends where it began', () => {
    const w = make({ editable: true })
    pointer(w.find('.handle').element, 'pointerdown', 0, 0)
    pointer(window, 'pointermove', 5, 5)
    pointer(window, 'pointerup', 5, 5)
    expect(w.emitted('update:items')).toBeUndefined()
  })

  it('resizes by the corner grip', async () => {
    const size = stubWidth(1200 - 16)
    const w = make({ editable: true, gap: 16, rowHeight: 84 })
    size.apply(w.element)
    const grip = w.find('[data-uid-grid-grip="a"]').element
    pointer(grip, 'pointerdown', 0, 0)
    pointer(window, 'pointermove', -190, 110)
    await nextTick()
    const item = w.find('[data-id="a"]')
    expect(item.classes()).toContain('uid-dashboard-grid__item--resizing')
    expect((item.element as HTMLElement).style.getPropertyValue('--uid-dashboard-grid-dw')).toBe('-190px')
    expect(w.find('.uid-dashboard-grid__placeholder').text()).toBe('Отпустите здесь · 4 × 3')
    pointer(window, 'pointerup', -190, 110)
    await nextTick()
    const payload = w.emitted('update:items')![0]![0] as Item[]
    expect(at(payload, 'a')).toEqual({ x: 0, y: 0, w: 4, h: 3 })
    expect(at(payload, 'c')!.y).toBe(3)
    expect(w.find('[aria-live]').text()).toBe('«Элемент 1»: новый размер 4 × 3')
  })

  it('moves with arrow keys on the handle and keeps focus there', async () => {
    const w = make({ editable: true, items: rows })
    const handle = w.find('[data-uid-grid-handle="a"]')
    ;(handle.element as HTMLElement).focus()
    await handle.trigger('keydown', { key: 'ArrowDown' })
    const payload = w.emitted('update:items')![0]![0] as Item[]
    expect(payload.map(i => i.y)).toEqual([1, 0, 2])
    expect(w.find('[aria-live]').text()).toBe('«Элемент 1» перемещён: столбец 1, строка 2')
    await w.setProps({ items: payload })
    await nextTick()
    expect(document.activeElement).toBe(w.find('[data-uid-grid-handle="a"]').element)
  })

  it('moves sideways with arrows and stays inside the grid', async () => {
    const w = make({ editable: true, items: [{ id: 1, x: 0, y: 0, w: 4, h: 1 }] })
    const handle = w.find('[data-uid-grid-handle="1"]')
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    expect(w.emitted('update:items')).toBeUndefined()
    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect((w.emitted('update:items')![0]![0] as Item[])[0]).toMatchObject({ x: 1, y: 0 })
  })

  it('resizes with Shift+arrows on the handle and arrows on the grip', async () => {
    const w = make({ editable: true, items: [{ id: 1, x: 0, y: 0, w: 4, h: 2 }] })
    await w.find('[data-uid-grid-handle="1"]').trigger('keydown', { key: 'ArrowRight', shiftKey: true })
    expect((w.emitted('update:items')![0]![0] as Item[])[0]).toMatchObject({ w: 5, h: 2 })
    await w.find('[data-uid-grid-grip="1"]').trigger('keydown', { key: 'ArrowUp' })
    expect((w.emitted('update:items')![1]![0] as Item[])[0]).toMatchObject({ w: 4, h: 1 })
    expect(w.find('[aria-live]').text()).toBe('«Элемент 1»: новый размер 4 × 1')
    expect(w.find('[data-uid-grid-grip="1"]').attributes('aria-label')).toBe('Изменить размер «Элемент 1»: 4 × 2')
  })

  it('names items with itemLabel', async () => {
    const w = make({ editable: true, itemLabel: (item: Item) => item.title ?? '' })
    expect(w.find('[data-uid-grid-handle="b"]').attributes('aria-label')).toBe('Переместить «Beta»: столбец 7, строка 1, 6 × 2')
  })

  it('stacks in reading order under stackBelow and turns editing off', async () => {
    const size = stubWidth(500)
    const w = make({
      editable: true,
      items: [cards[2], cards[1], cards[0]],
    })
    size.apply(w.element)
    await nextTick()
    expect(w.classes()).toContain('uid-dashboard-grid--stacked')
    expect(w.findAll('.uid-dashboard-grid__item').map(i => i.attributes('data-id'))).toEqual(['a', 'b', 'c'])
    expect((w.find('[data-id="a"]').element as HTMLElement).style.getPropertyValue('--uid-dashboard-grid-h')).toBe('2')
    expect(w.find('.uid-dashboard-grid__grip').exists()).toBe(false)
    expect(w.find('.handle').attributes('data-uid-grid-handle')).toBeUndefined()
    expect(w.find('.card').attributes('data-editing')).toBe('false')
  })

  it('stays a grid at or above stackBelow', async () => {
    const size = stubWidth(800)
    const w = make({ editable: true, stackBelow: 800 })
    size.apply(w.element)
    await nextTick()
    expect(w.classes()).not.toContain('uid-dashboard-grid--stacked')
    expect(w.find('.uid-dashboard-grid__grip').exists()).toBe(true)
  })

  it('renders a custom placeholder', async () => {
    const size = stubWidth(1200 - 16)
    const w = mount(UidDashboardGrid, {
      props: { items: [{ id: 1, x: 0, y: 0, w: 2, h: 1 }], editable: true },
      attachTo: document.body,
      slots: {
        item: ({ handle }: DashboardGridItemSlotProps) => h('button', { class: 'handle', ...handle }),
        placeholder: ({ w: cw, h: ch }: { w: number; h: number }) => h('b', `${cw}/${ch}`),
      },
    })
    size.apply(w.element)
    pointer(w.find('.handle').element, 'pointerdown', 0, 0)
    pointer(window, 'pointermove', 300, 0)
    await nextTick()
    expect(w.find('.uid-dashboard-grid__placeholder').text()).toBe('2/1')
  })
})
