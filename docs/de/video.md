# Video

`UidVideo` ist ein Videoplayer auf dem nativen Element `<video>` mit eigenen Bedienelementen des Kits: Zeitleiste mit gepufferten Bereichen, Kapiteln und Vorschaubildern, Lautstärke, Menüs für Geschwindigkeit und Qualität, Untertitel, Vollbild und Bild-in-Bild. Keine Abhängigkeiten; HLS-Streams spielt ein separater, verzögert geladener Einstiegspunkt ab (`@dskripchenko/ui/hls`).

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

| Prop | Typ | Standard | |
|---|---|---|---|
| `src` | `string` | — | Eine Quelle |
| `sources` | `UidMediaSource[]` | — | `{ src, type?, label? }` in Reihenfolge der Präferenz; der Browser nimmt die erste, die er abspielen kann. Zwei oder mehr mit `label` bilden das Qualitätsmenü |
| `poster` | `string` | — | Bild vor der Wiedergabe |
| `tracks` | `UidMediaTrack[]` | `[]` | WebVTT: `{ src, kind?: 'subtitles' \| 'captions' \| 'chapters', srclang?, label?, default? }` |
| `thumbnails` | `string` | — | WebVTT, dessen Cues auf Sprite-Kacheln zeigen: `sprite.jpg#xywh=0,0,160,90` |
| `autoplay` | `boolean` | `false` | Startet so früh wie möglich stummgeschaltet (Browser blockieren Autoplay mit Ton) |
| `muted`, `loop` | `boolean` | `false` | |
| `preload` | `'none' \| 'metadata' \| 'auto'` | `'metadata'` | |
| `controls` | `boolean` | `true` | `false` — ein nacktes Element mit den Bedienelementen des Browsers |
| `crossorigin` | `'' \| 'anonymous' \| 'use-credentials'` | — | Nötig für Untertitel und Vorschaubilder von einem anderen Origin |
| `exclusive` | `boolean` | `true` | Der Start dieses Players pausiert die anderen exklusiven Player der Seite |
| `resumeKey` | `string` | — | Merkt sich die Position in `localStorage` und setzt dort fort |
| `rates` | `number[]` | `0.5…2` | Geschwindigkeitsmenü |
| `hotkeys` | `boolean` | `true` | Tastenkürzel, solange der Player den Fokus hat |
| `aspectRatio` | `string` | `'16 / 9'` | Seitenverhältnis der Box, solange die Videogröße unbekannt ist |
| `title` | `string` | — | Barrierefreier Name des Players |
| `autoHide` | `number` | `2500` | Millisekunden ohne Aktivität, nach denen sich die Bedienelemente während der Wiedergabe ausblenden |
| `hlsOptions` | `HlsOptions` | — | Werden an den HLS-Adapter übergeben (siehe unten) |
| `hlsLoader` | `() => Promise<module>` | dynamischer Import | Woher der HLS-Adapter kommt |

Events: `play`, `pause`, `ended`, `error` (`{ kind, detail? }`), `qualitychange` (Label), `audiotrackchange` (Label), `chapterchange` (Kapitel, Index). Die Komponente stellt `play()`, `pause()`, `toggle()`, `seek(seconds)`, `seekToChapter(index | title)`, `chapters`, `chapterIndex`, den reaktiven `state` und das Element `media` bereit.

## Kapitel

Kapitel stammen aus einem `tracks`-Eintrag mit `kind: 'chapters'` (WebVTT, ein Cue pro Kapitel). Nach dem Laden stehen sie über die Komponenten-Ref bereit:

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

- `chapters` — `UidMediaChapter[]`, `{ start, end, title }` in Sekunden; leer, solange die VTT nicht geladen ist oder keine Kapitelspur existiert.
- `chapterIndex` — Index des Kapitels an der aktuellen Position, `-1` außerhalb aller Kapitel.
- `seekToChapter(index | title)` — springt zum Kapitelanfang. Ein Titel wird zuerst exakt, dann ohne Groß-/Kleinschreibung verglichen. Gibt `false` zurück, wenn kein Kapitel passt.
- Event `chapterchange` — `(chapter | null, index)`, sobald die Wiedergabe in ein anderes Kapitel (oder aus allen heraus) wechselt.

## Bedienelemente

