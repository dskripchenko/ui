import {
  computed, onBeforeUnmount, reactive, toValue, watch,
  type MaybeRefOrGetter, type Ref,
} from 'vue'
import { bufferedEndAt, clamp, toRanges, type UidMediaRange } from './mediaUtils.js'

export type UidMediaErrorKind =
  | 'aborted' | 'network' | 'decode' | 'unsupported'
  | 'mse' | 'manifest' | 'encrypted' | 'codec' | 'unknown'

export interface UidMediaErrorInfo {
  kind: UidMediaErrorKind
  /** Technical detail (browser message, HTTP status) — not localised. */
  detail?: string
}

export interface UseMediaControllerOptions {
  /** Starting this player pauses other exclusive players on the page (default `true`). */
  exclusive?: MaybeRefOrGetter<boolean>
  /** Element that goes full screen; defaults to the media element. */
  fullscreenTarget?: Ref<HTMLElement | null>
  /** localStorage key to remember the playback position under. */
  resumeKey?: MaybeRefOrGetter<string | undefined>
  /** Seconds a hotkey arrow moves (default 5); j/l move twice as far. */
  seekStep?: number
  onCaptionsToggle?: () => void
}

export interface UidMediaState {
  playing: boolean
  paused: boolean
  ended: boolean
  waiting: boolean
  stalled: boolean
  seeking: boolean
  ready: boolean
  currentTime: number
  duration: number
  live: boolean
  buffered: UidMediaRange[]
  volume: number
  muted: boolean
  rate: number
  fullscreen: boolean
  pip: boolean
  error: UidMediaErrorInfo | null
}

type WebkitVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void
  webkitExitFullscreen?: () => void
  webkitDisplayingFullscreen?: boolean
  webkitSupportsFullscreen?: boolean
  webkitSupportsPresentationMode?: (mode: string) => boolean
  webkitSetPresentationMode?: (mode: string) => void
  webkitPresentationMode?: string
}

type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
  webkitFullscreenEnabled?: boolean
}

type WebkitElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }

interface Registered { pause(): void, exclusive(): boolean }
const players = new Set<Registered>()

const ERROR_KINDS: Record<number, UidMediaErrorKind> = { 1: 'aborted', 2: 'network', 3: 'decode', 4: 'unsupported' }

const RESUME_PREFIX = 'uid-media:'

async function probeStatus(src: string): Promise<number | null> {
  try {
    const res = await fetch(src, { headers: { Range: 'bytes=0-1' } })
    res.body?.cancel().catch(() => {})
    return res.ok || res.status === 416 ? null : res.status
  } catch {
    return null
  }
}

function readResume(key: string): number | null {
  try {
    const v = localStorage.getItem(RESUME_PREFIX + key)
    return v === null ? null : Number(v)
  } catch {
    return null
  }
}

function writeResume(key: string, value: number | null): void {
  try {
    if (value === null) localStorage.removeItem(RESUME_PREFIX + key)
    else localStorage.setItem(RESUME_PREFIX + key, String(Math.floor(value)))
  } catch {
    // Storage may be unavailable (private mode, quota) — resuming is best effort.
  }
}

