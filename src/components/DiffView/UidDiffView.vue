<script setup lang="ts">
import './UidDiffView.css'
import { computed, ref, watch } from 'vue'
import { ChevronDown, ChevronRight, FileDiff } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import { diffCounts, diffPairs, diffRows, type DiffFile, type DiffRow } from './diff'

export interface UidDiffViewProps {
  files: DiffFile[]
  /** A heading over the files: what the change is. */
  title?: string
  /** Line by line, or the old and the new side by side. */
  mode?: 'unified' | 'split'
  /** Unchanged lines kept around each change; longer runs fold. */
  context?: number
  /** How many files are open at first, from the top. */
  open?: number
  /** The change was cut by its source: more files than shown. */
  truncated?: boolean
}

const props = withDefaults(defineProps<UidDiffViewProps>(), {
  title: undefined,
  mode: 'unified',
  context: 3,
  open: 1,
  truncated: false,
})

defineSlots<{
  /** Beside the totals in the heading: a link to the change at its source. */
  actions?(): unknown
}>()

const locale = useLocale()

const opened = ref<Set<number>>(new Set())
watch(() => [props.files, props.open] as const, () => {
  opened.value = new Set(props.files.map((_, i) => i).filter((i) => i < props.open))
}, { immediate: true })

/** Folds shown in full, by file and position. */
const unfolded = ref<Set<string>>(new Set())

function toggle(i: number): void {
  const next = new Set(opened.value)
  if (next.has(i)) next.delete(i)
  else next.add(i)
  opened.value = next
}

function unfold(key: string): void {
  unfolded.value = new Set([...unfolded.value, key])
}

const parsed = computed(() => props.files.map((file) => {
  const counts = diffCounts(file)
  return { file, counts, rows: diffRows(file.patch, props.context) }
}))

const totals = computed(() => parsed.value.reduce((t, p) => ({ additions: t.additions + p.counts.additions, deletions: t.deletions + p.counts.deletions }), { additions: 0, deletions: 0 }))

/** Rows with the folds a person opened shown in full. */
function shown(fileIndex: number, rows: DiffRow[]): { row: DiffRow; key: string }[] {
  const out: { row: DiffRow; key: string }[] = []
  rows.forEach((row, i) => {
    const key = `${fileIndex}:${i}`
    if (row.kind === 'fold' && row.rows.length > 0 && unfolded.value.has(key)) {
      row.rows.forEach((r, j) => out.push({ row: r, key: `${key}:${j}` }))
    } else {
      out.push({ row, key })
    }
  })
  return out
}

function lineOf(row: DiffRow, side: 'old' | 'new'): number | '' {
  if (row.kind === 'context') return side === 'old' ? row.old : row.new
  if (row.kind === 'del') return side === 'old' ? row.old : ''
  if (row.kind === 'add') return side === 'new' ? row.new : ''
  return ''
}

function mark(row: DiffRow): string {
  return row.kind === 'add' ? '+' : row.kind === 'del' ? '−' : ''
}

function pairsOf(fileIndex: number, rows: DiffRow[]) {
  return diffPairs(shown(fileIndex, rows).map((s) => s.row))
}
</script>

<template>
  <section
    class="uid-diff"
    :class="`uid-diff--${mode}`"
  >
    <header
      v-if="title || $slots.actions"
      class="uid-diff__head"
    >
      <UidIcon
        :icon="FileDiff"
        :size="15"
        aria-hidden="true"
      />
      <span class="uid-diff__title">{{ title }}</span>
      <span class="uid-diff__add">+{{ totals.additions }}</span>
      <span class="uid-diff__del">−{{ totals.deletions }}</span>
      <slot name="actions" />
    </header>
    <div
      v-for="(p, i) in parsed"
      :key="`${p.file.oldPath ?? ''}>${p.file.path}`"
      class="uid-diff__file"
    >
      <button
        type="button"
        class="uid-diff__file-head"
        :aria-expanded="opened.has(i)"
        @click="toggle(i)"
      >
        <UidIcon
          :icon="opened.has(i) ? ChevronDown : ChevronRight"
          :size="14"
          aria-hidden="true"
        />
        <span class="uid-diff__path">
          <template v-if="p.file.oldPath && p.file.oldPath !== p.file.path">{{ p.file.oldPath }} → </template>{{ p.file.path }}
        </span>
        <span
          v-if="p.file.status === 'added' || p.file.status === 'deleted'"
          class="uid-diff__status"
        >{{ locale.diffView[p.file.status] }}</span>
        <span class="uid-diff__add">+{{ p.counts.additions }}</span>
        <span class="uid-diff__del">−{{ p.counts.deletions }}</span>
      </button>
      <div
        v-if="opened.has(i)"
        class="uid-diff__body"
      >
        <table
          v-if="mode === 'unified'"
          class="uid-diff__table"
        >
          <tbody>
            <template
              v-for="s in shown(i, p.rows)"
              :key="s.key"
            >
              <tr
                v-if="s.row.kind === 'fold'"
                class="uid-diff__fold"
              >
                <td colspan="4">
                  <button
                    v-if="s.row.rows.length > 0"
                    type="button"
                    class="uid-diff__fold-button"
                    @click="unfold(s.key)"
                  >
                    ⋯ {{ locale.diffView.unchanged(s.row.count) }}
                  </button>
                  <span v-else>⋯ {{ locale.diffView.unchanged(s.row.count) }}</span>
                </td>
              </tr>
              <tr
                v-else
                class="uid-diff__row"
                :class="`uid-diff__row--${s.row.kind}`"
              >
                <td class="uid-diff__num">
                  {{ lineOf(s.row, 'old') }}
                </td>
                <td class="uid-diff__num">
                  {{ lineOf(s.row, 'new') }}
                </td>
                <td
                  class="uid-diff__mark"
                  aria-hidden="true"
                >
                  {{ mark(s.row) }}
                </td>
                <td class="uid-diff__code">
                  <span
                    v-if="s.row.kind !== 'context'"
                    class="uid-diff__sr"
                  >{{ s.row.kind === 'add' ? locale.diffView.added : locale.diffView.deleted }}: </span>{{ s.row.text }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <table
          v-else
          class="uid-diff__table uid-diff__table--split"
        >
          <tbody>
            <template
              v-for="(pair, j) in pairsOf(i, p.rows)"
              :key="j"
            >
              <tr
                v-if="pair.fold"
                class="uid-diff__fold"
              >
                <td colspan="4">
                  ⋯ {{ locale.diffView.unchanged(pair.fold.count) }}
                </td>
              </tr>
              <tr
                v-else
                class="uid-diff__row"
              >
                <td class="uid-diff__num">
                  {{ pair.left.line ?? '' }}
                </td>
                <td
                  class="uid-diff__code"
                  :class="`uid-diff__cell--${pair.left.kind}`"
                >
                  {{ pair.left.text ?? '' }}
                </td>
                <td class="uid-diff__num">
                  {{ pair.right.line ?? '' }}
                </td>
                <td
                  class="uid-diff__code"
                  :class="`uid-diff__cell--${pair.right.kind}`"
                >
                  {{ pair.right.text ?? '' }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <p
          v-if="p.file.truncated"
          class="uid-diff__note"
        >
          {{ locale.diffView.fileTruncated }}
        </p>
      </div>
    </div>
    <p
      v-if="truncated"
      class="uid-diff__note"
    >
      {{ locale.diffView.truncated }}
    </p>
  </section>
</template>
