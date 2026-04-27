import type { RuleFn, RuleInput, FieldContext } from './types'
import { NULLABLE_SENTINEL, required, nullable, email, url, numeric, integer, min, max, minValue, maxValue, regex, inList, sameAs } from './rules'

const stringFactories: Record<string, (params: string[]) => RuleFn> = {
  required:       () => required(),
  nullable:       () => nullable(),
  email:          () => email(),
  url:            () => url(),
  numeric:        () => numeric(),
  integer:        () => integer(),
  min:            ([n]) => min(Number(n)),
  max:            ([n]) => max(Number(n)),
  min_value:      ([n]) => minValue(Number(n)),
  max_value:      ([n]) => maxValue(Number(n)),
  regex:          ([pattern]) => regex(pattern),
  in:             (list) => inList(list),
  same_as:        ([field]) => sameAs(field),
}

export function parseRules(input?: RuleInput): RuleFn[] {
  if (!input) return []
  const items = Array.isArray(input) ? input : [input]
  return items.flatMap((item) => {
    if (typeof item === 'function') return [item]
    return item.split('|').map((segment) => {
      const colonIndex = segment.indexOf(':')
      const name = colonIndex === -1 ? segment.trim() : segment.slice(0, colonIndex).trim()
      const rawParams = colonIndex === -1 ? '' : segment.slice(colonIndex + 1)
      const params = rawParams ? rawParams.split(',') : []
      const factory = stringFactories[name]
      if (!factory) throw new Error(`Unknown validation rule: "${name}"`)
      return factory(params)
    })
  })
}

export function runRules(value: unknown, rules: RuleFn[], ctx: FieldContext): string {
  for (const rule of rules) {
    const result = rule(value, ctx)
    if (result === NULLABLE_SENTINEL) return ''
    if (result !== true) return result
  }
  return ''
}
