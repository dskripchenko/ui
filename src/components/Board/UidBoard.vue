<script setup lang="ts">
import './UidBoard.css'
import { computed, ref } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import type { Tone } from '../../types/index.js'

export type BoardKey = string | number

export interface BoardCardTag {
  label: string
  tone?: Tone | 'default'
}

/** Who a card is assigned to: a name, or a name with an avatar picture or colour. */
export type BoardAssignee = string | { name: string; avatar?: string; color?: string }

export interface BoardCard {
  key: BoardKey
  title: string
  subtitle?: string
  tags?: BoardCardTag[]
  /** Shown in the card's footer as initials or the avatar picture. */
  assignee?: BoardAssignee
  /** `YYYY-MM-DD`: the due date, shown formatted; before `today` (and not `done`) it is overdue. */
  due?: string
  /** A finished card: muted, and never overdue. */
  done?: boolean
  /** The swimlane the card sits in, when the board has lanes. */
  lane?: BoardKey
  /** Columns the card may move to; omitted — any column. */
  targets?: BoardKey[]
}

export interface BoardColumn {
  key: BoardKey
  title: string
  cards: BoardCard[]
  /** The real number of cards when only some are loaded; the count and WIP check use it. */
  total?: number
  /** Work-in-progress limit; the header warns when the column holds more. */
  wip?: number | null
}

export interface BoardLane {
  key: BoardKey
  title: string
}

export interface BoardMove {
  card: BoardCard
  from: BoardKey
  to: BoardKey
  /** The neighbours at the drop point, for ranking: null at an end. */
  beforeKey: BoardKey | null
  afterKey: BoardKey | null
  lane: BoardKey | null
}

export interface UidBoardProps {
  columns: BoardColumn[]
  lanes?: BoardLane[]
  /** Freeze the board while a move is being saved. */
  busy?: boolean
  readonly?: boolean
  /** `YYYY-MM-DD`: a card `due` before it is overdue. The local date by default. */
  today?: string
}

const props = withDefaults(defineProps<UidBoardProps>(), {
  lanes: () => [],
  busy: false,
  readonly: false,
  today: () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },
})

const emit = defineEmits<{
  move: [move: BoardMove]
  open: [card: BoardCard]
}>()

defineSlots<{
  card?(props: { card: BoardCard; column: BoardColumn }): unknown
  'column-header'?(props: { column: BoardColumn; count: number; over: boolean }): unknown
  /** The bottom of a column, below its cards (with lanes — below the last lane). */
  'column-footer'?(props: { column: BoardColumn }): unknown
}>()

const locale = useLocale()

