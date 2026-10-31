<script setup lang="ts">
import './UidKanban.css'
import { computed, ref, watch } from 'vue'
import { Lock, LockOpen, Plus } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidBoard from '../Board/UidBoard.vue'
import type { BoardKey, BoardMove } from '../Board/UidBoard.vue'
import UidButton from '../Button/UidButton.vue'
import UidDatePicker from '../DatePicker/UidDatePicker.vue'
import UidDrawer from '../Drawer/UidDrawer.vue'
import UidInput from '../Input/UidInput.vue'
import UidMarkdown from '../Markdown/UidMarkdown.vue'
import UidSelect from '../Select/UidSelect.vue'
import type { SelectModelValue } from '../Select/UidSelect.vue'
import UidTag from '../Tag/UidTag.vue'
import type { UidTagVariant } from '../Tag/UidTag.vue'
import UidTagsInput from '../TagsInput/UidTagsInput.vue'
import UidTextarea from '../Textarea/UidTextarea.vue'
import { useLocale } from '../../composables/useLocale.js'
import type { Tone } from '../../types/index.js'
import {
  addKanbanCard,
  kanbanInlineMarkdown,
  moveKanbanCard,
  parseKanban,
  parseMarkupProps,
  removeKanbanCard,
  updateKanbanCard,
  type KanbanCard,
  type KanbanColumn,
  type KanbanPriority,
} from './kanbanMarkup'

export interface UidKanbanProps {
  /** The board's markup. */
  source?: string
  /** Allow moves, new and changed cards and the source tab. */
  editable?: boolean
  /** Read-only, whatever `editable` says. */
  locked?: boolean
  /** Show the lock button (it emits `lock`). */
  lockable?: boolean
  /** `YYYY-MM-DD`: a due date before it is overdue. Today (UTC) by default. */
  today?: string
}

/** The payload of `open`: the card and the title of its column. */
export interface KanbanOpen {
  id: string
  title: string
  column: string
}

const props = withDefaults(defineProps<UidKanbanProps>(), {
  source: '',
  editable: false,
  locked: false,
  lockable: false,
  today: () => new Date().toISOString().slice(0, 10),
})

const emit = defineEmits<{
  change: [source: string]
  lock: [locked: boolean]
  open: [card: KanbanOpen]
}>()

interface Draft {
  id: string | null
  columnId: string
  title: string
  tags: string[]
  priority: '' | KanbanPriority
  who: string
  due: string | null
  lane: string
  extra: string
  description: string
}

const TONES: Tone[] = ['info', 'success', 'warning', 'danger']
const KNOWN = new Set(['lane', 'who', 'due'])

