import { describe, expect, it } from 'vitest'
import { tokenize, isHighlightable, type UidCodeTokenType } from './highlight'

const typesOf = (code: string, lang: string, type: UidCodeTokenType) =>
  tokenize(code, lang).filter((t) => t.type === type).map((t) => t.text)

const joined = (code: string, lang?: string) =>
  tokenize(code, lang).map((t) => t.text).join('')

describe('tokenize', () => {
  it('неизвестный язык → один plain-токен', () => {
    expect(tokenize('a < b', 'brainfuck')).toEqual([{ type: 'plain', text: 'a < b' }])
    expect(tokenize('x')).toEqual([{ type: 'plain', text: 'x' }])
    expect(tokenize('', 'js')).toEqual([])
  })

  it('isHighlightable учитывает алиасы и регистр', () => {
    expect(isHighlightable('TypeScript')).toBe(true)
    expect(isHighlightable('sh')).toBe(true)
    expect(isHighlightable('text')).toBe(false)
    expect(isHighlightable(undefined)).toBe(false)
  })

  it('токены без потерь восстанавливают исходник', () => {
    const samples: [string, string][] = [
      ['const a = `x${1}` // c\n/* b */', 'ts'],
      ['<?php $a = "x"; # c', 'php'],
      ['{"a": [1, true]}', 'json'],
      ["SELECT 'it''s' FROM t -- c", 'sql'],
      ['<a href="x">t &amp; u</a>', 'html'],
      ['a:hover { color: #fff; }', 'css'],
      ['echo "$HOME" # c', 'bash'],
    ]
    for (const [code, lang] of samples) expect(joined(code, lang)).toBe(code)
  })

  it('js/ts: keyword, string, number, comment, literal, function', () => {
    const code = 'const greet = (n) => format(`hi ${n}`, 42) // done\nreturn null'
    expect(typesOf(code, 'typescript', 'keyword')).toEqual(['const', 'return'])
    expect(typesOf(code, 'ts', 'string')).toEqual(['`hi ${n}`'])
    expect(typesOf(code, 'js', 'number')).toEqual(['42'])
    expect(typesOf(code, 'js', 'comment')).toEqual(['// done'])
    expect(typesOf(code, 'js', 'literal')).toEqual(['null'])
    expect(typesOf(code, 'js', 'function')).toEqual(['format'])
  })

  it('js: ключевое слово внутри идентификатора не подсвечивается', () => {
    expect(typesOf('format; newValue; ifx', 'js', 'keyword')).toEqual([])
  })

  it('php: переменные, ключевые слова без учёта регистра, теги', () => {
    const code = "<?php\nFUNCTION f($x) { return 'a' . $x; } // c"
    expect(typesOf(code, 'php', 'tag')).toEqual(['<?php'])
    expect(typesOf(code, 'php', 'variable')).toEqual(['$x', '$x'])
    expect(typesOf(code, 'php', 'keyword')).toEqual(['FUNCTION', 'return'])
    expect(typesOf(code, 'php', 'string')).toEqual(["'a'"])
    expect(typesOf(code, 'php', 'comment')).toEqual(['// c'])
  })

  it('json: ключи — property, значения — string', () => {
    const code = '{"name": "ui", "n": -1.5e3, "ok": false}'
    expect(typesOf(code, 'json', 'property')).toEqual(['"name"', '"n"', '"ok"'])
    expect(typesOf(code, 'json', 'string')).toEqual(['"ui"'])
    expect(typesOf(code, 'json', 'number')).toEqual(['-1.5e3'])
    expect(typesOf(code, 'json', 'literal')).toEqual(['false'])
  })

  it('sql: ключевые слова без учёта регистра, строки с экранированием, параметры', () => {
    const code = "select count(*) FROM users WHERE name = 'O''Neil' AND id = :id -- x"
    expect(typesOf(code, 'sql', 'keyword')).toEqual(['select', 'FROM', 'WHERE', 'AND'])
    expect(typesOf(code, 'sql', 'string')).toEqual(["'O''Neil'"])
    expect(typesOf(code, 'sql', 'variable')).toEqual([':id'])
    expect(typesOf(code, 'sql', 'function')).toEqual(['count'])
    expect(typesOf(code, 'sql', 'comment')).toEqual(['-- x'])
  })

  it('html/xml: теги, атрибуты, значения, комментарии, сущности', () => {
    const code = '<!-- c --><div class="a" hidden>"text" &amp;</div>'
    expect(typesOf(code, 'html', 'comment')).toEqual(['<!-- c -->'])
    expect(typesOf(code, 'html', 'tag')).toEqual(['<div', '>', '</div>'])
    expect(typesOf(code, 'xml', 'attr')).toEqual(['class', 'hidden'])
    expect(typesOf(code, 'vue', 'string')).toEqual(['"a"'])
    expect(typesOf(code, 'html', 'literal')).toEqual(['&amp;'])
  })

  it('css: селекторы, свойства, значения, at-правила', () => {
    const code = '@media screen {\n  .btn:hover { color: #fff; margin: 0 4px; width: calc(100% - 2px) }\n}'
    expect(typesOf(code, 'css', 'keyword')).toEqual(['@media'])
    expect(typesOf(code, 'css', 'tag')).toEqual(['screen', '.btn', 'hover'])
    expect(typesOf(code, 'css', 'property')).toEqual(['color', 'margin', 'width'])
    expect(typesOf(code, 'css', 'number')).toEqual(['#fff', '0', '4px', '100%', '2px'])
    expect(typesOf(code, 'css', 'function')).toEqual(['calc'])
  })

  it('bash: переменные, строки, флаги, комментарии', () => {
    const code = 'if [ -n "$X" ]; then\n  rm -rf ${DIR} --force # cleanup\nfi'
    expect(typesOf(code, 'bash', 'keyword')).toEqual(['if', 'then', 'fi'])
    expect(typesOf(code, 'sh', 'string')).toEqual(['"$X"'])
    expect(typesOf(code, 'shell', 'variable')).toEqual(['${DIR}'])
    expect(typesOf(code, 'bash', 'attr')).toEqual(['-n', '-rf', '--force'])
    expect(typesOf(code, 'bash', 'comment')).toEqual(['# cleanup'])
  })

  it('незакрытые строки и комментарии не зацикливают разбор', () => {
    expect(joined('"abc', 'js')).toBe('"abc')
    expect(joined('/* open', 'css')).toBe('/* open')
    expect(joined('<div class="x', 'html')).toBe('<div class="x')
  })
})
