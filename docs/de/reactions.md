# Reaktionen, Emoji und Anwesenheit

Drei Bausteine für Chat-Ansichten: Emoji-Reaktionen unter einer Nachricht, eine Emoji-Auswahl und eine Anwesenheitsmarke am Avatar.

## `UidReactions`

Pillen „Emoji · Anzahl“ mit „+“ am Ende. Die eigene Reaktion ist gedrückt (`aria-pressed`); ihr zugänglicher Name nennt Emoji, Anzahl und wer (`👍 3: du, Bob und Ilya`), der Tooltip nennt wer.

```vue
<UidReactions :reactions="reactions" :max="20" @toggle="react" @add="openPicker" />
```

Props: `reactions` (`emoji`, `count`, `mine`, `who`), `max`, `readonly`, `touch`. Events: `toggle(emoji)`, `add(anchor)`.

## `UidEmojiPicker`

Ein Dialog-Panel: Suche (der Fokus bleibt im Feld, die aktive Zelle ist sein `aria-activedescendant`), Kategorie-Tabs, ein Raster zu 8, „Zuletzt“ zuerst, unten Name und Hautton (Radiogruppe aus sechs). ↑↓←→ bewegen, ↵ wählt, Esc schließt.

```vue
<UidEmojiPicker v-model:skin-tone="tone" :recent="recent" @select="react" @close="close" />
```

Die Daten (Unicode 15.1, Namen und Schlüsselwörter aus CLDR, Russisch und Englisch) werden beim ersten Öffnen als eigener Chunk geladen (etwa 40 KB gzip); Quelle: `emoji-test.txt` und CLDR-Annotationen unter der Unicode License v3, neu gebaut mit `scripts/emoji/build.mjs`.

## Anwesenheit an `UidAvatar`

`presence`: `online` (gefüllter Punkt), `away` (Ring), `dnd` (Punkt mit Strich), `call` (Ring mit Punkt), `offline` (grauer Ring) — Form und Farbe zusammen; der zugängliche Name nennt den Zustand.

`color` setzt die Füllung unter den Initialen statt der Farbe aus dem Namen — um eine Art Konto zu unterscheiden, einen Dienst oder einen Bot (weiße Initialen darauf: 4,5:1 halten). Ein Bindestrich trennt in den Initialen zwei Wörter eines Namens: «Anne-Marie» ist «AM».

```vue
<UidAvatar name="Build bot" shape="square" color="#52525b" size="sm" />
```

`icon` zeigt ein Symbol statt der Initialen, weiß auf der Füllung — für ein Konto, das keine Person ist; der Name bleibt die Beschriftung.

```vue
<script setup>
import { Bot } from 'lucide-vue-next'
</script>

<UidAvatar name="Build bot" shape="square" color="#52525b" :icon="Bot" size="sm" />
```
