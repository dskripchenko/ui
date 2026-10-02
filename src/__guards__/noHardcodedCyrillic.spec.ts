import { describe, expect, it } from 'vitest'

/**
 * User-visible text lives in the locale bags (src/locales). A Cyrillic string
 * anywhere else in the components is a caption that ignores the active
 * locale. Comments may stay in Russian; stories and specs are exempt.
 */
const sources = import.meta.glob(
  [
    '../components/**/*.{vue,ts}',
    '../patterns/**/*.{vue,ts}',
    '../layouts/**/*.{vue,ts}',
    '../utils/**/*.ts',
    '../composables/**/*.ts',
    '!../**/*.stories.ts',
    '!../**/*.spec.ts',
    '!../**/*.test.ts',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

function stripComments(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')
}

describe('no hard-coded Cyrillic outside src/locales', () => {
  it('finds the sources', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(50)
  })

  it('every caption comes from the locale', () => {
    const offenders: string[] = []
    for (const [file, code] of Object.entries(sources)) {
      stripComments(code).split('\n').forEach((line, i) => {
        if (/[А-Яа-яЁё]/.test(line)) offenders.push(`${file}:${i + 1}: ${line.trim()}`)
      })
    }
    expect(offenders).toEqual([])
  })
})
