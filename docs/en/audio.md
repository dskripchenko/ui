# Audio

`UidAudio` is an audio player on the native `<audio>` element: a compact row (play, scrub bar, time, volume, speed), a `mini` variant for tables and lists, a waveform computed in the browser, and a playlist. It shares the controller with [UidVideo](./video.md).

```vue
<UidAudio src="/media/episode.mp3" title="Episode 12" artist="The Podcast" waveform />

<UidAudio :src="row.recording" variant="mini" />

<UidAudio v-model:index="current" :tracks="playlist" waveform />
```

| Prop | Type | Default | |
|---|---|---|---|
| `src`, `type` | `string` | — | One track; with `type` an unplayable format is reported at once |
| `title`, `artist` | `string` | — | Shown above the scrub bar |
| `tracks` | `UidAudioTrack[]` | — | Playlist: `{ src, type?, title?, artist?, peaks?, duration? }` |
| `index` (`v-model:index`) | `number` | `0` | Current playlist track |
| `variant` | `'default' \| 'mini'` | `'default'` | `mini` — one line: play, bar, time |
| `waveform` | `boolean` | `false` | Waveform decoded in the browser as the scrub bar |
| `peaks` | `number[]` | — | Precomputed peaks `0..1`; draws the waveform without decoding |
| `waveformMaxBytes` | `number` | 40 MB | Larger files are not decoded — a plain bar instead |
| `waveformMaxDuration` | `number` | 1800 | Longer audio (seconds) is not decoded |
| `autoAdvance` | `boolean` | `true` | Next playlist track when one ends |
| `loop` | `boolean` | `false` | Repeat the track, or the whole playlist |
| `preload` | `'none' \| 'metadata' \| 'auto'` | `'metadata'` | |
| `crossorigin` | `'' \| 'anonymous' \| 'use-credentials'` | — | |
| `exclusive` | `boolean` | `true` | Starting this player pauses the other ones |
| `resumeKey` | `string` | — | Remembers the position (per playlist track) |
| `rates` | `number[]` | `0.5…2` | Speed menu |
| `hotkeys` | `boolean` | `true` | Space/`K`, arrows, `J`/`L`, `M`, `0`–`9`; `Shift+N` / `Shift+P` — next / previous track |
| `showVolume`, `showRate` | `boolean` | `true` | |
| `showPlaylist` | `boolean` | `true` | Track list under the player |

Events: `play`, `pause`, `ended`, `error`, `trackchange` (index), `update:index`. Props `hlsOptions` and `hlsLoader` work as in UidVideo. Exposed: `play()`, `pause()`, `toggle()`, `seek()`, `next()`, `prev()`, `state`, `media`.

## Layout

- **Default** — a row: play button, title and scrub bar, time, volume, speed. In a narrow container (under 480 px) the title and artist stack and are cut with an ellipsis, the scrub bar moves to its own full-width line with the time under it, the volume slider is left to the hardware buttons. From 560 px the volume slider is always visible.
- **Mini** — `240px` wide by default (`--uid-audio-mini-width`), fits a table cell: play, bar or small waveform, time (the duration before playback, the position during it). Starting one row pauses the others.
- **Playlist** — previous / next around the play button and a numbered list with the playing track marked. "Previous" first rewinds a track that has been playing for more than 3 seconds. The lock screen and hardware media keys work through the Media Session API. Durations of all tracks are read one by one from their metadata; until then the list shows “—”.

## Waveform

With `waveform` the file is fetched and decoded with Web Audio (`decodeAudioData` at a low sample rate to keep memory small), and peaks are computed in chunks that yield to the browser between them (`requestIdleCallback`, otherwise `setTimeout`). Results are cached per address for the page's lifetime; files are decoded one at a time and only once the player is near the viewport, so a table of a hundred recordings stays responsive. Files over `waveformMaxBytes` or longer than `waveformMaxDuration` keep the plain bar. The audio has to be readable by `fetch` — same origin or CORS. Until the peaks are ready the bar shows a shimmering placeholder rather than a plain line that looks final.

For long recordings compute the peaks on the server and pass them in `peaks` (any length; the player resamples to its width):

```ts
import { computePeaks } from '@dskripchenko/ui'

// e.g. in a worker or during upload processing
const peaks = await computePeaks([audioBuffer.getChannelData(0)], 512)
```

Helpers: `getWaveform(src, options)`, `computePeaks(channels, count)`, `resamplePeaks(peaks, n)`, `peaksToPath(peaks)`.

## HLS

An `.m3u8` source (or `type: 'application/x-mpegURL'`) plays through the same lazily loaded adapter as in [UidVideo](./video.md#hls): an audio-only master or media playlist, fMP4, MPEG-TS or packed AAC segments. The waveform is not drawn for streams.

## Formats

| Format | Chrome / Edge | Firefox | Safari macOS | Safari iOS |
|---|---|---|---|---|
| MP3 | ✓ | ✓ | ✓ | ✓ |
| AAC / M4A | ✓ | ✓ | ✓ | ✓ |
| Ogg · Opus | ✓ | ✓ | ✓ (recent versions) | ✓ (recent versions) |
| Ogg · Vorbis | ✓ | ✓ | recent versions | recent versions |
| WAV (PCM) | ✓ | ✓ | ✓ | ✓ |
| FLAC | ✓ | ✓ | ✓ | ✓ |
| WebM · Opus | ✓ | ✓ | ✓ | ✓ (recent versions) |

Checked in real browsers (Playwright): MP3, Ogg/Opus, WAV, FLAC and M4A play and draw the waveform in Chromium 156, Chrome 156 and WebKit 27. Prefer giving `type` for a less common format: the player reports "not supported" immediately instead of after a failed load.

## Styling

Variables: `--uid-audio-accent`, `--uid-audio-accent-hover`, `--uid-audio-bg`, `--uid-audio-border`, `--uid-audio-radius`, `--uid-audio-padding`, `--uid-audio-play-size`, `--uid-audio-play-color`, `--uid-audio-wave`, `--uid-audio-wave-height`, `--uid-audio-mini-width`, `--uid-audio-list-max-height`.
