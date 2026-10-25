import { describe, expect, it } from 'vitest'
import {
  bufferedEndAt, cueAt, cueText, formatTime, isHlsSource, orderSources, parseThumbnail, parseVtt,
} from './mediaUtils'

describe('formatTime', () => {
  it('форматирует минуты и часы', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(65.9)).toBe('1:05')
    expect(formatTime(3725)).toBe('1:02:05')
    expect(formatTime(5, true)).toBe('0:00:05')
    expect(formatTime(NaN)).toBe('0:00')
    expect(formatTime(Infinity)).toBe('0:00')
  })
})

describe('parseVtt', () => {
  const vtt = `WEBVTT

1
00:00:01.000 --> 00:00:04.500 align:start
Hello <b>world</b>
second line

00:01:00,250 --> 00:01:02.000
&lt;tag&gt; &amp; <v Bob>Bob</v>
`
  it('разбирает тайминги и многострочный текст', () => {
    const cues = parseVtt(vtt)
    expect(cues).toHaveLength(2)
    expect(cues[0]).toEqual({ start: 1, end: 4.5, text: 'Hello <b>world</b>\nsecond line' })
    expect(cues[1].start).toBeCloseTo(60.25)
  })

  it('cueText убирает теги и раскрывает сущности', () => {
    expect(cueText(parseVtt(vtt)[1].text)).toBe('<tag> & Bob')
  })

  it('cueAt находит активный cue', () => {
    const cues = parseVtt(vtt)
    expect(cueAt(cues, 2)?.start).toBe(1)
    expect(cueAt(cues, 10)).toBeUndefined()
  })
})

describe('parseThumbnail', () => {
  it('xywh спрайта относительно адреса VTT', () => {
    expect(parseThumbnail('sprite.jpg#xywh=160,0,160,90', 'https://cdn.test/v/thumbs.vtt')).toEqual({
      url: 'https://cdn.test/v/sprite.jpg', x: 160, y: 0, w: 160, h: 90,
    })
  })

  it('целая картинка без фрагмента', () => {
    expect(parseThumbnail('/img/1.jpg', 'https://cdn.test/v/thumbs.vtt')?.w).toBe(0)
    expect(parseThumbnail('  ', 'x')).toBeNull()
  })
})

describe('sources', () => {
  it('isHlsSource по типу и по расширению', () => {
    expect(isHlsSource({ src: '/a.m3u8?token=1' })).toBe(true)
    expect(isHlsSource({ src: '/a', type: 'application/x-mpegURL' })).toBe(true)
    expect(isHlsSource({ src: '/a.mp4', type: 'video/mp4' })).toBe(false)
  })

  it('orderSources ставит воспроизводимые вперёд и отбрасывает невозможные', () => {
    const canPlay = (type: string): string => (type.startsWith('video/webm') ? '' : 'maybe')
    const list = orderSources([
      { src: 'a.webm', type: 'video/webm' },
      { src: 'b.mp4', type: 'video/mp4' },
      { src: 'c.m3u8' },
      { src: 'd' },
    ], canPlay, false)
    expect(list.map((s) => s.src)).toEqual(['b.mp4', 'd'])
  })
})

describe('bufferedEndAt', () => {
  it('конец диапазона с позицией, с допуском на дырку', () => {
    expect(bufferedEndAt([[0, 5], [5.1, 9]], 2)).toBe(9)
    expect(bufferedEndAt([[0, 5], [7, 9]], 2)).toBe(5)
    expect(bufferedEndAt([[3, 5]], 1)).toBe(1)
  })
})