/** The card's assignee as a list of zero or one, for a `v-for` in the template. */
function assigneesOf(card: BoardCard): { name: string; avatar?: string; color?: string }[] {
  const a = card.assignee
  if (a === undefined || a === null) return []
  if (typeof a === 'string') return a.trim() ? [{ name: a }] : []
  return a.name.trim() ? [a] : []
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

function isOverdue(card: BoardCard): boolean {
  return !!card.due && !card.done && card.due.slice(0, 10) < props.today
}

const dueFormats = computed(() => ({
  short: new Intl.DateTimeFormat(locale.value.code, { day: 'numeric', month: 'short' }),
  long: new Intl.DateTimeFormat(locale.value.code, { day: 'numeric', month: 'short', year: 'numeric' }),
}))

/** The due date in the kit's locale; the year only when it is not the current one. */
function formatDue(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return (m[1] === props.today.slice(0, 4) ? dueFormats.value.short : dueFormats.value.long).format(date)
}

const dragging = ref<{ card: BoardCard; from: BoardKey } | null>(null)
const hover = ref<{ column: BoardKey; lane: BoardKey | null; beforeKey: BoardKey | null } | null>(null)

const laneRows = computed<(BoardLane | null)[]>(() => (props.lanes.length > 0 ? props.lanes : [null]))

function cardsOf(column: BoardColumn, lane: BoardLane | null): BoardCard[] {
  return lane === null ? column.cards : column.cards.filter((c) => c.lane === lane.key)
}

function count(column: BoardColumn): number {
  return column.total ?? column.cards.length
}

function isOver(column: BoardColumn): boolean {
  return column.wip != null && column.wip > 0 && count(column) > column.wip
}

function allows(card: BoardCard, column: BoardColumn, from: BoardKey): boolean {
  if (column.key === from) return true
  return card.targets === undefined || card.targets.includes(column.key)
}

function onDragStart(event: DragEvent, card: BoardCard, column: BoardColumn): void {
  if (props.busy || props.readonly) {
    event.preventDefault()
    return
  }
  dragging.value = { card, from: column.key }
  event.dataTransfer?.setData('text/plain', String(card.key))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragEnd(): void {
  dragging.value = null
  hover.value = null
}

function onDragOver(event: DragEvent, column: BoardColumn, lane: BoardLane | null, beforeKey: BoardKey | null): void {
  const drag = dragging.value
  if (drag !== null) event.stopPropagation()
  if (drag === null || !allows(drag.card, column, drag.from)) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  hover.value = { column: column.key, lane: lane?.key ?? null, beforeKey }
}

function onDrop(event: DragEvent, column: BoardColumn, lane: BoardLane | null): void {
  const drag = dragging.value
  if (drag !== null) event.stopPropagation()
  if (drag === null || !allows(drag.card, column, drag.from)) return
  event.preventDefault()
  const beforeKey = hover.value?.column === column.key ? hover.value.beforeKey : null
  commit(drag.card, drag.from, column, lane, beforeKey)
  onDragEnd()
}

/**
 * Emit a move with the neighbours at the drop point. `beforeKey` is the card
 * the moved one lands in front of; null — the end of the column.
 */
function commit(card: BoardCard, from: BoardKey, column: BoardColumn, lane: BoardLane | null, beforeKey: BoardKey | null): void {
  const list = cardsOf(column, lane).filter((c) => c.key !== card.key)
  const index = beforeKey === null ? list.length : list.findIndex((c) => c.key === beforeKey)
  const at = index < 0 ? list.length : index
  const afterCard = at > 0 ? list[at - 1] : undefined
  const beforeCard = list[at]
  if (from === column.key && list.length === cardsOf(column, lane).length - 1) {
    const original = cardsOf(column, lane)
    const oldIndex = original.findIndex((c) => c.key === card.key)
    if (oldIndex === at) return
  }
  emit('move', {
    card,
    from,
    to: column.key,
    beforeKey: beforeCard?.key ?? null,
    afterKey: afterCard?.key ?? null,
    lane: lane?.key ?? card.lane ?? null,
  })
}

/** Alt+←/→ moves a focused card to the nearest column it may go to. */
function onKeydown(event: KeyboardEvent, card: BoardCard, column: BoardColumn, lane: BoardLane | null): void {
  if (event.key === 'Enter') {
    emit('open', card)
    return
  }
  if (!event.altKey || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') || props.busy || props.readonly) return
  event.preventDefault()
  const step = event.key === 'ArrowRight' ? 1 : -1
  const index = props.columns.findIndex((c) => c.key === column.key)
  for (let i = index + step; i >= 0 && i < props.columns.length; i += step) {
    const target = props.columns[i]
    if (target !== undefined && allows(card, target, column.key)) {
      commit(card, column.key, target, lane, null)
      return
    }
  }
}

function isDropTarget(column: BoardColumn): boolean {
  const drag = dragging.value
  return drag !== null && column.key !== drag.from && allows(drag.card, column, drag.from)
}

function isBlocked(column: BoardColumn): boolean {
  const drag = dragging.value
  return drag !== null && !allows(drag.card, column, drag.from)
}
</script>

<template>
  <div
    class="uid-board"
    :class="{ 'uid-board--busy': busy, 'uid-board--readonly': readonly, 'uid-board--dragging': dragging !== null }"
    role="region"
    :aria-label="locale.board.label"
    :aria-busy="busy"
  >
    <div
      v-for="(lane, laneIndex) in laneRows"
      :key="lane?.key ?? `lane-${laneIndex}`"
      class="uid-board__lane"
    >
      <div
        v-if="lane"
        class="uid-board__lane-title"
      >
        {{ lane.title }}
      </div>
      <div class="uid-board__columns">
        <section
          v-for="column in columns"
          :key="column.key"
          class="uid-board__column"
          :class="{
            'uid-board__column--over': isOver(column),
            'uid-board__column--target': isDropTarget(column),
            'uid-board__column--blocked': isBlocked(column),
          }"
          :aria-label="column.title"
          @dragover="onDragOver($event, column, lane, null)"
          @drop="onDrop($event, column, lane)"
        >
          <header
            v-if="laneIndex === 0"
            class="uid-board__header"
          >
            <slot
              name="column-header"
              :column="column"
              :count="count(column)"
              :over="isOver(column)"
            >
              <span class="uid-board__title">{{ column.title }}</span>
              <span
                class="uid-board__count"
                :title="isOver(column) ? locale.board.wipExceeded : undefined"
              >{{ count(column) }}<template v-if="column.wip">/{{ column.wip }}</template></span>
            </slot>
          </header>
          <ul
            class="uid-board__cards"
            role="list"
          >
            <li
              v-for="card in cardsOf(column, lane)"
              :key="card.key"
              class="uid-board__card"
              :class="{
                'uid-board__card--done': card.done,
                'uid-board__card--overdue': isOverdue(card),
                'uid-board__card--dragging': dragging?.card.key === card.key,
                'uid-board__card--drop-before': hover?.beforeKey === card.key && hover?.column === column.key,
              }"
              :draggable="!busy && !readonly"
              tabindex="0"
              role="listitem"
              :aria-keyshortcuts="readonly ? 'Enter' : 'Alt+ArrowLeft Alt+ArrowRight Enter'"
              @dragstart="onDragStart($event, card, column)"
              @dragend="onDragEnd"
              @dragover.stop="onDragOver($event, column, lane, card.key)"
              @drop.stop="onDrop($event, column, lane)"
              @click="emit('open', card)"
              @keydown="onKeydown($event, card, column, lane)"
            >
              <slot
                name="card"
                :card="card"
                :column="column"
              >
                <div class="uid-board__card-title">
                  {{ card.title }}
                </div>
                <div
                  v-if="card.subtitle"
                  class="uid-board__card-subtitle"
                >
                  {{ card.subtitle }}
                </div>
                <div
                  v-if="card.tags?.length"
                  class="uid-board__card-tags"
                >
                  <span
                    v-for="tag in card.tags"
                    :key="tag.label"
                    class="uid-board__tag"
                    :class="`uid-board__tag--${tag.tone ?? 'default'}`"
                  >{{ tag.label }}</span>
                </div>
                <div
                  v-if="card.due || assigneesOf(card).length > 0"
                  class="uid-board__card-foot"
                >
                  <span
                    v-if="card.due"
                    class="uid-board__due"
                    :class="{ 'uid-board__due--overdue': isOverdue(card) }"
                    :title="isOverdue(card) ? locale.board.overdue : locale.board.due"
                  >
                    <time :datetime="card.due">{{ formatDue(card.due) }}</time>
                    <span
                      v-if="isOverdue(card)"
                      class="uid-board__sr"
                    >, {{ locale.board.overdue }}</span>
                  </span>
                  <span
                    v-for="who in assigneesOf(card)"
                    :key="who.name"
                    class="uid-board__assignee"
                    role="img"
                    :title="locale.board.assignee(who.name)"
                    :aria-label="locale.board.assignee(who.name)"
                    :style="who.color ? { '--uid-board-avatar-bg': who.color } : undefined"
                  >
                    <img
                      v-if="who.avatar"
                      class="uid-board__avatar-img"
                      :src="who.avatar"
                      alt=""
                    >
                    <span
                      v-else
                      aria-hidden="true"
                    >{{ initials(who.name) }}</span>
                  </span>
                </div>
              </slot>
            </li>
            <li
              v-if="cardsOf(column, lane).length === 0 && (lane !== null || !column.total)"
              class="uid-board__empty"
              aria-hidden="true"
            >
              {{ locale.board.empty }}
            </li>
          </ul>
          <footer
            v-if="$slots['column-footer'] && laneIndex === laneRows.length - 1"
            class="uid-board__footer"
          >
            <slot
              name="column-footer"
              :column="column"
            />
          </footer>
        </section>
      </div>
    </div>
  </div>
</template>
