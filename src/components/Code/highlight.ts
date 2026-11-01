/**
 * Highlighting for UidCode: the tokens of `@dskripchenko/syntax` (some 35
 * languages and formats, by id or alias) under the kit's token names — a
 * constant is a `literal`, an attribute an `attr`, as before.
 */
import { isSupported, tokenize as tokenizeCode, type TokenType } from '@dskripchenko/syntax'

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
  | 'type'
  | 'operator'
  | 'regex'
  | 'meta'
  | 'escape'
  | 'heading'
  | 'emphasis'
  | 'strong'
  | 'link'
  | 'inserted'
  | 'deleted'
  | 'date'
  | 'error'
  | 'warning'
  | 'info'
  | 'debug'

export interface UidCodeToken {
  type: UidCodeTokenType
  text: string
}

const RENAMED: Partial<Record<TokenType, UidCodeTokenType>> = { constant: 'literal', attribute: 'attr' }

/** Names a fence may carry that are not a language of their own. */
const ALIASES: Record<string, string> = { curl: 'bash' }

const resolve = (language?: string): string | undefined => {
  if (!language) return undefined
  const id = language.toLowerCase()
  return ALIASES[id] ?? id
}

export function isHighlightable(language?: string): boolean {
  const id = resolve(language)
  return !!id && isSupported(id)
}

export function tokenize(code: string, language?: string): UidCodeToken[] {
  const id = resolve(language)
  if (!id || !isSupported(id)) return code ? [{ type: 'plain', text: code }] : []
  return tokenizeCode(code, id).map((t) => ({ type: RENAMED[t.type] ?? (t.type as UidCodeTokenType), text: t.text }))
}
