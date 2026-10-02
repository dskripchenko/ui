<script setup lang="ts">
import './UidTable.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidSpinner from '../Spinner/UidSpinner.vue'
import UidCheckbox from '../Checkbox/UidCheckbox.vue'
import { useLocale } from '../../composables/useLocale.js'


export interface UidTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
  /**
   * Pin the column to the left or right edge while the table scrolls horizontally.
   * Put left-fixed columns first and right-fixed columns last.
   */
  fixed?: 'left' | 'right'
}

export type SortDirection = 'asc' | 'desc' | null

export interface UidTableProps {
  columns: UidTableColumn[]
  data: Record<string, unknown>[]
  sortKey?: string | null
  sortDirection?: SortDirection
  loading?: boolean
  emptyText?: string
  striped?: boolean
  bordered?: boolean
  /** Switch on the checkbox column on the left (the header plus every row). */
  selectable?: boolean
  /**
   * Pin the selection column to the left edge while the table scrolls horizontally.
   * By default it is pinned only together with `fixed: 'left'` columns;
   * `true` pins it on its own, `false` never pins it.
   */
  selectionFixed?: boolean
  /** The set of ids of the selected rows. */
  selection?: Set<string | number>
  /** The row's id field. `id` by default. */
  rowKey?: string | ((row: Record<string, unknown>) => string | number)
}

const props = withDefaults(defineProps<UidTableProps>(), {
  sortKey: undefined,
  sortDirection: null,
  loading: false,
  emptyText: undefined,
  striped: false,
  bordered: false,
  selectable: false,
  selectionFixed: undefined,
  selection: () => new Set(),
  rowKey: 'id',
})

const uidLocale = useLocale()

const emit = defineEmits<{
  'update:sortKey': [key: string | null]
  'update:sortDirection': [dir: SortDirection]
  'update:selection': [selection: Set<string | number>]
  /** The click event comes second, for hosts that need the target or modifiers. */
  'row-click': [row: Record<string, unknown>, event: MouseEvent]
}>()

defineSlots<{
  [key: string]: (row?: Record<string, unknown>) => unknown
}>()

function rowId(row: Record<string, unknown>): string | number {
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  return (row[props.rowKey] ?? '') as string | number
}

const totalCols = computed<number>(() => props.columns.length + (props.selectable ? 1 : 0))

const allSelected = computed<boolean>(() => {
  if (!props.selectable || props.data.length === 0) return false
  return props.data.every((r) => props.selection.has(rowId(r)))
})

const someSelected = computed<boolean>(() => {
  if (!props.selectable) return false
  return props.data.some((r) => props.selection.has(rowId(r)))
})

const headerIndeterminate = computed<boolean>(
  () => props.selectable && someSelected.value && !allSelected.value,
)

/**
 * Three-state sorting. A click on the same key goes asc → desc → off.
 * A click on a different key gives asc.
 */
function onSort(col: UidTableColumn): void {
  if (!col.sortable) return

  if (props.sortKey === col.key) {
    if (props.sortDirection === 'asc') {
      emit('update:sortDirection', 'desc')
    } else if (props.sortDirection === 'desc') {
      emit('update:sortKey', null)
      emit('update:sortDirection', null)
    } else {
      emit('update:sortDirection', 'asc')
    }
  } else {
    emit('update:sortKey', col.key)
    emit('update:sortDirection', 'asc')
  }
}

function sortIcon(col: UidTableColumn) {
  if (!col.sortable) return null
  if (props.sortKey !== col.key) return ArrowUpDown
  if (props.sortDirection === 'asc') return ArrowUp
  if (props.sortDirection === 'desc') return ArrowDown
  return ArrowUpDown
}

function ariaSort(col: UidTableColumn): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortable) return undefined
  if (props.sortKey !== col.key) return 'none'
  if (props.sortDirection === 'asc') return 'ascending'
  if (props.sortDirection === 'desc') return 'descending'
  return 'none'
}

function onHeaderCheckbox(checked: boolean): void {
  const next = new Set<string | number>(props.selection)
  if (checked) {
    for (const r of props.data) next.add(rowId(r))
  } else {
    for (const r of props.data) next.delete(rowId(r))
  }
  emit('update:selection', next)
}

/**
 * What a click on a control inside a cell is meant for: the control. Such a
 * click — on a link, a button, an input, a switch, a cell editor, anything
 * marked `data-row-click-ignore` — is not a row click; neither is the end of
 * a text selection made inside the row.
 */