- **Zeitleiste** — gespielter Teil in der Akzentfarbe, gepufferte Bereiche, Lücken zwischen Kapiteln; beim Überfahren erscheinen Zeit, Kapiteltitel und Vorschaubild. Ziehen spult live. Als `slider` reagiert sie auf Pfeiltasten (±5 s), Page Up/Down (±10 %), Home/End.
- **Lautstärke** — der Button schaltet stumm, der Regler klappt bei Hover oder Fokus auf (auf Touchscreens übernehmen das die Hardwaretasten).
- **Einstellungen** — Geschwindigkeit und, falls es mehrere gibt, Qualität (`Auto` folgt bei HLS der Bandbreite) und bei einem HLS-Stream mit mehreren Audiospuren die Audiospur. Die Menüs leben im Player und funktionieren daher im Vollbild; in einem kleinen Player werden sie zu einem Sheet über dem Video.
- **Untertitel** — das Kit zeichnet die Cues selbst (oberhalb der Bedienelemente, auf jedem Video lesbar); im nativen Vollbild von iOS zeigt sie der Systemplayer.
- **Schmale Player** — die Leiste richtet sich nach der Breite des Players selbst: unter 440 px wandern Untertitel und Bild-in-Bild ins Einstellungsmenü, unter 360 px zeigt die Zeit nur die Position. Wiedergabe, Einstellungen und Vollbild bleiben immer.
- **Vollbild** — der ganze Player; auf dem iPhone, wo nur das `<video>` selbst ins Vollbild kann, öffnet sich der native Player.
- **Bild-in-Bild** — Standard-API oder der Präsentationsmodus von Safari.
- **Live**-Streams zeigen statt der Zeit ein Abzeichen „Live“; an der Live-Kante wird es rot, ein Klick springt dorthin.

Auf Touchscreens blendet ein Tippen die Bedienelemente ein oder aus, ein Doppeltippen auf das linke oder rechte Drittel spult ∓10 s, der mittlere Button startet und pausiert. Auf dem Desktop startet/pausiert ein Klick auf das Video, ein Doppelklick schaltet das Vollbild um. Während der Wiedergabe blenden sich die Bedienelemente nach `autoHide` aus und bleiben sichtbar, solange ein Menü offen ist, die Leiste gezogen wird oder der Fokus darin liegt.

## Tastatur

| Taste | Aktion |
|---|---|
| Leertaste, `K` | Wiedergabe / Pause |
| ← / → | −5 s / +5 s |
| `J` / `L` | −10 s / +10 s |
| ↑ / ↓ | Lautstärke ±10 % |
| `M` | Stummschalten |
| `F` | Vollbild |
| `C` | Untertitel an / aus |
| `0`–`9` | Sprung zu 0–90 % |
| Home / End | Anfang / Ende |

## Fehler

Fehler erscheinen im Player mit einem Button „Erneut versuchen“ (Try again) und haben eine Art: `aborted`, `network`, `decode`, `unsupported`, `mse`, `manifest`, `encrypted`, `codec`, `unknown`. Die Texte kommen aus der Locale (`media.errors`, siehe [i18n](./i18n.md)). Ein 404 wird als `network` gemeldet, nicht als „nicht unterstütztes Format“ wie in Browsern. Lässt sich eine Quelle nicht abspielen, wird die nächste aus `sources` versucht.

## Formate

Was die Browser nativ abspielen (das Kit fügt dafür nichts hinzu):

| Format | Chrome / Edge | Firefox | Safari macOS | Safari iOS |
|---|---|---|---|---|
| MP4 · H.264 + AAC | ✓ | ✓ | ✓ | ✓ |
| MP4 · HEVC | mit Hardware-Dekodierung | Windows mit Hardware-Dekodierung | ✓ | ✓ |
| WebM · VP9 + Opus | ✓ | ✓ | ✓ | ✓ (neuere Versionen) |
| MP4/WebM · AV1 | ✓ | ✓ | mit Hardware-Dekodierung | mit Hardware-Dekodierung |
| HLS (`.m3u8`) | über den Adapter des Kits; neuere Versionen auch nativ | über den Adapter des Kits | nativ | nativ |

In echten Browsern geprüft (Playwright): Chromium 156, Chrome 156, WebKit 27 — MP4 H.264/AAC, WebM VP9/Opus, HLS fMP4 und MPEG-TS (über den Adapter und nativ), AES-128, Live-Playlists, Diskontinuitäten, alternative Audiospuren (fMP4, MPEG-TS, Packed AAC) mit Umschalten. Firefox stand in der Testumgebung nicht zur Verfügung.

## HLS

Eine Quelle mit `type: 'application/x-mpegURL'` (oder einer `.m3u8`-Adresse) wird über `@dskripchenko/ui/hls` abgespielt. Der Adapter ist ein separater Einstiegspunkt, der per dynamischem Import erst geladen wird, wenn eine solche Quelle auftaucht — das Haupt-Bundle wächst nicht.

