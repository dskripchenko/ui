<script setup lang="ts">
import './UidEmojiPicker.css'
import { computed, nextTick, onMounted, ref, useId, watch, type Component } from 'vue'
import { Clock, Flag, Hand, Heart, Leaf, Lightbulb, Plane, Search, Smile, Trophy, UtensilsCrossed } from 'lucide-vue-next'
import { useLocale } from '../../composables/useLocale.js'
import { loadEmoji, searchEmoji, withTone, type EmojiEntry, type EmojiGroup, type EmojiGroupKey } from './emojiData.js'

export interface UidEmojiPickerProps {
  /** Emoji picked lately, newest first; shown first as «Recent». */
  recent?: string[]
  /** The dialog's accessible name; the locale's by default. */
  label?: string
  /** Cells of 42 for touch (a bottom sheet on a phone). */
  touch?: boolean
  /** Put the focus in the search field when shown. */
  autofocus?: boolean
}

const props = withDefaults(defineProps<UidEmojiPickerProps>(), {
  recent: () => [],
  label: undefined,
  touch: false,
  autofocus: true,
})

/** Skin tone: 0 — none (yellow), 1…5 — light to dark. */
const tone = defineModel<number>('skinTone', { default: 0 })

const emit = defineEmits<{
  select: [emoji: string]
  close: []
}>()

const uidLocale = useLocale()
const t = computed(() => uidLocale.value.emojiPicker)
const id = useId()
const COLS = 8

const groups = ref<EmojiGroup[] | null>(null)
const query = ref('')
const active = ref(0)
const toneOpen = ref(false)
const searchRef = ref<HTMLInputElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const shownTab = ref<string>('recent')

const ICONS: Record<EmojiGroupKey | 'recent', Component> = {
  recent: Clock,
  smileys: Smile,
  people: Hand,
  nature: Leaf,
  food: UtensilsCrossed,
  travel: Plane,
  activities: Trophy,
  objects: Lightbulb,
  symbols: Heart,
  flags: Flag,
}

watch(() => uidLocale.value.code ?? 'en', async (lang) => {
  groups.value = await loadEmoji(lang)
}, { immediate: true })

const byEmoji = computed(() => {
  const map = new Map<string, EmojiEntry>()
  for (const g of groups.value ?? []) for (const e of g.emojis) map.set(e.emoji, e)
  return map
})

interface Section { key: EmojiGroupKey | 'recent'; title: string; items: EmojiEntry[] }

const sections = computed<Section[]>(() => {
  if (groups.value === null) return []
  if (query.value.trim() !== '') {
    return [{ key: 'recent', title: '', items: searchEmoji(groups.value, query.value) }]
  }
  const recent = props.recent.map((e) => byEmoji.value.get(e) ?? byEmoji.value.get(stripTone(e))).filter((e): e is EmojiEntry => e !== undefined).slice(0, COLS * 2)
  return [
    ...(recent.length > 0 ? [{ key: 'recent' as const, title: t.value.recent, items: recent }] : []),
    ...groups.value.map((g) => ({ key: g.key, title: t.value.groups[g.key], items: g.emojis })),
  ]
})

const searching = computed(() => query.value.trim() !== '')
const flat = computed(() => sections.value.flatMap((s) => s.items))
const current = computed<EmojiEntry | null>(() => flat.value[active.value] ?? null)

watch(query, () => {
  active.value = 0
  bodyRef.value?.scrollTo?.({ top: 0 })
})

function stripTone(emoji: string): string {
  return emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
}

function shown(entry: EmojiEntry): string {
  return withTone(entry, tone.value)
}

function cellId(index: number): string {
  return `${id}-e${index}`
}

/** Index of the first item of each section in the flat list. */
const starts = computed(() => {
  const out: number[] = []
  let n = 0
  for (const s of sections.value) {
    out.push(n)
    n += s.items.length
  }
  return out
})

function pick(entry: EmojiEntry): void {
  emit('select', shown(entry))
}

async function move(to: number): Promise<void> {
  const last = flat.value.length - 1
  if (last < 0) return
  active.value = Math.max(0, Math.min(last, to))
  await nextTick()
  document.getElementById(cellId(active.value))?.scrollIntoView?.({ block: 'nearest' })
}

function onKey(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowRight':
      if (query.value !== '' && searchRef.value?.selectionStart !== query.value.length) return
      event.preventDefault()
      void move(active.value + 1)
      break
    case 'ArrowLeft':
      if (query.value !== '' && searchRef.value?.selectionStart !== query.value.length) return
      event.preventDefault()
      void move(active.value - 1)
      break
    case 'ArrowDown':
      event.preventDefault()
      void move(active.value + COLS)
      break
    case 'ArrowUp':
      event.preventDefault()
      void move(active.value - COLS)
      break
    case 'Enter':
      event.preventDefault()
      if (current.value !== null) pick(current.value)
      break
    case 'Escape':
      event.preventDefault()
      event.stopPropagation()
      if (toneOpen.value) toneOpen.value = false
      else emit('close')
      break
  }
}

