<script setup lang="ts">
import './UidTable.css'
import { computed } from 'vue'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidSpinner from '../Spinner/UidSpinner.vue'

export interface UidTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface UidTableProps {
  columns: UidTableColumn[]
  data: Record<string, unknown>[]
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  loading?: boolean
  emptyText?: string
  striped?: boolean
  bordered?: boolean
}

const props = withDefaults(defineProps<UidTableProps>(), {
  sortKey: undefined,
  sortDirection: 'asc',
  loading: false,
  emptyText: 'Нет данных',
  striped: false,
  bordered: false,
})

const emit = defineEmits<{
  'update:sortKey': [key: string]
  'update:sortDirection': [dir: 'asc' | 'desc']
}>()

defineSlots<{
  [key: string]: (row?: Record<string, unknown>) => unknown
}>()

function onSort(col: UidTableColumn): void {
  if (!col.sortable) return
  if (props.sortKey === col.key) {
    emit('update:sortDirection', props.sortDirection === 'asc' ? 'desc' : 'asc')
  } else {
    emit('update:sortKey', col.key)
    emit('update:sortDirection', 'asc')
  }
}

function sortIcon(col: UidTableColumn) {
  if (!col.sortable) return null
  if (props.sortKey !== col.key) return ArrowUpDown
  return props.sortDirection === 'asc' ? ArrowUp : ArrowDown
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
              v-for="col in columns"
              :key="col.key"
              class="uid-table__th"
              :class="[
                `uid-table__th--${col.align ?? 'left'}`,
                { 'uid-table__th--sortable': col.sortable },
                { 'uid-table__th--active': sortKey === col.key },
              ]"
              :style="col.width ? { width: col.width } : undefined"
              :aria-sort="sortKey === col.key
                ? (sortDirection === 'asc' ? 'ascending' : 'descending')
                : (col.sortable ? 'none' : undefined)"
              @click="onSort(col)"
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
                :colspan="columns.length"
                class="uid-table__td uid-table__td--center"
              >
                <UidSpinner size="md" />
              </td>
            </tr>
          </template>

          <template v-else-if="isEmpty">
            <tr>
              <td
                :colspan="columns.length"
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
            >
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
