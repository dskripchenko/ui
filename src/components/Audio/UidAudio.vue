<script setup lang="ts">
import '../Media/UidMedia.css'
import './UidAudio.css'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  CircleAlert, LoaderCircle, Pause, Play, SkipBack, SkipForward, Volume1, Volume2, VolumeX,
} from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidMediaScrubber from '../Media/UidMediaScrubber.vue'
import UidMediaMenu, { type UidMediaMenuGroup } from '../Media/UidMediaMenu.vue'
import { useMediaController, type UidMediaErrorInfo } from '../Media/useMediaController.js'
import { useMediaLocale } from '../Media/useMediaLocale.js'
import { PLAYBACK_RATES, formatTime, isHlsSource } from '../Media/mediaUtils.js'
import type { HlsOptions, HlsSession } from '../../hls/index.js'
import type { UidHlsModule } from '../Video/UidVideo.vue'
import { getWaveform } from '../Media/waveform.js'

export interface UidAudioTrack {
  src: string
  type?: string
  title?: string
  artist?: string
  /** Precomputed waveform peaks (0..1). */
  peaks?: number[]
  /** Known duration in seconds, shown in the playlist before metadata loads. */
  duration?: number
}

export interface UidAudioProps {
  src?: string
  type?: string
  title?: string
  artist?: string
  /** Playlist: next / previous buttons, a track list and auto-advance. */
  tracks?: UidAudioTrack[]
  /** `mini` — a compact inline player for tables and lists. */
  variant?: 'default' | 'mini'
  /** Draws the waveform as the scrub bar, decoded in the browser. */
  waveform?: boolean
  /** Precomputed peaks (0..1); implies the waveform without decoding. */
  peaks?: number[]
  /** Files larger than this are not decoded for the waveform (bytes). */
  waveformMaxBytes?: number
  /** Audio longer than this is not decoded for the waveform (seconds). */
  waveformMaxDuration?: number
  /** Plays the next playlist track when one ends. */
  autoAdvance?: boolean
  /** Repeats the track, or the whole playlist. */
  loop?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  crossorigin?: '' | 'anonymous' | 'use-credentials'
  exclusive?: boolean
  resumeKey?: string
  rates?: number[]
  hotkeys?: boolean
  showVolume?: boolean
  showRate?: boolean
  /** Shows the track list in playlist mode. */
  showPlaylist?: boolean
  hlsOptions?: Omit<HlsOptions, 'onError'>
  /** Loads the HLS adapter for `.m3u8` sources; defaults to the lazily imported `@dskripchenko/ui/hls`. */
  hlsLoader?: () => Promise<UidHlsModule>
}

const props = withDefaults(defineProps<UidAudioProps>(), {
  src: undefined,
  type: undefined,
  title: undefined,
  artist: undefined,
  tracks: undefined,
  variant: 'default',
  waveform: false,
  peaks: undefined,
  waveformMaxBytes: undefined,
  waveformMaxDuration: undefined,
  autoAdvance: true,
  loop: false,
  preload: 'metadata',
  crossorigin: undefined,
  exclusive: true,
  resumeKey: undefined,
  rates: () => PLAYBACK_RATES,
  hotkeys: true,
  showVolume: true,
  showRate: true,
  showPlaylist: true,
  hlsOptions: undefined,
  hlsLoader: undefined,
})

const index = defineModel<number>('index', { default: 0 })

const emit = defineEmits<{
  play: []
  pause: []
  ended: []
  error: [error: UidMediaErrorInfo]
  trackchange: [index: number]
}>()

const t = useMediaLocale()
const root = ref<HTMLElement | null>(null)
const audio = ref<HTMLAudioElement | null>(null)

const ctrl = useMediaController(audio, {
  exclusive: () => props.exclusive,
  resumeKey: () => (props.resumeKey ? `${props.resumeKey}:${index.value}` : undefined),
})
const { state } = ctrl

const playlist = computed(() => props.tracks ?? [])
const isPlaylist = computed(() => playlist.value.length > 0)
const current = computed<UidAudioTrack | null>(() => {
  if (isPlaylist.value) return playlist.value[Math.min(Math.max(index.value, 0), playlist.value.length - 1)] ?? null
  return props.src ? { src: props.src, type: props.type, title: props.title, artist: props.artist, peaks: props.peaks } : null
})
const mini = computed(() => props.variant === 'mini')
const isHls = computed(() => !!current.value && isHlsSource(current.value))
const hasMeta = computed(() => !mini.value && !!(current.value?.title || current.value?.artist))

// ---- waveform ----

