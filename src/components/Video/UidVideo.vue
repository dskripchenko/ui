<script setup lang="ts">
import '../Media/UidMedia.css'
import './UidVideo.css'
import {
  computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch,
} from 'vue'
import {
  Captions, CircleAlert, LoaderCircle, Maximize, Minimize, Pause, PictureInPicture2, Play,
  RotateCcw, Settings, Volume1, Volume2, VolumeX,
} from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidMediaScrubber from '../Media/UidMediaScrubber.vue'
import UidMediaMenu, { type UidMediaMenuGroup } from '../Media/UidMediaMenu.vue'
import { useMediaController, type UidMediaErrorInfo } from '../Media/useMediaController.js'
import { useMediaLocale } from '../Media/useMediaLocale.js'
import { useLocale } from '../../composables/useLocale.js'
import {
  PLAYBACK_RATES, cueAt, cueText, formatTime, isHlsSource, orderSources, parseThumbnail, parseVtt,
  type UidMediaCue, type UidMediaSource, type UidMediaTrack,
} from '../Media/mediaUtils.js'
import type { HlsAudioTrack, HlsLevel, HlsOptions, HlsSession } from '../../hls/index.js'

export type UidHlsModule = typeof import('../../hls/index.js')

export interface UidVideoProps {
  src?: string
  /** Alternatives in order of preference; labelled ones form the quality menu. */
  sources?: UidMediaSource[]
  poster?: string
  /** WebVTT subtitles, captions and chapters. */
  tracks?: UidMediaTrack[]
  /** WebVTT with sprite thumbnails (`sprite.jpg#xywh=x,y,w,h`) shown over the scrub bar. */
  thumbnails?: string
  /** Starts playing muted as soon as possible (browsers block unmuted autoplay). */
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  /** `false` hides the kit's controls (the element stays bare). */
  controls?: boolean
  crossorigin?: '' | 'anonymous' | 'use-credentials'
  /** Starting this player pauses the other exclusive players on the page. */
  exclusive?: boolean
  /** Remembers the position in localStorage under this key and resumes from it. */
  resumeKey?: string
  rates?: number[]
  hotkeys?: boolean
  /** Box ratio before the video size is known, e.g. `16 / 9`. */
  aspectRatio?: string
  /** Accessible name of the player. */
  title?: string
  /** Milliseconds of inactivity before the controls hide while playing. */
  autoHide?: number
  hlsOptions?: Omit<HlsOptions, 'onLevels' | 'onLevelSwitched' | 'onAudioTracks' | 'onAudioTrackSwitched' | 'onError'>
  /** Loads the HLS adapter; defaults to the lazily imported `@dskripchenko/ui/hls`. */
  hlsLoader?: () => Promise<UidHlsModule>
}

const props = withDefaults(defineProps<UidVideoProps>(), {
  src: undefined,
  sources: undefined,
  poster: undefined,
  tracks: () => [],
  thumbnails: undefined,
  autoplay: false,
  muted: false,
  loop: false,
  preload: 'metadata',
  controls: true,
  crossorigin: undefined,
  exclusive: true,
  resumeKey: undefined,
  rates: () => PLAYBACK_RATES,
  hotkeys: true,
  aspectRatio: '16 / 9',
  title: undefined,
  autoHide: 2500,
  hlsOptions: undefined,
  hlsLoader: undefined,
})

const emit = defineEmits<{
  play: []
  pause: []
  ended: []
  error: [error: UidMediaErrorInfo]
  qualitychange: [label: string]
  audiotrackchange: [label: string]
}>()

const t = useMediaLocale()
const uidLocale = useLocale()
const root = ref<HTMLElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const trackEls = ref<HTMLTrackElement[]>([])

const captionIndex = ref(-1)
let lastCaption = 0

const ctrl = useMediaController(video, {
  exclusive: () => props.exclusive,
  fullscreenTarget: root,
  resumeKey: () => props.resumeKey,
  onCaptionsToggle: () => toggleCaptions(),
})
const { state } = ctrl

// ---- sources ----

const allSources = computed<UidMediaSource[]>(() =>
  props.sources?.length ? props.sources : props.src ? [{ src: props.src }] : [],
)
const candidates = shallowRef<UidMediaSource[]>([])
const active = ref(-1)
const hls = shallowRef<HlsSession | null>(null)
const hlsLevels = ref<HlsLevel[]>([])
const hlsLevel = ref(-1)
const hlsAuto = ref(true)
const audioTracks = ref<HlsAudioTrack[]>([])
const audioTrack = ref(-1)
let loadToken = 0

