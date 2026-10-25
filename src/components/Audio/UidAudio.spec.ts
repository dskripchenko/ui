import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import UidAudio from './UidAudio.vue'
import UidLocaleProvider from '../LocaleProvider/UidLocaleProvider.vue'
import { en } from '../../locales/en'
import { fakeMedia } from '../Media/__testing__/fakeMedia'

const proto = HTMLMediaElement.prototype as unknown as Record<string, unknown>
const original = { canPlayType: proto.canPlayType, load: proto.load, play: proto.play, pause: proto.pause }

beforeEach(() => {
  proto.canPlayType = (type: string) => (type === 'audio/x-unknown' ? '' : 'maybe')
  proto.load = vi.fn()
  proto.play = vi.fn(async () => {})
  proto.pause = vi.fn()
})

const mounted: { unmount(): void }[] = []

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  Object.assign(proto, original)
  document.body.innerHTML = ''
})

const tracks = [
  { src: '/1.mp3', title: 'One', artist: 'A', duration: 61 },
  { src: '/2.mp3', title: 'Two', artist: 'B' },
  { src: '/3.mp3', title: 'Three' },
]

function mountAudio(props: Record<string, unknown>) {
  const w = mount(UidLocaleProvider, {
    props: { locale: en },
    slots: { default: () => h(UidAudio, props) },
    attachTo: document.body,
  })
  mounted.push(w)
  return w
}

describe('UidAudio', () => {
  it('компактная строка: play, перемотка, время, громкость, скорость', () => {
    const w = mountAudio({ src: '/a.mp3', title: 'Song', artist: 'Band' })
    expect(w.find('.uid-audio').attributes('role')).toBe('group')
    expect(w.find('.uid-audio__title').text()).toBe('Song')
    expect(w.find('[aria-label="Play"]').exists()).toBe(true)
    expect(w.find('[role="slider"]').exists()).toBe(true)
    expect(w.find('.uid-audio__time').text()).toBe('0:00 / 0:00')
    expect(w.find('[aria-label="Volume"]').exists()).toBe(true)
    expect(w.find('[aria-label="Speed"]').text()).toBe('1×')
    expect(w.find('audio').attributes('src')).toBe('/a.mp3')
  })

  it('mini: без громкости, скорости и заголовка', () => {
    const w = mountAudio({ src: '/a.mp3', title: 'Song', variant: 'mini' })
    expect(w.find('.uid-audio--mini').exists()).toBe(true)
    expect(w.find('[aria-label="Volume"]').exists()).toBe(false)
    expect(w.find('[aria-label="Speed"]').exists()).toBe(false)
    expect(w.find('.uid-audio__title').exists()).toBe(false)
  })

  it('peaks рисуют волну вместо полосы', () => {
    const w = mountAudio({ src: '/a.mp3', peaks: [0.1, 0.5, 1, 0.5] })
    expect(w.find('.uid-media-scrubber--wave').exists()).toBe(true)
    expect(w.findAll('.uid-media-scrubber__wave path')).toHaveLength(2)
    expect(w.find('.uid-media-scrubber__rail').exists()).toBe(false)
  })

  it('неподдерживаемый тип — понятная ошибка вместо полосы', async () => {
    const w = mountAudio({ src: '/a.xyz', type: 'audio/x-unknown' })
    await flushPromises()
    expect(w.find('[role="alert"]').text()).toContain('not supported')
  })

  it('плейлист: список, следующий трек, автопереход', async () => {
    const w = mountAudio({ tracks })
    const audio = fakeMedia(w.find('audio').element as HTMLAudioElement)
    expect(w.findAll('.uid-audio__item')).toHaveLength(3)
    expect(w.find('.uid-audio__item--active').text()).toContain('One')
    expect(w.find('.uid-audio__item-time').text()).toBe('1:01')
    await w.find('[aria-label="Next track"]').trigger('click')
    await flushPromises()
    expect(w.find('.uid-audio__item--active').text()).toContain('Two')
    expect(w.find('audio').attributes('src')).toBe('/2.mp3')
    expect(w.findComponent(UidAudio).emitted('update:index')?.[0]).toEqual([1])
    audio.fire('ended')
    await flushPromises()
    expect(w.find('.uid-audio__item--active').text()).toContain('Three')
    expect(w.find('[aria-label="Next track"]').attributes('disabled')).toBeDefined()
  })

  it('«назад» сначала перематывает трек в начало', async () => {
    const w = mountAudio({ tracks, index: 1 })
    await flushPromises()
    const audio = fakeMedia(w.find('audio').element as HTMLAudioElement)
    audio.set({ duration: 100 })
    audio.currentTime = 30
    audio.fire('timeupdate')
    await w.find('[aria-label="Previous track"]').trigger('click')
    expect(audio.currentTime).toBe(0)
  })

  it('клик по треку в списке выбирает его', async () => {
    const w = mountAudio({ tracks })
    await w.findAll('.uid-audio__item')[2].trigger('click')
    await flushPromises()
    expect(w.find('audio').attributes('src')).toBe('/3.mp3')
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('меню скорости', async () => {
    const w = mountAudio({ src: '/a.mp3' })
    await w.find('[aria-label="Speed"]').trigger('click')
    await w.findAll('[role="menuitemradio"]').find((i) => i.text() === '2×')!.trigger('click')
    expect((w.find('audio').element as HTMLAudioElement).playbackRate).toBe(2)
  })
})
