import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import UidVideo from './UidVideo.vue'
import UidLocaleProvider from '../LocaleProvider/UidLocaleProvider.vue'
import { en } from '../../locales/en'
import { fakeMedia } from '../Media/__testing__/fakeMedia'

const proto = HTMLMediaElement.prototype as unknown as Record<string, unknown>
const original = { canPlayType: proto.canPlayType, load: proto.load, play: proto.play, pause: proto.pause }

beforeEach(() => {
  proto.canPlayType = function (type: string) {
    if (type.includes('mpegurl') || type.includes('mpegURL')) return ''
    return type.includes('webm') ? '' : 'maybe'
  }
  proto.load = vi.fn()
  proto.play = vi.fn(async () => {})
  proto.pause = vi.fn()
  global.fetch = vi.fn(async () => new Response('WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nIntro\n\n00:00:05.000 --> 00:00:10.000\nPart 2\n')) as never
})

const mounted: { unmount(): void }[] = []

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  Object.assign(proto, original)
  document.body.innerHTML = ''
})

function mountVideo(props: Record<string, unknown>) {
  const w = mount(UidLocaleProvider, {
    props: { locale: en },
    slots: { default: () => h(UidVideo, props) },
    attachTo: document.body,
  })
  mounted.push(w)
  return w
}