function hlsPlayable(el: HTMLVideoElement): boolean {
  const w = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : {}
  return !!el.canPlayType('application/vnd.apple.mpegurl') || !!w.MediaSource || !!w.ManagedMediaSource
}

function teardownHls(): void {
  hls.value?.destroy()
  hls.value = null
  hlsLevels.value = []
  hlsLevel.value = -1
  audioTracks.value = []
  audioTrack.value = -1
}

async function load(index: number, resume?: { time: number, play: boolean }): Promise<void> {
  const el = video.value
  if (!el) return
  const token = ++loadToken
  teardownHls()
  ctrl.setError(null)
  active.value = index
  const source = candidates.value[index]
  if (!source) {
    if (allSources.value.length) ctrl.setError({ kind: 'unsupported' })
    return
  }
  if (resume) {
    el.addEventListener('loadedmetadata', () => {
      if (resume.time) ctrl.seek(resume.time)
      if (resume.play) ctrl.play().catch(() => {})
    }, { once: true })
  }
  if (isHlsSource(source)) {
    try {
      const mod = await (props.hlsLoader ?? (() => import('../../hls/index.js')))()
      if (token !== loadToken) return
      hls.value = mod.attachHls(el, source.src, {
        ...props.hlsOptions,
        onLevels: (levels) => { hlsLevels.value = levels },
        onLevelSwitched: (i) => { hlsLevel.value = i },
        onAudioTracks: (list) => { audioTracks.value = list },
        onAudioTrackSwitched: (i) => { audioTrack.value = i },
        onError: (e) => ctrl.setError({ kind: e.code, detail: e.message }),
      })
    } catch (e) {
      ctrl.setError({ kind: 'unknown', detail: (e as Error).message })
    }
  } else {
    el.src = source.src
    el.load()
  }
  if (props.autoplay && !resume) {
    el.muted = true
    ctrl.play().catch(() => {})
  }
}

function reset(): void {
  const el = video.value
  if (!el) return
  candidates.value = orderSources(allSources.value, (type) => el.canPlayType(type), hlsPlayable(el))
  load(0)
}

watch(allSources, reset)

watch(() => state.error, (err) => {
  if (!err) return
  // A source the browser turned down: fall back to the next candidate.
  if ((err.kind === 'unsupported' || err.kind === 'decode') && active.value + 1 < candidates.value.length && !hls.value) {
    load(active.value + 1)
    return
  }
  emit('error', err)
})

const errorMessage = computed(() => {
  const err = state.error
  if (!err) return ''
  return t.value.errors[err.kind] ?? t.value.errors.unknown
})

function retry(): void {
  const time = state.currentTime
  load(Math.max(0, active.value), { time, play: true })
}

// ---- quality ----

const labelledSources = computed(() => candidates.value.filter((s) => s.label && !isHlsSource(s)))

const qualityGroup = computed<UidMediaMenuGroup | null>(() => {
  if (hlsLevels.value.length > 1) {
    const current = hlsLevels.value[hlsLevel.value]?.label
    const options = [
      { value: -1, label: t.value.auto, hint: hlsAuto.value && current ? current : undefined },
      ...hlsLevels.value.slice().reverse().map((l) => ({ value: l.index, label: l.label })),
    ]
    return { id: 'quality', label: t.value.quality, value: hlsAuto.value ? -1 : hlsLevel.value, options }
  }
  if (labelledSources.value.length > 1) {
    const cur = candidates.value[active.value]
    return {
      id: 'quality',
      label: t.value.quality,
      value: cur ? candidates.value.indexOf(cur) : null,
      options: labelledSources.value.map((s) => ({ value: candidates.value.indexOf(s), label: s.label as string })),
    }
  }
  return null
})

function setQuality(value: number): void {
  if (hlsLevels.value.length > 1) {
    hlsAuto.value = value < 0
    hls.value?.setLevel(value)
    emit('qualitychange', value < 0 ? 'auto' : hlsLevels.value[value]?.label ?? '')
    return
  }
  if (value === active.value) return
  load(value, { time: state.currentTime, play: !state.paused })
  emit('qualitychange', candidates.value[value]?.label ?? '')
}

// ---- tracks: captions, chapters, thumbnails ----

