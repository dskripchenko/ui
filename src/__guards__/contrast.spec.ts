import { beforeAll, describe, expect, it } from 'vitest'

/**
 * Text that components put on a fill or a tint keeps WCAG AA contrast
 * (4.5:1) in both themes. Values come from the stylesheets themselves, so a
 * palette or theme change that breaks a pair fails here.
 */
interface Fs {
  readFileSync(path: string, encoding: 'utf8'): string
}
let palette: Record<string, string> = {}
const themes: Record<'light' | 'dark', Record<string, string>> = { light: {}, dark: {} }

const block = (code: string, selector: string): string => {
  const start = code.indexOf(selector)
  if (start < 0) throw new Error(`no ${selector}`)
  const open = code.indexOf('{', start)
  return code.slice(open + 1, code.indexOf('}', open))
}
const declarations = (body: string): Record<string, string> =>
  Object.fromEntries([...body.matchAll(/(--uid-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]))

beforeAll(async () => {
  const fs = (await import('node:fs' as string)) as Fs
  const src = `${(globalThis as unknown as { process: { cwd(): string } }).process.cwd()}/src`
  palette = declarations(fs.readFileSync(`${src}/tokens/colors.css`, 'utf8'))
  const code = fs.readFileSync(`${src}/styles/themes.css`, 'utf8')
  themes.light = declarations(block(code, ":root[data-theme='light']"))
  themes.dark = declarations(block(code, ":root[data-theme='dark']"))
})

const resolve = (theme: 'light' | 'dark', token: string): string => {
  let value = themes[theme][token] ?? palette[token]
  for (let i = 0; value?.startsWith('var(') && i < 5; i++) {
    const name = value.slice(4, -1).trim()
    value = themes[theme][name] ?? palette[name]
  }
  if (!value?.startsWith('#')) throw new Error(`${token} does not resolve to a hex colour in ${theme}`)
  return value
}

const rgb = (hex: string): number[] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const mix = (fg: string, share: number, bg: string): number[] => {
  const f = rgb(fg)
  const b = rgb(bg)
  return f.map((c, i) => c * share + b[i]! * (1 - share))
}
const luminance = (c: number[]): number => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
const ratio = (a: number[], b: number[]): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

// [text, background]; a background may be a tint `token@share/over`.
const pairs: [string, string][] = [
  ['--uid-text-on-accent', '--uid-accent-solid'],
  ['--uid-text-on-accent', '--uid-accent-solid-hover'],
  ['--uid-text-on-accent', '--uid-danger-solid'],
  ['--uid-text-on-accent', '--uid-danger-hover'],
  ['--uid-text-on-accent', '--uid-success-solid'],
  ['--uid-text-on-accent', '--uid-warning-solid'],
  ['--uid-text-on-accent', '--uid-info-solid'],
  ['--uid-accent-text', '--uid-accent-subtle'],
  ['--uid-accent-text', '--uid-accent@0.15/--uid-surface-raised'],
  ['--uid-accent-text', '--uid-accent@0.15/--uid-surface-base'],
  ['--uid-success-text', '--uid-success-subtle'],
  ['--uid-warning-text', '--uid-warning-subtle'],
  ['--uid-danger-text', '--uid-danger-subtle'],
  ['--uid-info-text', '--uid-info-subtle'],
  ['--uid-neutral-text', '--uid-neutral-text@0.08/--uid-surface-raised'],
  ['--uid-neutral-text', '--uid-neutral-text@0.08/--uid-surface-base'],
  ['--uid-neutral-text', '--uid-surface-base'],
  ['--uid-text-secondary', '--uid-surface-raised'],
]

const color = (theme: 'light' | 'dark', spec: string): number[] => {
  const tint = /^(--uid-[\w-]+)@([\d.]+)\/(--uid-[\w-]+)$/.exec(spec)
  if (tint) return mix(resolve(theme, tint[1]!), Number(tint[2]), resolve(theme, tint[3]!))
  return rgb(resolve(theme, spec))
}

describe('text on fills and tints reaches 4.5:1', () => {
  for (const theme of ['light', 'dark'] as const) {
    it(theme, () => {
      const failing = pairs
        .map(([fg, bg]) => ({ pair: `${fg} on ${bg}`, ratio: ratio(color(theme, fg), color(theme, bg)) }))
        .filter((r) => r.ratio < 4.5)
        .map((r) => `${r.pair}: ${r.ratio.toFixed(2)}`)
      expect(failing).toEqual([])
    })
  }
})
