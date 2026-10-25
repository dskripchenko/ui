import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useMediaController, type UidMediaController } from './useMediaController'
import { fakeMedia } from './__testing__/fakeMedia'

function setup(options: Parameters<typeof useMediaController>[1] = {}) {
  const el = fakeMedia()
  let ctrl!: UidMediaController
  const wrapper = mount(defineComponent({
    setup() {
      const media = ref<HTMLMediaElement | null>(el)
      ctrl = useMediaController(media, options)
      return () => h('div')
    },
  }))
  return { el, ctrl, wrapper }
}

function key(k: string, extra: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: k, ...extra })
}

describe('useMediaController', () => {
  afterEach(() => localStorage.clear())

  it('состояние следует событиям элемента', async () => {
    const { el, ctrl } = setup()
    el.set({ duration: 120, readyState: 4 })
    el.fire('loadedmetadata')
    expect(ctrl.state.duration).toBe(120)
    expect(ctrl.state.ready).toBe(true)
    await ctrl.play()
    expect(ctrl.state.playing).toBe(true)
    expect(ctrl.state.paused).toBe(false)
    el.fire('waiting')
    expect(ctrl.state.waiting).toBe(true)
    el.fire('playing')
    expect(ctrl.state.waiting).toBe(false)
    ctrl.pause()
    expect(ctrl.state.paused).toBe(true)
    expect(ctrl.state.playing).toBe(false)
  })

  it('команды: перемотка с ограничением, громкость, mute, скорость', () => {
    const { el, ctrl } = setup()
    el.set({ duration: 100 })
    el.fire('durationchange')
    ctrl.seek(150)
    expect(el.currentTime).toBe(100)
    ctrl.skip(-500)
    expect(el.currentTime).toBe(0)
    ctrl.setVolume(0.3)
    expect(ctrl.state.volume).toBe(0.3)
    ctrl.toggleMute()
    expect(ctrl.state.muted).toBe(true)
    ctrl.changeVolume(0.2)
    expect(el.muted).toBe(false)
    expect(el.volume).toBeCloseTo(0.2)
    ctrl.setRate(1.5)
    expect(ctrl.state.rate).toBe(1.5)
    expect(el.defaultPlaybackRate).toBe(1.5)
  })

  it('снятие mute при нулевой громкости возвращает слышимую громкость', () => {
    const { el, ctrl } = setup()
    el.volume = 0
    el.muted = true
    ctrl.setMuted(false)
    expect(el.volume).toBe(0.5)
  })

  it('горячие клавиши', async () => {
    let captions = 0
    const { el, ctrl } = setup({ onCaptionsToggle: () => captions++ })
    el.set({ duration: 100 })
    el.fire('durationchange')
    el.currentTime = 50
    expect(ctrl.handleKey(key('k'))).toBe(true)
    expect(el.play).toHaveBeenCalled()
    await Promise.resolve()
    ctrl.handleKey(key(' '))
    expect(el.pause).toHaveBeenCalled()
    ctrl.handleKey(key('ArrowRight'))
    expect(el.currentTime).toBe(55)
    ctrl.handleKey(key('j'))
    expect(el.currentTime).toBe(45)
    ctrl.handleKey(key('L'))
    expect(el.currentTime).toBe(55)
    ctrl.handleKey(key('7'))
    expect(el.currentTime).toBe(70)
    ctrl.handleKey(key('Home'))
    expect(el.currentTime).toBe(0)
    ctrl.handleKey(key('ArrowDown'))
    expect(el.volume).toBeCloseTo(0.9)
    ctrl.handleKey(key('m'))
    expect(el.muted).toBe(true)
    ctrl.handleKey(key('c'))
    expect(captions).toBe(1)
    expect(ctrl.handleKey(key('x'))).toBe(false)
    expect(ctrl.handleKey(key('k', { ctrlKey: true }))).toBe(false)
  })

  it('f — только для видео', () => {
    const audio = fakeMedia(document.createElement('audio'))
    let ctrl!: UidMediaController
    mount(defineComponent({ setup() { ctrl = useMediaController(ref(audio)); return () => h('div') } }))
    expect(ctrl.handleKey(key('f'))).toBe(false)
  })

  it('запуск одного плеера ставит на паузу остальные; exclusive=false не участвует', async () => {
    const a = setup()
    const b = setup()
    const c = setup({ exclusive: false })
    await a.ctrl.play()
    await c.ctrl.play()
    expect(a.el.paused).toBe(false)
    await b.ctrl.play()
    expect(a.el.paused).toBe(true)
    expect(c.el.paused).toBe(false)
    a.wrapper.unmount()
    b.wrapper.unmount()
    c.wrapper.unmount()
  })

  it('ошибки элемента переводятся в понятные виды', () => {
    const { el, ctrl } = setup()
    Object.defineProperty(el, 'error', { configurable: true, get: () => ({ code: 3, message: 'PIPELINE_ERROR_DECODE' }) })
    el.fire('error')
    expect(ctrl.state.error).toEqual({ kind: 'decode', detail: 'PIPELINE_ERROR_DECODE' })
    ctrl.setError({ kind: 'encrypted' })
    expect(ctrl.state.error?.kind).toBe('encrypted')
    ctrl.setError(null)
    expect(ctrl.state.error).toBeNull()
  })

  it('resumeKey: сохраняет позицию на паузе и восстанавливает при загрузке', () => {
    const first = setup({ resumeKey: 'lesson-1' })
    first.el.set({ duration: 600 })
    first.el.fire('durationchange')
    first.el.currentTime = 125.7
    first.el.fire('timeupdate')
    first.el.fire('pause')
    expect(localStorage.getItem('uid-media:lesson-1')).toBe('125')
    const second = setup({ resumeKey: 'lesson-1' })
    second.el.set({ duration: 600, readyState: 1 })
    second.el.fire('loadedmetadata')
    expect(second.el.currentTime).toBe(125)
    second.el.fire('ended')
    expect(localStorage.getItem('uid-media:lesson-1')).toBeNull()
  })

  it('resumeKey: начало и самый конец не запоминаются', () => {
    const { el } = setup({ resumeKey: 'k' })
    el.set({ duration: 100 })
    el.fire('durationchange')
    el.currentTime = 3
    el.fire('pause')
    expect(localStorage.getItem('uid-media:k')).toBeNull()
    el.currentTime = 98
    el.fire('pause')
    expect(localStorage.getItem('uid-media:k')).toBeNull()
  })
})