const textTracks = computed(() => props.tracks.filter((tr) => tr.kind !== 'chapters'))
const chapterTrack = computed(() => props.tracks.find((tr) => tr.kind === 'chapters'))
const chapters = ref<UidMediaCue[]>([])
const thumbCues = ref<UidMediaCue[]>([])
const captionLines = ref<string[]>([])

async function fetchCues(url: string | undefined): Promise<UidMediaCue[]> {
  if (!url || typeof fetch === 'undefined') return []
  try {
    const res = await fetch(url, { credentials: props.crossorigin === 'use-credentials' ? 'include' : 'same-origin' })
    return res.ok ? parseVtt(await res.text()) : []
  } catch {
    return []
  }
}

watch(() => chapterTrack.value?.src, async (url) => { chapters.value = await fetchCues(url) }, { immediate: true })
watch(() => props.thumbnails, async (url) => { thumbCues.value = await fetchCues(url) }, { immediate: true })

function thumbnailAt(time: number) {
  const cue = cueAt(thumbCues.value, time)
  return cue && props.thumbnails ? parseThumbnail(cue.text, props.thumbnails) : null
}

const currentChapter = computed(() => cueAt(chapters.value, state.currentTime)?.text)

watch(textTracks, (list) => {
  const def = list.findIndex((tr) => tr.default)
  captionIndex.value = def
  if (def >= 0) lastCaption = def
}, { immediate: true })

let cueTrack: TextTrack | null = null

function onCueChange(): void {
  const cues = cueTrack?.activeCues
  const lines: string[] = []
  if (cues) {
    for (let i = 0; i < cues.length; i++) {
      const text = (cues[i] as VTTCue).text
      if (text) lines.push(...cueText(text).split('\n'))
    }
  }
  captionLines.value = lines
}

function applyCaptionModes(): void {
  cueTrack?.removeEventListener('cuechange', onCueChange)
  cueTrack = null
  captionLines.value = []
  const nativeFs = (video.value as { webkitDisplayingFullscreen?: boolean } | null)?.webkitDisplayingFullscreen
  trackEls.value.forEach((el, i) => {
    const tt = el.track
    if (!tt) return
    if (i === captionIndex.value) {
      // Hidden: the browser keeps cues current, the kit draws them; iOS native full screen shows its own.
      tt.mode = nativeFs ? 'showing' : 'hidden'
      cueTrack = tt
    } else {
      tt.mode = 'disabled'
    }
  })
  const active = cueTrack as TextTrack | null
  if (active) {
    active.addEventListener('cuechange', onCueChange)
    onCueChange()
  }
}

watch([captionIndex, () => textTracks.value.length], () => nextTick(applyCaptionModes))
watch(() => state.fullscreen, () => nextTick(applyCaptionModes))

function toggleCaptions(): void {
  if (!textTracks.value.length) return
  if (captionIndex.value >= 0) {
    lastCaption = captionIndex.value
    captionIndex.value = -1
  } else {
    captionIndex.value = Math.min(lastCaption, textTracks.value.length - 1)
  }
}

const captionsGroup = computed<UidMediaMenuGroup>(() => ({
  id: 'captions',
  label: t.value.captions,
  value: captionIndex.value,
  options: [
    { value: -1, label: t.value.captionsOff },
    ...textTracks.value.map((tr, i) => ({ value: i, label: tr.label ?? tr.srclang ?? `#${i + 1}` })),
  ],
}))

// ---- settings menu ----

const rateGroup = computed<UidMediaMenuGroup>(() => ({
  id: 'rate',
  label: t.value.speed,
  value: state.rate,
  options: props.rates.map((r) => ({ value: r, label: r === 1 ? t.value.normalSpeed : `${r}×`, short: `${r}×` })),
}))

const audioGroup = computed<UidMediaMenuGroup | null>(() => (audioTracks.value.length > 1
  ? {
      id: 'audio',
      label: t.value.audioTrack,
      value: audioTrack.value,
      options: audioTracks.value.map((a) => ({ value: a.index, label: a.label })),
    }
  : null))

const settingsGroups = computed(() =>
  [rateGroup.value, qualityGroup.value, audioGroup.value].filter((g): g is UidMediaMenuGroup => !!g),
)

