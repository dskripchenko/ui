# Audio

`UidAudio` ist ein Audioplayer auf dem nativen Element `<audio>`: eine kompakte Zeile (Wiedergabe, Zeitleiste, Zeit, Lautstärke, Geschwindigkeit), eine Variante `mini` für Tabellen und Listen, eine im Browser berechnete Wellenform und eine Playlist. Den Controller teilt er mit [UidVideo](./video.md).

```vue
<UidAudio src="/media/episode.mp3" title="Episode 12" artist="The Podcast" waveform />

<UidAudio :src="row.recording" variant="mini" />

<UidAudio v-model:index="current" :tracks="playlist" waveform />
```

| Prop | Typ | Standard | |
|---|---|---|---|
| `src`, `type` | `string` | — | Ein Titel; mit `type` wird ein nicht abspielbares Format sofort gemeldet |
| `title`, `artist` | `string` | — | Über der Zeitleiste angezeigt |
| `tracks` | `UidAudioTrack[]` | — | Playlist: `{ src, type?, title?, artist?, peaks?, duration? }` |
| `index` (`v-model:index`) | `number` | `0` | Aktueller Titel der Playlist |
| `variant` | `'default' \| 'mini'` | `'default'` | `mini` — eine Zeile: Wiedergabe, Leiste, Zeit |
| `waveform` | `boolean` | `false` | Im Browser dekodierte Wellenform als Zeitleiste |
| `peaks` | `number[]` | — | Vorberechnete Spitzen `0..1`; zeichnet die Wellenform ohne Dekodierung |
| `waveformMaxBytes` | `number` | 40 MB | Größere Dateien werden nicht dekodiert — stattdessen eine einfache Leiste |
| `waveformMaxDuration` | `number` | 1800 | Längeres Audio (Sekunden) wird nicht dekodiert |
| `autoAdvance` | `boolean` | `true` | Nächster Titel der Playlist, wenn einer endet |
| `loop` | `boolean` | `false` | Den Titel oder die ganze Playlist wiederholen |
| `preload` | `'none' \| 'metadata' \| 'auto'` | `'metadata'` | |
| `crossorigin` | `'' \| 'anonymous' \| 'use-credentials'` | — | |
| `exclusive` | `boolean` | `true` | Der Start dieses Players pausiert die anderen |
| `resumeKey` | `string` | — | Merkt sich die Position (je Titel der Playlist) |
| `rates` | `number[]` | `0.5…2` | Geschwindigkeitsmenü |
| `hotkeys` | `boolean` | `true` | Leertaste/`K`, Pfeiltasten, `J`/`L`, `M`, `0`–`9`; `Shift+N` / `Shift+P` — nächster / vorheriger Titel |
| `showVolume`, `showRate` | `boolean` | `true` | |
| `showPlaylist` | `boolean` | `true` | Titelliste unter dem Player |

Events: `play`, `pause`, `ended`, `error`, `trackchange` (Index), `update:index`. Bereitgestellt: `play()`, `pause()`, `toggle()`, `seek()`, `next()`, `prev()`, `state`, `media`.

## Layout

- **Standard** — eine Zeile: Wiedergabe-Button, Titel und Zeitleiste, Zeit, Lautstärke, Geschwindigkeit. In einem schmalen Container (unter 480 px) wandert die Zeitleiste in eine eigene Zeile in voller Breite, Titel und Interpret stehen untereinander, der Lautstärkeregler bleibt den Hardwaretasten überlassen. Ab 560 px ist der Lautstärkeregler immer sichtbar.
- **Mini** — standardmäßig `240px` breit (`--uid-audio-mini-width`), passt in eine Tabellenzelle: Wiedergabe, Leiste oder kleine Wellenform, Zeit (vor der Wiedergabe die Dauer, währenddessen die Position). Der Start einer Zeile pausiert die anderen.
- **Playlist** — Zurück / Weiter neben dem Wiedergabe-Button und eine nummerierte Liste mit markiertem laufendem Titel. „Zurück“ spult einen Titel, der länger als 3 Sekunden läuft, zuerst an den Anfang. Sperrbildschirm und Hardware-Medientasten funktionieren über die Media Session API.

## Wellenform

Mit `waveform` wird die Datei geladen und mit Web Audio dekodiert (`decodeAudioData` mit niedriger Abtastrate, um Speicher zu sparen), und die Spitzen werden in Portionen berechnet, zwischen denen der Browser zum Zug kommt (`requestIdleCallback`, sonst `setTimeout`). Ergebnisse werden je Adresse für die Lebensdauer der Seite zwischengespeichert; Dateien werden einzeln dekodiert und erst, wenn der Player nahe am Viewport ist, sodass eine Tabelle mit hundert Aufnahmen reaktionsschnell bleibt. Dateien über `waveformMaxBytes` oder länger als `waveformMaxDuration` behalten die einfache Leiste. Das Audio muss für `fetch` lesbar sein — gleicher Origin oder CORS.

Für lange Aufnahmen die Spitzen auf dem Server berechnen und in `peaks` übergeben (beliebige Länge; der Player resampelt auf seine Breite):

```ts
import { computePeaks } from '@dskripchenko/ui'

// etwa in einem Worker oder bei der Verarbeitung eines Uploads
const peaks = await computePeaks([audioBuffer.getChannelData(0)], 512)
```

Helfer: `getWaveform(src, options)`, `computePeaks(channels, count)`, `resamplePeaks(peaks, n)`, `peaksToPath(peaks)`.

## Formate

| Format | Chrome / Edge | Firefox | Safari macOS | Safari iOS |
|---|---|---|---|---|
| MP3 | ✓ | ✓ | ✓ | ✓ |
| AAC / M4A | ✓ | ✓ | ✓ | ✓ |
| Ogg · Opus | ✓ | ✓ | ✓ (neuere Versionen) | ✓ (neuere Versionen) |
| Ogg · Vorbis | ✓ | ✓ | neuere Versionen | neuere Versionen |
| WAV (PCM) | ✓ | ✓ | ✓ | ✓ |
| FLAC | ✓ | ✓ | ✓ | ✓ |
| WebM · Opus | ✓ | ✓ | ✓ | ✓ (neuere Versionen) |

In echten Browsern geprüft (Playwright): MP3, Ogg/Opus, WAV, FLAC und M4A werden in Chromium 156, Chrome 156 und WebKit 27 abgespielt und zeichnen die Wellenform. Bei einem weniger verbreiteten Format besser `type` angeben: Der Player meldet „nicht unterstützt“ sofort statt erst nach einem fehlgeschlagenen Laden.

## Gestaltung

Variablen: `--uid-audio-accent`, `--uid-audio-accent-hover`, `--uid-audio-bg`, `--uid-audio-border`, `--uid-audio-radius`, `--uid-audio-padding`, `--uid-audio-play-size`, `--uid-audio-play-color`, `--uid-audio-wave`, `--uid-audio-wave-height`, `--uid-audio-mini-width`, `--uid-audio-list-max-height`.
