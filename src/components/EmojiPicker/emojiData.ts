/**
 * Unicode emoji (15.1) with names and keywords from CLDR, by group, for one
 * language; loaded on first use as a chunk of its own.
 * Built by scripts/emoji/build.mjs from Unicode's files (Unicode License v3,
 * data/LICENSE-UNICODE.txt).
 */
export type EmojiGroupKey = 'smileys' | 'people' | 'nature' | 'food' | 'travel' | 'activities' | 'objects' | 'symbols' | 'flags'

export interface EmojiEntry {
  emoji: string
  name: string
  keywords: string[]
  /** Takes a skin tone. */
  skin: boolean
}

export interface EmojiGroup {
  key: EmojiGroupKey
  emojis: EmojiEntry[]
}

/** The JSON as built: each emoji is [emoji, name, keywords joined by |, 1 when it takes a skin tone?]. */
type Raw = { groups: { key: string; emojis: (string | number)[][] }[] }

const KEYS: readonly EmojiGroupKey[] = ['smileys', 'people', 'nature', 'food', 'travel', 'activities', 'objects', 'symbols', 'flags']

function isKey(key: string): key is EmojiGroupKey {
  return (KEYS as readonly string[]).includes(key)
}

const cache = new Map<string, Promise<EmojiGroup[]>>()

/** The emoji with names in this language (ru or en; anything else — en). */
export function loadEmoji(lang: string): Promise<EmojiGroup[]> {
  const key = lang.toLowerCase().startsWith('ru') ? 'ru' : 'en'
  let found = cache.get(key)
  if (found === undefined) {
    const raw: Promise<{ default: Raw }> = key === 'ru' ? import('./data/ru.json') : import('./data/en.json')
    found = raw.then(({ default: data }) => data.groups.flatMap((g) => (isKey(g.key)
      ? [{
          key: g.key,
          emojis: g.emojis.map((e) => {
            const keywords = String(e[2] ?? '')
            return { emoji: String(e[0]), name: String(e[1]), keywords: keywords === '' ? [] : keywords.split('|'), skin: e[3] === 1 }
          }),
        }]
      : [])))
    cache.set(key, found)
  }
  return found
}

const TONES = ['', '\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}']

/** The emoji in a skin tone (0 — none, 1…5 — light to dark), when it takes one. */
export function withTone(entry: Pick<EmojiEntry, 'emoji' | 'skin'>, tone: number): string {
  const mark = TONES[tone] ?? ''
  if (!entry.skin || mark === '') return entry.emoji
  const [first, ...rest] = [...entry.emoji]
  const tail = rest[0] === '️' ? rest.slice(1) : rest
  return first + mark + tail.join('')
}

/** Emoji whose name or keywords start with the words of the query; names first. */
export function searchEmoji(groups: EmojiGroup[], query: string, limit = 200): EmojiEntry[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const scored: { entry: EmojiEntry; score: number; order: number }[] = []
  let order = 0
  for (const group of groups) {
    for (const entry of group.emojis) {
      order++
      const name = entry.name.toLowerCase()
      const nameWords = name.split(/[\s:,]+/)
      const keys = entry.keywords.map((k) => k.toLowerCase())
      let score = 0
      for (const w of words) {
        if (nameWords.some((n) => n.startsWith(w))) score += 3
        else if (keys.some((k) => k.split(/\s+/).some((p) => p.startsWith(w)))) score += 2
        else if (name.includes(w)) score += 1
        else {
          score = 0
          break
        }
      }
      if (score > 0) scored.push({ entry, score, order })
    }
  }
  return scored.sort((a, b) => b.score - a.score || a.order - b.order).slice(0, limit).map((s) => s.entry)
}
