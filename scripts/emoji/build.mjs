// Builds the emoji data of UidEmojiPicker from Unicode's own files:
// emoji-test.txt (the list, groups, order, skin tones) and the CLDR
// annotations (names and keywords per language).
//
//   node scripts/emoji/build.mjs <dir with emoji-test.txt, ann-<lang>.xml, derived-<lang>.xml>
//
// Sources (Unicode License v3, https://www.unicode.org/license.txt):
//   https://unicode.org/Public/emoji/15.1/emoji-test.txt
//   https://github.com/unicode-org/cldr/tree/release-45/common/annotations
//   https://github.com/unicode-org/cldr/tree/release-45/common/annotationsDerived
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const dir = process.argv[2]
if (!dir) {
  console.error('usage: node scripts/emoji/build.mjs <source dir>')
  process.exit(1)
}
const out = resolve(import.meta.dirname, '../../src/components/EmojiPicker/data')
mkdirSync(out, { recursive: true })

const GROUPS = {
  'Smileys & Emotion': 'smileys',
  'People & Body': 'people',
  'Animals & Nature': 'nature',
  'Food & Drink': 'food',
  'Travel & Places': 'travel',
  Activities: 'activities',
  Objects: 'objects',
  Symbols: 'symbols',
  Flags: 'flags',
}
const TONES = ['\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}']
const strip = (s) => s.replaceAll('️', '')

// The list: fully-qualified emoji in Unicode's order, by group; tones apart.
const all = new Set()
const list = []
let group = null
for (const line of readFileSync(resolve(dir, 'emoji-test.txt'), 'utf8').split('\n')) {
  const g = /^# group: (.+)$/.exec(line)
  if (g) {
    group = GROUPS[g[1]] ?? null
    continue
  }
  const m = /^([0-9A-F ]+?)\s*; fully-qualified\s*# (\S+)/.exec(line)
  if (!m) continue
  const emoji = String.fromCodePoint(...m[1].split(' ').map((h) => parseInt(h, 16)))
  all.add(emoji)
  if (group !== null && !TONES.some((t) => emoji.includes(t))) list.push({ emoji, group })
}

/** The emoji with a skin tone: the tone after its first code point. */
export function toned(emoji, tone) {
  const [first, ...rest] = [...emoji]
  const tail = rest[0] === '️' ? rest.slice(1) : rest
  return first + tone + tail.join('')
}

for (const item of list) {
  item.skin = TONES.every((t) => all.has(toned(item.emoji, t)))
}

function annotations(lang) {
  const names = new Map()
  const words = new Map()
  for (const file of [`ann-${lang}.xml`, `derived-${lang}.xml`]) {
    const xml = readFileSync(resolve(dir, file), 'utf8')
    for (const m of xml.matchAll(/<annotation cp="([^"]+)"( type="tts")?>([^<]*)<\/annotation>/g)) {
      const cp = strip(m[1].replaceAll('&amp;', '&'))
      const text = m[3].replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&apos;', "'")
      if (m[2]) names.set(cp, text)
      else words.set(cp, text.split('|').map((w) => w.trim()).filter(Boolean))
    }
  }
  return { names, words }
}

for (const lang of ['en', 'ru']) {
  const { names, words } = annotations(lang)
  const groups = {}
  let missing = 0
  for (const { emoji, group, skin } of list) {
    const key = strip(emoji)
    const name = names.get(key)
    if (name === undefined) {
      missing++
      continue
    }
    const kw = (words.get(key) ?? []).filter((w) => w.toLowerCase() !== name.toLowerCase())
    ;(groups[group] ??= []).push(skin ? [emoji, name, kw.join('|'), 1] : [emoji, name, kw.join('|')])
  }
  const data = { version: '15.1', groups: Object.entries(groups).map(([key, emojis]) => ({ key, emojis })) }
  writeFileSync(resolve(out, `${lang}.json`), JSON.stringify(data))
  const count = Object.values(groups).reduce((n, g) => n + g.length, 0)
  console.log(`${lang}: ${count} emoji, ${missing} without a name (left out)`)
}