function hash(s: string): number {
  let n = 0
  for (const ch of s) n = (n * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(n)
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

const locale = useLocale()
const t = computed(() => locale.value.kanban)

const text = ref(props.source)
let emitted = props.source
watch(() => props.source, (next) => {
  if (next !== emitted) {
    text.value = next
    emitted = next
  }
})

const doc = computed(() => parseKanban(text.value))
const canEdit = computed(() => props.editable && !props.locked)
const tab = ref<'board' | 'source'>('board')
const tagFilter = ref<string | null>(null)
const whoFilter = ref<string | null>(null)
const open = ref(false)
const draft = ref<Draft | null>(null)
const viewing = ref<{ card: KanbanCard; column: KanbanColumn } | null>(null)

function commit(next: string): void {
  if (next === text.value) return
  text.value = next
  emitted = next
  emit('change', next)
}

const allTags = computed(() => [...new Set(doc.value.columns.flatMap((c) => c.cards.flatMap((k) => k.tags)))])
const people = computed(() => [...new Set(doc.value.columns.flatMap((c) => c.cards.map((k) => k.props.get('who') ?? '').filter(Boolean)))])
const peopleOptions = computed(() => people.value.map((p) => ({ value: p, label: p })))
const toneOf = (tag: string): UidTagVariant => (doc.value.tagTones[tag] as UidTagVariant | undefined) ?? TONES[hash(tag) % TONES.length]

const visible = (card: KanbanCard): boolean =>
  (tagFilter.value === null || card.tags.includes(tagFilter.value)) && (whoFilter.value === null || card.props.get('who') === whoFilter.value)

const cardById = computed(() => {
  const map = new Map<string, { card: KanbanCard; column: KanbanColumn }>()
  for (const column of doc.value.columns) for (const card of column.cards) map.set(card.id, { card, column })
  return map
})

const lanes = computed(() => doc.value.lanes.map((l) => ({ key: l, title: l })))
const columns = computed(() =>
  doc.value.columns.map((column) => ({
    key: column.id,
    title: column.title,
    wip: column.wip,
    cards: column.cards.filter(visible).map((card) => ({
      key: card.id,
      title: card.title,
      ...(lanes.value.length > 0 ? { lane: card.props.get('lane') ?? doc.value.lanes[0] } : {}),
    })),
  })),
)

const columnOptions = computed(() => doc.value.columns.map((c) => ({ value: c.id, label: c.title })))
const laneOptions = computed(() => doc.value.lanes.map((l) => ({ value: l, label: l })))
const priorityOptions = computed(() => [
  { value: '', label: t.value.priority.none },
  { value: 'high', label: t.value.priority.high },
  { value: 'low', label: t.value.priority.low },
])

function onMove(move: BoardMove): void {
  if (!canEdit.value) return
  const id = String(move.card.key)
  const current = cardById.value.get(id)?.card.props.get('lane') ?? (lanes.value.length > 0 ? doc.value.lanes[0] : null)
  const lane = lanes.value.length > 0 && move.lane !== null && String(move.lane) !== current ? String(move.lane) : undefined
  commit(moveKanbanCard(text.value, id, String(move.to), move.beforeKey === null ? null : String(move.beforeKey), lane))
}

function openCard(id: string): void {
  const found = cardById.value.get(id)
  if (!found) return
  viewing.value = found
  emit('open', { id, title: found.card.title, column: found.column.title })
  if (canEdit.value) {
    const { card, column } = found
    const extra = [...card.props].filter(([k]) => !KNOWN.has(k)).map(([k, v]) => (v === '' ? k : `${k}: ${v}`)).join('\n')
    draft.value = {
      id: card.id,
      columnId: column.id,
      title: card.title,
      tags: [...card.tags],
      priority: card.priority ?? '',
      who: card.props.get('who') ?? '',
      due: card.props.get('due') || null,
      lane: card.props.get('lane') ?? '',
      extra,
      description: card.description,
    }
  } else {
    draft.value = null
  }
  open.value = true
}

function newCard(columnId: string): void {
  viewing.value = null
  draft.value = { id: null, columnId, title: '', tags: [], priority: '', who: '', due: null, lane: doc.value.lanes[0] ?? '', extra: '', description: '' }
  open.value = true
}

function save(): void {
  const d = draft.value
  if (!d || d.title.trim() === '') return
  const cardProps = new Map<string, string>()
  if (d.lane && lanes.value.length > 0) cardProps.set('lane', d.lane)
  if (d.who.trim()) cardProps.set('who', d.who.trim())
  if (d.due) cardProps.set('due', d.due)
  for (const line of d.extra.split('\n')) for (const [k, v] of parseMarkupProps(line)) cardProps.set(k, v)
  const fields = { title: d.title, tags: d.tags.map((x) => x.replace(/^#/, '').trim()).filter(Boolean), priority: d.priority || null, props: cardProps, description: d.description }
  let next = d.id === null ? addKanbanCard(text.value, d.columnId, fields) : updateKanbanCard(text.value, d.id, fields)
  if (d.id !== null && cardById.value.get(d.id)?.column.id !== d.columnId) next = moveKanbanCard(next, d.id, d.columnId, null)
  commit(next)
  open.value = false
}

function remove(): void {
  const d = draft.value
  if (!d || d.id === null) return
  commit(removeKanbanCard(text.value, d.id))
  open.value = false
}

let typing: ReturnType<typeof setTimeout> | undefined
function onSource(event: Event): void {
  text.value = (event.target as HTMLTextAreaElement).value
  clearTimeout(typing)
  typing = setTimeout(() => {
    emitted = text.value
    emit('change', text.value)
  }, 300)
}

function onTitleClick(event: MouseEvent): void {
  // A link in the title opens itself, not the card.
  if ((event.target as HTMLElement).closest('a')) event.stopPropagation()
}

function setWho(v: SelectModelValue<false>): void {
  whoFilter.value = v === null || v === undefined ? null : String(v)
}

function toggleTag(tag: string): void {
  tagFilter.value = tagFilter.value === tag ? null : tag
}

const cardViews = computed(() => {
  const map = new Map<string, { card: KanbanCard; done: boolean; due: string; overdue: boolean; who: string; avatar: string; hasMeta: boolean; hasFoot: boolean }>()
  for (const { card, column } of cardById.value.values()) {
    const due = card.props.get('due') ?? ''
    const who = card.props.get('who') ?? ''
    map.set(card.id, {
      card,
      done: column.done,
      due,
      overdue: !!due && due < props.today && !column.done,
      who,
      avatar: `hsl(${hash(who) % 360} 55% 45%)`,
      hasMeta: !!card.priority || card.tags.length > 0,
      hasFoot: !!due || !!who,
    })
  }
  return map
})

function headerCount(key: BoardKey, count: number): string {
  const column = doc.value.columns.find((c) => c.id === key)
  return column?.wip ? `${count}/${column.wip}` : String(count)
}

const drawerTitle = computed(() => {
  const d = draft.value
  if (d) return d.id === null ? t.value.newCard : t.value.editCard
  return viewing.value?.card.title.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') ?? ''
})

const detailRows = computed<[string, string][]>(() => {
  const v = viewing.value
  if (!v) return []
  const { card, column } = v
  const rows: [string, string][] = [[t.value.column, column.title]]
  if (card.props.get('lane')) rows.push([t.value.lane, card.props.get('lane')!])
  if (card.priority) rows.push([t.value.priorityLabel, t.value.priority[card.priority]])
  if (card.props.get('who')) rows.push([t.value.who, card.props.get('who')!])
  if (card.props.get('due')) rows.push([t.value.due, card.props.get('due')!])
  for (const [k, val] of card.props) if (!KNOWN.has(k)) rows.push([k, val || '✓'])
  return rows
})
</script>

<template>
  <div
    class="uid-kanban"
    :class="{ 'uid-kanban--editable': canEdit, 'uid-kanban--locked': locked }"
  >
    <div class="uid-kanban__bar">
      <div
        v-if="doc.title"
        class="uid-kanban__title"
      >
        {{ doc.title }}
      </div>
      <div class="uid-kanban__filters">
        <div
          v-if="allTags.length > 0"
          class="uid-kanban__tags"
          role="group"
          :aria-label="t.filterTag"
        >
          <button
            v-for="tag in allTags"
            :key="tag"
            type="button"
            class="uid-kanban__filter"
            :class="{ 'uid-kanban__filter--on': tagFilter === tag }"
            :aria-pressed="tagFilter === tag"
            @click="toggleTag(tag)"
          >
            #{{ tag }}
          </button>
        </div>
        <div
          v-if="people.length > 0"
          class="uid-kanban__people"
        >
          <UidSelect
            size="sm"
            clearable
            :placeholder="t.everyone"
            :options="peopleOptions"
            :model-value="whoFilter"
            @update:model-value="setWho"
          />
        </div>
      </div>
      <div class="uid-kanban__actions">
        <div
          v-if="canEdit"
          class="uid-kanban__tabs"
          role="group"
        >
          <button
            v-for="k in (['board', 'source'] as const)"
            :key="k"
            type="button"
            class="uid-kanban__tab"
            :class="{ 'uid-kanban__tab--on': tab === k }"
            :aria-pressed="tab === k"
            @click="tab = k"
          >
            {{ t[k] }}
          </button>
        </div>
        <button
          v-if="lockable"
          type="button"
          class="uid-kanban__lock"
          :class="{ 'uid-kanban__lock--on': locked }"
          :title="locked ? t.unlock : t.lock"
          :aria-label="locked ? t.unlock : t.lock"
          :aria-pressed="locked"
          @click="emit('lock', !locked)"
        >
          <UidIcon
            :icon="locked ? Lock : LockOpen"
            :size="16"
          />
        </button>
      </div>
    </div>

    <div
      v-if="tab === 'source' && canEdit"
      class="uid-kanban__source"
    >
      <textarea
        class="uid-kanban__code"
        :value="text"
        spellcheck="false"
        :aria-label="t.source"
        @input="onSource"
      />
      <ul
        v-if="doc.problems.length"
        class="uid-kanban__problems"
        role="status"
      >
        <li
          v-for="p in doc.problems"
          :key="p.line"
        >
          {{ t.line }} {{ p.line }}: {{ p.message }}
        </li>
      </ul>
    </div>
    <UidBoard
      v-else
      :columns="columns"
      :lanes="lanes"
      :readonly="!canEdit"
      @move="onMove"
      @open="(card) => openCard(String(card.key))"
    >
      <template #card="{ card: boardCard }">
        <template v-if="cardViews.get(String(boardCard.key))">
          <div
            v-for="view in [cardViews.get(String(boardCard.key))!]"
            :key="view.card.id"
            class="uid-kanban__card"
            :class="{ 'uid-kanban__card--done': view.done }"
          >
            <!-- eslint-disable vue/no-v-html -- kanbanInlineMarkdown escapes the title before adding markup -->
            <div
              class="uid-kanban__card-title"
              @click="onTitleClick"
              v-html="kanbanInlineMarkdown(view.card.title)"
            />
            <!-- eslint-enable vue/no-v-html -->
            <div
              v-if="view.hasMeta"
              class="uid-kanban__card-meta"
            >
              <span
                v-if="view.card.priority"
                class="uid-kanban__priority"
                :class="`uid-kanban__priority--${view.card.priority}`"
              >{{ t.priority[view.card.priority] }}</span>
              <UidTag
                v-for="tag in view.card.tags"
                :key="tag"
                size="sm"
                :variant="toneOf(tag)"
              >
                {{ tag }}
              </UidTag>
            </div>
            <div
              v-if="view.hasFoot"
              class="uid-kanban__card-foot"
            >
              <span
                v-if="view.due"
                class="uid-kanban__due"
                :class="{ 'uid-kanban__due--overdue': view.overdue }"
                :title="t.due"
              >{{ view.due }}</span>
              <span
                v-if="view.who"
                class="uid-kanban__who"
                :title="view.who"
              >
                <span
                  class="uid-kanban__avatar"
                  :style="{ '--uid-kanban-avatar': view.avatar }"
                >{{ initials(view.who) }}</span>
                <span>{{ view.who }}</span>
              </span>
            </div>
            <span
              v-if="view.card.description"
              class="uid-kanban__has-desc"
              :title="t.description"
            >≡</span>
          </div>
        </template>
      </template>
      <template #column-header="{ column, count, over }">
        <div
          class="uid-kanban__column-head"
          :class="{ 'uid-kanban__column-head--over': over }"
        >
          <span class="uid-kanban__column-title">{{ column.title }}</span>
          <span class="uid-kanban__count">{{ headerCount(column.key, count) }}</span>
          <button
            v-if="canEdit"
            type="button"
            class="uid-kanban__add"
            :title="t.addCard"
            :aria-label="`${t.addCard}: ${column.title}`"
            @click="newCard(String(column.key))"
          >
            <UidIcon
              :icon="Plus"
              :size="16"
            />
          </button>
        </div>
      </template>
    </UidBoard>

    <UidDrawer
      v-model="open"
      :title="drawerTitle"
      width="440px"
    >
      <form
        v-if="draft"
        class="uid-kanban__form"
        @submit.prevent="save"
      >
        <label class="uid-kanban__field">
          <span class="uid-kanban__label">{{ t.cardTitle }}</span>
          <UidInput
            v-model="draft.title"
            required
          />
        </label>
        <label class="uid-kanban__field">
          <span class="uid-kanban__label">{{ t.column }}</span>
          <UidSelect
            :options="columnOptions"
            :model-value="draft.columnId"
            @update:model-value="(x) => draft && (draft.columnId = String(x))"
          />
        </label>
        <label
          v-if="lanes.length > 0"
          class="uid-kanban__field"
        >
          <span class="uid-kanban__label">{{ t.lane }}</span>
          <UidSelect
            :options="laneOptions"
            :model-value="draft.lane"
            @update:model-value="(x) => draft && (draft.lane = String(x))"
          />
        </label>
        <label class="uid-kanban__field">
          <span class="uid-kanban__label">{{ t.tags }}</span>
          <UidTagsInput v-model="draft.tags" />
        </label>
        <div class="uid-kanban__row">
          <label class="uid-kanban__field">
            <span class="uid-kanban__label">{{ t.priorityLabel }}</span>
            <UidSelect
              :options="priorityOptions"
              :model-value="draft.priority"
              @update:model-value="(x) => draft && (draft.priority = x as '' | KanbanPriority)"
            />
          </label>
          <label class="uid-kanban__field">
            <span class="uid-kanban__label">{{ t.due }}</span>
            <UidDatePicker v-model="draft.due" />
          </label>
        </div>
        <label class="uid-kanban__field">
          <span class="uid-kanban__label">{{ t.who }}</span>
          <UidInput v-model="draft.who" />
        </label>
        <label class="uid-kanban__field">
          <span class="uid-kanban__label">{{ t.description }}</span>
          <UidTextarea
            v-model="draft.description"
            :rows="5"
            auto-grow
          />
        </label>
        <label class="uid-kanban__field">
          <span class="uid-kanban__label">{{ t.extra }}</span>
          <UidTextarea
            v-model="draft.extra"
            :rows="2"
            auto-grow
            placeholder="key: value"
          />
        </label>
        <div class="uid-kanban__buttons">
          <UidButton
            type="submit"
            variant="primary"
          >
            {{ t.save }}
          </UidButton>
          <UidButton
            variant="ghost"
            @click="open = false"
          >
            {{ t.cancel }}
          </UidButton>
          <UidButton
            v-if="draft.id !== null"
            variant="danger"
            class="uid-kanban__delete"
            @click="remove"
          >
            {{ t.delete }}
          </UidButton>
        </div>
      </form>
      <div
        v-else-if="viewing"
        class="uid-kanban__details"
      >
        <div
          v-if="viewing.card.tags.length"
          class="uid-kanban__card-meta"
        >
          <UidTag
            v-for="tag in viewing.card.tags"
            :key="tag"
            size="sm"
            :variant="toneOf(tag)"
          >
            {{ tag }}
          </UidTag>
        </div>
        <dl class="uid-kanban__props">
          <template
            v-for="([k, val], i) in detailRows"
            :key="i"
          >
            <dt>{{ k }}</dt>
            <dd>{{ val }}</dd>
          </template>
        </dl>
        <UidMarkdown
          v-if="viewing.card.description"
          :source="viewing.card.description"
        />
      </div>
    </UidDrawer>
  </div>
</template>
