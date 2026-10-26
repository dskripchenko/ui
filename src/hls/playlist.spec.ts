import { describe, expect, it } from 'vitest'
import { parseAttributes, parseHexIv, parsePlaylist, sequenceIv } from './playlist'
import { alignTimes } from './engine'

const master = `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="English",LANGUAGE="en",DEFAULT=YES,URI="audio/en.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=2000000,AVERAGE-BANDWIDTH=1800000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2",FRAME-RATE=30,AUDIO="aud"
v720/index.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=640x360,CODECS="avc1.4d401e,mp4a.40.2"
https://cdn.test/v360/index.m3u8
`

const media = `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:4
#EXT-X-MEDIA-SEQUENCE:100
#EXT-X-DISCONTINUITY-SEQUENCE:3
#EXT-X-MAP:URI="init.mp4",BYTERANGE="720@0"
#EXT-X-KEY:METHOD=AES-128,URI="key.bin",IV=0x0000000000000000000000000000000A
#EXTINF:4.0,first
seg100.m4s
#EXT-X-BYTERANGE:1000@2000
#EXTINF:3.5,
all.m4s
#EXT-X-BYTERANGE:500
#EXTINF:2,
all.m4s
#EXT-X-KEY:METHOD=NONE
#EXT-X-DISCONTINUITY
#EXTINF:4,
other/seg0.ts
#EXT-X-ENDLIST
`

describe('parseAttributes', () => {
  it('кавычки, запятые внутри кавычек, числа', () => {
    expect(parseAttributes('BANDWIDTH=1,CODECS="a,b",RESOLUTION=1x2')).toEqual({ BANDWIDTH: '1', CODECS: 'a,b', RESOLUTION: '1x2' })
  })
})

describe('parsePlaylist', () => {
  it('master: варианты и альтернативные дорожки', () => {
    const pl = parsePlaylist(master, 'https://cdn.test/live/master.m3u8')
    expect(pl.type).toBe('master')
    if (pl.type !== 'master') return
    expect(pl.variants).toHaveLength(2)
    expect(pl.variants[0]).toMatchObject({
      uri: 'https://cdn.test/live/v720/index.m3u8', bandwidth: 2000000, averageBandwidth: 1800000,
      width: 1280, height: 720, codecs: 'avc1.4d401f,mp4a.40.2', frameRate: 30, audio: 'aud',
    })
    expect(pl.variants[1].uri).toBe('https://cdn.test/v360/index.m3u8')
    expect(pl.media[0]).toMatchObject({ type: 'AUDIO', groupId: 'aud', language: 'en', default: true, uri: 'https://cdn.test/live/audio/en.m3u8' })
  })

  it('media: последовательность, init, ключ, byterange, разрывы', () => {
    const pl = parsePlaylist(media, 'https://cdn.test/v/index.m3u8')
    if (pl.type !== 'media') throw new Error('expected media')
    expect(pl.targetDuration).toBe(4)
    expect(pl.endList).toBe(true)
    expect(pl.totalDuration).toBe(13.5)
    const [a, b, c, d] = pl.segments
    expect(a).toMatchObject({ sn: 100, cc: 3, start: 0, duration: 4, title: 'first', uri: 'https://cdn.test/v/seg100.m4s' })
    expect(a.map).toMatchObject({ uri: 'https://cdn.test/v/init.mp4', byteRange: { offset: 0, length: 720 } })
    expect(a.key?.method).toBe('AES-128')
    expect(a.key?.iv?.[15]).toBe(10)
    expect(b).toMatchObject({ sn: 101, start: 4, byteRange: { offset: 2000, length: 1000 } })
    expect(c.byteRange).toEqual({ offset: 3000, length: 500 })
    expect(d).toMatchObject({ sn: 103, cc: 4, key: undefined })
  })

  it('без #EXTM3U — ошибка', () => {
    expect(() => parsePlaylist('hello', 'x')).toThrow('Not an M3U8')
  })

  it('target duration выводится из сегментов', () => {
    const pl = parsePlaylist('#EXTM3U\n#EXTINF:5.2,\na.ts\n', 'https://x/p.m3u8')
    expect(pl.type === 'media' && pl.targetDuration).toBe(6)
  })
})

describe('IV', () => {
  it('из номера сегмента и из hex', () => {
    expect(Array.from(sequenceIv(258).slice(14))).toEqual([1, 2])
    expect(parseHexIv('0x01')[15]).toBe(1)
  })
})

describe('alignTimes', () => {
  const live = (seq: number, n: number) => parsePlaylist(
    `#EXTM3U\n#EXT-X-TARGETDURATION:2\n#EXT-X-MEDIA-SEQUENCE:${seq}\n${Array.from({ length: n }, (_, i) => `#EXTINF:2,\ns${seq + i}.ts`).join('\n')}\n`,
    'https://x/live.m3u8',
  )

  it('сохраняет время сегментов между перезагрузками живого плейлиста', () => {
    const a = live(10, 4)
    const b = live(12, 4)
    alignTimes(a as never, b as never)
    if (b.type !== 'media') return
    expect(b.segments[0]).toMatchObject({ sn: 12, start: 4 })
  })

  it('при отставании без пересечения продолжает по номерам', () => {
    const a = live(10, 2)
    const b = live(20, 2)
    alignTimes(a as never, b as never)
    if (b.type !== 'media') return
    expect(b.segments[0].start).toBe(20)
  })
})
