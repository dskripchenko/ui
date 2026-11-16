import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractTokens, parseBlocks, resolveAll, toValue } from './build-tokens.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('build-tokens', () => {
  it('parses blocks and drops comments', () => {
    const blocks = parseBlocks(":root { /* note: x */ --uid-a: 1px; --other: 2; }\n:root[data-theme='dark'] { --uid-a: var(--uid-b); }")
    expect(blocks).toEqual([
      { selector: ':root', decls: { a: '1px' } },
      { selector: ":root[data-theme='dark']", decls: { a: 'var(--uid-b)' } },
    ])
  })

  it('resolves nested references and fallbacks, and refuses unknown ones', () => {
    expect(resolveAll({ a: 'var(--uid-b)', b: '0 0 0 3px var(--uid-c)', c: '#fff' })).toEqual({ a: '0 0 0 3px #fff', b: '0 0 0 3px #fff', c: '#fff' })
    expect(resolveAll({ a: 'var(--uid-missing, 4px)' })).toEqual({ a: '4px' })
    expect(() => resolveAll({ a: 'var(--uid-missing)' })).toThrow('Unknown token --uid-missing')
    expect(() => resolveAll({ a: 'var(--uid-b)', b: 'var(--uid-a)' })).toThrow('Cyclic')
  })

  it('turns px, ms and unitless numbers into numbers', () => {
    expect([toValue('16px'), toValue('100ms'), toValue('1.25'), toValue('0'), toValue('#fafafa'), toValue('3px 4px')]).toEqual([16, 100, 1.25, 0, '#fafafa', '3px 4px'])
  })

  const tokens = extractTokens(root)

  it('exports the real tokens with every reference resolved', () => {
    expect(tokens.primitives['color-teal-500']).toBe('#14b8a6')
    expect(tokens.primitives['space-md']).toBe(16)
    expect(tokens.primitives['font-size-base']).toBe(16)
    expect(tokens.themes.light['accent']).toBe('#14b8a6')
    expect(tokens.themes.light['color-primary']).toBe(tokens.themes.light['accent'])
    const all = [tokens.primitives, tokens.themes.light, tokens.themes.dark].flatMap((o) => Object.values(o))
    expect(all.filter((v) => typeof v === 'string' && v.includes('var('))).toEqual([])
  })

  it('gives both themes the same keys, and the aliases follow the theme', () => {
    expect(Object.keys(tokens.themes.dark).sort()).toEqual(Object.keys(tokens.themes.light).sort())
    expect(tokens.themes.dark['color-text']).toBe(tokens.themes.dark['text-primary'])
    expect(tokens.themes.dark['surface-base']).not.toBe(tokens.themes.light['surface-base'])
  })
})
