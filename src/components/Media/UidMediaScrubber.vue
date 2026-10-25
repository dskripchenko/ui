<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  clamp, cueAt, formatTime,
  type UidMediaCue, type UidMediaRange, type UidMediaThumbnail,
} from './mediaUtils.js'
import { peaksToPath, resamplePeaks } from './waveform.js'

const props = withDefaults(defineProps<{
  currentTime: number
  duration: number
  buffered?: UidMediaRange[]
  chapters?: UidMediaCue[]
  peaks?: number[] | null
  thumbnailAt?: (time: number) => UidMediaThumbnail | null
  label: string
  valueText: (current: string, total: string) => string
  disabled?: boolean
  step?: number
  /** A waveform is on its way: show a placeholder instead of a bar that looks final. */
  pending?: boolean
  /** Hides the hover preview (e.g. while a menu is open over the bar). */
  suppressPreview?: boolean
}>(), {
  buffered: () => [],
  chapters: () => [],
  peaks: null,
  thumbnailAt: undefined,
  disabled: false,
  step: 5,
  pending: false,
  suppressPreview: false,
})

const emit = defineEmits<{
  seek: [time: number]
  scrubstart: []
  scrubend: []
}>()

const root = ref<HTMLElement | null>(null)
const width = ref(0)
const hoverX = ref<number | null>(null)
const dragTime = ref<number | null>(null)
let ro: ResizeObserver | null = null
let pendingSeek: number | null = null
let raf = 0

onMounted(() => {
  if (!root.value) return
  width.value = root.value.clientWidth
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => { width.value = root.value?.clientWidth ?? 0 })
    ro.observe(root.value)
  }
})

onBeforeUnmount(() => {
  ro?.disconnect()
  if (raf) cancelAnimationFrame(raf)
})

const hasDuration = computed(() => props.duration > 0 && Number.isFinite(props.duration))
const shownTime = computed(() => dragTime.value ?? props.currentTime)
const pct = (t: number): number => (hasDuration.value ? clamp((t / props.duration) * 100, 0, 100) : 0)

const playedPct = computed(() => pct(shownTime.value))

const bufferedSegments = computed(() =>
  props.buffered.map(([s, e]) => ({ left: pct(s), width: Math.max(0, pct(e) - pct(s)) })),
)

const chapterMask = computed(() => {
  if (!hasDuration.value || props.chapters.length < 2) return undefined
  const stops: string[] = []
  for (const c of props.chapters.slice(1)) {
    const p = pct(c.start)
    if (p <= 0 || p >= 100) continue
    stops.push(`#000 calc(${p}% - 1.5px)`, `transparent calc(${p}% - 1.5px)`, `transparent calc(${p}% + 1.5px)`, `#000 calc(${p}% + 1.5px)`)
  }
  if (!stops.length) return undefined
  const mask = `linear-gradient(to right, #000 0, ${stops.join(', ')}, #000 100%)`
  return { maskImage: mask, WebkitMaskImage: mask }
})

const barCount = computed(() => Math.max(16, Math.floor((width.value || 300) / 3)))
const waveBars = computed(() => (props.peaks?.length ? resamplePeaks(props.peaks, barCount.value) : null))
const wavePath = computed(() => (waveBars.value ? peaksToPath(waveBars.value) : ''))
const waveViewBox = computed(() => `0 0 ${(waveBars.value?.length ?? 0) * 3 - 1} 100`)

function timeAtClientX(clientX: number): number {
  const el = root.value
  if (!el || !hasDuration.value) return 0
  const rect = el.getBoundingClientRect()
  const ratio = rect.width ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0
  return ratio * props.duration
}

const hoverTime = computed(() => {
  if (hoverX.value === null || !hasDuration.value || !width.value) return null
  return clamp(hoverX.value / width.value, 0, 1) * props.duration
})

const previewTime = computed(() => (props.suppressPreview && dragTime.value === null ? null : dragTime.value ?? hoverTime.value))
const previewChapter = computed(() =>
  previewTime.value === null ? undefined : cueAt(props.chapters, previewTime.value)?.text,
)
const previewThumb = computed(() =>
  previewTime.value === null || !props.thumbnailAt ? null : props.thumbnailAt(previewTime.value),
)

const previewStyle = computed(() => {
  if (previewTime.value === null) return undefined
  const x = (pct(previewTime.value) / 100) * width.value
  const half = previewThumb.value?.w ? previewThumb.value.w / 2 : 32
  return { left: `${clamp(x, Math.min(half, width.value / 2), Math.max(width.value - half, width.value / 2))}px` }
})

const thumbStyle = computed(() => {
  const t = previewThumb.value
  if (!t) return undefined
  if (!t.w) return { backgroundImage: `url("${t.url}")`, backgroundSize: 'cover', width: '160px', height: '90px' }
  return {
    backgroundImage: `url("${t.url}")`,
    backgroundPosition: `-${t.x}px -${t.y}px`,
    width: `${t.w}px`,
    height: `${t.h}px`,
  }
})