function onMenuSelect(group: string, value: string | number): void {
  if (group === 'rate') ctrl.setRate(Number(value))
  else if (group === 'quality') setQuality(Number(value))
  else if (group === 'audio') {
    hls.value?.setAudioTrack(Number(value))
    emit('audiotrackchange', audioTracks.value[Number(value)]?.label ?? '')
  }
  else if (group === 'captions') {
    captionIndex.value = Number(value)
    if (captionIndex.value >= 0) lastCaption = captionIndex.value
  }
}

// ---- controls visibility and gestures ----

const controlsVisible = ref(true)
const menuOpen = ref(false)
const scrubbing = ref(false)
const started = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

function clearHide(): void {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = null
}

function scheduleHide(delay = props.autoHide): void {
  clearHide()
  if (!state.playing || menuOpen.value || scrubbing.value) return
  hideTimer = setTimeout(() => {
    if (state.playing && !menuOpen.value && !scrubbing.value) controlsVisible.value = false
  }, delay)
}

function poke(): void {
  controlsVisible.value = true
  scheduleHide()
}

watch(() => state.playing, (playing) => {
  if (playing) {
    started.value = true
    scheduleHide()
    emit('play')
  } else {
    controlsVisible.value = true
    clearHide()
  }
})
watch(() => state.paused, (p) => { if (p && started.value && !state.ended) emit('pause') })
watch(() => state.ended, (e) => { if (e) emit('ended') })
watch([menuOpen, scrubbing], ([m, s]) => (m || s ? (clearHide(), (controlsVisible.value = true)) : scheduleHide()))

const flash = ref<{ side: 'left' | 'right', seconds: number } | null>(null)
let flashTimer: ReturnType<typeof setTimeout> | null = null
let lastTap = { time: 0, side: '' as 'left' | 'right' | 'center' | '' }
let tapTimer: ReturnType<typeof setTimeout> | null = null

function showFlash(side: 'left' | 'right', seconds: number): void {
  const accumulate = flash.value && flash.value.side === side
  flash.value = { side, seconds: accumulate ? (flash.value as { seconds: number }).seconds + seconds : seconds }
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => { flash.value = null }, 700)
}

function onSurfaceUp(e: PointerEvent): void {
  if (e.button !== 0 || state.error) return
  if (e.pointerType === 'mouse') {
    ctrl.toggle()
    poke()
    return
  }
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = (e.clientX - rect.left) / (rect.width || 1)
  const side = x < 0.35 ? 'left' : x > 0.65 ? 'right' : 'center'
  const now = Date.now()
  if (now - lastTap.time < 300 && side === lastTap.side && side !== 'center') {
    if (tapTimer) clearTimeout(tapTimer)
    tapTimer = null
    ctrl.skip(side === 'left' ? -10 : 10)
    showFlash(side, 10)
    lastTap = { time: now, side }
    return
  }
  lastTap = { time: now, side }
  if (tapTimer) clearTimeout(tapTimer)
  tapTimer = setTimeout(() => {
    tapTimer = null
    if (!started.value || state.paused) {
      ctrl.toggle()
      poke()
    } else if (controlsVisible.value) {
      controlsVisible.value = false
    } else {
      poke()
    }
  }, 260)
}

function onSurfaceDblClick(e: MouseEvent): void {
  if ((e as PointerEvent).pointerType && (e as PointerEvent).pointerType !== 'mouse') return
  ctrl.toggleFullscreen().catch(() => {})
}

function onKeydown(e: KeyboardEvent): void {
  if (!props.hotkeys || !props.controls) return
  const target = e.target as HTMLElement
  const tag = target.tagName
  if ((tag === 'BUTTON' || tag === 'A') && (e.key === ' ' || e.key === 'Enter')) return
  if (tag === 'INPUT' && e.key.startsWith('Arrow')) return
  if (tag === 'INPUT' && (target as HTMLInputElement).type !== 'range') return
  if (ctrl.handleKey(e)) {
    e.preventDefault()
    poke()
    if (e.key === 'ArrowLeft' || e.key === 'j') showFlash('left', e.key === 'j' ? 10 : 5)
    if (e.key === 'ArrowRight' || e.key === 'l') showFlash('right', e.key === 'l' ? 10 : 5)
  }
}

// ---- derived UI ----

