<script setup lang="ts">
import './UidMilestoneStrip.css'
import { computed } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import { dayNumber, dayPercent, dayToDate, milestoneRange, monthStarts, type Milestone } from './milestoneStrip'

export type UidMilestoneStripMonthFormat = 'short' | 'long'

export interface UidMilestoneStripProps {
  /** Three to five milestones read best. */
  items: Milestone[]
  /** YYYY-MM-DD, the first day of the scale. Default: the first day of the earliest month (items and `today`). */
  start?: string
  /** YYYY-MM-DD, the last day of the scale. Default: the last day of the latest month (items and `today`). */
  end?: string
  /** YYYY-MM-DD: a vertical line across all rows. */
  today?: string
  /** A footnote under the strip explaining the today line; omit to render your own. */
  todayLabel?: string
  /** Month names in the header, as `Intl.DateTimeFormat` gives them. */
  monthFormat?: UidMilestoneStripMonthFormat
  /** Accessible name of the list; default from the locale. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<UidMilestoneStripProps>(), {
  start: undefined,
  end: undefined,
  today: undefined,
  todayLabel: undefined,
  monthFormat: 'short',
  ariaLabel: undefined,
})

const emit = defineEmits<{
  /** A milestone without `href` was activated (click, Enter or Space). */
  select: [item: Milestone]
}>()

const locale = useLocale()

/** From this position on (percent) the text sits to the left of the marker. */
const FLIP_AT = 70
/** A partial first month gets a name only when it is at least this wide (percent). */
const MIN_PARTIAL_MONTH = 8

const range = computed(() => milestoneRange(props.items, props.start, props.end, props.today))

const monthFmt = computed(() => new Intl.DateTimeFormat(locale.value.code, { month: props.monthFormat, timeZone: 'UTC' }))
const dateFmt = computed(() => new Intl.DateTimeFormat(locale.value.code, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }))

function r2(v: number): number {
  return Math.round(v * 100) / 100
}

const months = computed(() => {
  const r = range.value
  if (!r) return []
  const starts = monthStarts(r)
  const out = starts.map((d) => ({ key: d, left: r2(dayPercent(d, r)), text: monthFmt.value.format(dayToDate(d)) }))
  const first = starts[0]
  if (first === undefined || first > r.start) {
    const share = dayPercent(first ?? r.end + 1, r)
    if (share >= MIN_PARTIAL_MONTH) out.unshift({ key: r.start, left: 0, text: monthFmt.value.format(dayToDate(r.start)) })
  }
  return out
})

const rows = computed(() => {
  const r = range.value
  return props.items.map((item) => {
    const day = dayNumber(item.date)
    const left = r && day !== null ? r2(dayPercent(day, r)) : 0
    const date = day !== null ? dateFmt.value.format(dayToDate(day)) : item.date
    const name = [item.label, date, item.caption, item.risk ? locale.value.milestoneStrip.atRisk : undefined].filter(Boolean).join(', ')
    return { item, left, flip: left > FLIP_AT, name }
  })
})

const todayLeft = computed(() => {
  const r = range.value
  const day = dayNumber(props.today)
  return r && day !== null ? r2(dayPercent(day, r)) : null
})

function itemStyle(left: number, flip: boolean): Record<string, string> {
  return flip
    ? { marginInlineStart: 'auto', marginInlineEnd: `calc(${r2(100 - left)}% - var(--uid-milestone-half))`, maxWidth: `calc(${left}% + var(--uid-milestone-half))` }
    : { marginInlineStart: `calc(${left}% - var(--uid-milestone-half))`, maxWidth: `calc(${r2(100 - left)}% + var(--uid-milestone-half))` }
}

function onSelect(item: Milestone): void {
  emit('select', item)
}
</script>

<template>
  <div class="uid-milestone-strip">
    <div class="uid-milestone-strip__track">
      <div
        class="uid-milestone-strip__months"
        aria-hidden="true"
      >
        <span
          v-for="m in months"
          :key="m.key"
          class="uid-milestone-strip__month"
          :style="{ insetInlineStart: `${m.left}%` }"
        >{{ m.text }}</span>
      </div>
      <ol
        class="uid-milestone-strip__list"
        role="list"
        :aria-label="ariaLabel ?? locale.milestoneStrip.label"
      >
        <li
          v-for="row in rows"
          :key="row.item.key"
          class="uid-milestone-strip__row"
        >
          <component
            :is="row.item.href ? 'a' : 'button'"
            class="uid-milestone-strip__item"
            :class="{ 'uid-milestone-strip__item--flip': row.flip, 'uid-milestone-strip__item--risk': row.item.risk }"
            :href="row.item.href"
            :type="row.item.href ? undefined : 'button'"
            :aria-label="row.name"
            :data-left="row.left"
            :style="itemStyle(row.left, row.flip)"
            @click="row.item.href ? undefined : onSelect(row.item)"
          >
            <span
              class="uid-milestone-strip__marker"
              aria-hidden="true"
            />
            <span class="uid-milestone-strip__text">
              <span class="uid-milestone-strip__label">{{ row.item.label }}</span>
              <span
                v-if="row.item.caption"
                class="uid-milestone-strip__caption"
              >{{ row.item.caption }}</span>
            </span>
          </component>
        </li>
      </ol>
      <span
        v-if="todayLeft !== null"
        class="uid-milestone-strip__today"
        :style="{ insetInlineStart: `${todayLeft}%` }"
        aria-hidden="true"
      />
    </div>
    <p
      v-if="todayLabel && todayLeft !== null"
      class="uid-milestone-strip__footnote"
    >
      <span
        class="uid-milestone-strip__footnote-mark"
        aria-hidden="true"
      />
      {{ todayLabel }}
    </p>
  </div>
</template>
