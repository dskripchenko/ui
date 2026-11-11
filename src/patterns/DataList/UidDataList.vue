<script setup lang="ts" generic="T">
import { Search } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import UidSkeleton from '../../components/Skeleton/UidSkeleton.vue'
import './UidDataList.css'

export interface UidDataListChip {
  key: string
  label: string
  count?: number
}

export interface UidDataListColumn {
  key: string
  label: string
  /** A CSS grid track, e.g. "120px" or "minmax(0, 1fr)". */
  width?: string
}

export interface UidDataListGroup<R> {
  key: string
  title: string
  /** After the title: "4 channels · 2 new". */
  summary?: string
  items: R[]
}

export interface UidDataListProps<R> {
  /** Rows, or rows in groups. */
  items?: R[]
  groups?: UidDataListGroup<R>[]
  /** A stable key of a row. */
  rowKey: (row: R) => string | number
  columns: UidDataListColumn[]
  /** The search field's text; null — no field. */
  searchLabel?: string | null
  /** Filter chips: one is chosen. */
  chips?: UidDataListChip[]
  loading?: boolean
  /** The list's accessible name. */
  label: string
}

const props = withDefaults(defineProps<UidDataListProps<T>>(), {
  items: () => [],
  groups: undefined,
  searchLabel: null,
  chips: () => [],
  loading: false,
})

const query = defineModel<string>('query', { default: '' })
const chip = defineModel<string | null>('chip', { default: null })

defineSlots<{
  /** One row: its cells, in the columns' order. */
  row(props: { row: T }): unknown
  /** Dropdown filters next to the search: project, order, grouping. */
  filters?(): unknown
  /** Nothing matches: what to do next. */
  empty?(): unknown
  /** Under the list: "Shown 8 of 186". */
  footer?(): unknown
}>()

const field = ref<HTMLInputElement | null>(null)
const template = computed(() => props.columns.map((c) => c.width ?? 'minmax(0, 1fr)').join(' '))
const groups = computed<UidDataListGroup<T>[]>(() => props.groups ?? [{ key: '', title: '', items: props.items }])
const empty = computed(() => !props.loading && groups.value.every((g) => g.items.length === 0))

// "/" puts the cursor into the search, as in the field's hint.
function slash(event: KeyboardEvent): void {
  if (event.key !== '/' || props.searchLabel === null || event.defaultPrevented) return
  const target = event.target as HTMLElement | null
  if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
  event.preventDefault()
  field.value?.focus()
}
onMounted(() => document.addEventListener('keydown', slash))
onBeforeUnmount(() => document.removeEventListener('keydown', slash))
</script>

<template>
  <div class="uid-data-list">
    <div
      v-if="searchLabel !== null || $slots.filters"
      class="uid-data-list__bar"
    >
      <label
        v-if="searchLabel !== null"
        class="uid-data-list__search"
      >
        <Search
          :size="14"
          aria-hidden="true"
        />
        <input
          ref="field"
          v-model="query"
          type="search"
          :placeholder="searchLabel"
          :aria-label="searchLabel"
          class="uid-data-list__input"
        >
        <kbd
          class="uid-data-list__kbd"
          aria-hidden="true"
        >/</kbd>
      </label>
      <slot name="filters" />
    </div>
    <div
      v-if="chips.length > 0"
      class="uid-data-list__chips"
      role="group"
      :aria-label="label"
    >
      <button
        v-for="c in chips"
        :key="c.key"
        type="button"
        class="uid-data-list__chip"
        :class="{ 'uid-data-list__chip--on': chip === c.key }"
        :aria-pressed="chip === c.key"
        @click="chip = c.key"
      >
        {{ c.label }}<span
          v-if="c.count !== undefined"
          class="uid-data-list__chip-count"
        >{{ c.count }}</span>
      </button>
    </div>
    <div
      class="uid-data-list__table"
      role="table"
      :aria-label="label"
      :aria-busy="loading || undefined"
      :style="{ '--uid-data-list-columns': template }"
    >
      <div
        class="uid-data-list__head"
        role="row"
      >
        <span
          v-for="c in columns"
          :key="c.key"
          class="uid-data-list__th"
          role="columnheader"
        >{{ c.label }}</span>
      </div>
      <template v-if="loading">
        <div
          v-for="n in 6"
          :key="n"
          class="uid-data-list__row uid-data-list__row--skeleton"
          role="row"
        >
          <UidSkeleton
            v-for="c in columns"
            :key="c.key"
            height="14px"
            role="cell"
          />
        </div>
      </template>
      <div
        v-else-if="empty"
        class="uid-data-list__empty"
        role="row"
      >
        <div role="cell">
          <slot name="empty" />
        </div>
      </div>
      <template v-else>
        <div
          v-for="g in groups"
          :key="g.key"
          class="uid-data-list__group"
          role="rowgroup"
        >
          <div
            v-if="g.title"
            class="uid-data-list__group-head"
            role="row"
          >
            <span role="cell">
              <b>{{ g.title }}</b><span
                v-if="g.summary"
                class="uid-data-list__group-summary"
              > · {{ g.summary }}</span>
            </span>
          </div>
          <div
            v-for="r in g.items"
            :key="rowKey(r)"
            class="uid-data-list__row"
            role="row"
          >
            <slot
              name="row"
              :row="r"
            />
          </div>
        </div>
      </template>
    </div>
    <div
      v-if="$slots.footer"
      class="uid-data-list__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
