/** A changed file as a review shows it: a unified patch of it. */
export interface DiffFile {
  path: string
  /** The path before a move. */
  oldPath?: string | null
  status?: 'added' | 'modified' | 'deleted' | 'renamed'
  additions?: number
  deletions?: number
  /** Unified diff hunks: `@@ -a,b +c,d @@` and lines with ` `, `-`, `+`. */
  patch: string
  /** The patch was cut by its source. */
  truncated?: boolean
}

export type DiffRow =
  | { kind: 'context'; old: number; new: number; text: string }
  | { kind: 'del'; old: number; text: string }
  | { kind: 'add'; new: number; text: string }
  /** Lines unchanged that are not shown: `rows` when known, else only how many. */
  | { kind: 'fold'; count: number; rows: DiffRow[] }

/** A row of the side-by-side view: what was on the left, what is on the right. */
export interface DiffPair {
  left: { kind: 'context' | 'del' | 'empty'; line?: number; text?: string }
  right: { kind: 'context' | 'add' | 'empty'; line?: number; text?: string }
  fold?: { count: number; rows: DiffRow[] }
}

const HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/

/**
 * Rows of a unified patch, with unchanged runs longer than twice `context`
 * folded in the middle, and the unchanged lines before and between hunks
 * counted.
 */
export function diffRows(patch: string, context = 3): DiffRow[] {
  const rows: DiffRow[] = []
  let old = 0
  let now = 0
  let lastOld: number | null = null
  let hunk: DiffRow[] = []
  const flush = (): void => {
    rows.push(...foldContext(hunk, context))
    hunk = []
  }
  for (const line of patch.split('\n')) {
    const head = HUNK.exec(line)
    if (head) {
      flush()
      const start = Number(head[1])
      const gap = lastOld === null ? start - 1 : start - lastOld - 1
      if (gap > 0) rows.push({ kind: 'fold', count: gap, rows: [] })
      old = start
      now = Number(head[3])
      continue
    }
    if (line.startsWith('\\')) continue
    const mark = line[0]
    const text = line.slice(1)
    if (mark === '-') {
      hunk.push({ kind: 'del', old, text })
      lastOld = old
      old++
    } else if (mark === '+') {
      hunk.push({ kind: 'add', new: now, text })
      now++
    } else if (mark === ' ' || (line === '' && old > 0)) {
      if (line === '' && old === 0) continue
      hunk.push({ kind: 'context', old, new: now, text })
      lastOld = old
      old++
      now++
    }
  }
  flush()
  // A trailing empty context made by the patch's last newline is not a line.
  const last = rows[rows.length - 1]
  if (last && last.kind === 'context' && last.text === '' && !patch.endsWith('\n \n')) rows.pop()

  return rows
}

function foldContext(rows: DiffRow[], context: number): DiffRow[] {
  const out: DiffRow[] = []
  let run: DiffRow[] = []
  const end = (atStart: boolean, atEnd: boolean): void => {
    const keepHead = atStart ? 0 : context
    const keepTail = atEnd ? 0 : context
    if (run.length > keepHead + keepTail + 1) {
      out.push(...run.slice(0, keepHead))
      const hidden = run.slice(keepHead, run.length - keepTail)
      out.push({ kind: 'fold', count: hidden.length, rows: hidden })
      out.push(...run.slice(run.length - keepTail))
    } else {
      out.push(...run)
    }
    run = []
  }
  rows.forEach((row) => {
    if (row.kind === 'context') {
      run.push(row)
    } else {
      end(out.length === 0, false)
      out.push(row)
    }
  })
  end(out.length === 0, true)

  return out
}

/** Rows paired for the side-by-side view: deletions beside the additions that follow them. */
export function diffPairs(rows: DiffRow[]): DiffPair[] {
  const pairs: DiffPair[] = []
  let dels: Extract<DiffRow, { kind: 'del' }>[] = []
  let adds: Extract<DiffRow, { kind: 'add' }>[] = []
  const flush = (): void => {
    const n = Math.max(dels.length, adds.length)
    for (let i = 0; i < n; i++) {
      const d = dels[i]
      const a = adds[i]
      pairs.push({
        left: d ? { kind: 'del', line: d.old, text: d.text } : { kind: 'empty' },
        right: a ? { kind: 'add', line: a.new, text: a.text } : { kind: 'empty' },
      })
    }
    dels = []
    adds = []
  }
  for (const row of rows) {
    if (row.kind === 'del') {
      if (adds.length > 0) flush()
      dels.push(row)
    } else if (row.kind === 'add') {
      adds.push(row)
    } else {
      flush()
      if (row.kind === 'context') {
        pairs.push({ left: { kind: 'context', line: row.old, text: row.text }, right: { kind: 'context', line: row.new, text: row.text } })
      } else {
        pairs.push({ left: { kind: 'empty' }, right: { kind: 'empty' }, fold: { count: row.count, rows: row.rows } })
      }
    }
  }
  flush()

  return pairs
}

/** Lines added and removed, counted from the patch when the source did not say. */
export function diffCounts(file: DiffFile): { additions: number; deletions: number } {
  if (typeof file.additions === 'number' && typeof file.deletions === 'number') return { additions: file.additions, deletions: file.deletions }
  let additions = 0
  let deletions = 0
  for (const line of file.patch.split('\n')) {
    if (line.startsWith('+') && !line.startsWith('+++')) additions++
    else if (line.startsWith('-') && !line.startsWith('---')) deletions++
  }

  return { additions, deletions }
}
