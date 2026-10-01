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

const ALIASES: Record<string, Grammar> = {
  js, javascript: js, jsx: js, mjs: js, ts: js, typescript: js, tsx: js,
  php,
  json,
  sql, mysql: sql, pgsql: sql, postgresql: sql,
  css,
  html: markup, xml: markup, vue: markup, svg: markup, markup,
  bash, sh: bash, shell: bash, zsh: bash,
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
