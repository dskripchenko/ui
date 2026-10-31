/**
 * The kanban markup:
 *
 *   # Board title
 *   lanes: Payments, Refunds
 *
 *   ## Column {wip: 3}
 *   - Card title #tag !high {lane: Payments, who: Anna, due: 2026-11-15}
 *     Description, indented.
 *
 * Parsing keeps each column's and card's line range, so an edit (moving a
 * card, changing one) rewrites only its own lines and leaves comments, blank
 * lines and the rest of the text as they were.
 */

// ---- properties in braces

/**
 * `{key: value, flag, list: a, b}` — the properties at the end of a kanban
 * card, column or calendar event line. A part without a colon is a flag
 * (`done`) when it reads like a name, otherwise the next item of the
 * previous value (`except: 2026-11-30, 2026-12-07`). Flags map to ''.
 */
export type MarkupProps = Map<string, string>

const NAME = /^[A-Za-z][\w-]*$/

export function parseMarkupProps(inner: string): MarkupProps {
  const props: MarkupProps = new Map()
  let last: string | null = null
  for (const raw of inner.split(',')) {
    const part = raw.trim()
    if (part === '') continue
    const colon = part.indexOf(':')
    const key = colon > 0 ? part.slice(0, colon).trim() : ''
    if (colon > 0 && NAME.test(key)) {
      last = key
      props.set(key, part.slice(colon + 1).trim())
      continue
    }
    if (last !== null && props.get(last) !== '' && !NAME.test(part)) {
      props.set(last, `${props.get(last)}, ${part}`)
      continue
    }
    props.set(part, '')
    last = part
  }
  return props
}

export function serializeMarkupProps(props: MarkupProps): string {
  if (props.size === 0) return ''
  return `{${[...props].map(([k, v]) => (v === '' ? k : `${k}: ${v}`)).join(', ')}}`
}

/** `Title {a: 1, b}` → the text and its props (the braces at the end of a line). */
export function splitMarkupProps(text: string): { text: string; props: MarkupProps } {
  const m = /\{([^{}]*)\}\s*$/.exec(text)
  if (!m) return { text: text.trim(), props: new Map() }
  return { text: text.slice(0, m.index).trim(), props: parseMarkupProps(m[1]) }
}

// ---- the board

export type KanbanPriority = 'high' | 'low'

export interface KanbanCard {
  id: string
  title: string
  tags: string[]
  priority: KanbanPriority | null
  props: MarkupProps
  description: string
  /** Lines of the card: its own line and the description under it. */
  start: number
  end: number
}

export interface KanbanColumn {
  id: string
  title: string
  props: MarkupProps
  wip: number | null
  done: boolean
  cards: KanbanCard[]
  start: number
  end: number
}

export interface KanbanProblem {
  line: number
  message: string
}

export interface KanbanDoc {
  title: string | null
  settings: MarkupProps
  lanes: string[]
  tagTones: Record<string, string>
  columns: KanbanColumn[]
  problems: KanbanProblem[]
}

const COLUMN = /^##\s+(.*)$/
const TITLE = /^#\s+(.*)$/
const CARD = /^[-*]\s+(.*)$/
const SETTING = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/
const INDENT = /^(\t| {2,})/

function list(value: string | undefined): string[] {
  return (value ?? '').split(',').map((s) => s.trim()).filter(Boolean)
}

function parseCardLine(text: string): Pick<KanbanCard, 'title' | 'tags' | 'priority' | 'props'> {
  const { text: rest, props } = splitMarkupProps(text)
  const tags: string[] = []
  let priority: KanbanPriority | null = null
  const title = rest
    .replace(/(^|\s)#([\p{L}\p{N}_-]+)/gu, (_, sp: string, tag: string) => {
      tags.push(tag)
      return sp
    })
    .replace(/(^|\s)!(high|low)\b/g, (_, sp: string, p: KanbanPriority) => {
      priority = p
      return sp
    })
    .replace(/\s{2,}/g, ' ')
    .trim()
  return { title, tags, priority, props }
}

