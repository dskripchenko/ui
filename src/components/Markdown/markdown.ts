/**
 * A small, dependency-free markdown → HTML renderer.
 *
 * It covers the everyday subset — headings, paragraphs, emphasis, inline code,
 * fenced code, links, images, block quotes and callouts, lists, tables and
 * rules — which is what a description, a note or a documentation page in an
 * admin usually holds. A host that needs the full CommonMark grammar registers
 * its own `markdown` field, entry or layout.
 *
 * Safety: the source is HTML-escaped BEFORE any markup is produced, so raw
 * HTML in the markdown is shown as text, never executed; link, image and
 * internal-link URLs are limited to http(s), mailto, relative and anchor
 * targets, judged on the final value (backslash escapes restored, character
 * references decoded).
 *
 * TeX math (`$…$`, `$$…$$`) is drawn as MathML by @dskripchenko/math, which
 * escapes the TeX in the same way.
 *
 * Ported from laravel-admin core, where it was born; the kit is now its home.
 */
import { renderMath } from '@dskripchenko/math'

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch)
}

function unescapeHtml(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

/** A heading met while rendering, for a table of contents. */
export interface MarkdownHeading {
  level: number
  /** The heading's plain text. */
  text: string
  id: string
}

/** A heading's anchor as a link names it: the same rule as the headings' ids, without numbering. */
function headingSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  )
}

/** ` ^id` at the very end of a line: a block id (see `MarkdownOptions.blockIds`). */
const BLOCK_ID = /[ \t]+\^((?=[A-Za-z0-9-]*[A-Za-z])[A-Za-z0-9][A-Za-z0-9-]{0,31})[ \t]*$/

/** Splits a block id off the end of a line: the line without it, and the id in lower case. */
function takeBlockId(line: string, opts: MarkdownOptions): [string, string | null] {
  if (opts.blockIds === false) return [line, null]
  const m = BLOCK_ID.exec(line)
  return m ? [line.slice(0, m.index), (m[1] ?? '').toLowerCase()] : [line, null]
}

/** The attributes a block with an id gets. */
function blockIdAttrs(id: string | null): string {
  return id === null ? '' : ` id="^${id}" data-block-id="${id}"`
}

/** Turns heading text into a unique anchor id; shared across the chunks of one document. */
export type Slugger = (text: string) => string

export function createSlugger(): Slugger {
  const seen = new Map<string, number>()
  return (text: string): string => {
    const base =
      text
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'section'
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }
}

export interface MarkdownOptions {
  /** Gives the headings anchor ids. */
  slugger?: Slugger | null
  /** Called for every heading, in document order. */
  onHeading?: (heading: MarkdownHeading) => void
  /**
   * The base relative links resolve against, the way a browser resolves them
   * against `<base href>`. Absolute, anchor and scheme links are left alone.
   */
  linkBase?: string | null
  /** Drops a trailing `.md` from relative links resolved through linkBase. */
  stripMdExtension?: boolean
  /**
   * Reads `[[note]]` internal links (on by default): links with `data-wikilink` for the host to resolve;
   * `![[note]]` is an embed — `<span class="uid-markdown__embed" data-embed>` around the link, for the host to fill.
   */
  wikiLinks?: boolean
  /**
   * Reads TeX math (on by default): `$…$` and `\(…\)` in a line, `$$…$$` and
   * `\[…\]` on lines of their own — drawn as MathML by @dskripchenko/math.
   */
  math?: boolean
  /** Reads `#tags` (on by default): `<span class="uid-markdown__tag" data-tag="…">` for the host to act on. */
  tags?: boolean
  /**
   * Reads block ids (on by default), as Obsidian writes them: ` ^id` at the end of a paragraph's,
   * a heading's or a list item's last line. The marker is hidden; the block gets the anchor `^id`
   * (`id`, or an anchor element in a heading that has a slug id) and `data-block-id`, and
   * `[[note#^id]]` links to it. An id has letters, digits and dashes, and at least one letter,
   * so that ` ^2` stays text.
   */
  blockIds?: boolean
  /**
   * Reads a YAML front matter at the start of the source (`---` lines around
   * `key: value`) as the document's properties, drawn as a table. Off by
   * default: a caller rendering a piece of a document says when it is the start.
   */
  frontMatter?: boolean
  /** The base relative image paths resolve against. */
  imageBase?: string | null
  /**
   * Opens relative and anchor links in place. By default every link opens in
   * a new tab, which suits a note in a form; a documentation page wants its
   * own links to navigate.
   */
  internalLinksInPlace?: boolean
  /** Read-out names of task checkboxes; English when not given. */
  taskLabels?: { done: string; open: string }
  /** Titles of `[!NOTE]`-style callouts; English when not given. */
  calloutTitles?: Partial<Record<UidMarkdownCalloutKind, string>>
}

