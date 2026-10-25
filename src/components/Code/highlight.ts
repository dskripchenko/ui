export type UidCodeTokenType =
  | 'plain'
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'literal'
  | 'function'
  | 'variable'
  | 'tag'
  | 'attr'
  | 'property'
  | 'punctuation'

export interface UidCodeToken {
  type: UidCodeTokenType
  text: string
}

// [token type, pattern, next state]
type Rule = [UidCodeTokenType, RegExp, string?]
type Grammar = Record<string, Rule[]>

const words = (list: string, flags = ''): RegExp =>
  new RegExp(`\\b(?:${list.replace(/ /g, '|')})\\b`, flags)

const BLOCK_COMMENT = /\/\*[\s\S]*?(?:\*\/|$)/
const DQ = /"(?:\\[\s\S]|[^"\\\n])*"?/
const SQ = /'(?:\\[\s\S]|[^'\\\n])*'?/
const NUMBER = /\b(?:0[xob][\da-f_]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?)\b/i
const FUNC = /[A-Za-z_$][\w$]*(?=\s*\()/
const IDENT = /[A-Za-z_$][\w$]*/
const PUNCT = /[{}()[\];,.<>=+\-*/%!&|^~?:@\\]+/

const js: Grammar = {
  main: [
    ['comment', /\/\/.*/],
    ['comment', BLOCK_COMMENT],
    ['string', DQ],
    ['string', SQ],
    ['string', /`(?:\\[\s\S]|[^`\\])*`?/],
    ['number', NUMBER],
    ['keyword', words('abstract as async await break case catch class const continue debugger declare default delete do else enum export extends finally for from function get if implements import in instanceof interface keyof let namespace new of private protected public readonly return set static super switch this throw try type typeof var void while with yield')],
    ['literal', words('true false null undefined NaN Infinity')],
    ['function', FUNC],
    ['plain', IDENT],
    ['punctuation', PUNCT],
  ],
}

const php: Grammar = {
  main: [
    ['tag', /<\?(?:php|=)?|\?>/i],
    ['comment', /(?:\/\/|#(?!\[)).*/],
    ['comment', BLOCK_COMMENT],
    ['variable', /\$\w+/],
    ['string', DQ],
    ['string', SQ],
    ['number', NUMBER],
    ['keyword', words('abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enum extends final finally fn for foreach function global goto if implements include include_once instanceof insteadof interface isset list match namespace new or parent print private protected public readonly require require_once return self static switch throw trait try unset use var while xor yield', 'i')],
    ['literal', words('true false null', 'i')],
    ['function', FUNC],
    ['plain', IDENT],
    ['punctuation', PUNCT],
  ],
}

const json: Grammar = {
  main: [
    ['property', /"(?:\\.|[^"\\\n])*"(?=\s*:)/],
    ['string', DQ],
    ['number', /-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i],
    ['literal', words('true false null')],
    ['punctuation', /[{}[\],:]+/],
  ],
}

const sql: Grammar = {
  main: [
    ['comment', /--.*/],
    ['comment', BLOCK_COMMENT],
    ['string', /'(?:''|[^'])*'?/],
    ['property', /"[^"]*"?|`[^`]*`?/],
    ['variable', /[:@]\w+/],
    ['number', NUMBER],
    ['keyword', words('add all alter and as asc begin between by case cast check commit constraint create cross database default delete desc distinct drop else end exists foreign from full grant group having if in index inner insert into is join key left like limit not offset on or order outer over partition primary references replace returning revoke right rollback select set table then transaction truncate union unique update using values view when where with', 'i')],
    ['literal', words('true false null', 'i')],
    ['function', FUNC],
    ['plain', IDENT],
    ['punctuation', PUNCT],
  ],
}

