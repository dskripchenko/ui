# Video

`UidVideo` is a video player on the native `<video>` element with the kit's own controls: scrub bar with buffered ranges, chapters and thumbnail preview, volume, speed and quality menus, subtitles, full screen and picture-in-picture. No dependencies; HLS streams are played by a separate, lazily loaded entry (`@dskripchenko/ui/hls`).

```vue
<UidVideo
  src="/media/lesson.mp4"
  poster="/media/lesson.jpg"
  :tracks="[
    { src: '/media/lesson.en.vtt', srclang: 'en', label: 'English', default: true },
    { src: '/media/lesson.chapters.vtt', kind: 'chapters' },
  ]"
  thumbnails="/media/lesson.thumbs.vtt"
  resume-key="lesson-42"
/>
```

| Prop | Type | Default | |
|---|---|---|---|
| `src` | `string` | — | One source |
| `sources` | `UidMediaSource[]` | — | `{ src, type?, label? }` in order of preference; the browser gets the first one it can play. Two or more with `label` form the quality menu |
| `poster` | `string` | — | Image before playback |
| `tracks` | `UidMediaTrack[]` | `[]` | WebVTT: `{ src, kind?: 'subtitles' \| 'captions' \| 'chapters', srclang?, label?, default? }` |
| `thumbnails` | `string` | — | WebVTT whose cues point to sprite tiles: `sprite.jpg#xywh=0,0,160,90` |
| `autoplay` | `boolean` | `false` | Starts muted as soon as possible (browsers block unmuted autoplay) |
| `muted`, `loop` | `boolean` | `false` | |
| `preload` | `'none' \| 'metadata' \| 'auto'` | `'metadata'` | |
| `controls` | `boolean` | `true` | `false` — a bare element with the browser's controls |
| `crossorigin` | `'' \| 'anonymous' \| 'use-credentials'` | — | Needed for subtitles and thumbnails from another origin |
| `exclusive` | `boolean` | `true` | Starting this player pauses the other exclusive players on the page |
| `resumeKey` | `string` | — | Remembers the position in `localStorage` and resumes from it |
| `rates` | `number[]` | `0.5…2` | Speed menu |
| `hotkeys` | `boolean` | `true` | Keyboard shortcuts while the player has focus |
| `aspectRatio` | `string` | `'16 / 9'` | Box ratio before the video size is known |
| `title` | `string` | — | Accessible name of the player |
| `autoHide` | `number` | `2500` | Milliseconds without activity before the controls hide while playing |
| `hlsOptions` | `HlsOptions` | — | Passed to the HLS adapter (see below) |
| `hlsLoader` | `() => Promise<module>` | dynamic import | Where the HLS adapter comes from |

Events: `play`, `pause`, `ended`, `error` (`{ kind, detail? }`), `qualitychange` (label), `audiotrackchange` (label), `chapterchange` (chapter, index). The component exposes `play()`, `pause()`, `toggle()`, `seek(seconds)`, `seekToChapter(index | title)`, `chapters`, `chapterIndex`, the reactive `state` and the `media` element.

## Chapters

Chapters come from a `tracks` entry with `kind: 'chapters'` (WebVTT, one cue per chapter). Once loaded, they are available on the component ref:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidVideo, type UidMediaChapter } from '@dskripchenko/ui'

const player = ref<InstanceType<typeof UidVideo> | null>(null)
function onChapter(chapter: UidMediaChapter | null, index: number) { /* … */ }
</script>

<template>
  <UidVideo ref="player" :src="src" :tracks="tracks" @chapterchange="onChapter" />
  <button v-for="(c, i) in player?.chapters" :key="i" @click="player?.seekToChapter(i)">{{ c.title }}</button>
