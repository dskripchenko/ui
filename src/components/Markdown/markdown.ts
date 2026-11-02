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
 * HTML in the markdown is shown as text, never executed; link and image URLs
 * are limited to http(s), mailto, relative and anchor targets.
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
  /** Reads `[[note]]` internal links (on by default): links with `data-wikilink` for the host to resolve. */
  wikiLinks?: boolean
  /**
   * Reads TeX math (on by default): `$…$` and `\(…\)` in a line, `$$…$$` and
   * `\[…\]` on lines of their own — drawn as MathML by @dskripchenko/math.
   */
  math?: boolean
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

/** A URL is allowed when it has no scheme, or one of the harmless ones. */
function safeUrl(url: string): string | null {
  const trimmed = url.trim()
  // Entities were escaped already; decode the colon tricks before testing.
  const probe = trimmed.replace(/&#0*58;|&colon;/gi, ':').replace(/\s+/g, '').toLowerCase()
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

  const title = (t: string | undefined): string => (t ? ` title="${t}"` : '')
  // Internal links, as note-taking apps write them: [[note]], [[note#heading]], [[note|text]];
  // ![[picture.png]] is the picture. The host decides where a note is (`data-wikilink`);
  // the address is a guess: the note's file beside the document.
  if (opts.wikiLinks !== false) {
    out = out.replace(/(!?)\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g, (m, bang: string, target: string, alias?: string) => {
      const [name = '', heading] = target.trim().split('#')
      const picture = /\.(?:png|jpe?g|gif|svg|webp|avif|bmp)$/i.test(name)
      let file = name.trim() === '' ? '' : /\.\w+$/.test(name.trim()) ? name.trim() : `${name.trim()}.md`
      file = file.replace(/ /g, '%20')
      if (bang && picture) {
        let src = safeUrl(file)
        if (src === null) return m
        if (opts.imageBase && isRelative(src)) src = resolveAgainst(src, opts.imageBase)
        return stash(`<img src="${src}" alt="${alias ?? name}" loading="lazy">`)
      }
      const anchor = heading ? `#${headingSlug(unescapeHtml(heading))}` : ''
      let href = file === '' ? anchor : `${file}${anchor}`
      if (opts.linkBase && file !== '' && isRelative(href)) href = resolveAgainst(href, opts.linkBase, opts.stripMdExtension ?? false)
      const text = alias ?? (heading ? `${name.trim() || ''}${name.trim() ? ' › ' : ''}${heading.trim()}` : name.trim())
      return stash(`<a href="${href}" class="uid-markdown__wikilink" data-wikilink="${target.trim()}">${text}</a>`)
    })
  }
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^)]*?)&quot;)?\)/g, (m, alt: string, url: string, t?: string) => {
    let src = safeUrl(url)
    if (src === null) return m
    if (opts.imageBase && isRelative(src)) src = resolveAgainst(src, opts.imageBase)
    return stash(`<img src="${src}" alt="${alt}"${title(t)} loading="lazy">`)
  })
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^)]*?)&quot;)?\)/g, (m, text: string, url: string, t?: string) => {
    let href = safeUrl(url)
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
  let prev = ''
  while (prev !== out) {
    prev = out
    out = out.replace(/(\d+)/g, (_m, i: string) => slots[Number(i)] ?? '')
  }
  return out
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
  const lines = escapeHtml(source.replace(/\r\n?/g, '\n')).split('\n')
  const html: string[] = []
  let paragraph: string[] = []
  const inline = (text: string): string => renderInline(text, opts)

  const flushParagraph = (): void => {
    if (paragraph.length > 0) {
      html.push(`<p>${inline(paragraph.join('\n'))}</p>`)
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
      const content = inline(heading[2] ?? '')
      if (opts.slugger) {
        const text = plainText(content)
        const id = opts.slugger(text)
        opts.onHeading?.({ level, text, id })
        html.push(`<h${level} id="${escapeHtml(id)}">${content}</h${level}>`)
      } else {
        html.push(`<h${level}>${content}</h${level}>`)
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
    let inner = renderInline(text.join('\n'), opts)
    if (body.some((l) => l.trim() !== '')) {
      const cut = Math.min(...body.filter((l) => l.trim() !== '').map(indentOf))
      const dedented = body.map((l) => l.replace(/\t/g, '    ').slice(cut))
      inner += renderEscapedBlocks(dedented, opts)
    }
    items.push(
      task
        ? `<li class="uid-markdown__task"><input type="checkbox" disabled${task[1] === ' ' ? '' : ' checked'} aria-label="${escapeHtml(task[1] === ' ' ? (opts.taskLabels?.open ?? 'Not done') : (opts.taskLabels?.done ?? 'Done'))}"> ${inner}</li>`
        : `<li>${inner}</li>`,
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
