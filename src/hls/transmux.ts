import type { Mp4TrackInfo } from './mp4.js'

export interface TransmuxResult {
  /** A new initialization segment, when the stream configuration appeared or changed. */
  init?: Uint8Array
  /** Media fragments (`moof` + `mdat`) to append. */
  data: Uint8Array
  /** MIME type with codecs for the SourceBuffer. */
  mimeType: string
  tracks: Mp4TrackInfo[]
  /** Decode time of the first sample, in seconds. */
  startTime: number
}

export interface TransmuxContext {
  /** The segment starts after EXT-X-DISCONTINUITY (or after a seek / level switch). */
  discontinuity: boolean
}

export interface SegmentTransmuxer {
  /** Whether this transmuxer understands the segment (by its first bytes). */
  canHandle(data: Uint8Array): boolean
  push(data: Uint8Array, ctx: TransmuxContext): TransmuxResult
  reset(): void
}

export type TransmuxerFactory = () => SegmentTransmuxer

export class TransmuxError extends Error {
  constructor(message: string, readonly code: 'codec' | 'format') {
    super(message)
    this.name = 'TransmuxError'
  }
}