- Wo der Browser HLS selbst abspielt (Safari, iOS, neueres Chrome), geht die Adresse direkt an `<video>` (`preferNative: true`; `false` setzen, um immer den Adapter zu nutzen und das Qualitätsmenü zu erhalten).
- Sonst speist der Adapter Media Source Extensions: Master- und Media-Playlists, **fMP4/CMAF**-Segmente mit `EXT-X-MAP`, **MPEG-TS**-Segmente (H.264 + AAC), die im Browser in fMP4 umgewandelt werden, Byte-Bereiche, `EXT-X-DISCONTINUITY`, **AES-128** (WebCrypto), **alternative Audiospuren** (`EXT-X-MEDIA TYPE=AUDIO` mit URI) in einem eigenen SourceBuffer, beim Spulen und Qualitätswechsel synchron zum Video; gewählt nach `audioLanguage`, dann `DEFAULT`, dann `AUTOSELECT` in der Browsersprache, umschaltbar im Einstellungsmenü; Audiospuren als fMP4, MPEG-TS oder **Packed AAC** mit ID3-Zeitstempel; Live-Playlists mit Neuladen und gleitendem Fenster, Vorauspufferung und Verdrängung, Spulen, ABR mit manueller Qualitätswahl, Wiederholungen mit Backoff.
- Nicht unterstützt: SAMPLE-AES / DRM (Fehler `encrypted`), HEVC oder MP3 in MPEG-TS (Fehler `codec`), Low-Latency-HLS-Parts.

```ts
import { UidVideo } from '@dskripchenko/ui'

// Im Template:
// <UidVideo src="https://cdn.example/live/master.m3u8" :hls-options="{ maxBufferAhead: 20 }" />
```

| `HlsOptions` | Standard | |
|---|---|---|
| `preferNative` | `true` | Das eigene HLS des Browsers nutzen, falls vorhanden |
| `startLevel` | `-1` | Startvariante; `-1` — ABR entscheidet |
| `audioLanguage` | — | Bevorzugte Sprache der Audiospur (`ru`, `en-US`…) |
| `maxBufferAhead` | `30` | Sekunden, die vorausgepuffert werden |
| `maxBufferBehind` | `30` | Sekunden, die hinter der Abspielposition behalten werden |
| `retries` | `3` | Wiederholungen einer fehlgeschlagenen Anfrage (500 ms, 1 s, 2 s…) |
| `initialBandwidth` | `1000000` | Erste Schätzung der Bandbreite, Bit/s |
| `capToPlayerSize` | `true` | ABR wählt keine Varianten, die deutlich höher sind als der Player |
| `transmuxer` | eingebauter MPEG-TS | Factory eines Segmentkonverters; `null` deaktiviert ihn |

Der Adapter lässt sich ohne die Komponente verwenden:

```ts
import { attachHls } from '@dskripchenko/ui/hls'

const session = attachHls(videoElement, url, {
  onLevels: (levels) => console.log(levels.map((l) => l.label)),
  onError: (e) => console.warn(e.code, e.message),
})
session.setLevel(1)   // -1 — zurück zur Automatik
session.setAudioTrack(1) // andere Audiospur
session.stats()        // Puffer je SourceBuffer, Level, Bandbreite
session.destroy()
```

Ein Konverter für einen anderen Container wird über `transmuxer` eingebunden: ein Objekt mit `canHandle(bytes)`, `push(bytes, { discontinuity })` → `{ init?, data, mimeType, tracks, startTime }` und `reset()`.

## Der Controller

`useMediaController(mediaRef, options)` ist der gemeinsame Kern beider Player; darauf lässt sich eine eigene Player-Oberfläche bauen.

```ts
const media = ref<HTMLVideoElement | null>(null)
const { state, play, pause, toggle, seek, skip, setVolume, toggleMute, setRate, toggleFullscreen, togglePip, handleKey } =
  useMediaController(media, { fullscreenTarget: rootRef, resumeKey: 'intro' })
```

`state` ist reaktiv: `playing`, `paused`, `ended`, `waiting`, `stalled`, `seeking`, `currentTime`, `duration`, `live`, `buffered`, `volume`, `muted`, `rate`, `fullscreen`, `pip`, `error`. `handleKey(event)` wendet die obigen Tastenkürzel an und gibt `true` zurück, wenn die Taste behandelt wurde.

## Gestaltung

Die Bedienelemente bleiben immer hell auf dunklem Hintergrund. Variablen: `--uid-video-accent` (gespielter Teil, ausgewählte Einträge), `--uid-video-radius`, `--uid-video-bg`, `--uid-video-caption-size`.
