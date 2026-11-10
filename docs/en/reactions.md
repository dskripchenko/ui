# Reactions, emoji and presence

Three pieces for chat-like screens: emoji reactions under a message, an emoji picker, and a presence mark on the avatar.

## `UidReactions`

Pills «emoji · count» with «+» at the end. The viewer's own reaction is pressed (`aria-pressed`); its spoken name says the emoji, the count and who (`👍 3: you, Bob and Ilya`), and the tooltip says who.

```vue
<UidReactions
  :reactions="[{ emoji: '👍', count: 3, mine: true, who: 'you, Bob and Ilya' }]"
  :max="20"
  @toggle="(emoji) => react(emoji)"
  @add="(button) => openPicker(button)"
/>
```

Props: `reactions` (`emoji`, `count`, `mine`, `who`), `max` (different emoji; at the limit «+» is off with a tooltip), `readonly`, `touch` (pills of 32 in rows of 44). Events: `toggle(emoji)`, `add(anchor)`. Nothing is drawn without reactions.

## `UidEmojiPicker`

A dialog panel: search (the field keeps the focus; the active cell is its `aria-activedescendant`), category tabs, a grid of 8, «Recent» first, a footer with the emoji's name and the skin tone (a radio group of six). ↑↓←→ move, ↵ picks, Esc closes. Place it in a popover yourself (`usePopover`), or in a bottom sheet on a phone with `touch`.

```vue
<UidEmojiPicker v-model:skin-tone="tone" :recent="recent" @select="react" @close="close" />
```

Props: `recent`, `label`, `touch`, `autofocus`; `v-model:skinTone` (0 — none, 1…5). Events: `select(emoji)` (with the tone), `close`.

The data — Unicode 15.1 emoji with CLDR names and keywords in Russian and English — is loaded on first use as a chunk of its own (about 40 KB gzipped); the locale's `code` picks the language. `loadEmoji`, `searchEmoji` and `withTone` are exported for other uses. The data comes from Unicode's `emoji-test.txt` and CLDR annotations under the Unicode License v3; `scripts/emoji/build.mjs` rebuilds it.

## Presence on `UidAvatar`

`presence`: `online` (a filled dot), `away` (a ring), `dnd` (a dot with a bar), `call` (a ring with a dot), `offline` (a grey ring) — shape and colour together. The spoken name gets the state: «Maria Sokolova, do not disturb». The ring around the mark takes `--uid-avatar-presence-ring` (the page background by default).

```vue
<UidAvatar name="Maria Sokolova" presence="dnd" size="sm" />
```
