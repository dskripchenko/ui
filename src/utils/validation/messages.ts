import type { FieldContext, ValidationMessages } from './types'

const defaults: Record<string, (ctx: FieldContext) => string> = {
  required:       ({ label }) => `Поле «${label ?? 'значение'}» обязательно`,
  email:          () => 'Введите корректный email',
  url:            () => 'Введите корректный URL',
  numeric:        () => 'Введите число',
  integer:        () => 'Введите целое число',
  min:            ({ params }) => `Минимум ${params?.[0]} символов`,
  max:            ({ params }) => `Максимум ${params?.[0]} символов`,
  min_value:      ({ params }) => `Значение не менее ${params?.[0]}`,
  max_value:      ({ params }) => `Значение не более ${params?.[0]}`,
  regex:          () => 'Неверный формат',
  in:             () => 'Выберите допустимое значение',
  same_as:        () => 'Значения не совпадают',
  required_if:    ({ label }) => `Поле «${label ?? 'значение'}» обязательно`,
  required_unless: ({ label }) => `Поле «${label ?? 'значение'}» обязательно`,
}

let customMessages: ValidationMessages = {}

export function setMessages(messages: ValidationMessages): void {
  customMessages = { ...customMessages, ...messages }
}

export function getMessage(ruleName: string, ctx: FieldContext): string {
  const custom = customMessages[ruleName]
  if (custom) return typeof custom === 'function' ? custom(ctx) : custom
  return defaults[ruleName]?.(ctx) ?? `Ошибка валидации: ${ruleName}`
}
