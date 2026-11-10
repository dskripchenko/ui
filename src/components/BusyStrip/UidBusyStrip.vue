<script setup lang="ts">
import './UidBusyStrip.css'
import { computed } from 'vue'
import type { BusyRow, BusySegment, BusySelection } from './busyStrip'

export interface UidBusyStripProps {
  rows: BusyRow[]
  /** The first hour of the scale. */
  from?: number
  /** The last hour of the scale. */
  to?: number
  /** Every how many hours the scale is labelled. */
  labelEvery?: number
  /** The chosen time, drawn as a frame over every row. */
  selection?: BusySelection | null
  /** Width of the row labels, CSS. */
  labelWidth?: string
  /** A click on a row's track picks a time, rounded down to this many minutes; 0 — no picking. */
  pickStep?: number
}

const props = withDefaults(defineProps<UidBusyStripProps>(), {
  from: 9,
  to: 19,
  labelEvery: 2,
  selection: null,
  labelWidth: '112px',
  pickStep: 0,
})

const emit = defineEmits<{
  /** A time picked on a track, minutes from midnight. */
  pick: [minute: number]
}>()

defineSlots<{
  /** A row's label: an avatar and a name. */
  label?: (props: { row: BusyRow }) => unknown
}>()

const first = computed(() => props.from * 60)
const span = computed(() => Math.max(60, (props.to - props.from) * 60))
const scale = computed(() => {
  const out: { hour: number; left: number }[] = []
  for (let h = props.from; h <= props.to; h += Math.max(1, props.labelEvery)) out.push({ hour: h, left: ((h * 60 - first.value) / span.value) * 100 })
  return out
})
const ticks = computed(() => Array.from({ length: props.to - props.from + 1 }, (_, i) => (i * 60 / span.value) * 100))

function pct(minute: number): number {
  return Math.max(0, Math.min(100, ((minute - first.value) / span.value) * 100))
}

function segmentStyle(s: BusySegment): Record<string, string> {
  const left = pct(s.start)
  return { left: `${left}%`, width: `${Math.max(0.6, pct(s.end) - left)}%` }
}

function visible(row: BusyRow): BusySegment[] {
  return row.segments.filter((s) => s.end > first.value && s.start < first.value + span.value)
}

const frame = computed(() => (props.selection ? { left: `${pct(props.selection.start)}%`, width: `${Math.max(0.6, pct(props.selection.end) - pct(props.selection.start))}%` } : null))

function clock(minute: number): string {
  return `${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, '0')}`
}

function summary(row: BusyRow): string {
  return [row.label, ...visible(row).map((s) => `${s.label ?? s.kind} ${clock(s.start)}–${clock(s.end)}`)].join(', ')
}

function onPick(e: MouseEvent): void {
  if (props.pickStep <= 0) return
  const track = e.currentTarget as HTMLElement
  const rect = track.getBoundingClientRect()
  if (rect.width === 0) return
  const minute = first.value + ((e.clientX - rect.left) / rect.width) * span.value
  emit('pick', Math.floor(minute / props.pickStep) * props.pickStep)
}
</script>

<template>
  <div
    class="uid-busy-strip"
    :class="{ 'uid-busy-strip--pick': pickStep > 0 }"
    :style="{ '--uid-busy-label-w': labelWidth }"
  >
    <div
      class="uid-busy-strip__scale"
      aria-hidden="true"
    >
      <span
        v-for="m in scale"
        :key="m.hour"
        class="uid-busy-strip__hour"
        :style="{ left: `${m.left}%` }"
      >{{ m.hour }}</span>
    </div>
    <div class="uid-busy-strip__rows">
      <div
        v-for="row in rows"
        :key="row.id"
        class="uid-busy-strip__row"
      >
        <span class="uid-busy-strip__label">
          <slot
            name="label"
            :row="row"
          >{{ row.label }}</slot>
        </span>
        <span
          class="uid-busy-strip__track"
          role="img"
          :aria-label="summary(row)"
          @click="onPick"
        >
          <span
            v-for="(t, i) in ticks"
            :key="i"
            class="uid-busy-strip__tick"
            :style="{ left: `${t}%` }"
          />
          <span
            v-for="(s, i) in visible(row)"
            :key="i"
            class="uid-busy-strip__segment"
            :class="`uid-busy-strip__segment--${s.kind}`"
            :style="segmentStyle(s)"
            :title="s.kind === 'own' && s.label ? s.label : undefined"
          >{{ s.kind === 'own' && s.label ? s.label : '' }}</span>
        </span>
      </div>
      <span
        v-if="frame"
        class="uid-busy-strip__overlay"
        aria-hidden="true"
      >
        <span
          class="uid-busy-strip__frame"
          :style="frame"
        />
      </span>
    </div>
  </div>
</template>
