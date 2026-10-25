import { isMpegTs, type Mp4TrackInfo } from '../mp4.js'
import { TransmuxError, type SegmentTransmuxer, type TransmuxContext, type TransmuxResult } from '../transmux.js'
import { audioSpecificConfig, parseAdts, type AdtsConfig } from './adts.js'
import { demuxTs, STREAM_AAC, STREAM_H264, type DemuxState, type PesPacket } from './demux.js'
import { isPackedAudio, parsePackedAudio } from './id3.js'
import { avcCodec, nalType, NAL_AUD, NAL_IDR, NAL_PPS, NAL_SPS, parseSps, splitNals, toAvcc } from './h264.js'
import { concatBytes, fragment, initSegment, type MuxSample, type MuxTrack } from './mp4mux.js'

const VIDEO_ID = 1
const AUDIO_ID = 2
const WRAP = 8589934592
const FRAME = 1024

interface Samples { base: number, samples: MuxSample[], payload: Uint8Array }

interface VideoConfig { sps: Uint8Array, pps: Uint8Array, width: number, height: number, codec: string }

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

/** MPEG-TS (H.264 + AAC) → fragmented MP4, segment by segment, with a continuous timeline. */
export class TsTransmuxer implements SegmentTransmuxer {
  private demux: DemuxState = {}
  private video?: VideoConfig
  private audio?: AdtsConfig
  private initKey = ''
  private seq = 1
  private ref: number | null = null
  private nextVideoDts: number | null = null
  private nextAudioDts: number | null = null
  private videoDuration = 3000

  canHandle(data: Uint8Array): boolean {
    return isMpegTs(data) || isPackedAudio(data)
  }

  reset(): void {
    this.demux = {}
    this.initKey = ''
    this.ref = null
    this.nextVideoDts = null
    this.nextAudioDts = null
  }

  private unwrap(ts: number): number {
    if (this.ref === null) this.ref = ts
    while (ts - this.ref > WRAP / 2) ts -= WRAP
    while (this.ref - ts > WRAP / 2) ts += WRAP
    this.ref = ts
    return ts
  }

  push(data: Uint8Array, ctx: TransmuxContext): TransmuxResult {
    if (ctx.discontinuity) {
      this.ref = null
      this.nextVideoDts = null
      this.nextAudioDts = null
    }
    if (!isMpegTs(data)) return this.pushPacked(data)
    const res = demuxTs(data, this.demux)
    this.demux = res
    if (res.videoType !== undefined && res.videoType !== STREAM_H264) {
      throw new TransmuxError(`Unsupported video stream type 0x${res.videoType.toString(16)}`, 'codec')
    }
    if (res.audioType !== undefined && res.audioType !== STREAM_AAC) {
      throw new TransmuxError(`Unsupported audio stream type 0x${res.audioType.toString(16)}`, 'codec')
    }
    if (res.videoPid === undefined && res.audioPid === undefined) {
      throw new TransmuxError('No program map in the transport stream', 'format')
    }

    const video = res.video.length ? this.videoSamples(res.video) : null
    const audio = res.audio.length ? this.audioSamples(res.audio) : null
    return this.output(video, audio)
  }

  private pushPacked(data: Uint8Array): TransmuxResult {
    const packed = parsePackedAudio(data)
    if (packed.pts === undefined && this.nextAudioDts === null) {
      throw new TransmuxError('Packed audio segment without an ID3 timestamp', 'format')
    }
    // Without a timestamp the segment continues the previous one.
    const pts = packed.pts ?? Math.round(((this.nextAudioDts as number) * 90000) / (this.audio?.sampleRate ?? 90000))
    const audio = this.audioSamples([{ pts, dts: pts, data: packed.data }])
    if (!audio) throw new TransmuxError('No AAC frames in the packed audio segment', 'format')
    return this.output(null, audio)
  }

  private output(video: Samples | null, audio: Samples | null): TransmuxResult {
    const tracks: MuxTrack[] = []
    const info: Mp4TrackInfo[] = []
    const codecs: string[] = []
    if (this.video) {
      tracks.push({ id: VIDEO_ID, kind: 'video', timescale: 90000, ...this.video })
      info.push({ id: VIDEO_ID, kind: 'video', timescale: 90000, codec: this.video.codec })
      codecs.push(this.video.codec)
    }
    if (this.audio) {
      const config = audioSpecificConfig(this.audio)
      tracks.push({ id: AUDIO_ID, kind: 'audio', timescale: this.audio.sampleRate, channels: this.audio.channels, sampleRate: this.audio.sampleRate, config })
      info.push({ id: AUDIO_ID, kind: 'audio', timescale: this.audio.sampleRate, codec: `mp4a.40.${this.audio.objectType}` })
      codecs.push(`mp4a.40.${this.audio.objectType}`)
    }
    if (!tracks.length) throw new TransmuxError('No decodable samples in the segment', 'format')

    const key = codecs.join(',') + (this.video ? `|${this.video.width}x${this.video.height}|${this.video.sps.join('.')}` : '')
    let init: Uint8Array | undefined
    if (key !== this.initKey) {
      init = initSegment(tracks)
      this.initKey = key
    }

    const parts: Uint8Array[] = []
    const starts: number[] = []
    if (video && this.video) {
      parts.push(fragment(this.seq++, VIDEO_ID, video.base, video.samples, video.payload))
      starts.push(video.base / 90000)
    }
    if (audio && this.audio) {
      parts.push(fragment(this.seq++, AUDIO_ID, audio.base, audio.samples, audio.payload))
      starts.push(audio.base / this.audio.sampleRate)
    }
    return {
      init,
      data: concatBytes(parts),
      mimeType: `${this.video ? 'video' : 'audio'}/mp4; codecs="${codecs.join(',')}"`,
      tracks: info,
      startTime: starts.length ? Math.min(...starts) : 0,
    }
  }