describe('UidVideo', () => {
  it('рисует панель управления с доступными подписями', () => {
    const w = mountVideo({ src: '/a.mp4', title: 'Lesson' })
    expect(w.find('.uid-video').attributes('aria-label')).toBe('Lesson')
    expect(w.find('[aria-label="Play"]').exists()).toBe(true)
    expect(w.find('[aria-label="Mute"]').exists()).toBe(true)
    expect(w.find('[aria-label="Volume"]').attributes('type')).toBe('range')
    expect(w.find('[role="slider"][aria-label="Seek"]').exists()).toBe(true)
    expect(w.find('[aria-label="Settings"]').attributes('aria-haspopup')).toBe('menu')
    expect(w.find('video').attributes('playsinline')).toBeDefined()
    expect((w.find('video').element as HTMLVideoElement).src).toContain('/a.mp4')
  })

  it('выбирает первый воспроизводимый источник', () => {
    const w = mountVideo({ sources: [{ src: '/a.webm', type: 'video/webm' }, { src: '/a.mp4', type: 'video/mp4' }] })
    expect((w.find('video').element as HTMLVideoElement).src).toContain('/a.mp4')
  })

  it('без воспроизводимых источников показывает ошибку', async () => {
    const w = mountVideo({ sources: [{ src: '/a.webm', type: 'video/webm' }] })
    await flushPromises()
    expect(w.find('[role="alert"]').text()).toContain('not supported')
  })

  it('controls=false — голый элемент с родными контролами', () => {
    const w = mountVideo({ src: '/a.mp4', controls: false })
    expect(w.find('.uid-video__controls').exists()).toBe(false)
    expect(w.find('video').attributes('controls')).toBeDefined()
  })

  it('меню скорости меняет playbackRate', async () => {
    const w = mountVideo({ src: '/a.mp4' })
    const v = w.find('video').element as HTMLVideoElement
    await w.find('[aria-label="Settings"]').trigger('click')
    const items = w.findAll('[role="menuitemradio"]')
    expect(items.map((i) => i.text())).toEqual(['0.5×', '0.75×', 'Normal', '1.25×', '1.5×', '1.75×', '2×'])
    expect(items[2].attributes('aria-checked')).toBe('true')
    await items[4].trigger('click')
    expect(v.playbackRate).toBe(1.5)
    expect(w.find('[role="menu"]').exists()).toBe(false)
  })

  it('качество из подписанных источников', async () => {
    const w = mountVideo({ sources: [{ src: '/hd.mp4', type: 'video/mp4', label: '720p' }, { src: '/sd.mp4', type: 'video/mp4', label: '360p' }] })
    await w.find('[aria-label="Settings"]').trigger('click')
    const labels = w.findAll('[role="menuitemradio"]').map((i) => i.text())
    expect(labels).toContain('720p')
    expect(labels).toContain('360p')
    await w.findAll('[role="menuitemradio"]').find((i) => i.text() === '360p')!.trigger('click')
    expect((w.find('video').element as HTMLVideoElement).src).toContain('/sd.mp4')
  })

  it('HLS-адаптер подгружается лениво и наполняет меню качества', async () => {
    const setLevel = vi.fn()
    const attachHls = vi.fn((_el: HTMLMediaElement, _url: string, opts: { onLevels: (l: unknown[]) => void, onLevelSwitched: (i: number) => void }) => {
      opts.onLevels([{ index: 0, bandwidth: 5e5, height: 360, label: '360p' }, { index: 1, bandwidth: 2e6, height: 720, label: '720p' }])
      opts.onLevelSwitched(0)
      return { native: false, live: false, levels: [], level: 0, autoLevel: true, bandwidth: 0, setLevel, destroy: vi.fn() }
    })
    const hlsLoader = vi.fn(async () => ({ attachHls }) as never)
    ;(window as unknown as { MediaSource: unknown }).MediaSource = function () {}
    const w = mountVideo({ src: '/live/master.m3u8', hlsLoader, hlsOptions: { maxBufferAhead: 10 } })
    await flushPromises()
    expect(hlsLoader).toHaveBeenCalled()
    expect(attachHls.mock.calls[0][1]).toBe('/live/master.m3u8')
    expect(attachHls.mock.calls[0][2]).toMatchObject({ maxBufferAhead: 10 })
    await w.find('[aria-label="Settings"]').trigger('click')
    const items = w.findAll('[role="group"][aria-label="Quality"] [role="menuitemradio"]').map((i) => i.text())
    expect(items).toEqual(['Auto · 360p', '720p', '360p'])
    await w.findAll('[role="menuitemradio"]').find((i) => i.text() === '720p')!.trigger('click')
    expect(setLevel).toHaveBeenCalledWith(1)
    delete (window as unknown as { MediaSource?: unknown }).MediaSource
  })

  it('HLS: меню аудиодорожек, когда их больше одной', async () => {
    const setAudioTrack = vi.fn()
    const attachHls = vi.fn((_el: HTMLMediaElement, _url: string, opts: { onAudioTracks: (l: unknown[]) => void, onAudioTrackSwitched: (i: number) => void }) => {
      opts.onAudioTracks([{ index: 0, label: 'English', language: 'en', default: true }, { index: 1, label: 'Русский', language: 'ru', default: false }])
      opts.onAudioTrackSwitched(0)
      return { setLevel: vi.fn(), setAudioTrack, destroy: vi.fn() }
    })
    ;(window as unknown as { MediaSource: unknown }).MediaSource = function () {}
    const w = mountVideo({ src: '/m.m3u8', hlsLoader: async () => ({ attachHls }) as never })
    await flushPromises()
    await w.find('[aria-label="Settings"]').trigger('click')
    expect(w.find('[role="group"][aria-label="Audio"]').exists()).toBe(true)
    const item = w.findAll('[role="menuitemradio"]').find((i) => i.text() === 'Русский')!
    await item.trigger('click')
    expect(setAudioTrack).toHaveBeenCalledWith(1)
    expect(w.findComponent(UidVideo).emitted('audiotrackchange')?.[0]).toEqual(['Русский'])
    delete (window as unknown as { MediaSource?: unknown }).MediaSource
  })

  it('HLS: одинаковые метки уровней различаются битрейтом', async () => {
    const attachHls = vi.fn((_el: HTMLMediaElement, _url: string, opts: { onLevels: (l: unknown[]) => void, onLevelSwitched: (i: number) => void }) => {
      opts.onLevels([
        { index: 0, bandwidth: 2_500_000, height: 720, label: '720p' },
        { index: 1, bandwidth: 4_000_000, height: 720, label: '720p' },
      ])
      opts.onLevelSwitched(1)
      return { setLevel: vi.fn(), setAudioTrack: vi.fn(), destroy: vi.fn() }
    })
    ;(window as unknown as { MediaSource: unknown }).MediaSource = function () {}
    const w = mountVideo({ src: '/m.m3u8', hlsLoader: async () => ({ attachHls }) as never })
    await flushPromises()
    await w.find('[aria-label="Settings"]').trigger('click')
    const items = w.findAll('[role="group"][aria-label="Quality"] [role="menuitemradio"]').map((i) => i.text())
    expect(items).toEqual(['Auto · 720p · 4000 kbps', '720p · 4000 kbps', '720p · 2500 kbps'])
    delete (window as unknown as { MediaSource?: unknown }).MediaSource
  })

  it('узкий плеер: субтитры и PiP уходят в настройки, время короче', async () => {
    const observers: (() => void)[] = []
    const RO = globalThis.ResizeObserver
    globalThis.ResizeObserver = class {
      constructor(cb: () => void) { observers.push(cb) }
      observe() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320)
    const w = mountVideo({ src: '/a.mp4', tracks: [{ src: '/en.vtt', srclang: 'en', label: 'English' }] })
    await flushPromises()
    expect(w.find('.uid-video--folded').exists()).toBe(true)
    expect(w.find('[aria-label="Subtitles"]').exists()).toBe(false)
    expect(w.find('[aria-label="Full screen"]').exists() || w.find('[aria-label="Settings"]').exists()).toBe(true)
    expect(w.find('.uid-media__time').text()).toBe('0:00')
    await w.find('[aria-label="Settings"]').trigger('click')
    expect(w.find('[role="group"][aria-label="Subtitles"]').exists()).toBe(true)
    width.mockReturnValue(800)
    observers.forEach((cb) => cb())
    await flushPromises()
    expect(w.find('.uid-video--folded').exists()).toBe(false)
    expect(w.find('[aria-label="Subtitles"]').exists()).toBe(true)
    expect(w.find('.uid-media__time').text()).toBe('0:00 / 0:00')
    width.mockRestore()
    globalThis.ResizeObserver = RO
  })

  it('ошибка HLS показывается локализованным текстом', async () => {
    const attachHls = vi.fn((_el: HTMLMediaElement, _url: string, opts: { onError: (e: { code: string, message: string }) => void }) => {
      opts.onError({ code: 'encrypted', message: 'SAMPLE-AES' })
      return { destroy: vi.fn(), setLevel: vi.fn() }
    })
    ;(window as unknown as { MediaSource: unknown }).MediaSource = function () {}
    const w = mountVideo({ src: '/x.m3u8', hlsLoader: async () => ({ attachHls }) as never })
    await flushPromises()
    expect(w.find('[role="alert"]').text()).toContain('Encrypted streams')
    delete (window as unknown as { MediaSource?: unknown }).MediaSource
  })

  it('субтитры: меню, дорожки track, главы из VTT', async () => {
    const w = mountVideo({
      src: '/a.mp4',
      tracks: [
        { src: '/en.vtt', srclang: 'en', label: 'English', default: true },
        { src: '/de.vtt', srclang: 'de', label: 'Deutsch' },
        { src: '/ch.vtt', kind: 'chapters' },
      ],
    })
    await flushPromises()
    const tracks = w.findAll('track')
    expect(tracks).toHaveLength(2)
    expect(tracks[0].attributes('kind')).toBe('subtitles')
    expect(fetch).toHaveBeenCalledWith('/ch.vtt', expect.anything())
    await w.find('[aria-label="Subtitles"]').trigger('click')
    const items = w.findAll('[role="menuitemradio"]')
    expect(items.map((i) => i.text())).toEqual(['Off', 'English', 'Deutsch'])
    expect(items[1].attributes('aria-checked')).toBe('true')
    await items[0].trigger('click')
    await w.find('[aria-label="Subtitles"]').trigger('click')
    expect(w.findAll('[role="menuitemradio"]')[0].attributes('aria-checked')).toBe('true')
  })

  it('горячие клавиши на корне и стрелки в меню не уходят в плеер', async () => {
    const w = mountVideo({ src: '/a.mp4' })
    const v = fakeMedia(w.find('video').element as HTMLVideoElement)
    v.set({ duration: 100 })
    v.fire('durationchange')
    await w.find('.uid-video').trigger('keydown', { key: 'm' })
    expect(v.muted).toBe(true)
    await w.find('.uid-video').trigger('keydown', { key: '5' })
    expect(v.currentTime).toBe(50)
    await w.find('[aria-label="Settings"]').trigger('click')
    await w.find('[role="menu"]').trigger('keydown', { key: 'ArrowRight' })
    expect(v.currentTime).toBe(50)
  })

  it('кнопка play запускает воспроизведение и эмитит play', async () => {
    const w = mountVideo({ src: '/a.mp4' })
    await flushPromises()
    const v = fakeMedia(w.find('video').element as HTMLVideoElement)
    await w.find('.uid-video__big-play').trigger('click')
    await flushPromises()
    expect(v.play).toHaveBeenCalled()
    expect(w.findComponent(UidVideo).emitted('play')).toHaveLength(1)
    expect(w.find('.uid-video__big-play').exists()).toBe(false)
  })

  it('autoplay запускается без звука', async () => {
    const w = mountVideo({ src: '/a.mp4', autoplay: true })
    await flushPromises()
    expect((w.find('video').element as HTMLVideoElement).muted).toBe(true)
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })
})
