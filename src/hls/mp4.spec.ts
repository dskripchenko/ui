import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findBoxes, fragmentStart, isFmp4, isMpegTs, parseInit, readBoxes } from './mp4'
import { TsTransmuxer } from './ts/transmuxer'
import { demuxTs, readTimestamp } from './ts/demux'
import { parseAdts, audioSpecificConfig } from './ts/adts'
import { BitReader, parseSps, splitNals, toAvcc, unescapeRbsp } from './ts/h264'
import { TransmuxError } from './transmux'

const fixture = (name: string): Uint8Array => new Uint8Array(readFileSync(resolve(process.cwd(), 'src/hls/__fixtures__', name)))

describe('mp4 reader', () => {
  it('распознаёт контейнеры', () => {
    expect(isFmp4(fixture('tiny-init.mp4'))).toBe(true)
    expect(isFmp4(fixture('tiny-seg.m4s'))).toBe(true)
    expect(isMpegTs(fixture('tiny-ts.bin'))).toBe(true)
    expect(isMpegTs(fixture('tiny-seg.m4s'))).toBe(false)
  })

  it('дорожки и кодеки из init-сегмента', () => {
    const tracks = parseInit(fixture('tiny-init.mp4'))
    expect(tracks.map((t) => t.kind).sort()).toEqual(['audio', 'video'])
    expect(tracks.find((t) => t.kind === 'video')?.codec).toMatch(/^avc1\.[0-9a-f]{6}$/)
    expect(tracks.find((t) => t.kind === 'audio')).toMatchObject({ codec: 'mp4a.40.2', timescale: 22050 })
  })

  it('время начала фрагмента из tfdt', () => {
    const tracks = parseInit(fixture('tiny-init.mp4'))
    const start = fragmentStart(fixture('tiny-seg.m4s'), tracks)
    expect(start).not.toBeNull()
    expect(start as number).toBeLessThan(0.5)
  })

  it('readBoxes не выходит за границы обрезанных данных', () => {
    const d = fixture('tiny-init.mp4').subarray(0, 30)
    expect(() => readBoxes(d)).not.toThrow()
    expect(findBoxes(d, ['moov', 'trak'])).toEqual([])
  })
})

describe('H.264 / ADTS helpers', () => {
  it('splitNals по стартовым кодам 3 и 4 байта', () => {
    const d = Uint8Array.from([0, 0, 0, 1, 0x67, 1, 2, 0, 0, 1, 0x68, 3, 0, 0, 1, 0x65, 4, 5])
    const nals = splitNals(d)
    expect(nals.map((n) => n[0])).toEqual([0x67, 0x68, 0x65])
    expect(Array.from(toAvcc([nals[1]]))).toEqual([0, 0, 0, 2, 0x68, 3])
  })

  it('unescapeRbsp и экспоненциальный код Голомба', () => {
    expect(Array.from(unescapeRbsp(Uint8Array.from([0, 0, 3, 1, 0, 0, 3])))).toEqual([0, 0, 1, 0, 0])
    const r = new BitReader(Uint8Array.from([0b10100110, 0b11000000]))
    expect([r.ue(), r.ue(), r.ue(), r.se()]).toEqual([0, 1, 2, -1])
  })

  it('PES-время 33 бита без потери точности', () => {
    // PTS = 2^32 + 90000
    const v = 4294967296 + 90000
    const b = new Uint8Array(5)
    b[0] = 0x20 | ((Math.floor(v / 2 ** 30) & 7) << 1) | 1
    b[1] = Math.floor(v / 2 ** 22) & 0xff
    b[2] = ((Math.floor(v / 2 ** 15) & 0x7f) << 1) | 1
    b[3] = Math.floor(v / 2 ** 7) & 0xff
    b[4] = ((v % 128) << 1) | 1
    expect(readTimestamp(b, 0)).toBe(v)
  })

  it('ADTS: кадры, конфигурация, хвост', () => {
    const frame = (len: number): number[] => [0xff, 0xf1, 0x50, 0x80, (len >> 3) & 0xff, ((len & 7) << 5) | 0x1f, 0xfc, ...new Array(len - 7).fill(0x11)]
    const d = Uint8Array.from([...frame(10), ...frame(12), 0xff, 0xf1])
    const res = parseAdts(d)
    expect(res.frames.map((f) => f.length)).toEqual([3, 5])
    expect(res.config).toMatchObject({ objectType: 2, sampleRate: 44100, channels: 2 })
    expect(res.rest.length).toBe(2)
    expect(Array.from(audioSpecificConfig(res.config!))).toEqual([0x12, 0x10])
  })
})

describe('TS → fMP4', () => {
  it('демультиплексирует видео и аудио PES', () => {
    const res = demuxTs(fixture('tiny-ts.bin'))
    expect(res.videoType).toBe(0x1b)
    expect(res.audioType).toBe(0x0f)
    expect(res.video.length).toBe(10)
    expect(res.audio.length).toBeGreaterThan(0)
    expect(res.video[0].pts).toBeGreaterThanOrEqual(res.video[0].dts as number)
  })

  it('SPS: профиль и размер кадра', () => {
    const nal = splitNals(demuxTs(fixture('tiny-ts.bin')).video[0].data).find((n) => (n[0] & 0x1f) === 7)
    const sps = parseSps(nal as Uint8Array)
    expect(sps).toMatchObject({ profile: 100, width: 64, height: 48 })
  })

  it('выдаёт init + фрагменты, которые снова читаются как fMP4', () => {
    const tx = new TsTransmuxer()
    const out = tx.push(fixture('tiny-ts.bin'), { discontinuity: true })
    expect(out.mimeType).toMatch(/^video\/mp4; codecs="avc1\.64[0-9a-f]{4},mp4a\.40\.2"$/)
    expect(out.init && isFmp4(out.init)).toBe(true)
    const tracks = parseInit(out.init as Uint8Array)
    expect(tracks.map((t) => t.codec)).toEqual([expect.stringMatching(/^avc1\.64/), 'mp4a.40.2'])
    expect(findBoxes(out.data, ['moof'])).toHaveLength(2)
    expect(findBoxes(out.data, ['mdat'])).toHaveLength(2)
    const trun = findBoxes(out.data, ['moof', 'traf', 'trun'])[0]
    const count = new DataView(out.data.buffer, out.data.byteOffset + trun.data + 4, 4).getUint32(0)
    expect(count).toBe(10)
    expect(out.startTime).toBeGreaterThan(1)
    expect(fragmentStart(out.data, tracks)).toBeCloseTo(out.startTime, 2)
  })

  it('следующий сегмент продолжает шкалу и не повторяет init', () => {
    const tx = new TsTransmuxer()
    const a = tx.push(fixture('tiny-ts.bin'), { discontinuity: true })
    const b = tx.push(fixture('tiny-ts.bin'), { discontinuity: false })
    expect(b.init).toBeUndefined()
    expect(b.startTime).toBeCloseTo(a.startTime, 3)
  })

  it('не-H.264 видео — понятная ошибка', () => {
    const d = fixture('tiny-ts.bin').slice()
    // Patch the PMT stream type of the first elementary stream from 0x1b (H.264) to 0x24 (HEVC).
    for (let o = 0; o < d.length; o += 188) {
      const pid = ((d[o + 1] & 0x1f) << 8) | d[o + 2]
      if (pid === 0x1000) {
        const i = d.indexOf(0x1b, o + 5)
        d[i] = 0x24
        break
      }
    }
    expect(() => new TsTransmuxer().push(d, { discontinuity: true })).toThrow(TransmuxError)
  })
})