</template>
```

- `chapters` — `UidMediaChapter[]`, `{ start, end, title }` in seconds; empty until the VTT is loaded or when there is no chapters track.
- `chapterIndex` — index of the chapter at the current time, `-1` outside all chapters.
- `seekToChapter(index | title)` — seeks to the chapter start. A title is matched exactly first, then case-insensitively. Returns `false` when no chapter matches.
- `chapterchange` event — `(chapter | null, index)` whenever playback crosses into another chapter (or out of all of them).

## Controls

- **Scrub bar** — played part in the accent colour, buffered ranges, gaps between chapters; hovering shows the time, the chapter title and the thumbnail. Dragging seeks live. As a `slider` it takes arrows (±5 s), Page Up/Down (±10 %), Home/End.
- **Volume** — the button mutes, the slider unfolds on hover or focus (on touch screens the hardware buttons do the job).
- **Settings** — speed and, when there are several, quality (`Auto` follows the bandwidth for HLS) and, for an HLS stream with several audio renditions, the audio track. The menus live inside the player, so they work in full screen; in a small player they become a sheet over the video.
- **Subtitles** — the kit draws the cues itself (position above the controls, readable on any video); iOS native full screen shows them through the system player.
- **Narrow players** — the bar follows the player's own width: under 440 px subtitles and picture-in-picture move into the settings menu, under 360 px the time shows only the position. Play, settings and full screen always stay.
- **Full screen** — the whole player; on iPhone, where only the `<video>` itself can go full screen, the native player opens.
- **Picture-in-picture** — standard API or Safari's presentation mode.
- **Live** streams show a `Live` badge instead of the time; it turns red at the live edge, a click jumps there.

On touch screens a tap shows or hides the controls, a double tap on the left or right third seeks ∓10 s, the centre button plays and pauses. On desktop a click on the video plays/pauses and a double click toggles full screen. Controls hide after `autoHide` while playing and stay while a menu is open, the bar is being dragged or focus is inside it.

## Keyboard

| Key | Action |
|---|---|
| Space, `K` | Play / pause |
| ← / → | −5 s / +5 s |
| `J` / `L` | −10 s / +10 s |
| ↑ / ↓ | Volume ±10 % |
| `M` | Mute |
| `F` | Full screen |
| `C` | Subtitles on / off |
| `0`–`9` | Jump to 0–90 % |
| Home / End | Start / end |

## Errors

Errors are shown inside the player with a "Try again" button and come with a kind: `aborted`, `network`, `decode`, `unsupported`, `mse`, `manifest`, `encrypted`, `codec`, `unknown`. Texts come from the locale bag `media.errors` (see [i18n](./i18n.md)). A 404 is reported as `network`, not as "unsupported format" as browsers do. When a source cannot be played, the next one from `sources` is tried.

## Formats

What the browsers play natively (the kit adds nothing for these):

| Format | Chrome / Edge | Firefox | Safari macOS | Safari iOS |
|---|---|---|---|---|
| MP4 · H.264 + AAC | ✓ | ✓ | ✓ | ✓ |
| MP4 · HEVC | with hardware decoding | Windows with hardware decoding | ✓ | ✓ |
| WebM · VP9 + Opus | ✓ | ✓ | ✓ | ✓ (recent versions) |
| MP4/WebM · AV1 | ✓ | ✓ | with hardware decoding | with hardware decoding |
| HLS (`.m3u8`) | through the kit's adapter; recent versions also natively | through the kit's adapter | natively | natively |

Checked in real browsers (Playwright): Chromium 156, Chrome 156, WebKit 27 — MP4 H.264/AAC, WebM VP9/Opus, HLS fMP4 and MPEG-TS (through the adapter and natively), AES-128, live playlists, discontinuities, alternate audio renditions (fMP4, MPEG-TS, packed AAC) with switching. Firefox was not available in the test environment.

## HLS

A source with `type: 'application/x-mpegURL'` (or a `.m3u8` address) is played through `@dskripchenko/ui/hls`. The adapter is a separate entry loaded with a dynamic import only when such a source appears — the main bundle does not grow.

- Where the browser plays HLS itself (Safari, iOS, recent Chrome) the address goes straight to `<video>` (`preferNative: true`; set `false` to always use the adapter and get the quality menu).
- Otherwise the adapter feeds Media Source Extensions: master and media playlists, **fMP4/CMAF** segments with `EXT-X-MAP`, **MPEG-TS** segments (H.264 + AAC) converted to fMP4 in the browser, byte ranges, `EXT-X-DISCONTINUITY`, **AES-128** (WebCrypto), **alternate audio renditions** (`EXT-X-MEDIA TYPE=AUDIO` with a URI) in their own SourceBuffer, kept in sync with the video across seeking and quality switches, chosen by `audioLanguage`, then `DEFAULT`, then `AUTOSELECT` in the browser language, and switchable from the settings menu; audio renditions as fMP4, MPEG-TS or **packed AAC** with an ID3 timestamp; live playlists with reloads and a sliding window, buffer-ahead and eviction, seeking, ABR with manual quality selection, retries with backoff.
- Not supported: SAMPLE-AES / DRM (`encrypted` error), HEVC or MP3 inside MPEG-TS (`codec` error), low-latency HLS parts.

```ts
import { UidVideo } from '@dskripchenko/ui'

// In a template:
// <UidVideo src="https://cdn.example/live/master.m3u8" :hls-options="{ maxBufferAhead: 20 }" />
```

| `HlsOptions` | Default | |
|---|---|---|
| `preferNative` | `true` | Use the browser's own HLS when present |
| `startLevel` | `-1` | Starting variant; `-1` — ABR decides |
| `audioLanguage` | — | Preferred audio rendition language (`ru`, `en-US`…) |
| `maxBufferAhead` | `30` | Seconds to buffer ahead |
| `maxBufferBehind` | `30` | Seconds kept behind the playhead |
| `retries` | `3` | Repeats of a failed request (500 ms, 1 s, 2 s…) |
| `initialBandwidth` | `1000000` | First bandwidth estimate, bit/s |
| `capToPlayerSize` | `true` | ABR does not pick variants much taller than the player |
| `transmuxer` | built-in MPEG-TS | Factory of a segment converter; `null` disables it |

The adapter can be used without the component:

```ts
import { attachHls } from '@dskripchenko/ui/hls'

const session = attachHls(videoElement, url, {
  onLevels: (levels) => console.log(levels.map((l) => l.label)),
  onError: (e) => console.warn(e.code, e.message),
})
session.setLevel(1)   // -1 — back to automatic
session.setAudioTrack(1) // another audio rendition
session.stats()        // buffered ranges per SourceBuffer, level, bandwidth
session.destroy()
```

A converter for another container plugs in through `transmuxer`: an object with `canHandle(bytes)`, `push(bytes, { discontinuity })` → `{ init?, data, mimeType, tracks, startTime }` and `reset()`.

## The controller

`useMediaController(mediaRef, options)` is the core both players share; build your own player UI on it.

```ts
const media = ref<HTMLVideoElement | null>(null)
const { state, play, pause, toggle, seek, skip, setVolume, toggleMute, setRate, toggleFullscreen, togglePip, handleKey } =
  useMediaController(media, { fullscreenTarget: rootRef, resumeKey: 'intro' })
```

`state` is reactive: `playing`, `paused`, `ended`, `waiting`, `stalled`, `seeking`, `currentTime`, `duration`, `live`, `buffered`, `volume`, `muted`, `rate`, `fullscreen`, `pip`, `error`. `handleKey(event)` applies the shortcuts above and returns `true` when the key was handled.

## Styling

The controls always stay light on a dark scrim. Variables: `--uid-video-accent` (played part, checked items), `--uid-video-radius`, `--uid-video-bg`, `--uid-video-caption-size`.