const volumeIcon = computed(() => (state.muted || state.volume === 0 ? VolumeX : state.volume < 0.5 ? Volume1 : Volume2))
const showHours = computed(() => state.duration >= 3600)
const timeText = computed(() => `${formatTime(state.currentTime, showHours.value)} / ${formatTime(state.duration, showHours.value)}`)
const atLiveEdge = computed(() => state.live && state.duration - state.currentTime < 8)
const loadingVisible = computed(() => !state.error && (state.waiting || (state.seeking && !state.paused)))
const coarse = ref(false)
// Desktop: the centre button only invites the first start (and a replay); on touch it is the
// play / pause toggle shown together with the controls, as phone players do.
const bigPlayVisible = computed(() => {
  if (state.error || loadingVisible.value) return false
  if (!started.value || state.ended) return true
  return coarse.value ? controlsVisible.value : false
})
const hasVideoSize = ref(false)

function goLive(): void {
  ctrl.seek(state.duration - 1)
  if (state.paused) ctrl.play().catch(() => {})
}

function onVolumeInput(e: Event): void {
  ctrl.setVolume(Number((e.target as HTMLInputElement).value))
}

function onMeta(): void {
  hasVideoSize.value = !!video.value?.videoWidth
}

onMounted(() => {
  coarse.value = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  if (props.muted && video.value) video.value.muted = true
  reset()
  applyCaptionModes()
})

onBeforeUnmount(() => {
  clearHide()
  if (flashTimer) clearTimeout(flashTimer)
  if (tapTimer) clearTimeout(tapTimer)
  cueTrack?.removeEventListener('cuechange', onCueChange)
  teardownHls()
})

defineExpose({
  play: ctrl.play,
  pause: ctrl.pause,
  toggle: ctrl.toggle,
  seek: ctrl.seek,
  state,
  media: video,
})
</script>