function goTo(key: string): void {
  const i = sections.value.findIndex((s) => s.key === key)
  const el = bodyRef.value?.querySelector<HTMLElement>(`[data-section="${key}"]`)
  if (i < 0 || el === null || el === undefined || bodyRef.value === null) return
  bodyRef.value.scrollTo?.({ top: el.offsetTop - bodyRef.value.offsetTop })
  shownTab.value = key
  active.value = starts.value[i] ?? 0
  searchRef.value?.focus()
}

function onScroll(): void {
  const body = bodyRef.value
  if (body === null || searching.value) return
  let key = sections.value[0]?.key ?? 'recent'
  for (const el of body.querySelectorAll<HTMLElement>('[data-section]')) {
    if (el.offsetTop - body.offsetTop <= body.scrollTop + 8) key = (el.dataset.section ?? key) as Section['key']
  }
  shownTab.value = key
}

const toneSamples = computed(() => [0, 1, 2, 3, 4, 5].map((n) => withTone({ emoji: '\u{1F44B}', skin: true }, n)))

function setTone(n: number): void {
  tone.value = n
  toneOpen.value = false
  searchRef.value?.focus()
}

onMounted(() => {
  if (props.autofocus) searchRef.value?.focus()
})

defineExpose({ focus: () => searchRef.value?.focus() })
</script>

<template>
  <div
    class="uid-emoji-picker"
    :class="{ 'uid-emoji-picker--touch': touch }"
    role="dialog"
    :aria-label="label ?? t.label"
    @keydown="onKey"
  >
    <div class="uid-emoji-picker__search">
      <Search
        :size="14"
        aria-hidden="true"
      />
      <input
        ref="searchRef"
        v-model="query"
        type="text"
        role="combobox"
        :aria-label="t.search"
        :placeholder="t.search"
        aria-autocomplete="list"
        :aria-expanded="true"
        :aria-controls="`${id}-grid`"
        :aria-activedescendant="current ? cellId(active) : undefined"
        autocomplete="off"
        spellcheck="false"
      >
    </div>

    <div
      v-if="!searching && groups !== null"
      class="uid-emoji-picker__tabs"
      role="tablist"
      :aria-label="t.categories"
    >
      <button
        v-for="s in sections"
        :key="s.key"
        type="button"
        role="tab"
        class="uid-emoji-picker__tab"
        :class="{ 'uid-emoji-picker__tab--on': shownTab === s.key }"
        :aria-selected="shownTab === s.key"
        :aria-label="s.title"
        :title="s.title"
        tabindex="-1"
        @click="goTo(s.key)"
      >
        <component
          :is="ICONS[s.key]"
          :size="16"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      :id="`${id}-grid`"
      ref="bodyRef"
      class="uid-emoji-picker__body"
      role="grid"
      :aria-label="label ?? t.label"
      @scroll.passive="onScroll"
    >
      <p
        v-if="groups === null"
        class="uid-emoji-picker__note"
      >
        {{ uidLocale.common.loading }}
      </p>
      <p
        v-else-if="searching && flat.length === 0"
        class="uid-emoji-picker__note"
        role="status"
      >
        {{ t.empty }}
      </p>
      <section
        v-for="(s, si) in sections"
        v-else
        :key="s.key"
        class="uid-emoji-picker__section"
        :data-section="s.key"
        role="rowgroup"
        :aria-label="s.title || undefined"
      >
        <h3
          v-if="s.title"
          class="uid-emoji-picker__title"
          aria-hidden="true"
        >
          {{ s.title }}
        </h3>
        <div
          class="uid-emoji-picker__grid"
          role="row"
        >
          <button
            v-for="(e, i) in s.items"
            :id="cellId((starts[si] ?? 0) + i)"
            :key="e.emoji"
            type="button"
            role="gridcell"
            tabindex="-1"
            class="uid-emoji-picker__cell"
            :class="{ 'uid-emoji-picker__cell--active': active === (starts[si] ?? 0) + i }"
            :aria-label="e.name"
            :aria-selected="active === (starts[si] ?? 0) + i"
            @mouseenter="active = (starts[si] ?? 0) + i"
            @click="pick(e)"
          >
            {{ shown(e) }}
          </button>
        </div>
      </section>
    </div>

    <div class="uid-emoji-picker__foot">
      <span
        class="uid-emoji-picker__preview"
        aria-hidden="true"
      >{{ current ? shown(current) : '' }}</span>
      <span class="uid-emoji-picker__meta">
        <span
          class="uid-emoji-picker__name"
          aria-live="polite"
        >{{ current?.name ?? '' }}</span>
        <span
          v-if="!touch"
          class="uid-emoji-picker__hint"
        >{{ t.hint }}</span>
      </span>
      <div class="uid-emoji-picker__tone">
        <button
          type="button"
          class="uid-emoji-picker__tone-button"
          :aria-label="t.skinTone"
          :title="t.skinTone"
          :aria-expanded="toneOpen"
          @click="toneOpen = !toneOpen"
        >
          {{ toneSamples[tone] }}
        </button>
        <div
          v-if="toneOpen"
          class="uid-emoji-picker__tones"
          role="radiogroup"
          :aria-label="t.skinTone"
        >
          <button
            v-for="(sample, n) in toneSamples"
            :key="n"
            type="button"
            role="radio"
            class="uid-emoji-picker__tone-option"
            :aria-checked="tone === n"
            :aria-label="t.tones[n]"
            :title="t.tones[n]"
            @click="setTone(n)"
          >
            {{ sample }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
