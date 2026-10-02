import type { FieldContext, ValidationMessages } from './types'
import type { UidLocale } from '../../locales/types.js'
import { ru } from '../../locales/ru.js'

type Bag = UidLocale['validation']

function defaultsFrom(v: Bag): Record<string, (ctx: FieldContext) => string> {
  const field = (label?: string) => v.required(label ?? v.value)
  return {
    required: ({ label }) => field(label),
    email: () => v.email,
    url: () => v.url,
    numeric: () => v.numeric,
    integer: () => v.integer,
    min: ({ params }) => v.min(String(params?.[0])),
    max: ({ params }) => v.max(String(params?.[0])),
    min_value: ({ params }) => v.minValue(String(params?.[0])),
    max_value: ({ params }) => v.maxValue(String(params?.[0])),
    regex: () => v.regex,
    in: () => v.in,
    same_as: () => v.sameAs,
    required_if: ({ label }) => field(label),
    required_unless: ({ label }) => field(label),
  }
}

// The default messages follow the kit locale: provideLocale() switches them.
let bag: Bag = ru.validation
let defaults = defaultsFrom(bag)

/** Switches the default messages to a locale's bag; called by provideLocale(). */
export function setValidationLocale(locale: Pick<UidLocale, 'validation'>): void {
  if (locale.validation === bag) return
  bag = locale.validation
  defaults = defaultsFrom(bag)
}

let customMessages: ValidationMessages = {}

export function setMessages(messages: ValidationMessages): void {
  customMessages = { ...customMessages, ...messages }
}

export function getMessage(ruleName: string, ctx: FieldContext): string {
  const custom = customMessages[ruleName]
  if (custom) return typeof custom === 'function' ? custom(ctx) : custom
  return defaults[ruleName]?.(ctx) ?? bag.unknown(ruleName)
}