<template>
  <div
    ref="root"
    class="uid-video"
    :class="{
      'uid-video--controls-hidden': controls && !controlsVisible,
      'uid-video--playing': state.playing,
      'uid-video--fullscreen': state.fullscreen,
      'uid-video--started': started,
      'uid-video--paused': state.paused,
      'uid-video--bare': !controls,
    }"
    :style="{ aspectRatio: state.fullscreen ? undefined : aspectRatio }"
    role="region"
    data-media-menu-bounds
    :aria-label="title ?? t.play"
    tabindex="0"
    @keydown="onKeydown"
    @pointermove="(e) => e.pointerType === 'mouse' && poke()"
    @pointerleave="(e) => e.pointerType === 'mouse' && scheduleHide(600)"
    @focusin="poke"
  >
    <video
      ref="video"
      class="uid-video__media"
      :poster="poster"
      :preload="preload"
      :loop="loop"
      :crossorigin="crossorigin"
      :controls="!controls"
      playsinline
      webkit-playsinline
      :title="title"
      @loadedmetadata="onMeta"
    >
      <track
        v-for="(tr, i) in textTracks"
        :key="`${i}:${tr.src}`"
        ref="trackEls"
        :kind="tr.kind ?? 'subtitles'"
        :src="tr.src"
        :srclang="tr.srclang"
        :label="tr.label"
      >
    </video>

    <template v-if="controls">
      <div
        class="uid-video__surface"
        aria-hidden="true"
        @pointerup="onSurfaceUp"
        @dblclick="onSurfaceDblClick"
      />

      <div
        v-if="captionLines.length"
        class="uid-video__captions"
      >
        <span
          v-for="(line, i) in captionLines"
          :key="i"
          class="uid-video__caption-line"
        >{{ line }}</span>
      </div>

      <div
        v-if="flash"
        class="uid-video__flash"
        :class="`uid-video__flash--${flash.side}`"
        aria-hidden="true"
      >
        {{ flash.side === 'left' ? '−' : '+' }}{{ flash.seconds }} s
      </div>

      <div
        v-if="loadingVisible"
        class="uid-video__loading"
        role="status"
        :aria-label="t.loading"
      >
        <UidIcon
          :icon="LoaderCircle"
          :size="44"
          class="uid-media__spin"
        />
      </div>

      <button
        v-if="bigPlayVisible"
        type="button"
        class="uid-video__big-play"
        :aria-label="state.ended ? t.replay : state.paused ? t.play : t.pause"
        @click="ctrl.toggle(); poke()"
      >
        <UidIcon
          :icon="state.ended ? RotateCcw : state.paused ? Play : Pause"
          :size="32"
          :class="{ 'uid-media__fill': !state.ended, 'uid-video__big-icon--pause': !state.paused }"
        />
      </button>

      <div
        v-if="state.error"
        class="uid-video__error"
        role="alert"
      >
        <UidIcon
          :icon="CircleAlert"
          :size="28"
        />
        <p class="uid-video__error-text">
          {{ errorMessage }}
        </p>
        <button
          type="button"
          class="uid-video__retry"
          @click="retry"
        >
          {{ t.retry }}
        </button>
      </div>

      <div
        class="uid-video__controls"
        @pointermove.stop="poke"
      >
        <UidMediaScrubber
          class="uid-video__scrubber"
          :current-time="state.currentTime"
          :duration="state.duration"
          :buffered="state.buffered"
          :chapters="chapters"
          :thumbnail-at="thumbCues.length ? thumbnailAt : undefined"
          :label="t.seek"
          :value-text="t.timeOf"
          :disabled="!!state.error"
          :suppress-preview="menuOpen || !controlsVisible"
          @seek="ctrl.seek"
          @scrubstart="scrubbing = true"
          @scrubend="scrubbing = false"
        />
        <div class="uid-video__bar">
          <button
            type="button"
            class="uid-media__button"
            :aria-label="state.playing || !state.paused ? t.pause : t.play"
            :title="state.playing || !state.paused ? t.pause : t.play"
            @click="ctrl.toggle"
          >
            <UidIcon
              :icon="!state.paused ? Pause : state.ended ? RotateCcw : Play"
              :size="20"
              :class="{ 'uid-media__fill': !state.ended || !state.paused }"
            />
          </button>
          <div class="uid-media__volume">
            <button
              type="button"
              class="uid-media__button"
              :aria-label="state.muted ? t.unmute : t.mute"
              :title="state.muted ? t.unmute : t.mute"
              @click="ctrl.toggleMute"
            >
              <UidIcon
                :icon="volumeIcon"
                :size="20"
              />
            </button>
            <input
              class="uid-media__volume-range"
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="state.muted ? 0 : state.volume"
              :aria-label="t.volume"
              :aria-valuetext="`${Math.round((state.muted ? 0 : state.volume) * 100)}%`"
              :style="{ '--_fill': `${(state.muted ? 0 : state.volume) * 100}%` }"
              @input="onVolumeInput"
            >
          </div>
          <button
            v-if="state.live"
            type="button"
            class="uid-video__live"
            :class="{ 'uid-video__live--edge': atLiveEdge }"
            :aria-label="t.goLive"
            @click="goLive"
          >
            <span
              class="uid-video__live-dot"
              aria-hidden="true"
            />{{ t.live }}
          </button>
          <span
            v-else
            class="uid-media__time"
          >{{ timeText }}</span>
          <span
            v-if="currentChapter"
            class="uid-video__chapter"
            :title="currentChapter"
          >{{ currentChapter }}</span>
          <span class="uid-video__spacer" />
          <UidMediaMenu
            v-if="textTracks.length"
            :close-label="uidLocale.common.close"
            :label="t.captions"
            :groups="[captionsGroup]"
            :button-class="captionIndex >= 0 ? 'uid-media__button--on' : ''"
            @select="onMenuSelect"
            @update:open="menuOpen = $event"
          >
            <UidIcon
              :icon="Captions"
              :size="20"
            />
          </UidMediaMenu>
          <UidMediaMenu
            :label="t.settings"
            :close-label="uidLocale.common.close"
            :groups="settingsGroups"
            @select="onMenuSelect"
            @update:open="menuOpen = $event"
          >
            <UidIcon
              :icon="Settings"
              :size="20"
            />
            <span
              v-if="state.rate !== 1"
              class="uid-media__badge"
            >{{ state.rate }}×</span>
          </UidMediaMenu>
          <button
            v-if="ctrl.canPip.value && hasVideoSize"
            type="button"
            class="uid-media__button uid-video__pip"
            :aria-label="state.pip ? t.exitPip : t.pip"
            :title="state.pip ? t.exitPip : t.pip"
            @click="ctrl.togglePip().catch(() => {})"
          >
            <UidIcon
              :icon="PictureInPicture2"
              :size="20"
            />
          </button>
          <button
            v-if="ctrl.canFullscreen.value"
            type="button"
            class="uid-media__button"
            :aria-label="state.fullscreen ? t.exitFullscreen : t.fullscreen"
            :title="state.fullscreen ? t.exitFullscreen : t.fullscreen"
            @click="ctrl.toggleFullscreen().catch(() => {})"
          >
            <UidIcon
              :icon="state.fullscreen ? Minimize : Maximize"
              :size="20"
            />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