export type UidMarkdownCalloutKind = 'note' | 'tip' | 'important' | 'warning' | 'caution'

const DEFAULT_CALLOUT_TITLES: Record<UidMarkdownCalloutKind, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}

/** Named character references that matter for reading a scheme. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  colon: ':',
  tab: '\t',
  newline: '\n',
  nbsp: ' ',
}

/** Decodes numeric and the named character references above, repeatedly, so no layer of encoding hides a scheme. */
function decodeEntities(text: string): string {
  let prev = ''
  let out = text
  for (let round = 0; round < 8 && prev !== out; round++) {
    prev = out
    out = out.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));?/gi, (m, dec?: string, hex?: string, name?: string) => {
      if (name !== undefined) return NAMED_ENTITIES[name.toLowerCase()] ?? m
      const code = dec !== undefined ? Number.parseInt(dec, 10) : Number.parseInt(hex ?? '', 16)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
    })
  }
  return out
}

/**
 * A URL is allowed when it has no scheme, or one of the harmless ones.
 *
 * The URL is the escaped text as it will stand in the attribute, with the
 * inline placeholders (backslash escapes and the like) already put back: the
 * check sees the final value. Markup or a placeholder left in it means it is
 * not a plain URL, and it is refused. The scheme is judged as a browser would
 * read it, and stricter: character references decoded, whitespace and control
 * characters dropped, letter case ignored.
 */
