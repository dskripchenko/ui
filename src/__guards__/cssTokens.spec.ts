import { beforeAll, describe, expect, it } from 'vitest'

/**
 * A `var(--uid-…)` with no fallback must resolve: a token that no file
 * defines makes the declaration invalid at computed-value time, and the
 * property silently falls back to its inherited or initial value (a
 * transparent tooltip, a palette with no shadow). Component hooks defined
 * in their own stylesheet (`--uid-button-bg` in UidButton.css) count.
 */
// Read from disk: Vitest hands stylesheets to the CSS pipeline, which empties them.
interface Fs {
  readFileSync(path: string, encoding: 'utf8'): string
  readdirSync(path: string, options: { recursive: true }): string[]
}
const css: Record<string, string> = {}
beforeAll(async () => {
  const fs = (await import('node:fs' as string)) as Fs
  const src = `${(globalThis as unknown as { process: { cwd(): string } }).process.cwd()}/src`
  for (const rel of fs.readdirSync(src, { recursive: true })) {
    if (rel.endsWith('.css')) css[`../${rel}`] = fs.readFileSync(`${src}/${rel}`, 'utf8')
  }
})

const definitions = (code: string): Set<string> =>
  new Set([...code.matchAll(/(--uid-[\w-]+)\s*:/g)].map((m) => m[1]!))

describe('every --uid-* token used without a fallback is defined', () => {
  it('finds the stylesheets', () => {
    expect(Object.keys(css).length).toBeGreaterThan(50)
    expect(Object.values(css).join('').length).toBeGreaterThan(10_000)
  })

  it('resolves', () => {
    const global = new Set<string>()
    for (const [file, code] of Object.entries(css)) {
      if (file.startsWith('../tokens/') || file.startsWith('../styles/')) {
        for (const t of definitions(code)) global.add(t)
      }
    }
    const offenders: string[] = []
    for (const [file, code] of Object.entries(css)) {
      const local = definitions(code)
      for (const m of code.matchAll(/var\(\s*(--uid-[\w-]+)\s*\)/g)) {
        const token = m[1]!
        if (!global.has(token) && !local.has(token)) offenders.push(`${file}: ${token}`)
      }
    }
    expect([...new Set(offenders)]).toEqual([])
  })
})
