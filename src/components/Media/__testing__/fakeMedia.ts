import { vi } from 'vitest'

export interface FakeMedia extends HTMLVideoElement {
  fire(name: string): void
  set(props: Partial<Record<'duration' | 'readyState' | 'videoWidth', number>>): void
}

/** A jsdom media element with a working playback state machine (jsdom has none). */
export function fakeMedia(el: HTMLMediaElement = document.createElement('video')): FakeMedia {
  const s = { paused: true, ended: false, currentTime: 0, duration: NaN, volume: 1, muted: false, playbackRate: 1, defaultPlaybackRate: 1, readyState: 0, videoWidth: 0 }
  const fire = (name: string): void => { el.dispatchEvent(new Event(name)) }
  for (const key of Object.keys(s) as (keyof typeof s)[]) {
    Object.defineProperty(el, key, {
      configurable: true,
      get: () => s[key],
      set: (v) => {
        ;(s as Record<string, unknown>)[key] = v
        if (key === 'volume' || key === 'muted') fire('volumechange')
        if (key === 'playbackRate') fire('ratechange')
        if (key === 'currentTime') fire('seeking')
      },
    })
  }
  Object.defineProperty(el, 'buffered', { configurable: true, get: () => ({ length: 0, start: () => 0, end: () => 0 }) })
  Object.defineProperty(el, 'seekable', { configurable: true, get: () => ({ length: 0, start: () => 0, end: () => 0 }) })
  el.play = vi.fn(async () => {
    s.paused = false
    fire('play')
    fire('playing')
  })
  el.pause = vi.fn(() => {
    if (s.paused) return
    s.paused = true
    fire('pause')
  })
  el.load = vi.fn()
  const out = el as FakeMedia
  out.fire = fire
  out.set = (props) => Object.assign(s, props)
  return out
}