export function useMediaController(
  media: Ref<HTMLMediaElement | null>,
  options: UseMediaControllerOptions = {},
) {
  const state = reactive<UidMediaState>({
    playing: false,
    paused: true,
    ended: false,
    waiting: false,
    stalled: false,
    seeking: false,
    ready: false,
    currentTime: 0,
    duration: 0,
    live: false,
    buffered: [],
    volume: 1,
    muted: false,
    rate: 1,
    fullscreen: false,
    pip: false,
    error: null,
  })

  const seekStep = options.seekStep ?? 5
  let raf = 0
  let lastSaved = 0
  let resumeApplied = false

  const isExclusive = (): boolean => toValue(options.exclusive) !== false
  const self: Registered = { pause: () => media.value?.pause(), exclusive: isExclusive }

  const bufferedEnd = computed(() => bufferedEndAt(state.buffered, state.currentTime))

  function syncTime(): void {
    const el = media.value
    if (!el) return
    state.currentTime = el.currentTime
    const d = el.duration
    state.live = d === Infinity
    if (state.live && el.seekable.length) {
      state.duration = el.seekable.end(el.seekable.length - 1)
    } else {
      state.duration = Number.isFinite(d) ? d : 0
    }
  }

  function loop(): void {
    syncTime()
    raf = state.playing ? requestAnimationFrame(loop) : 0
  }

  function startLoop(): void {
    if (!raf && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(loop)
  }

  function stopLoop(): void {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  function saveResume(force = false): void {
    const key = toValue(options.resumeKey)
    if (!key || state.live || !state.duration) return
    const now = Date.now()
    if (!force && now - lastSaved < 3000) return
    lastSaved = now
    const t = state.currentTime
    writeResume(key, t > 5 && t < state.duration - 5 ? t : null)
  }

  function applyResume(): void {
    const key = toValue(options.resumeKey)
    const el = media.value
    if (!key || !el || resumeApplied || state.live) return
    resumeApplied = true
    const t = readResume(key)
    if (t && Number.isFinite(t) && (!state.duration || t < state.duration - 5)) el.currentTime = t
  }

  const handlers: Record<string, (e: Event) => void> = {
    play: () => {
      state.paused = false
      state.ended = false
      if (isExclusive()) {
        for (const p of players) if (p !== self && p.exclusive()) p.pause()
      }
    },
    playing: () => {
      state.playing = true
      state.waiting = false
      state.stalled = false
      startLoop()
    },
    pause: () => {
      state.paused = true
      state.playing = false
      stopLoop()
      syncTime()
      saveResume(true)
    },
    waiting: () => { state.waiting = true },
    stalled: () => { state.stalled = true },
    canplay: () => { state.waiting = false },
    seeking: () => { state.seeking = true; syncTime() },
    seeked: () => { state.seeking = false; state.waiting = false; syncTime() },
    timeupdate: () => { syncTime(); saveResume() },
    durationchange: syncTime,
    loadedmetadata: () => { state.ready = true; syncTime(); applyResume() },
    progress: () => { state.buffered = toRanges(media.value?.buffered); state.stalled = false },
    volumechange: () => {
      const el = media.value
      if (!el) return
      state.volume = el.volume
      state.muted = el.muted
    },
    ratechange: () => { state.rate = media.value?.playbackRate ?? 1 },
    ended: () => {
      state.ended = true
      state.playing = false
      state.paused = true
      stopLoop()
      syncTime()
      const key = toValue(options.resumeKey)
      if (key) writeResume(key, null)
    },
    emptied: () => {
      state.ready = false
      state.playing = false
      state.paused = media.value?.paused ?? true
      state.buffered = []
      state.currentTime = 0
      state.duration = 0
      resumeApplied = false
    },
    error: () => {
      const el = media.value
      const err = el?.error
      if (!el || !err) return
      state.error = { kind: ERROR_KINDS[err.code] ?? 'unknown', detail: err.message || undefined }
      state.waiting = false
      // Browsers report a 404 as "format not supported": ask the server to tell them apart.
      const src = el.currentSrc
      if (err.code === 4 && /^https?:/.test(src)) {
        probeStatus(src).then((status) => {
          if (status && el.currentSrc === src && state.error?.kind === 'unsupported') {
            state.error = { kind: 'network', detail: `HTTP ${status}` }
          }
        })
      }
    },
    enterpictureinpicture: () => { state.pip = true },
    leavepictureinpicture: () => { state.pip = false },
    webkitpresentationmodechanged: () => {
      state.pip = (media.value as WebkitVideo | null)?.webkitPresentationMode === 'picture-in-picture'
    },
    webkitbeginfullscreen: () => { state.fullscreen = true },
    webkitendfullscreen: () => { state.fullscreen = false },
  }

  function onFullscreenChange(): void {
    const doc = document as WebkitDocument
    const fsEl = doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null
    const target = options.fullscreenTarget?.value ?? media.value
    state.fullscreen = !!fsEl && !!target && (fsEl === target || fsEl.contains(target))
  }

  function snapshot(el: HTMLMediaElement): void {
    state.volume = el.volume
    state.muted = el.muted
    state.rate = el.playbackRate
    state.paused = el.paused
    state.playing = !el.paused && !el.ended && el.readyState > 2
    state.ready = el.readyState >= 1
    state.buffered = toRanges(el.buffered)
    syncTime()
    if (el.error) handlers.error(new Event('error'))
    if (state.ready) applyResume()
  }

  watch(media, (el, prev) => {
    if (prev) for (const [name, fn] of Object.entries(handlers)) prev.removeEventListener(name, fn)
    if (el) {
      for (const [name, fn] of Object.entries(handlers)) el.addEventListener(name, fn)
      snapshot(el)
    }
  }, { immediate: true, flush: 'post' })

  players.add(self)
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
  }

  onBeforeUnmount(() => {
    saveResume(true)
    stopLoop()
    players.delete(self)
    const el = media.value
    if (el) for (const [name, fn] of Object.entries(handlers)) el.removeEventListener(name, fn)
    document.removeEventListener('fullscreenchange', onFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
  })

  async function play(): Promise<void> {
    const el = media.value
    if (!el) return
    if (el.error) {
      handlers.error(new Event('error'))
      return
    }
    state.error = null
    try {
      await el.play()
    } catch (e) {
      // A refused start (autoplay policy), an interrupted one, or a source the error event reports anyway.
      const name = (e as DOMException)?.name
      if (name !== 'NotAllowedError' && name !== 'AbortError' && name !== 'NotSupportedError') {
        state.error ??= { kind: 'unknown', detail: (e as Error)?.message }
      }
      throw e
    }
  }

  function pause(): void {
    media.value?.pause()
  }

  function toggle(): void {
    const el = media.value
    if (!el) return
    if (el.paused || el.ended) play().catch(() => {})
    else el.pause()
  }

  function seek(time: number): void {
    const el = media.value
    if (!el || !Number.isFinite(time)) return
    const max = state.duration || el.duration
    const t = Number.isFinite(max) && max > 0 ? clamp(time, 0, max) : Math.max(0, time)
    el.currentTime = t
    state.currentTime = t
  }

  function skip(delta: number): void {
    seek((media.value?.currentTime ?? state.currentTime) + delta)
  }

  function setVolume(v: number): void {
    const el = media.value
    if (!el) return
    el.volume = clamp(v, 0, 1)
    if (el.volume > 0 && el.muted) el.muted = false
  }

  function changeVolume(delta: number): void {
    const el = media.value
    if (!el) return
    setVolume((el.muted ? 0 : el.volume) + delta)
  }

  function setMuted(value: boolean): void {
    const el = media.value
    if (!el) return
    el.muted = value
    if (!value && el.volume === 0) el.volume = 0.5
  }

  function toggleMute(): void {
    setMuted(!media.value?.muted)
  }

  function setRate(rate: number): void {
    const el = media.value
    if (!el) return
    el.playbackRate = rate
    el.defaultPlaybackRate = rate
  }

  const canFullscreen = computed(() => {
    if (typeof document === 'undefined') return false
    const doc = document as WebkitDocument
    const el = media.value as WebkitVideo | null
    return !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled || el?.webkitSupportsFullscreen || el?.webkitEnterFullscreen)
  })

  async function toggleFullscreen(): Promise<void> {
    const doc = document as WebkitDocument
    const el = media.value as WebkitVideo | null
    if (state.fullscreen) {
      if (doc.fullscreenElement) await doc.exitFullscreen()
      else if (doc.webkitFullscreenElement) await doc.webkitExitFullscreen?.()
      else el?.webkitExitFullscreen?.()
      return
    }
    const target = (options.fullscreenTarget?.value ?? el) as WebkitElement | null
    if (!target) return
    if (target.requestFullscreen && doc.fullscreenEnabled) await target.requestFullscreen()
    else if (target.webkitRequestFullscreen && doc.webkitFullscreenEnabled) await target.webkitRequestFullscreen()
    // iPhone: only the video element itself can go full screen (native controls).
    else el?.webkitEnterFullscreen?.()
  }

  const canPip = computed(() => {
    const el = media.value as WebkitVideo | null
    if (!el || el.tagName !== 'VIDEO' || typeof document === 'undefined') return false
    if ('pictureInPictureEnabled' in document) return !!document.pictureInPictureEnabled
    return !!el.webkitSupportsPresentationMode?.('picture-in-picture')
  })

  async function togglePip(): Promise<void> {
    const el = media.value as WebkitVideo | null
    if (!el) return
    if ('pictureInPictureEnabled' in document && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await el.requestPictureInPicture()
      return
    }
    if (el.webkitSetPresentationMode) {
      el.webkitSetPresentationMode(el.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture')
    }
  }

  function setError(error: UidMediaErrorInfo | null): void {
    state.error = error
    if (error) state.waiting = false
  }

  /** Applies a player hotkey; returns `true` when the key was handled. */
  function handleKey(e: KeyboardEvent): boolean {
    if (e.ctrlKey || e.metaKey || e.altKey) return false
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
    switch (key) {
      case ' ':
      case 'k':
        toggle()
        return true
      case 'ArrowLeft':
        skip(-seekStep)
        return true
      case 'ArrowRight':
        skip(seekStep)
        return true
      case 'j':
        skip(-seekStep * 2)
        return true
      case 'l':
        skip(seekStep * 2)
        return true
      case 'ArrowUp':
        changeVolume(0.1)
        return true
      case 'ArrowDown':
        changeVolume(-0.1)
        return true
      case 'm':
        toggleMute()
        return true
      case 'f':
        if (media.value?.tagName !== 'VIDEO') return false
        toggleFullscreen().catch(() => {})
        return true
      case 'c':
        if (!options.onCaptionsToggle) return false
        options.onCaptionsToggle()
        return true
      case 'Home':
        seek(0)
        return true
      case 'End':
        if (!state.duration) return false
        seek(state.duration)
        return true
      default:
        if (/^[0-9]$/.test(key) && state.duration) {
          seek((state.duration * Number(key)) / 10)
          return true
        }
        return false
    }
  }

  return {
    state,
    bufferedEnd,
    canFullscreen,
    canPip,
    play,
    pause,
    toggle,
    seek,
    skip,
    setVolume,
    changeVolume,
    setMuted,
    toggleMute,
    setRate,
    toggleFullscreen,
    togglePip,
    setError,
    handleKey,
  }
}

export type UidMediaController = ReturnType<typeof useMediaController>