export function parseKanban(source: string): KanbanDoc {
  const lines = source.split(/\r?\n/)
  const doc: KanbanDoc = { title: null, settings: new Map(), lanes: [], tagTones: {}, columns: [], problems: [] }
  let column: KanbanColumn | null = null
  let card: KanbanCard | null = null
  let cardCount = 0
  let inComment = false
  const closeCard = (): void => {
    card = null
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (inComment) {
      if (trimmed.includes('-->')) inComment = false
      continue
    }
    if (trimmed.startsWith('<!--')) {
      if (!trimmed.includes('-->')) inComment = true
      continue
    }
    if (card && (INDENT.test(line) || trimmed === '')) {
      if (trimmed !== '') {
        const c: KanbanCard = card
        c.description += (c.description ? '\n' : '') + line.replace(INDENT, '')
        c.end = i
        if (column) column.end = i
      }
      continue
    }
    if (trimmed === '') continue
    closeCard()
    let m = COLUMN.exec(trimmed)
    if (m) {
      const { text, props } = splitMarkupProps(m[1])
      const wip = Number(props.get('wip'))
      column = {
        id: `col-${doc.columns.length}`,
        title: text,
        props,
        wip: Number.isFinite(wip) && wip > 0 ? wip : null,
        done: props.has('done'),
        cards: [],
        start: i,
        end: i,
      }
      doc.columns.push(column)
      continue
    }
    m = CARD.exec(trimmed)
    if (m && !INDENT.test(line)) {
      if (!column) {
        doc.problems.push({ line: i + 1, message: 'A card before the first column (## Column)' })
        continue
      }
      card = { id: `card-${cardCount++}`, ...parseCardLine(m[1]), description: '', start: i, end: i }
      column.cards.push(card)
      column.end = i
      continue
    }
    if (!column) {
      m = TITLE.exec(trimmed)
      if (m && doc.title === null) {
        doc.title = m[1].trim()
        continue
      }
      m = SETTING.exec(trimmed)
      if (m) {
        doc.settings.set(m[1], m[2].trim())
        continue
      }
    }
    doc.problems.push({ line: i + 1, message: column ? 'Not a card: a card starts with "- "' : 'Not a setting: "key: value" before the first column' })
  }
  doc.lanes = list(doc.settings.get('lanes') ?? undefined)
  for (const pair of list(doc.settings.get('tags') ?? undefined)) {
    const [tag, tone] = pair.split('=').map((s) => s.trim())
    if (tag && tone) doc.tagTones[tag] = tone
  }
  return doc
}

export interface KanbanCardFields {
  title: string
  tags?: string[]
  priority?: KanbanPriority | null
  props?: MarkupProps
  description?: string
}

/** A card as markup lines: its own line, then the description indented under it. */
export function serializeKanbanCard(card: KanbanCardFields): string[] {
  let line = `- ${card.title.trim()}`
  for (const tag of card.tags ?? []) line += ` #${tag}`
  if (card.priority) line += ` !${card.priority}`
  const props = serializeMarkupProps(card.props ?? new Map())
  if (props) line += ` ${props}`
  const out = [line]
  for (const d of (card.description ?? '').split('\n')) if (d.trim() !== '' || out.length > 1) out.push(d.trim() === '' ? '' : `  ${d}`)
  while (out.length > 1 && out[out.length - 1] === '') out.pop()
  return out
}

function findCard(doc: KanbanDoc, id: string): { column: KanbanColumn; card: KanbanCard; index: number } {
  for (const column of doc.columns) {
    const index = column.cards.findIndex((c) => c.id === id)
    if (index >= 0) return { column, card: column.cards[index], index }
  }
  throw new Error(`No card ${id}`)
}

function findColumn(doc: KanbanDoc, id: string): KanbanColumn {
  const column = doc.columns.find((c) => c.id === id)
  if (!column) throw new Error(`No column ${id}`)
  return column
}

/** Where a new last card of the column goes: after its last line. */
function columnEnd(column: KanbanColumn): number {
  return column.end + 1
}

function splice(source: string, start: number, remove: number, insert: string[]): string {
  const lines = source.split(/\r?\n/)
  lines.splice(start, remove, ...insert)
  return lines.join('\n')
}

/** Moves a card into a column, before another card or (null) to its end; `lane` changes its swimlane. */
export function moveKanbanCard(source: string, cardId: string, toColumnId: string, beforeCardId: string | null, lane?: string | null): string {
  const doc = parseKanban(source)
  const { card } = findCard(doc, cardId)
  const target = findColumn(doc, toColumnId)
  let block = source.split(/\r?\n/).slice(card.start, card.end + 1)
  if (lane !== undefined) {
    const props = new Map(card.props)
    if (lane) props.set('lane', lane)
    else props.delete('lane')
    block = [serializeKanbanCard({ ...card, props })[0], ...block.slice(1)]
  }
  let at = beforeCardId ? findCard(doc, beforeCardId).card.start : columnEnd(target)
  if (beforeCardId === cardId) return source
  const lines = source.split(/\r?\n/)
  lines.splice(card.start, card.end - card.start + 1)
  if (at > card.start) at -= card.end - card.start + 1
  lines.splice(at, 0, ...block)
  return lines.join('\n')
}

export function addKanbanCard(source: string, columnId: string, card: KanbanCardFields): string {
  const doc = parseKanban(source)
  return splice(source, columnEnd(findColumn(doc, columnId)), 0, serializeKanbanCard(card))
}

export function updateKanbanCard(source: string, cardId: string, card: KanbanCardFields): string {
  const doc = parseKanban(source)
  const found = findCard(doc, cardId).card
  return splice(source, found.start, found.end - found.start + 1, serializeKanbanCard(card))
}

export function removeKanbanCard(source: string, cardId: string): string {
  const doc = parseKanban(source)
  const found = findCard(doc, cardId).card
  return splice(source, found.start, found.end - found.start + 1, [])
}

export function addKanbanColumn(source: string, title: string): string {
  const trimmed = source.replace(/\s+$/, '')
  return `${trimmed}${trimmed ? '\n\n' : ''}## ${title.trim()}\n`
}

// ---- card titles

const escapeHtml = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** A card title's inline markdown as HTML: links, code, bold, italics. The text is escaped first. */
export function kanbanInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => {
      const safe = /^(https?:|mailto:|\/|#)/i.test(url) ? url : '#'
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
}