const css: Grammar = {
  main: [
    ['comment', BLOCK_COMMENT],
    ['string', DQ],
    ['string', SQ],
    ['keyword', /@[\w-]+|!important/],
    ['property', /-{0,2}[A-Za-z][\w-]*(?=\s*:[^{;]*(?:[;}]|$))/],
    ['tag', /[.#]?-?[A-Za-z_][\w-]*(?=[^{};]*\{)/],
    ['number', /#[\da-f]{3,8}\b|-?(?:\d*\.)?\d+(?:[a-z]+|%)?/i],
    ['function', /[\w-]+(?=\()/],
    ['plain', /[\w-]+/],
    ['punctuation', /[{}()[\];,:>+~*=]+/],
  ],
}

const markup: Grammar = {
  main: [
    ['comment', /<!--[\s\S]*?(?:-->|$)/],
    ['keyword', /<![\s\S]*?>|<\?[\s\S]*?\?>/],
    ['tag', /<\/?[A-Za-z][\w:.-]*/, 'tag'],
    ['literal', /&#?\w+;/],
    ['plain', /[^<&]+/],
  ],
  tag: [
    ['tag', /\/?>/, 'main'],
    ['string', /"[^"]*"?|'[^']*'?/],
    ['punctuation', /=/],
    ['attr', /[^\s=/>"']+/],
    ['plain', /\s+/],
  ],
}

const bash: Grammar = {
  main: [
    // No lookbehind (older Safari); tokenize() splits the leading whitespace off.
    ['comment', /(?:^|[ \t])#.*/m],
    ['string', /"(?:\\[\s\S]|[^"\\])*"?/],
    ['string', /'[^']*'?/],
    ['variable', /\$(?:\{[^}]*\}?|\w+|[@#?$!*-])/],
    ['keyword', words('alias break case cd continue declare do done echo elif else esac eval exec exit export fi for function if in local read readonly return select set shift source then trap unset until while')],
    ['attr', /\s--?[A-Za-z][\w-]*/],
    ['number', /\b\d+\b/],
    ['function', /[A-Za-z_][\w-]*(?=\s*\(\s*\))/],
    ['plain', /[\w./-]+/],
    ['punctuation', /[|&;<>(){}[\]=!]+/],
  ],
}

const python: Grammar = {
  main: [
    ['comment', /#.*/],
    ['string', /[rbfu]{0,2}(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))/i],
    ['string', /[rbfu]{0,2}(?:"(?:\\[\s\S]|[^"\\\n])*"?|'(?:\\[\s\S]|[^'\\\n])*'?)/i],
    ['attr', /@[\w.]+/],
    ['number', NUMBER],
    ['keyword', words('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case')],
    ['literal', words('True False None')],
    ['function', FUNC],
    ['plain', IDENT],
    ['punctuation', PUNCT],
  ],
}

const go: Grammar = {
  main: [
    ['comment', /\/\/.*/],
    ['comment', BLOCK_COMMENT],
    ['string', DQ],
    ['string', /`[^`]*`?/],
    ['string', /'(?:\\[\s\S]|[^'\\\n])*'?/],
    ['number', NUMBER],
    ['keyword', words('break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var')],
    ['literal', words('true false nil iota')],
    ['function', FUNC],
    ['plain', IDENT],
    ['punctuation', PUNCT],
  ],
}

/** Java, C#, Kotlin and Swift: C-like, each with its own words. */
const cLike = (keywords: string, literals: string, extra: Rule[] = []): Grammar => ({
  main: [
    ['comment', /\/\/.*/],
    ['comment', BLOCK_COMMENT],
    ...extra,
    ['string', /"""[\s\S]*?(?:"""|$)/],
    ['string', DQ],
    ['string', SQ],
    ['attr', /@\w+/],
    ['number', NUMBER],
    ['keyword', words(keywords)],
    ['literal', words(literals)],
    ['function', FUNC],
    ['plain', IDENT],
    ['punctuation', PUNCT],
  ],
})

const java = cLike(
  'abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public record return static strictfp super switch synchronized this throw throws transient try var void volatile while yield',
  'true false null',
)

const csharp = cLike(
  'abstract as async await base break case catch checked class const continue default delegate do else enum event explicit extern finally fixed for foreach goto if implicit in interface internal is lock namespace new operator out override params private protected public readonly record ref return sealed sizeof stackalloc static struct switch this throw try typeof unchecked unsafe using var virtual void volatile while',
  'true false null',
  [['string', /[$@]+"(?:""|\\[\s\S]|[^"\\])*"?/]],
)

const kotlin = cLike(
  'as break by catch class companion constructor continue data do else enum finally for fun get if import in init interface internal is lateinit object open override package private protected public return sealed set super suspend this throw try typealias typeof val var when while',
  'true false null',
)

const swift = cLike(
  'as associatedtype async await break case catch class continue default defer deinit do else enum extension fallthrough fileprivate for func guard if import in init inout internal is let open operator private protocol public repeat rethrows return self Self static struct subscript super switch throw throws try typealias var where while',
  'true false nil',
)

const powershell: Grammar = {
  main: [
    ['comment', /<#[\s\S]*?(?:#>|$)/],
    ['comment', /#.*/],
    ['string', /@"[\s\S]*?(?:"@|$)|@'[\s\S]*?(?:'@|$)/],
    ['string', /"(?:`[\s\S]|[^"`])*"?/],
    ['string', /'(?:''|[^'])*'?/],
    ['variable', /\$(?:\{[^}]*\}?|[\w:]+)/],
    ['attr', /-[A-Za-z]\w*/],
    ['number', NUMBER],
    ['keyword', words('begin break catch class continue data do dynamicparam else elseif end exit filter finally for foreach from function if in param process return switch throw trap try until using while', 'i')],
    ['function', /\b[A-Z][a-z]+-[A-Za-z]+\b/],
    ['plain', IDENT],
    ['punctuation', /[{}()[\];,.<>=+*/%!&|@]+/],
  ],
}

/** A raw HTTP message: the request or status line, the headers, then the body. */
const http: Grammar = {
  main: [
    ['keyword', /^(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE|CONNECT)\b/m],
    ['literal', /\bHTTP\/[\d.]+\b/],
    ['property', /^[\w-]+(?=:)/m],
    ['number', /\b[1-5]\d\d\b/],
    ['string', DQ],
    ['plain', /[^\s"]+/],
  ],
}

const yaml: Grammar = {
  main: [
    // No lookbehind (older Safari); tokenize() splits the leading whitespace off.
    ['comment', /(?:^|[ \t])#.*/m],
    ['keyword', /^(?:---|\.\.\.)(?=\s|$)/m],
    ['property', /"(?:\\.|[^"\\\n])*"(?=[ \t]*:(?:\s|$))|'(?:''|[^'\n])*'(?=[ \t]*:(?:\s|$))/],
    ['property', /[^\s:#'"[\]{},&*!|>-][^\n:#]*?(?=[ \t]*:(?:\s|$))/],
    ['string', DQ],
    ['string', /'(?:''|[^'])*'?/],
    ['variable', /[&*][^\s,[\]{}]+/],
    ['attr', /!{1,2}[\w./-]*/],
    ['literal', /\b(?:true|false|null|True|False|Null|NULL)\b|~/],
    ['number', /[-+]?(?:\.inf|\.nan|0x[\da-f]+|0o[0-7]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/i],
    ['punctuation', /[-:,[\]{}|>?]+/],
    ['plain', /[^\s:#,[\]{}]+/],
  ],
}

const ALIASES: Record<string, Grammar> = {
  js, javascript: js, jsx: js, mjs: js, ts: js, typescript: js, tsx: js,
  php,
  json,
  sql, mysql: sql, pgsql: sql, postgresql: sql,
  css,
  html: markup, xml: markup, vue: markup, svg: markup, markup,
  bash, sh: bash, shell: bash, zsh: bash, curl: bash,
  python, py: python,
  go, golang: go,
  java,
  csharp, cs: csharp, 'c#': csharp,
  kotlin, kt: kotlin,
  swift,
  powershell, ps1: powershell, pwsh: powershell,
  http,
  yaml, yml: yaml,
}

const compiled = new WeakMap<RegExp, RegExp>()

function sticky(re: RegExp): RegExp {
  let s = compiled.get(re)
  if (!s) {
    s = new RegExp(re.source, re.flags.replace(/[gy]/g, '') + 'y')
    compiled.set(re, s)
  }
  return s
}

export function isHighlightable(language?: string): boolean {
  return !!language && language.toLowerCase() in ALIASES
}

export function tokenize(code: string, language?: string): UidCodeToken[] {
  const grammar = language ? ALIASES[language.toLowerCase()] : undefined
  if (!grammar) return code ? [{ type: 'plain', text: code }] : []

  const out: UidCodeToken[] = []
  const push = (type: UidCodeTokenType, text: string): void => {
    const last = out[out.length - 1]
    if (last && last.type === type) last.text += text
    else out.push({ type, text })
  }

  let state = 'main'
  let pos = 0
  while (pos < code.length) {
    let matched = false
    for (const [type, re, next] of grammar[state]) {
      const s = sticky(re)
      s.lastIndex = pos
      const m = s.exec(code)
      if (m && m[0]) {
        const lead = type === 'plain' ? 0 : m[0].length - m[0].trimStart().length
        if (lead) push('plain', m[0].slice(0, lead))
        push(type, m[0].slice(lead))
        pos += m[0].length
        if (next) state = next
        matched = true
        break
      }
    }
    if (!matched) push('plain', code[pos++])
  }
  return out
}