const wavePeaks = ref<number[] | null>(null)
const waveWanted = computed(() => (props.waveform && !isHls.value) || !!current.value?.peaks?.length)
const wavePending = ref(false)
const visible = ref(false)
let io: IntersectionObserver | null = null
let waveToken = 0

async function loadWave(): Promise<void> {
  const tr = current.value
  const token = ++waveToken
  wavePeaks.value = tr?.peaks?.length ? tr.peaks : null
  wavePending.value = !!tr && !wavePeaks.value && waveWanted.value
  if (!tr || wavePeaks.value || !waveWanted.value || !visible.value) return
  const result = await getWaveform(tr.src, {
    maxBytes: props.waveformMaxBytes,
    maxDuration: props.waveformMaxDuration,
    fetchInit: props.crossorigin === 'use-credentials' ? { credentials: 'include' } : undefined,
  })
  if (token !== waveToken) return
  wavePeaks.value = result
  wavePending.value = false
}

watch([() => current.value?.src, () => current.value?.peaks, () => props.waveform, visible], loadWave, { immediate: true })

// ---- playlist ----

let playOnLoad = false

function select(i: number, autoplay = true): void {
  if (!isPlaylist.value) return
  const n = playlist.value.length
  const next = props.loop ? (i + n) % n : i
  if (next < 0 || next >= n) return
  playOnLoad = autoplay
  if (next === index.value) {
    ctrl.seek(0)
    if (autoplay) ctrl.play().catch(() => {})
    return
  }
  index.value = next
}

let session: HlsSession | null = null
let hlsToken = 0

function detachHls(): void {
  hlsToken++
  session?.destroy()
  session = null
}

async function attachHls(): Promise<void> {
  const el = audio.value
  const tr = current.value
  if (!el || !tr || !isHls.value) return
  const token = ++hlsToken
  try {
    const mod = await (props.hlsLoader ?? (() => import('../../hls/index.js')))()
    if (token !== hlsToken) return
    session = mod.attachHls(el, tr.src, {
      ...props.hlsOptions,
      onError: (e) => ctrl.setError({ kind: e.code, detail: e.message }),
    })
  } catch (e) {
    ctrl.setError({ kind: 'unknown', detail: (e as Error).message })
  }
}

function checkType(): void {
  const type = current.value?.type
  if (type && audio.value && !audio.value.canPlayType(type)) ctrl.setError({ kind: 'unsupported', detail: type })
}

// Before the DOM update: an HLS session must let go of the element before a plain src is bound.
watch(() => current.value?.src, detachHls)

watch(() => current.value?.src, () => {
  ctrl.setError(null)
  emit('trackchange', index.value)
  checkType()
  if (isHls.value) {
    attachHls()
    // MediaSource attaches asynchronously: start once there is something to play.
    if (playOnLoad) audio.value?.addEventListener('loadedmetadata', () => ctrl.play().catch(() => {}), { once: true })
  } else if (playOnLoad && !state.error) {
    ctrl.play().catch(() => {})
  }
  playOnLoad = false
}, { flush: 'post' })

watch(() => state.ended, (ended) => {
  if (!ended) return
  emit('ended')
  if (isPlaylist.value && props.autoAdvance && (index.value < playlist.value.length - 1 || props.loop)) {
    select(index.value + 1)
  }
})

watch(() => state.playing, (p) => (p ? emit('play') : undefined))
watch(() => state.paused, (p) => { if (p && !state.ended && state.currentTime > 0) emit('pause') })
watch(() => state.error, (e) => { if (e) emit('error', e) })

const hasPrev = computed(() => isPlaylist.value && (index.value > 0 || props.loop))
const hasNext = computed(() => isPlaylist.value && (index.value < playlist.value.length - 1 || props.loop))

function prev(): void {
  // Like most players: "previous" first rewinds a track that has been playing for a while.
  if (state.currentTime > 3 || !hasPrev.value) {
    ctrl.seek(0)
    return
  }
  select(index.value - 1, !state.paused)
}

function next(): void {
  if (hasNext.value) select(index.value + 1, !state.paused || state.ended)
}

const durations = ref<Record<number, number>>({})
let durationToken = 0

