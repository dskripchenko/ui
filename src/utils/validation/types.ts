export interface FieldContext {
  field: string
  label?: string
  params?: string[]
  form?: Record<string, unknown>
}

export type RuleFn = (value: unknown, ctx: FieldContext) => true | string

export type RuleInput = string | RuleFn | (string | RuleFn)[]

export type MessageFn = (ctx: FieldContext) => string
export type MessageInput = string | MessageFn

export type ValidationMessages = Partial<Record<string, MessageInput>>
