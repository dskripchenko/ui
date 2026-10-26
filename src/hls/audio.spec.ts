import { describe, expect, it } from 'vitest'
import { pickAudioRendition } from './engine'
import { parsePlaylist } from './playlist'
import { isPackedAudio, parsePackedAudio } from './ts/id3'
import { TsTransmuxer } from './ts/transmuxer'
import { findBoxes, parseInit } from './mp4'

const master = `#EXTM3U
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="English",LANGUAGE="en",AUTOSELECT=YES,DEFAULT=YES,CHANNELS="2",URI="en/index.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="Русский",LANGUAGE="ru",AUTOSELECT=YES,URI="ru/index.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=500000,CODECS="avc1.4d401e,mp4a.40.2",AUDIO="aud"
v360/index.m3u8
`

function adtsFrame(len: number): number[] {
  return [0xff, 0xf1, 0x50, 0x80, (len >> 3) & 0xff, ((len & 7) << 5) | 0x1f, 0xfc, ...new Array(len - 7).fill(0x21)]
}

function id3Pts(pts: number): number[] {
  const owner = Array.from('com.apple.streaming.transportStreamTimestamp\0', (c) => c.charCodeAt(0))
  const hi = Math.floor(pts / 4294967296) & 1
  const lo = pts % 4294967296
  const body = [...owner, 0, 0, 0, hi, (lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff]
  const frame = [0x50, 0x52, 0x49, 0x56, 0, 0, 0, body.length, 0, 0, ...body]
  return [0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, frame.length, ...frame]
}

describe('альтернативные аудиодорожки', () => {
  it('master: группа, язык, DEFAULT и AUTOSELECT', () => {
    const pl = parsePlaylist(master, 'https://cdn.test/master.m3u8')
    if (pl.type !== 'master') throw new Error('master expected')
    expect(pl.variants[0].audio).toBe('aud')
    expect(pl.media).toHaveLength(2)
    expect(pl.media[1]).toMatchObject({ type: 'AUDIO', name: 'Русский', language: 'ru', autoselect: true, default: false, uri: 'https://cdn.test/ru/index.m3u8' })
    expect(pl.media[0].channels).toBe('2')
  })

  it('выбор: предпочтительный язык, затем DEFAULT, затем первый', () => {
    const pl = parsePlaylist(master, 'https://cdn.test/master.m3u8')
    if (pl.type !== 'master') return
    expect(pickAudioRendition(pl.media, 'ru')).toBe(1)
    expect(pickAudioRendition(pl.media, 'ru-RU')).toBe(1)
    expect(pickAudioRendition(pl.media, 'de')).toBe(0)
    expect(pickAudioRendition(pl.media)).toBe(0)
    expect(pickAudioRendition(pl.media.map((m) => ({ ...m, default: false, autoselect: false })))).toBe(0)
    expect(pickAudioRendition([])).toBe(-1)
  })
})

describe('packed audio (ID3 + ADTS)', () => {
  it('время из ID3 PRIV и полезная нагрузка после тегов', () => {
    const d = Uint8Array.from([...id3Pts(8589934591), ...adtsFrame(20)])
    expect(isPackedAudio(d)).toBe(true)
    const res = parsePackedAudio(d)
    expect(res.pts).toBe(8589934591)
    expect(res.data[0]).toBe(0xff)
    expect(res.data.length).toBe(20)
  })

  it('чистый ADTS без ID3 тоже распознаётся', () => {
    expect(isPackedAudio(Uint8Array.from(adtsFrame(10)))).toBe(true)
    expect(isPackedAudio(Uint8Array.from([0x47, 0, 0]))).toBe(false)
    expect(parsePackedAudio(Uint8Array.from(adtsFrame(10))).pts).toBeUndefined()
  })

  it('транcмуксер делает аудио-only fMP4 и продолжает шкалу', () => {
    const tx = new TsTransmuxer()
    const seg = (pts: number): Uint8Array => Uint8Array.from([...id3Pts(pts), ...adtsFrame(30), ...adtsFrame(30), ...adtsFrame(30)])
    expect(tx.canHandle(seg(0))).toBe(true)
    const a = tx.push(seg(90000), { discontinuity: true })
    expect(a.mimeType).toBe('audio/mp4; codecs="mp4a.40.2"')
    expect(parseInit(a.init as Uint8Array).map((t) => t.kind)).toEqual(['audio'])
    expect(a.startTime).toBeCloseTo(1, 3)
    expect(findBoxes(a.data, ['moof'])).toHaveLength(1)
    const b = tx.push(seg(90000 + Math.round((3 * 1024 * 90000) / 44100)), { discontinuity: false })
    expect(b.init).toBeUndefined()
    expect(b.startTime).toBeCloseTo(1 + (3 * 1024) / 44100, 3)
  })
})
