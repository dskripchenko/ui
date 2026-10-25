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

  it('новые языки: исходник восстанавливается без потерь', () => {
    const samples: [string, string][] = [
      ['import requests\nr = requests.post("u", json={"a": True}, headers=None)  # c\n"""doc"""', 'python'],
      ['package main\nfunc main() { s := `raw`; fmt.Println("x", nil) } // c', 'go'],
      ['var r = HttpRequest.newBuilder().uri(URI.create("u")).build(); /* c */', 'java'],
      ['using var c = new HttpClient(); var s = $"x{1}"; // c', 'csharp'],
      ['val body = """{"a":1}""".toRequestBody(null) // c', 'kotlin'],
      ['let url = URL(string: "u")!; var r = URLRequest(url: url) // c', 'swift'],
      ["$h = @{ 'A' = \"b\" } # c\nInvoke-RestMethod -Uri 'u' -Method Post", 'powershell'],
      ['POST /pets HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\n\n{"a": 1}', 'http'],
      ["openapi: 3.1.0 # c\ninfo:\n  title: 'Pet store'\n  version: \"1\"\npaths: {}\ntags: [a, b]\nx: &a 1\ny: *a\nz: |\n  text", 'yaml'],
    ]
    for (const [code, lang] of samples) expect(joined(code, lang)).toBe(code)
  })

  it('python: keyword, literal, string, comment, decorator', () => {
    const code = '@app.get\ndef f(x):\n    return None  # done\ns = f"hi"'
    expect(typesOf(code, 'py', 'keyword')).toEqual(['def', 'return'])
    expect(typesOf(code, 'python', 'literal')).toEqual(['None'])
    expect(typesOf(code, 'python', 'comment')).toEqual(['# done'])
    expect(typesOf(code, 'python', 'string')).toEqual(['f"hi"'])
    expect(typesOf(code, 'python', 'attr')).toEqual(['@app.get'])
  })

  it('go, java, csharp, kotlin, swift: keywords and literals', () => {
    expect(typesOf('func f() error { return nil }', 'go', 'keyword')).toEqual(['func', 'return'])
    expect(typesOf('public static void main() { return null; }', 'java', 'literal')).toEqual(['null'])
    expect(typesOf('var s = $"a{b}";', 'cs', 'string')).toEqual(['$"a{b}"'])
    expect(typesOf('val x = when (y) { else -> null }', 'kt', 'keyword')).toEqual(['val', 'when', 'else'])
    expect(typesOf('guard let x = y else { return nil }', 'swift', 'keyword')).toEqual(['guard', 'let', 'else', 'return'])
  })

  it('powershell: variable, parameter, cmdlet', () => {
    const code = 'Invoke-RestMethod -Uri $url -Headers $h'
    expect(typesOf(code, 'ps1', 'function')).toEqual(['Invoke-RestMethod'])
    expect(typesOf(code, 'pwsh', 'attr')).toEqual(['-Uri', '-Headers'])
    expect(typesOf(code, 'powershell', 'variable')).toEqual(['$url', '$h'])
  })

  it('http: method, version, header names', () => {
    const code = 'GET /pets?limit=10 HTTP/1.1\nAccept: application/json\nX-Trace-Id: 1'
    expect(typesOf(code, 'http', 'keyword')).toEqual(['GET'])
    expect(typesOf(code, 'http', 'literal')).toEqual(['HTTP/1.1'])
    expect(typesOf(code, 'http', 'property')).toEqual(['Accept', 'X-Trace-Id'])
  })

  it('yaml: keys, scalars, anchors, comments', () => {
    const code = "openapi: 3.1.0\ninfo:\n  title: 'Pets'  # name\n  x-flag: true\nbase: &b {a: 1}\nother: *b\n'quoted key': ~"
    expect(typesOf(code, 'yml', 'property')).toEqual(['openapi', 'info', 'title', 'x-flag', 'base', 'a', 'other', "'quoted key'"])
    expect(typesOf(code, 'yaml', 'string')).toEqual(["'Pets'"])
    expect(typesOf(code, 'yaml', 'comment')).toEqual(['# name'])
    expect(typesOf(code, 'yaml', 'literal')).toEqual(['true', '~'])
    expect(typesOf(code, 'yaml', 'variable')).toEqual(['&b', '*b'])
    expect(typesOf(code, 'yaml', 'number')).toEqual(['3.1', '1'])
  })
})