function flushSeek(): void {
  raf = 0
  if (pendingSeek !== null) emit('seek', pendingSeek)
  pendingSeek = null
}

function queueSeek(t: number): void {
  pendingSeek = t
  if (!raf) raf = requestAnimationFrame(flushSeek)
}

function onPointerDown(e: PointerEvent): void {
  if (props.disabled || !hasDuration.value || e.button !== 0) return
  root.value?.setPointerCapture?.(e.pointerId)
  dragTime.value = timeAtClientX(e.clientX)
  emit('scrubstart')
  queueSeek(dragTime.value)
}

function onPointerMove(e: PointerEvent): void {
  const rect = root.value?.getBoundingClientRect()
  if (rect) hoverX.value = e.clientX - rect.left
  if (dragTime.value !== null) {
    dragTime.value = timeAtClientX(e.clientX)
    queueSeek(dragTime.value)
  }
}

function onPointerUp(e: PointerEvent): void {
  if (dragTime.value === null) return
  root.value?.releasePointerCapture?.(e.pointerId)
  const t = timeAtClientX(e.clientX)
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  pendingSeek = null
  emit('seek', t)
  dragTime.value = null
  emit('scrubend')
  if (e.pointerType !== 'mouse') hoverX.value = null
}

function onPointerLeave(): void {
  if (dragTime.value === null) hoverX.value = null
}

function onKeydown(e: KeyboardEvent): void {
  if (props.disabled || !hasDuration.value) return
  const big = props.duration / 10
  let next: number | null = null
  switch (e.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      next = props.currentTime - props.step
      break
    case 'ArrowRight':
    case 'ArrowUp':
      next = props.currentTime + props.step
      break
    case 'PageDown':
      next = props.currentTime - big
      break
    case 'PageUp':
      next = props.currentTime + big
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = props.duration
      break
  }
  if (next === null) return
  e.preventDefault()
  e.stopPropagation()
  emit('seek', clamp(next, 0, props.duration))
}

const ariaValueText = computed(() =>
  props.valueText(formatTime(props.currentTime), formatTime(props.duration)),
)
</script>

<template>
  <div
    ref="root"
    class="uid-media-scrubber"
    :class="{
      'uid-media-scrubber--wave': !!waveBars || pending,
      'uid-media-scrubber--pending': pending && !waveBars,
      'uid-media-scrubber--dragging': dragTime !== null,
      'uid-media-scrubber--disabled': disabled || !hasDuration,
    }"
    role="slider"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    :aria-valuemin="0"
    :aria-valuemax="Math.floor(duration || 0)"
    :aria-valuenow="Math.floor(currentTime || 0)"
    :aria-valuetext="ariaValueText"
    :aria-disabled="disabled || !hasDuration ? 'true' : undefined"
    :style="{ '--_played': `${playedPct}%` }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerleave="onPointerLeave"
    @keydown="onKeydown"
  >
    <div
      v-if="waveBars"
      class="uid-media-scrubber__wave"
      aria-hidden="true"
    >
      <svg
        class="uid-media-scrubber__wave-base"
        :viewBox="waveViewBox"
        preserveAspectRatio="none"
      >
        <path :d="wavePath" />
      </svg>
      <svg
        class="uid-media-scrubber__wave-played"
        :viewBox="waveViewBox"
        preserveAspectRatio="none"
      >
        <path :d="wavePath" />
      </svg>
    </div>
    <div
      v-else-if="pending"
      class="uid-media-scrubber__placeholder"
      aria-hidden="true"
    />
    <div
      v-else
      class="uid-media-scrubber__rail"
      :style="chapterMask"
      aria-hidden="true"
    >
      <div
        v-for="(seg, i) in bufferedSegments"
        :key="i"
        class="uid-media-scrubber__buffered"
        :style="{ left: `${seg.left}%`, width: `${seg.width}%` }"
      />
      <div class="uid-media-scrubber__played" />
    </div>
    <div
      v-if="!waveBars && !pending"
      class="uid-media-scrubber__handle"
      aria-hidden="true"
    />
    <div
      v-if="previewTime !== null && hoverTime !== null && (waveBars || pending)"
      class="uid-media-scrubber__hover-line"
      :style="{ left: `${pct(hoverTime)}%` }"
      aria-hidden="true"
    />
    <div
      v-if="previewTime !== null"
      class="uid-media-scrubber__preview"
      :style="previewStyle"
      aria-hidden="true"
    >
      <div
        v-if="thumbStyle"
        class="uid-media-scrubber__thumb"
        :style="thumbStyle"
      />
      <div
        v-if="previewChapter"
        class="uid-media-scrubber__chapter"
      >
        {{ previewChapter }}
      </div>
      <div class="uid-media-scrubber__time">
        {{ formatTime(previewTime, duration >= 3600) }}
      </div>
    </div>
  </div>
</template>