function safeUrl(url: string): string | null {
  const trimmed = url.trim()
  if (/[<>"]/.test(trimmed)) return null
  const probe = decodeEntities(trimmed)
    .replace(/[\u0000- \u007f- \s]+/g, '')
    .toLowerCase()
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(probe)
  if (scheme && !['http', 'https', 'mailto'].includes(scheme[1] ?? '')) return null
  return trimmed
}

function isRelative(url: string): boolean {
  return !/^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(url)
}

/**
 * Resolves an escaped relative URL against a base. The result is escaped
 * again; an absolute base keeps its origin, a path base yields a path.
 */
export function resolveAgainst(escapedUrl: string, base: string, stripMd = false): string {
  let url = unescapeHtml(escapedUrl)
  if (stripMd) {
    url = url.replace(/\.md(?=$|[?#])/i, '')
  }
  try {
    const absoluteBase = /^[a-z][a-z0-9+.-]*:\/\//i.test(base)
    const resolved = new URL(url, absoluteBase ? base : `http://base.invalid${base.startsWith('/') ? '' : '/'}${base}`)
    const out = absoluteBase ? resolved.href : resolved.pathname + resolved.search + resolved.hash
    return escapeHtml(out)
  } catch {
    return escapedUrl
  }
}

/** Inline markup over an already escaped line. */
function renderInline(escaped: string, opts: MarkdownOptions = {}): string {
  const slots: string[] = []
  const stash = (html: string): string => `${slots.push(html) - 1}`

  // Code spans: a run of backticks up to the same run; one space on both sides is padding.
  let out = escaped.replace(/(?<![`\\])(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g, (_m, _ticks: string, code: string) => {
    const body = /^ [\s\S]* $/.test(code) && code.trim() !== '' ? code.slice(1, -1) : code
    return stash(`<code>${body.replace(/\n/g, ' ')}</code>`)
  })
  // Math, before the escapes: TeX is full of backslashes. `$$…$$` in a line is displayed;
  // `$…$` as Pandoc reads it — no space inside the dollars, no digit after the closing one,
  // so prices ($5 and $10) stay text.
  if (opts.math !== false) {
    const tex = (s: string): string => unescapeHtml(s)
    out = out.replace(/(?<![\\$])\$\$(?=\S)([\s\S]+?)(?<=\S)\$\$/g, (_m, t: string) => stash(renderMath(tex(t), { display: true })))
    out = out.replace(/\\\(([\s\S]+?)\\\)/g, (_m, t: string) => stash(renderMath(tex(t))))
    out = out.replace(/(?<![\\$\w])\$(?![\s$])((?:\\\$|[^$])+?)(?<![\s\\])\$(?![\d$])/g, (_m, t: string) => stash(renderMath(tex(t))))
  }
  // Hard breaks: a backslash or two spaces at the end of a line.
  out = out.replace(/(?:\\| {2,})\n/g, () => stash('<br>'))
  // Backslash escapes of ASCII punctuation (an HTML-escaped character counts as one).
  out = out.replace(/\\(&(?:lt|gt|amp|quot|#39);|[!-/:-@[-`{-~])/g, (_m, ch: string) => stash(ch))

  // Puts the stashed pieces back into a part of the line; slots inside slots resolve too.
  const restore = (text: string): string => {
    let prev = ''
    let res = text
    while (prev !== res) {
      prev = res
      res = res.replace(/(\d+)/g, (_m, i: string) => slots[Number(i)] ?? '')
    }
    return res
  }
  // A URL is judged as it will stand in the attribute: escapes restored first, so that
  // `javascript\:` or an escaped letter cannot hide a scheme from safeUrl.
  const checkUrl = (raw: string): string | null => safeUrl(restore(raw))
  // Text for an attribute: restored, without markup a stashed piece (code, math) would bring.
  const attr = (text: string): string => restore(text).replace(/<[^>]*>/g, '').replace(/"/g, '&quot;')
  const title = (t: string | undefined): string => (t ? ` title="${attr(t)}"` : '')
  // Internal links, as note-taking apps write them: [[note]], [[note#heading]], [[note|text]];
  // ![[picture.png]] is the picture, ![[picture.png|300]] (or |300x200) at that size. The host
  // decides where a note or a picture is (`data-wikilink`, `data-embed`); the address is a guess:
  // the file beside the document.
  if (opts.wikiLinks !== false) {
    out = out.replace(/(!?)\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g, (m, bang: string, target: string, alias?: string) => {
      const [name = '', heading] = target.trim().split('#')
      const picture = /\.(?:png|jpe?g|gif|svg|webp|avif|bmp|ico|apng)$/i.test(name)
      // An embed's text that is a size (`300`, `300x200`) sizes it, as in Obsidian.
      const size = bang && alias !== undefined ? /^\s*(\d+)\s*(?:x\s*(\d+))?\s*$/.exec(alias) : null
      const sized = size ? ` data-size="${size[1]}${size[2] ? `x${size[2]}` : ''}"` : ''
      let file = name.trim() === '' ? '' : /\.\w+$/.test(name.trim()) ? name.trim() : `${name.trim()}.md`
      file = file.replace(/ /g, '%20')
      if (bang && picture) {
        let src = checkUrl(file)
        if (src === null) return m
        if (opts.imageBase && isRelative(src)) src = resolveAgainst(src, opts.imageBase)
        const dims = size ? ` width="${size[1]}"${size[2] ? ` height="${size[2]}"` : ''}` : ''
        return stash(`<img src="${src}" alt="${attr(size ? name.trim() : (alias ?? name))}"${dims} loading="lazy" class="uid-markdown__embed-image" data-embed="${attr(name.trim())}"${sized}>`)
      }
      // `#^id` names a block (see blockIds); anything else after `#` is a heading.
      const fragment = heading?.trim() ?? ''
      const blockRef = opts.blockIds !== false && /^\^[A-Za-z0-9-]+$/.test(fragment)
      const anchor = !heading ? '' : blockRef ? `#%5E${fragment.slice(1).toLowerCase()}` : `#${headingSlug(unescapeHtml(heading))}`
      // The guessed address goes through the same check as any link: [[javascript:…]] is no link, it stays text.
      let href = checkUrl(file === '' ? anchor : `${file}${anchor}`)
      if (href === null) return m
      if (opts.linkBase && file !== '' && isRelative(href)) href = resolveAgainst(href, opts.linkBase, opts.stripMdExtension ?? false)
      const text = alias ?? (heading ? `${name.trim() || ''}${name.trim() ? ' › ' : ''}${heading.trim()}` : name.trim())
      const link = `<a href="${href}" class="uid-markdown__wikilink" data-wikilink="${attr(target.trim())}">${text}</a>`
      // ![[note]], ![[note#heading]]: another note's text in this one. The host fills it in (data-embed);
      // without a host it stays the link.
      if (bang) return stash(`<span class="uid-markdown__embed" data-embed="${attr(target.trim())}"${sized}>${link}</span>`)
      return stash(link)
    })
  }
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^)]*?)&quot;)?\)/g, (m, alt: string, url: string, t?: string) => {
    let src = checkUrl(url)
    if (src === null) return m
    if (opts.imageBase && isRelative(src)) src = resolveAgainst(src, opts.imageBase)
    return stash(`<img src="${src}" alt="${attr(alt)}"${title(t)} loading="lazy">`)
  })
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^)]*?)&quot;)?\)/g, (m, text: string, url: string, t?: string) => {
    let href = checkUrl(url)
    if (href === null) return m
    const relative = isRelative(href)
    if (opts.linkBase && relative) {
      href = resolveAgainst(href, opts.linkBase, opts.stripMdExtension ?? false)
    }
    const external = /^(https?:)?\/\//i.test(href) || /^mailto:/i.test(href)
    const inPlace = opts.internalLinksInPlace === true && !external
    return stash(
      inPlace
        ? `<a href="${href}"${title(t)}>${text}</a>`
        : `<a href="${href}"${title(t)} target="_blank" rel="noopener noreferrer">${text}</a>`,
    )
  })

  // Tags, as note-taking apps write them: #word, #nested/tag — a letter somewhere in it (#123 is not one),
  // at the start of a word (C# and links' #anchors are not).
  if (opts.tags !== false) {
    out = out.replace(TAG, (_m, tag: string) => stash(tagHtml(tag)))
  }

  out = out
    .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\w)__(?=\S)(.+?)(?<=\S)__(?!\w)/g, '<strong>$1</strong>')
    .replace(/\*(?=\S)(.+?)(?<=\S)\*/g, '<em>$1</em>')
    // An underscore inside a word (snake_case) is not emphasis.
    .replace(/(?<!\w)_(?=\S)(.+?)(?<=\S)_(?!\w)/g, '<em>$1</em>')
    .replace(/~~(?=\S)(.+?)(?<=\S)~~/g, '<del>$1</del>')
    // Highlighted text, as note-taking apps write it: ==marked==.
    .replace(/(?<!=)==(?=[^\s=])(.+?)(?<=[^\s=])==(?!=)/g, '<mark>$1</mark>')

  // Slots inside slots (an escape inside a link's text) resolve too.
  return restore(out)
}