/** Reads the duration of every playlist track, one at a time, from its metadata. */
async function prefetchDurations(): Promise<void> {
  if (!isPlaylist.value || typeof Audio === 'undefined') return
  const token = ++durationToken
  const list = playlist.value
  for (let i = 0; i < list.length; i++) {
    const tr = list[i]
    if (token !== durationToken) return
    if (tr.duration || durations.value[i] || isHlsSource(tr)) continue
    const d = await new Promise<number>((resolve) => {
      const probe = new Audio()
      probe.preload = 'metadata'
      if (props.crossorigin !== undefined) probe.crossOrigin = props.crossorigin
      const done = (value: number): void => {
        probe.removeAttribute('src')
        probe.load()
        resolve(value)
      }
      probe.addEventListener('loadedmetadata', () => done(probe.duration), { once: true })
      probe.addEventListener('error', () => done(NaN), { once: true })
      setTimeout(() => done(NaN), 15000)
      probe.src = tr.src
    })
    if (token === durationToken && Number.isFinite(d) && d > 0) durations.value = { ...durations.value, [i]: d }
  }
}

watch(() => props.tracks, () => {
  durations.value = {}
  prefetchDurations()
})
watch(() => state.duration, (d) => {
  if (d && isPlaylist.value) durations.value = { ...durations.value, [index.value]: d }
})

// ---- media session (lock screen, hardware keys) ----

function updateMediaSession(): void {
  const ms = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined
  if (!ms || !state.playing || typeof MediaMetadata === 'undefined') return
  const tr = current.value
  ms.metadata = new MediaMetadata({ title: tr?.title ?? '', artist: tr?.artist ?? '' })
  const set = (action: MediaSessionAction, fn: MediaSessionActionHandler | null): void => {
    try {
      ms.setActionHandler(action, fn)
    } catch {
      // Unsupported action in this browser.
    }
  }
  set('play', () => ctrl.play().catch(() => {}))
  set('pause', () => ctrl.pause())
  set('seekto', (d) => d.seekTime !== undefined && ctrl.seek(d.seekTime))
  set('previoustrack', isPlaylist.value ? prev : null)
  set('nexttrack', isPlaylist.value ? next : null)
}

watch(() => [state.playing, current.value?.src], updateMediaSession)

// ---- UI ----

const volumeIcon = computed(() => (state.muted || state.volume === 0 ? VolumeX : state.volume < 0.5 ? Volume1 : Volume2))
const loading = computed(() => !state.error && state.waiting && !state.paused)
const timeText = computed(() => {
  if (mini.value) {
    return state.playing || state.currentTime > 0 ? formatTime(state.currentTime) : formatTime(state.duration || current.value?.duration || 0)
  }
  return `${formatTime(state.currentTime)} / ${formatTime(state.duration || current.value?.duration || 0)}`
})
const errorMessage = computed(() => (state.error ? t.value.errors[state.error.kind] ?? t.value.errors.unknown : ''))

const rateGroup = computed<UidMediaMenuGroup>(() => ({
  id: 'rate',
  label: t.value.speed,
  value: state.rate,
  options: props.rates.map((r) => ({ value: r, label: r === 1 ? t.value.normalSpeed : `${r}×` })),
}))

function onVolumeInput(e: Event): void {
  ctrl.setVolume(Number((e.target as HTMLInputElement).value))
}

function onKeydown(e: KeyboardEvent): void {
  if (!props.hotkeys) return
  const target = e.target as HTMLElement
  const tag = target.tagName
  if ((tag === 'BUTTON' || tag === 'A') && (e.key === ' ' || e.key === 'Enter')) return
  if (tag === 'INPUT' && e.key.startsWith('Arrow')) return
  if (e.key.toLowerCase() === 'n' && e.shiftKey) {
    next()
    e.preventDefault()
    return
  }
  if (e.key.toLowerCase() === 'p' && e.shiftKey) {
    prev()
    e.preventDefault()
    return
  }
  if (ctrl.handleKey(e)) e.preventDefault()
}

function playTrack(i: number): void {
  if (i === index.value) ctrl.toggle()
  else select(i)
}

onMounted(() => {
  checkType()
  attachHls()
  prefetchDurations()
  if (typeof IntersectionObserver === 'undefined' || !root.value) {
    visible.value = true
    return
  }
  io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      visible.value = true
      io?.disconnect()
      io = null
    }
  }, { rootMargin: '200px' })
  io.observe(root.value)
})

onBeforeUnmount(() => {
  detachHls()
  durationToken++
  io?.disconnect()
  waveToken++
})

defineExpose({
  play: ctrl.play,
  pause: ctrl.pause,
  toggle: ctrl.toggle,
  seek: ctrl.seek,
  next,
  prev,
  state,
  media: audio,
})
</script>