const ROW_CLICK_IGNORE = [
  'a[href]', 'button', 'input', 'select', 'textarea', 'label', 'summary',
  '[role="button"]', '[role="checkbox"]', '[role="switch"]', '[role="link"]',
  '[role="menuitem"]', '[role="option"]', '[role="combobox"]', '[role="textbox"]',
  '[contenteditable=""]', '[contenteditable="true"]', '[data-row-click-ignore]',
].join(', ')

function onRowClick(row: Record<string, unknown>, event: MouseEvent): void {
  const tr = event.currentTarget instanceof Element ? event.currentTarget : null
  const target = event.target instanceof Element ? event.target : null
  const hit = target?.closest(ROW_CLICK_IGNORE)
  if (hit && hit !== tr && (!tr || tr.contains(hit))) return
  const selection = typeof window !== 'undefined' ? window.getSelection?.() : null
  if (
    selection && !selection.isCollapsed && selection.toString().trim() !== ''
    && tr && selection.anchorNode && tr.contains(selection.anchorNode)
  ) return
  emit('row-click', row, event)
}

function onRowCheckbox(row: Record<string, unknown>, checked: boolean): void {
  const next = new Set<string | number>(props.selection)
  const id = rowId(row)
  if (checked) next.add(id)
  else next.delete(id)
  emit('update:selection', next)
}

const isEmpty = computed(() => !props.loading && props.data.length === 0)

// ---- Fixed (sticky) columns -------------------------------------------------

const scrollRef = ref<HTMLElement | null>(null)
const headRowRef = ref<HTMLTableRowElement | null>(null)

const hasFixedLeft = computed(() => props.columns.some(c => c.fixed === 'left'))
const hasFixedRight = computed(() => props.columns.some(c => c.fixed === 'right'))
/**
 * The selection column sticks to the left together with left-fixed columns,
 * or on its own with `selectionFixed`.
 */
const selectFixed = computed(() => props.selectable && (props.selectionFixed ?? hasFixedLeft.value))
const hasFixed = computed(() => hasFixedLeft.value || hasFixedRight.value || selectFixed.value)

/** Measured header cell widths, in DOM order (selection column first when present). */
const cellWidths = ref<number[]>([])
const pingLeft = ref(false)
const pingRight = ref(false)

function parsePx(width: string | undefined): number {
  if (!width) return 0
  const m = /^\s*(\d+(?:\.\d+)?)px\s*$/.exec(width)
  return m ? Number(m[1]) : 0
}

/** Width of the cell at `index` (DOM order): the measured one, else a px `width` from the column. */
function widthAt(index: number): number {
  const measured = cellWidths.value[index] ?? 0
  if (measured > 0) return measured
  const colIndex = index - (props.selectable ? 1 : 0)
  return colIndex >= 0 ? parsePx(props.columns[colIndex]?.width) : 40
}

const fixedOffsets = computed(() => {
  const left = new Map<string, number>()
  const right = new Map<string, number>()
  const shift = props.selectable ? 1 : 0
  let acc = selectFixed.value ? widthAt(0) : 0
  props.columns.forEach((col, i) => {
    if (col.fixed !== 'left') return
    left.set(col.key, acc)
    acc += widthAt(i + shift)
  })
  acc = 0
  for (let i = props.columns.length - 1; i >= 0; i--) {
    const col = props.columns[i]
    if (col.fixed !== 'right') continue
    right.set(col.key, acc)
    acc += widthAt(i + shift)
  }
  return { left, right }
})

const lastFixedLeftKey = computed(() => {
  const cols = props.columns.filter(c => c.fixed === 'left')
  return cols.length > 0 ? cols[cols.length - 1].key : null
})
const firstFixedRightKey = computed(() => props.columns.find(c => c.fixed === 'right')?.key ?? null)

function fixedClass(col: UidTableColumn): Record<string, boolean> {
  return {
    'uid-table__cell--fixed': !!col.fixed,
    'uid-table__cell--fixed-left': col.fixed === 'left',
    'uid-table__cell--fixed-right': col.fixed === 'right',
    'uid-table__cell--fixed-left-last': col.fixed === 'left' && col.key === lastFixedLeftKey.value,
    'uid-table__cell--fixed-right-first': col.fixed === 'right' && col.key === firstFixedRightKey.value,
  }
}

function fixedStyle(col: UidTableColumn): CSSProperties | undefined {
  if (col.fixed === 'left') return { left: `${fixedOffsets.value.left.get(col.key) ?? 0}px` }
  if (col.fixed === 'right') return { right: `${fixedOffsets.value.right.get(col.key) ?? 0}px` }
  return undefined
}

function thStyle(col: UidTableColumn): CSSProperties | undefined {
  const style: CSSProperties = { ...fixedStyle(col) }
  if (col.width) style.width = col.width
  return Object.keys(style).length > 0 ? style : undefined
}

