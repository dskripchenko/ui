<script setup lang="ts">
import './UidEventCalendar.css'
import { computed, reactive, ref, watch } from 'vue'
import { Lock, LockOpen } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidCalendar from '../Calendar/UidCalendar.vue'
import type { CalendarEventMove, CalendarSlot } from '../Calendar/UidCalendar.vue'
import { toISO, type CalendarEvent, type CalendarRange, type CalendarView } from '../Calendar/calendarModel'
import UidDrawer from '../Drawer/UidDrawer.vue'
import UidMarkdown from '../Markdown/UidMarkdown.vue'
import UidTag from '../Tag/UidTag.vue'
import { useLocale } from '../../composables/useLocale.js'
import {
  addCalendarEvent,
  detachCalendarOccurrence,
  eventRuleText,
  expandEventCalendar,
  parseEventCalendar,
  removeCalendarEvent,
  updateCalendarEvent,
  type EventCalendarItem,
  type EventCalendarOccurrence,
} from './eventCalendarMarkup'
import { draftOf, fieldsOf, newDraft, type EventCalendarDraft } from './eventCalendarDraft'
import UidEventCalendarBuilder from './UidEventCalendarBuilder.vue'

export interface UidEventCalendarProps {
  /** The calendar's markup. */
  source?: string
  /** Drag and resize, the event builder, the source tab. */
  editable?: boolean
  /** Read-only, whatever `editable` says. */
  locked?: boolean
  /** Show the lock button (it emits `lock`). */
  lockable?: boolean
  /** The view shown first; empty — the markup's `view:`, else the month. */
  view?: CalendarView | ''
  /** The date shown first (`YYYY-MM-DD`); empty — the markup's `date:`, else today. */
  date?: string
  /** The views offered. */
  views?: CalendarView[]
}

/** The payload of `open`: the event (the series for a repeat) and the date opened. */
export interface EventCalendarOpen {
  id: string
  date: string
  title: string
}

const VIEWS: CalendarView[] = ['day', 'week', 'month', 'year', 'agenda']
const TONES = ['info', 'success', 'warning', 'danger'] as const
const TONE_COLOR: Record<string, string> = {
  info: 'var(--uid-color-info)',
  success: 'var(--uid-color-success)',
  warning: 'var(--uid-color-warning)',
  danger: 'var(--uid-color-danger)',
}
const HIDDEN = ['from', 'until', 'count', 'except', 'rrule', 'description']

const props = withDefaults(defineProps<UidEventCalendarProps>(), {
  source: '',
  editable: false,
  locked: false,
  lockable: false,
  view: '',
  date: '',
  views: () => ['day', 'week', 'month', 'year', 'agenda'],
})

const emit = defineEmits<{
  change: [source: string]
  lock: [locked: boolean]
  open: [event: EventCalendarOpen]
  range: [range: CalendarRange]
}>()