<template>
  <div
    ref="root"
    class="uid-audio"
    :class="{
      'uid-audio--mini': mini,
      'uid-audio--wave': waveWanted,
      'uid-audio--playing': state.playing,
      'uid-audio--playlist': isPlaylist && !mini,
      'uid-audio--error': !!state.error,
    }"
    role="group"
    :aria-label="current?.title ?? t.play"
    @keydown="onKeydown"
  >
    <audio
      ref="audio"
      class="uid-audio__media"
      :preload="preload"
      :loop="loop && !isPlaylist"
      :crossorigin="crossorigin"
      :src="isHls ? undefined : current?.src"
    />

    <div
      class="uid-audio__row"
      :class="{ 'uid-audio__row--meta': hasMeta }"
    >
      <div class="uid-audio__lead">
        <button
          v-if="isPlaylist && !mini"
          type="button"
          class="uid-media__button uid-audio__skip"
          :aria-label="t.prev"
          :title="t.prev"
          @click="prev"
        >
          <UidIcon
            :icon="SkipBack"
            :size="18"
          />
        </button>
        <button
          type="button"
          class="uid-audio__play"
          :aria-label="state.paused ? t.play : t.pause"
          :title="state.paused ? t.play : t.pause"
          :disabled="!current"
          @click="ctrl.toggle"
        >
          <UidIcon
            v-if="loading"
            :icon="LoaderCircle"
            :size="mini ? 16 : 20"
            class="uid-media__spin"
          />
          <UidIcon
            v-else
            :icon="state.paused ? Play : Pause"
            :size="mini ? 16 : 20"
            :class="['uid-media__fill', { 'uid-audio__play-icon': state.paused }]"
          />
        </button>
        <button
          v-if="isPlaylist && !mini"
          type="button"
          class="uid-media__button uid-audio__skip"
          :aria-label="t.next"
          :title="t.next"
          :disabled="!hasNext"
          @click="next"
        >
          <UidIcon
            :icon="SkipForward"
            :size="18"
          />
        </button>
      </div>

      <div
        v-if="hasMeta"
        class="uid-audio__meta"
      >
        <span
          v-if="current?.title"
          class="uid-audio__title"
        >{{ current.title }}</span>
        <span
          v-if="current?.artist"
          class="uid-audio__artist"
        >{{ current.artist }}</span>
      </div>

      <div class="uid-audio__track">
        <p
          v-if="state.error"
          class="uid-audio__error"
          role="alert"
        >
          <UidIcon
            :icon="CircleAlert"
            :size="16"
          />
          <span>{{ errorMessage }}</span>
        </p>
        <UidMediaScrubber
          v-else
          class="uid-audio__scrubber"
          :current-time="state.currentTime"
          :duration="state.duration || current?.duration || 0"
          :buffered="state.buffered"
          :peaks="waveWanted ? wavePeaks : null"
          :pending="wavePending"
          :label="t.seek"
          :value-text="t.timeOf"
          @seek="ctrl.seek"
        />
      </div>

      <div class="uid-audio__side">
        <span class="uid-media__time uid-audio__time">{{ timeText }}</span>
        <div
          v-if="showVolume && !mini"
          class="uid-media__volume uid-audio__volume"
        >
          <button
            type="button"
            class="uid-media__button"
            :aria-label="state.muted ? t.unmute : t.mute"
            :title="state.muted ? t.unmute : t.mute"
            @click="ctrl.toggleMute"
          >
            <UidIcon
              :icon="volumeIcon"
              :size="18"
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
        <UidMediaMenu
          v-if="showRate && !mini"
          :label="t.speed"
          :groups="[rateGroup]"
          button-class="uid-audio__rate"
          @select="(_g, v) => ctrl.setRate(Number(v))"
        >
          <span class="uid-audio__rate-text">{{ state.rate }}×</span>
        </UidMediaMenu>
      </div>
    </div>

    <ol
      v-if="isPlaylist && !mini && showPlaylist"
      class="uid-audio__list"
      :aria-label="t.playlist"
    >
      <li
        v-for="(tr, i) in playlist"
        :key="`${i}:${tr.src}`"
      >
        <button
          type="button"
          class="uid-audio__item"
          :class="{ 'uid-audio__item--active': i === index }"
          :aria-current="i === index ? 'true' : undefined"
          @click="playTrack(i)"
        >
          <span
            class="uid-audio__item-index"
            aria-hidden="true"
          >
            <span
              v-if="i === index && state.playing"
              class="uid-audio__eq"
            ><i /><i /><i /></span>
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="uid-audio__item-text">
            <span class="uid-audio__item-title">{{ tr.title ?? tr.src.split('/').pop() }}</span>
            <span
              v-if="tr.artist"
              class="uid-audio__item-artist"
            >{{ tr.artist }}</span>
          </span>
          <span class="uid-audio__item-time">{{ durations[i] || tr.duration ? formatTime(durations[i] || tr.duration || 0) : '—' }}</span>
        </button>
      </li>
    </ol>
  </div>
</template>