const selectCellClass = computed(() => ({
  'uid-table__cell--fixed': selectFixed.value,
  'uid-table__cell--fixed-left': selectFixed.value,
  'uid-table__cell--fixed-left-last': selectFixed.value && lastFixedLeftKey.value === null,
}))
const selectCellStyle = computed<CSSProperties | undefined>(() => (selectFixed.value ? { left: '0px' } : undefined))

function measure(): void {
  if (!hasFixed.value) return
  const row = headRowRef.value
  if (row) cellWidths.value = Array.from(row.cells).map(c => c.offsetWidth)
  updatePing()
}

function updatePing(): void {
  const el = scrollRef.value
  if (!el || !hasFixed.value) {
    pingLeft.value = false
    pingRight.value = false
    return
  }
  pingLeft.value = el.scrollLeft > 0
  pingRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

let resizeObserver: ResizeObserver | null = null

function observe(): void {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (!hasFixed.value || typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(() => measure())
  if (scrollRef.value) resizeObserver.observe(scrollRef.value)
  const table = scrollRef.value?.querySelector('table')
  if (table) resizeObserver.observe(table)
}

onMounted(() => {
  measure()
  observe()
})

watch(
  () => [props.columns, props.data, props.selectable, props.selectionFixed, props.loading],
  () => nextTick(() => {
    measure()
    observe()
  }),
  { deep: false },
)

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div
    class="uid-table-wrap"
    :class="{ 'uid-table-wrap--bordered': bordered }"
  >
    <div
      ref="scrollRef"
      class="uid-table-scroll"
      :class="{
        'uid-table-scroll--ping-left': pingLeft,
        'uid-table-scroll--ping-right': pingRight,
      }"
      @scroll.passive="updatePing"
    >
      <table
        class="uid-table"
        :class="{ 'uid-table--striped': striped, 'uid-table--has-fixed': hasFixed }"
      >
        <thead class="uid-table__head">
          <tr ref="headRowRef">
            <th
              v-if="selectable"
              class="uid-table__th uid-table__th--select"
              :class="selectCellClass"
              :style="selectCellStyle"
              scope="col"
            >
              <UidCheckbox
                :model-value="allSelected"
                :indeterminate="headerIndeterminate"
                :aria-label="uidLocale.table.selectAll"
                @update:model-value="onHeaderCheckbox"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="uid-table__th"
              :class="[
                `uid-table__th--${col.align ?? 'left'}`,
                { 'uid-table__th--sortable': col.sortable },
                { 'uid-table__th--active': sortKey === col.key && sortDirection !== null },
                fixedClass(col),
              ]"
              :style="thStyle(col)"
              :tabindex="col.sortable ? 0 : undefined"
              :role="col.sortable ? 'button' : undefined"
              :aria-sort="ariaSort(col)"
              @click="onSort(col)"
              @keydown.enter.prevent="onSort(col)"
              @keydown.space.prevent="onSort(col)"
            >
              <span class="uid-table__th-content">
                {{ col.label }}
                <UidIcon
                  v-if="col.sortable"
                  :icon="sortIcon(col)!"
                  :size="14"
                  class="uid-table__sort-icon"
                />
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="uid-table__body">
          <template v-if="loading">
            <tr>
              <td
                :colspan="totalCols"
                class="uid-table__td uid-table__td--center"
              >
                <UidSpinner size="md" />
              </td>
            </tr>
          </template>

          <template v-else-if="isEmpty">
            <tr>
              <td
                :colspan="totalCols"
                class="uid-table__td uid-table__td--empty"
              >
                <slot name="empty">
                  {{ emptyText ?? uidLocale.table.empty }}
                </slot>
              </td>
            </tr>
          </template>

          <template v-else>
            <tr
              v-for="(row, idx) in data"
              :key="idx"
              class="uid-table__row"
              :class="{ 'uid-table__row--selected': selectable && selection.has(rowId(row)) }"
              @click="onRowClick(row, $event)"
            >
              <td
                v-if="selectable"
                class="uid-table__td uid-table__td--select"
                :class="selectCellClass"
                :style="selectCellStyle"
                @click.stop
              >
                <UidCheckbox
                  :model-value="selection.has(rowId(row))"
                  :aria-label="uidLocale.table.row(rowId(row))"
                  @update:model-value="(v) => onRowCheckbox(row, v)"
                />
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                class="uid-table__td"
                :class="[`uid-table__td--${col.align ?? 'left'}`, fixedClass(col)]"
                :style="fixedStyle(col)"
              >
                <slot
                  :name="col.key"
                  :row="row"
                >
                  {{ row[col.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