function hash(s: string): number {
  let n = 0
  for (const ch of s) n = (n * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(n)
}

const locale = useLocale()
const t = computed(() => locale.value.eventCalendar)

const text = ref(props.source)
let emitted = props.source
watch(() => props.source, (next) => {
  if (next !== emitted) {
    text.value = next
    emitted = next
  }
})

const doc = computed(() => parseEventCalendar(text.value))
const canEdit = computed(() => props.editable && !props.locked)
const settingView = (): CalendarView | null => {
  const v = (doc.value.settings.get('view') ?? '') as CalendarView
  return VIEWS.includes(v) ? v : null
}
const settingDate = (): string | null => {
  const d = doc.value.settings.get('date') ?? ''
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
}
const view = ref<CalendarView>(props.view || settingView() || 'month')
watch(() => props.view, (v) => {
  if (v) view.value = v
})
const anchor = ref<string>(props.date || settingDate() || toISO(new Date()))
// Markup that arrives after the first render still applies its `view:` and
// `date:` — unless the props say otherwise or the reader has moved already.
let touched = false
watch(() => [settingView(), settingDate()] as const, ([v, d]) => {
  if (touched) return
  if (v && !props.view) view.value = v
  if (d && !props.date) anchor.value = d
})
const range = ref<{ start: string; end: string } | null>(null)
const tab = ref<'calendar' | 'source'>('calendar')
const open = ref(false)
const draft = ref<EventCalendarDraft | null>(null)
const viewing = ref<EventCalendarOccurrence | null>(null)

function commit(next: string): void {
  if (next === text.value) return
  text.value = next
  emitted = next
  emit('change', next)
}

const toneOf = (tag: string): string => TONE_COLOR[doc.value.tagTones[tag] ?? ''] ?? doc.value.tagTones[tag] ?? TONE_COLOR[TONES[hash(tag) % TONES.length]]
const occurrences = computed(() => (range.value ? expandEventCalendar(doc.value, range.value.start, range.value.end) : []))
const byId = computed(() => new Map(occurrences.value.map((o) => [o.id, o])))
const events = computed<CalendarEvent[]>(() =>
  occurrences.value.map((o) => ({
    id: o.id,
    date: o.date,
    ...(o.endDate ? { endDate: o.endDate } : {}),
    ...(o.time ? { time: o.time } : {}),
    ...(o.endTime ? { endTime: o.endTime } : {}),
    title: o.item.title,
    ...(o.item.tags.length ? { color: toneOf(o.item.tags[0]) } : {}),
  })),
)

function onRange(r: CalendarRange): void {
  range.value = { start: r.start, end: r.end }
  emit('range', r)
}

function onView(v: CalendarView): void {
  touched = true
  view.value = v
}

function onAnchor(v: string | null): void {
  if (v === null) return
  touched = true
  anchor.value = v
}

function openOccurrence(id: string): void {
  const o = byId.value.get(id)
  if (!o) return
  viewing.value = o
  emit('open', { id: o.item.id, date: o.date, title: o.item.title })
  draft.value = canEdit.value ? reactive(draftOf(o.item, o.date)) : null
  if (draft.value && o.item.rule) draft.value.scope = 'one'
  open.value = true
}

function newEvent(date: string, time?: string): void {
  viewing.value = null
  draft.value = reactive(newDraft(date, time))
  open.value = true
}

function onMove(m: CalendarEventMove): void {
  if (!canEdit.value) return
  const o = byId.value.get(String(m.event.id))
  if (!o) return
  const item = o.item
  const moved = {
    title: item.title,
    tags: item.tags,
    props: item.props,
    date: m.date,
    endDate: m.endDate ?? null,
    time: m.time ?? item.time,
    endTime: m.endTime ?? item.endTime,
  }
  if (item.rule) {
    const kept = new Map(item.props)
    for (const k of ['from', 'until', 'count', 'except', 'rrule']) kept.delete(k)
    commit(detachCalendarOccurrence(text.value, item.id, o.date, { ...moved, props: kept }))
  } else {
    commit(updateCalendarEvent(text.value, item.id, { ...moved, rule: null }))
  }
}

function onEventClick(e: CalendarEvent): void {
  openOccurrence(String(e.id))
}

function onSlotClick(s: CalendarSlot): void {
  newEvent(s.date, s.time)
}

function onDateClick(date: string): void {
  if (canEdit.value && view.value === 'month') newEvent(date)
}

function save(): void {
  const d = draft.value
  if (!d || d.title.trim() === '') return
  if (d.itemId === null) commit(addCalendarEvent(text.value, fieldsOf(d)))
  else if (d.occurrence !== null && d.scope === 'one') commit(detachCalendarOccurrence(text.value, d.itemId, viewing.value?.date ?? d.occurrence, fieldsOf(d, true)))
  else commit(updateCalendarEvent(text.value, d.itemId, fieldsOf(d)))
  open.value = false
}

function remove(): void {
  const d = draft.value
  if (!d || d.itemId === null) return
  commit(removeCalendarEvent(text.value, d.itemId))
  open.value = false
}

function skip(): void {
  const d = draft.value
  const o = viewing.value
  if (!d || d.itemId === null || !o?.item.rule) return
  const item = parseEventCalendar(text.value).items.find((i) => i.id === d.itemId) as EventCalendarItem
  const rule = { ...item.rule!, except: [...new Set([...item.rule!.except, o.date])].sort() }
  commit(updateCalendarEvent(text.value, d.itemId, { title: item.title, date: item.date, time: item.time, endTime: item.endTime, tags: item.tags, props: item.props, rule }))
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

const drawerTitle = computed(() => {
  const d = draft.value
  if (d) return d.itemId === null ? t.value.newEvent : t.value.event
  return viewing.value?.item.title ?? ''
})

const detailRows = computed<[string, string][]>(() => {
  const o = viewing.value
  if (!o) return []
  const item = o.item
  const when = `${o.date}${o.endDate ? ` – ${o.endDate}` : ''}${o.time ? `, ${o.time}${o.endTime ? `–${o.endTime}` : ''}` : `, ${t.value.allDay.toLowerCase()}`}`
  const rows: [string, string][] = [[t.value.date, when]]
  if (item.rule) rows.push([t.value.repeats, eventRuleText(item.rule) + (item.rule.until ? ` → ${item.rule.until}` : '') + (item.rule.count !== null ? ` × ${item.rule.count}` : '')])
  for (const [k, v] of item.props) if (!HIDDEN.includes(k)) rows.push([k === 'where' ? t.value.where : k, v || '✓'])
  return rows
})

const showBar = computed(() => !!doc.value.title || canEdit.value || props.lockable)
</script>

<template>
  <div
    class="uid-event-calendar"
    :class="{ 'uid-event-calendar--editable': canEdit, 'uid-event-calendar--locked': locked }"
  >
    <div
      v-if="showBar"
      class="uid-event-calendar__bar"
    >
      <div
        v-if="doc.title"
        class="uid-event-calendar__title"
      >
        {{ doc.title }}
      </div>
      <div class="uid-event-calendar__actions">
        <template v-if="canEdit">
          <button
            type="button"
            class="uid-event-calendar__btn"
            @click="newEvent(anchor)"
          >
            + {{ t.addEvent }}
          </button>
          <div
            class="uid-event-calendar__tabs"
            role="group"
          >
            <button
              v-for="k in (['calendar', 'source'] as const)"
              :key="k"
              type="button"
              class="uid-event-calendar__tab"
              :class="{ 'uid-event-calendar__tab--on': tab === k }"
              :aria-pressed="tab === k"
              @click="tab = k"
            >
              {{ t[k] }}
            </button>
          </div>
        </template>
        <button
          v-if="lockable"
          type="button"
          class="uid-event-calendar__lock"
          :class="{ 'uid-event-calendar__lock--on': locked }"
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
      class="uid-event-calendar__source"
    >
      <textarea
        class="uid-event-calendar__code"
        :value="text"
        spellcheck="false"
        :aria-label="t.source"
        @input="onSource"
      />
      <ul
        v-if="doc.problems.length"
        class="uid-event-calendar__problems"
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
    <UidCalendar
      v-else
      :events="events"
      :views="views"
      :view="view"
      :anchor="anchor"
      :editable="canEdit"
      @update:view="onView"
      @update:anchor="onAnchor"
      @range="onRange"
      @event-click="onEventClick"
      @event-move="onMove"
      @slot-click="onSlotClick"
      @date-click="onDateClick"
    />

    <UidDrawer
      v-model="open"
      :title="drawerTitle"
      width="480px"
    >
      <UidEventCalendarBuilder
        v-if="draft"
        v-model:draft="draft"
        @save="save"
        @remove="remove"
        @skip="skip"
        @cancel="open = false"
      />
      <div
        v-else-if="viewing"
        class="uid-event-calendar__details"
      >
        <div
          v-if="viewing.item.tags.length"
          class="uid-event-calendar__tags"
        >
          <UidTag
            v-for="tag in viewing.item.tags"
            :key="tag"
            size="sm"
          >
            {{ tag }}
          </UidTag>
        </div>
        <dl class="uid-event-calendar__props">
          <template
            v-for="([k, v], i) in detailRows"
            :key="i"
          >
            <dt>{{ k }}</dt>
            <dd>{{ v }}</dd>
          </template>
        </dl>
        <UidMarkdown
          v-if="viewing.item.props.get('description')"
          :source="viewing.item.props.get('description')"
        />
      </div>
    </UidDrawer>
  </div>
</template>