  private videoSamples(pes: PesPacket[]): Samples | null {
    const units: { dts: number, pts: number, key: boolean, data: Uint8Array }[] = []
    let lastDts: number | null = null
    for (const p of pes) {
      const nals = splitNals(p.data)
      const keep: Uint8Array[] = []
      let key = false
      for (const nal of nals) {
        const t = nalType(nal)
        if (t === NAL_SPS) {
          const info = parseSps(nal)
          if (!this.video || !sameBytes(this.video.sps, nal)) {
            this.video = { sps: nal.slice(), pps: this.video?.pps ?? new Uint8Array(0), width: info.width, height: info.height, codec: avcCodec(nal) }
          }
        } else if (t === NAL_PPS) {
          if (this.video) this.video.pps = nal.slice()
        } else if (t !== NAL_AUD) {
          if (t === NAL_IDR) key = true
          keep.push(nal)
        }
      }
      if (!keep.length) continue
      const dts: number | null = p.dts !== undefined ? this.unwrap(p.dts) : (lastDts !== null ? lastDts + this.videoDuration : null)
      if (dts === null) continue
      const pts = p.pts !== undefined ? this.unwrap(p.pts) : dts
      units.push({ dts, pts, key, data: toAvcc(keep) })
      lastDts = dts
    }
    if (!units.length || !this.video?.pps.length) return null

    // Continuity: a segment that starts within a frame of where the previous ended is glued to it.
    if (this.nextVideoDts !== null) {
      const gap = units[0].dts - this.nextVideoDts
      if (Math.abs(gap) < this.videoDuration * 1.5 && gap !== 0) {
        units[0].pts -= gap
        units[0].dts -= gap
      }
    }

    const samples: MuxSample[] = []
    for (let i = 0; i < units.length; i++) {
      const u = units[i]
      let duration = i + 1 < units.length ? units[i + 1].dts - u.dts : this.videoDuration
      if (duration <= 0) duration = this.videoDuration
      else if (i + 1 < units.length) this.videoDuration = duration
      samples.push({ size: u.data.length, duration, cts: Math.max(0, u.pts - u.dts), key: u.key })
    }
    const last = units[units.length - 1]
    this.nextVideoDts = last.dts + samples[samples.length - 1].duration
    return { base: units[0].dts, samples, payload: concatBytes(units.map((u) => u.data)) }
  }

  private audioSamples(pes: PesPacket[]): Samples | null {
    const frames: Uint8Array[] = []
    let firstPts: number | null = null
    let carry: Uint8Array = new Uint8Array(0)
    for (const p of pes) {
      const input: Uint8Array = carry.length ? concatBytes([carry, p.data]) : p.data
      const parsed = parseAdts(input)
      if (parsed.config && !this.audio) this.audio = parsed.config
      else if (parsed.config && this.audio && (parsed.config.sampleRate !== this.audio.sampleRate || parsed.config.channels !== this.audio.channels)) {
        this.audio = parsed.config
      }
      if (firstPts === null && p.pts !== undefined) {
        // Frames carried over from the previous PES started one frame-run earlier; keep the first PES time.
        firstPts = this.unwrap(p.pts)
      }
      frames.push(...parsed.frames)
      carry = parsed.rest
    }
    if (!frames.length || !this.audio || firstPts === null) return null
    const rate = this.audio.sampleRate
    let base = Math.round((firstPts * rate) / 90000)
    if (this.nextAudioDts !== null && Math.abs(base - this.nextAudioDts) < FRAME * 2) base = this.nextAudioDts
    this.nextAudioDts = base + frames.length * FRAME
    const samples = frames.map((f) => ({ size: f.length, duration: FRAME, cts: 0, key: true }))
    return { base, samples, payload: concatBytes(frames) }
  }
}

export function createTsTransmuxer(): SegmentTransmuxer {
  return new TsTransmuxer()
}
