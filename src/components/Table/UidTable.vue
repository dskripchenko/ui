<script setup lang="ts">
import './UidTable.css'
import { computed } from 'vue'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidSpinner from '../Spinner/UidSpinner.vue'
import UidCheckbox from '../Checkbox/UidCheckbox.vue'

export interface UidTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
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
  /** Включить колонку чекбоксов слева (header + per-row). */
  selectable?: boolean
  /** Set ID-шников выбранных строк. */
  selection?: Set<string | number>
  /** Поле id-строки. По умолчанию — `id`. */
  rowKey?: string | ((row: Record<string, unknown>) => string | number)
}

const props = withDefaults(defineProps<UidTableProps>(), {
  sortKey: undefined,
  sortDirection: null,
  loading: false,
  emptyText: 'Нет данных',
  striped: false,
  bordered: false,
  selectable: false,
  selection: () => new Set(),
  rowKey: 'id',
})

const emit = defineEmits<{
  'update:sortKey': [key: string | null]
  'update:sortDirection': [dir: SortDirection]
  'update:selection': [selection: Set<string | number>]
  'row-click': [row: Record<string, unknown>]
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
 * 3-режимная сортировка. Click по same key → asc → desc → off.
 * Click по другому key → asc.
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

function onRowCheckbox(row: Record<string, unknown>, checked: boolean): void {
  const next = new Set<string | number>(props.selection)
  const id = rowId(row)
  if (checked) next.add(id)
  else next.delete(id)
  emit('update:selection', next)
}

const isEmpty = computed(() => !props.loading && props.data.length === 0)
</script>

<template>
  <div
    class="uid-table-wrap"
    :class="{ 'uid-table-wrap--bordered': bordered }"
  >
    <div class="uid-table-scroll">
      <table
        class="uid-table"
        :class="{ 'uid-table--striped': striped }"
      >
        <thead class="uid-table__head">
          <tr>
            <th
              v-if="selectable"
              class="uid-table__th uid-table__th--select"
              scope="col"
            >
              <UidCheckbox
                :model-value="allSelected"
                :indeterminate="headerIndeterminate"
                aria-label="Выделить всё"
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
              ]"
              :style="col.width ? { width: col.width } : undefined"
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
                  {{ emptyText }}
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
              @click="emit('row-click', row)"
            >
              <td
                v-if="selectable"
                class="uid-table__td uid-table__td--select"
                @click.stop
              >
                <UidCheckbox
                  :model-value="selection.has(rowId(row))"
                  :aria-label="`Строка ${rowId(row)}`"
                  @update:model-value="(v) => onRowCheckbox(row, v)"
                />
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                class="uid-table__td"
                :class="`uid-table__td--${col.align ?? 'left'}`"
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