/** A tag in text: `#` at the start of a word, then letters, digits, `_`, `-` and `/`, at least one of them a letter. */
const TAG = /(?<![^\s(\[{,;])#((?=[\p{L}\p{N}_/-]*[\p{L}_])[\p{L}\p{N}_][\p{L}\p{N}_/-]*)/gu

function tagHtml(tag: string): string {
  const name = tag.replace(/[/-]+$/, '')
  const rest = tag.slice(name.length)
  return `<span class="uid-markdown__tag" data-tag="${name}">#${name}</span>${rest}`
}

/** A value of a document's property: text, or a list. */
export type FrontMatterValue = string | string[]

/** A document's YAML front matter: its properties, and how long it is in the source. */
export interface FrontMatter {
  data: Record<string, FrontMatterValue>
  /** The characters it takes at the start of the source, its `---` lines included. */
  length: number
}

/**
 * The front matter at the start of a source, read as simple YAML: `key: value`,
 * lists as `[a, b]` or `- a` lines, quoted strings; anything deeper is kept as
 * its text. Null when the source does not start with one.
 */
export function readFrontMatter(source: string): FrontMatter | null {
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(source)
  if (!m) return null
  const data: Record<string, FrontMatterValue> = {}
  const unquote = (v: string): string => {
    const t = v.trim()
    return /^(["']).*\1$/.test(t) ? t.slice(1, -1) : t
  }
  let last: string | null = null
  for (const line of (m[1] ?? '').split(/\r?\n/)) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue
    const item = /^\s+-\s+(.*)$|^-\s+(.*)$/.exec(line)
    if (item && last !== null) {
      const prev = data[last]
      const value = unquote(item[1] ?? item[2] ?? '')
      data[last] = Array.isArray(prev) ? [...prev, value] : prev ? [prev, value] : [value]
      continue
    }
    const pair = /^([^\s:#][^:]*?):(?:\s+(.*))?$/.exec(line)
    if (pair && !/^\s/.test(line)) {
      last = pair[1]!.trim()
      const value = (pair[2] ?? '').trim()
      data[last] = /^\[.*\]$/.test(value)
        ? value.slice(1, -1).split(',').map(unquote).filter((v) => v !== '')
        : unquote(value)
      continue
    }
    // Deeper YAML: kept as the text of the property it belongs to.
    if (last !== null && typeof data[last] === 'string') data[last] = `${data[last]}${data[last] ? '\n' : ''}${line.trim()}`
  }
  return { data, length: m[0].length }
}

/** The properties as a table; the tags among them as tags. */
function propertiesHtml(data: Record<string, FrontMatterValue>, opts: MarkdownOptions): string {
  const rows = Object.entries(data).map(([key, value]) => {
    const tagsKey = /^tags?$/i.test(key) && opts.tags !== false
    const items = (Array.isArray(value) ? value : tagsKey ? value.split(/[,\s]+/) : [value]).filter((v) => v !== '')
    const cell = items
      .map((v) => (tagsKey ? tagHtml(escapeHtml(v.replace(/^#/, ''))) : `<span class="uid-markdown__prop-value">${escapeHtml(v)}</span>`))
      .join(tagsKey ? ' ' : '')
    return `<tr><th scope="row">${escapeHtml(key)}</th><td>${cell}</td></tr>`
  })
  return `<table class="uid-markdown__props"><tbody>${rows.join('')}</tbody></table>`
}

/** The plain text of rendered inline HTML: for anchor ids and the table of contents. */
function plainText(html: string): string {
  return unescapeHtml(html.replace(/<[^>]+>/g, ''))
}

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/
const TABLE_SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/

function splitRow(line: string): string[] {
  let row = line.trim()
  if (row.startsWith('|')) row = row.slice(1)
  if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1)
  return row.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'))
}

/** The callout kinds, keyed by the marker that opens them: `[!NOTE]` or `**Note**`. */
const CALLOUTS: Record<string, string> = {
  note: 'note',
  info: 'note',
  tip: 'tip',
  hint: 'tip',
  important: 'important',
  warning: 'warning',
  caution: 'caution',
  danger: 'caution',
  // Russian markers: they are what a document's author writes, not captions,
  // so they are recognised whatever the interface language. Escaped to keep
  // the sources free of Cyrillic (see __guards__/noHardcodedCyrillic).
  '\u043f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435': 'note',
  '\u0437\u0430\u043c\u0435\u0442\u043a\u0430': 'note',
  '\u0441\u043e\u0432\u0435\u0442': 'tip',
  '\u0432\u0430\u0436\u043d\u043e': 'important',
  '\u0432\u043d\u0438\u043c\u0430\u043d\u0438\u0435': 'warning',
  '\u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u0435': 'warning',
  '\u043e\u0441\u0442\u043e\u0440\u043e\u0436\u043d\u043e': 'caution',
}

function calloutTitle(kind: string, opts: MarkdownOptions): string {
  const k = kind as UidMarkdownCalloutKind
  return opts.calloutTitles?.[k] ?? DEFAULT_CALLOUT_TITLES[k] ?? DEFAULT_CALLOUT_TITLES.note
}

export function renderMarkdown(source: string | null | undefined, opts: MarkdownOptions = {}): string {
  if (!source) return ''
  const html: string[] = []
  const front = opts.frontMatter ? readFrontMatter(source) : null
  if (front) {
    if (Object.keys(front.data).length > 0) html.push(propertiesHtml(front.data, opts))
    source = source.slice(front.length)
  }
  const lines = escapeHtml(source.replace(/\r\n?/g, '\n')).split('\n')
  let paragraph: string[] = []
  const inline = (text: string): string => renderInline(text, opts)

  const flushParagraph = (): void => {
    if (paragraph.length > 0) {
      const [last, id] = takeBlockId(paragraph[paragraph.length - 1] ?? '', opts)
      paragraph[paragraph.length - 1] = last
      html.push(`<p${blockIdAttrs(id)}>${inline(paragraph.join('\n'))}</p>`)
      paragraph = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''

    const fence = /^\s*(`{3,}|~{3,})\s*([\w+#.-]*)[^`]*$/.exec(line)
    if (fence) {
      flushParagraph()
      const body: string[] = []
      const marker = fence[1] ?? '```'
      const indent = line.length - line.trimStart().length
      // The closing fence: the same character, at least as long, nothing after it, and indented
      // at most three spaces more than the opening one — a deeper ``` is the content's own.
      const closes = (l: string): boolean => {
        const t = l.trim()
        const at = l.length - l.trimStart().length
        return at <= indent + 3 && t.length >= marker.length && t[0] === marker[0] && /^(`+|~+)$/.test(t)
      }
      i++
      while (i < lines.length && !closes(lines[i] ?? '')) {
        body.push(lines[i] ?? '')
        i++
      }
      const cls = fence[2] ? ` class="language-${fence[2]}"` : ''
      html.push(`<pre><code${cls}>${body.join('\n')}</code></pre>`)
      continue
    }

    if (line.trim() === '') {
      flushParagraph()
      continue
    }

    // A displayed formula: `$$` or `\[` opening a line, up to `$$` or `\]` closing one (the same line too).
    const mathOpen = opts.math !== false ? /^\s*(\$\$|\\\[)/.exec(line) : null
    if (mathOpen) {
      const close = mathOpen[1] === '$$' ? '$$' : '\\]'
      const first = line.trim().slice(2)
      const body: string[] = []
      let closed = first.trimEnd().endsWith(close)
      if (closed) body.push(first.trimEnd().slice(0, -close.length))
      else {
        body.push(first)
        let j = i + 1
        while (j < lines.length && !(lines[j] ?? '').trimEnd().endsWith(close)) body.push(lines[j++] ?? '')
        if (j < lines.length) {
          body.push((lines[j] ?? '').trimEnd().slice(0, -close.length))
          closed = true
          i = j
        }
      }
      // Without its closing line it is text, as written.
      if (closed) {
        flushParagraph()
        html.push(`<div class="uid-markdown__math">${renderMath(unescapeHtml(body.join('\n').trim()), { display: true })}</div>`)
        continue
      }
    }

    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)
    if (heading) {
      flushParagraph()
      const level = heading[1]?.length ?? 1
      const [title, blockId] = takeBlockId(heading[2] ?? '', opts)
      const content = inline(title)
      if (opts.slugger) {
        const text = plainText(content)
        const id = opts.slugger(text)
        opts.onHeading?.({ level, text, id })
        // The heading keeps its slug id; the block id gets an anchor of its own.
        const anchor = blockId === null ? '' : `<a class="uid-markdown__block-anchor" id="^${blockId}" aria-hidden="true"></a>`
        const data = blockId === null ? '' : ` data-block-id="${blockId}"`
        html.push(`<h${level} id="${escapeHtml(id)}"${data}>${anchor}${content}</h${level}>`)
      } else {
        html.push(`<h${level}${blockIdAttrs(blockId)}>${content}</h${level}>`)
      }
      continue
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushParagraph()
      html.push('<hr>')
      continue
    }

    // A table: a row of cells, then the separator row of dashes.
    if (line.includes('|') && TABLE_SEPARATOR.test(lines[i + 1] ?? '') && (lines[i + 1] ?? '').includes('|')) {
      flushParagraph()
      const header = splitRow(line)
      const aligns = splitRow(lines[i + 1] ?? '').map((cell) => {
        const left = cell.startsWith(':')
        const right = cell.endsWith(':')
        return left && right ? 'center' : right ? 'right' : left ? 'left' : ''
      })
      const cell = (tag: 'th' | 'td', text: string, idx: number): string => {
        const align = aligns[idx] ? ` style="text-align:${aligns[idx]}"` : ''
        return `<${tag}${align}>${inline(text)}</${tag}>`
      }
      const rows: string[] = []
      i += 2
      while (i < lines.length && (lines[i] ?? '').includes('|') && (lines[i] ?? '').trim() !== '') {
        const cells = splitRow(lines[i] ?? '')
        rows.push(`<tr>${header.map((_h, idx) => cell('td', cells[idx] ?? '', idx)).join('')}</tr>`)
        i++
      }
      i--
      html.push(
        '<div class="uid-markdown__table"><table>'
          + `<thead><tr>${header.map((h, idx) => cell('th', h, idx)).join('')}</tr></thead>`
          + `<tbody>${rows.join('')}</tbody></table></div>`,
      )
      continue
    }

    if (/^\s*&gt;/.test(line)) {
      flushParagraph()
      const quoted: string[] = []
      while (i < lines.length && /^\s*&gt;/.test(lines[i] ?? '')) {
        quoted.push((lines[i] ?? '').replace(/^\s*&gt;\s?/, ''))
        i++
      }
      i--
      html.push(renderQuote(quoted, opts))
      continue
    }

    if (LIST_ITEM.test(line)) {
      flushParagraph()
      const list = renderList(lines, i, opts)
      html.push(list.html)
      i = list.next - 1
      continue
    }

    paragraph.push(line)
  }
  flushParagraph()

  return html.join('\n')
}

/** The width of a line's leading whitespace, a tab counting as four. */
function indentOf(line: string): number {
  const lead = /^[ \t]*/.exec(line)?.[0] ?? ''
  return lead.replace(/\t/g, '    ').length
}

/** Whether a line starts a block of its own rather than continuing a list item's text. */
function opensBlock(line: string): boolean {
  return /^\s*(#{1,6}\s|&gt;|```|~~~|\|)/.test(line) || /^\s*([-*_])(\s*\1){2,}\s*$/.test(line)
}

/**
 * A list starting at lines[start], nested lists included: a line indented
 * past an item's marker belongs to that item — a sub-list, a continuation
 * paragraph, a code block — and is rendered as the item's own markdown. A
 * blank line inside the list does not end it while the list goes on below.
 * The lines are escaped already.
 */
function renderList(lines: string[], start: number, opts: MarkdownOptions): { html: string; next: number } {
  const first = LIST_ITEM.exec(lines[start] ?? '')
  const indent = indentOf(first?.[1] ?? '')
  const ordered = /\d/.test(first?.[2] ?? '')
  const items: string[] = []
  let tasks = 0
  let i = start

  while (i < lines.length) {
    const m = LIST_ITEM.exec(lines[i] ?? '')
    if (!m || indentOf(m[1] ?? '') > indent + 1 || indentOf(m[1] ?? '') < indent || /\d/.test(m[2] ?? '') !== ordered) break

    const text: string[] = [m[3] ?? '']
    const body: string[] = []
    i++
    while (i < lines.length) {
      const next = lines[i] ?? ''
      if (next.trim() === '') {
        // A blank line: the item goes on only if something indented follows.
        let j = i + 1
        while (j < lines.length && (lines[j] ?? '').trim() === '') j++
        if (j < lines.length && indentOf(lines[j] ?? '') > indent + 1) {
          for (; i < j; i++) body.push('')
          continue
        }
        break
      }
      // The item's text going on: a line of text right under it — indented or not (lazy) —
      // before any blank line or nested block; it is the same paragraph, as in CommonMark.
      if (body.length === 0 && !LIST_ITEM.test(next) && !opensBlock(next)) {
        text.push(next.trim())
        i++
        continue
      }
      if (indentOf(next) > indent + 1) {
        body.push(next)
        i++
        continue
      }
      break
    }

    // A GitHub task item: `[ ]` or `[x]` right after the marker.
    const task = /^\[([ xX])\]\s+/.exec(text[0] ?? '')
    if (task) text[0] = (text[0] ?? '').slice(task[0].length)
    const [lastLine, blockId] = takeBlockId(text[text.length - 1] ?? '', opts)
    text[text.length - 1] = lastLine
    let inner = renderInline(text.join('\n'), opts)
    if (body.some((l) => l.trim() !== '')) {
      const cut = Math.min(...body.filter((l) => l.trim() !== '').map(indentOf))
      const dedented = body.map((l) => l.replace(/\t/g, '    ').slice(cut))
      inner += renderEscapedBlocks(dedented, opts)
    }
    items.push(
      task
        ? `<li class="uid-markdown__task"${blockIdAttrs(blockId)}><input type="checkbox" disabled${task[1] === ' ' ? '' : ' checked'} aria-label="${escapeHtml(task[1] === ' ' ? (opts.taskLabels?.open ?? 'Not done') : (opts.taskLabels?.done ?? 'Done'))}"> ${inner}</li>`
        : `<li${blockIdAttrs(blockId)}>${inner}</li>`,
    )
    if (task) tasks++

    // Blank lines between the items of one list keep it going.
    let j = i
    while (j < lines.length && (lines[j] ?? '').trim() === '') j++
    const after = LIST_ITEM.exec(lines[j] ?? '')
    if (j > i && after && indentOf(after[1] ?? '') <= indent + 1 && indentOf(after[1] ?? '') >= indent && /\d/.test(after[2] ?? '') === ordered) {
      i = j
    }
  }

  const tag = ordered ? 'ol' : 'ul'
  const startAt = ordered ? Number.parseInt(first?.[2] ?? '1', 10) : 1
  const startAttr = ordered && startAt !== 1 && Number.isFinite(startAt) ? ` start="${startAt}"` : ''
  // A list of tasks only goes without bullets: the checkboxes are its markers.
  const classAttr = tasks > 0 && tasks === items.length ? ' class="uid-markdown__tasks"' : ''
  return { html: `<${tag}${startAttr}${classAttr}>${items.join('')}</${tag}>`, next: i }
}

/**
 * A block quote, or a callout when its first line is a marker: GitHub's
 * `[!NOTE]` (the marker line is replaced with a title) or a bold `**Note**`
 * (kept as written).
 */
function renderQuote(quoted: string[], opts: MarkdownOptions): string {
  const first = (quoted[0] ?? '').trim()
  const github = /^\[!(\w+)\]\s*$/.exec(first)
  if (github) {
    const kind = CALLOUTS[(github[1] ?? '').toLowerCase()]
    if (kind) {
      const title = `<p class="uid-markdown__callout-title">${escapeHtml(calloutTitle(kind, opts))}</p>`
      return `<blockquote class="uid-markdown__callout uid-markdown__callout--${kind}">${title}${renderEscapedBlocks(quoted.slice(1), opts)}</blockquote>`
    }
  }
  const bold = /^\*\*([^*]+?):?\*\*:?/.exec(first)
  if (bold) {
    const kind = CALLOUTS[(bold[1] ?? '').trim().toLowerCase()]
    if (kind) {
      return `<blockquote class="uid-markdown__callout uid-markdown__callout--${kind}">${renderEscapedBlocks(quoted, opts)}</blockquote>`
    }
  }
  return `<blockquote>${renderEscapedBlocks(quoted, opts)}</blockquote>`
}

/** Renders lines that were escaped already (the body of a block quote). */
function renderEscapedBlocks(lines: string[], opts: MarkdownOptions): string {
  // Unescape and run the full renderer: it escapes again exactly once.
  return renderMarkdown(unescapeHtml(lines.join('\n')), opts)
}

/** A piece of a markdown document: text to render, or a top-level fenced code block. */
export type MarkdownSegment =
  | { kind: 'text'; source: string }
  | { kind: 'code'; code: string; language: string }

/**
 * Splits a document at its top-level fenced code blocks, so that a caller can
 * draw the code with a real highlighter and the rest with renderMarkdown.
 * Fences inside block quotes stay in the text.
 */
export function splitMarkdown(source: string | null | undefined): MarkdownSegment[] {
  if (!source) return []
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const segments: MarkdownSegment[] = []
  let text: string[] = []

  const flushText = (): void => {
    if (text.some((l) => l.trim() !== '')) segments.push({ kind: 'text', source: text.join('\n') })
    text = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const fence = /^ {0,3}(`{3,}|~{3,})\s*([\w+#.-]*)[^`]*$/.exec(line)
    if (!fence) {
      text.push(line)
      continue
    }
    flushText()
    const marker = fence[1] ?? '```'
    const indent = line.length - line.trimStart().length
    const closes = (l: string): boolean => {
      const t = l.trim()
      return l.length - l.trimStart().length <= indent + 3 && t.length >= marker.length && t[0] === marker[0] && /^(`+|~+)$/.test(t)
    }
    const body: string[] = []
    i++
    while (i < lines.length && !closes(lines[i] ?? '')) {
      body.push(lines[i] ?? '')
      i++
    }
    segments.push({ kind: 'code', code: body.join('\n'), language: (fence[2] ?? '').toLowerCase() })
  }
  flushText()

  return segments
}
