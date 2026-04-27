# Валидация форм

Механизм валидации построен на трёх принципах Laravel-подхода: декларативные правила, компонуемость, расширяемость. Реализован через composables без компонента-обёртки.

## Архитектура

```
src/utils/validation/
  types.ts        # RuleFn, RuleInput, FieldContext, ValidationMessages
  rules.ts        # встроенные правила
  parseRules.ts   # парсер строковой нотации
  messages.ts     # дефолтные сообщения + глобальный реестр

src/composables/
  useField.ts     # валидация одного поля
  useForm.ts      # валидация формы, контекст для cross-field правил
```

Компоненты (`UidInput`, `UidSelect`, `UidCheckbox` и др.) принимают проп `rules` и внутренне используют `useField`.

## Типы

```ts
// Контекст, который получает каждое правило при вызове
interface FieldContext {
  field: string                        // имя поля (из useForm или проп name)
  label?: string                       // для подстановки в сообщение
  form?: Record<string, unknown>       // значения соседних полей (только в useForm)
}

// Функция-правило: возвращает true (успех) или строку (ошибка)
type RuleFn = (value: unknown, ctx: FieldContext) => true | string

// Входной формат правил — три равнозначных варианта
type RuleInput = string | RuleFn | (string | RuleFn)[]
```

## Форматы правил

Три формата взаимозаменяемы и смешиваемы:

```ts
// 1. Строка — pipe-нотация (как Laravel)
rules="required|email|max:255"

// 2. Массив строк
:rules="['required', 'email', 'max:255']"

// 3. Массив функций — для кастомных и параметризованных правил
:rules="[required(), email(), max(255)]"

// 4. Смешанный
:rules="['required', email(), max(255), myCustomRule]"
```

Строковые правила с параметрами: `'min:8'`, `'max:255'`, `'min_value:0'`, `'regex:^[a-z]+$'`, `'in:admin,user,guest'`.

## Встроенные правила

| Правило | Строка | Функция | Описание |
|---|---|---|---|
| Required | `required` | `required()` | Не пусто (не `''`, `null`, `undefined`) |
| Nullable | `nullable` | `nullable()` | Пропускает валидацию, если значение пусто |
| Email | `email` | `email()` | Формат email |
| URL | `url` | `url()` | Формат URL |
| Numeric | `numeric` | `numeric()` | Число (целое или дробное) |
| Integer | `integer` | `integer()` | Целое число |
| Min length | `min:n` | `min(n)` | Минимальная длина строки или массива |
| Max length | `max:n` | `max(n)` | Максимальная длина строки или массива |
| Min value | `min_value:n` | `minValue(n)` | Числовой минимум |
| Max value | `max_value:n` | `maxValue(n)` | Числовой максимум |
| Regex | `regex:pattern` | `regex(pattern)` | Соответствие регулярному выражению |
| In | `in:a,b,c` | `inList([a, b, c])` | Значение из списка |
| Same as | `same_as:field` | `sameAs(field)` | Совпадает с другим полем (требует `useForm`) |
| Required if | `required_if:field,value` | `requiredIf(field, value)` | Обязательно, если другое поле равно значению |
| Required unless | `required_unless:field,value` | `requiredUnless(field, value)` | Обязательно, если другое поле не равно значению |

## Стратегия trigger: eager

Дефолтная стратегия и единственная публично документируемая.

**Поведение:**
1. До первого `blur` — валидация не запускается (пользователь ещё вводит).
2. После `blur` — поле становится "грязным", запускается валидация.
3. После первой ошибки — валидация запускается на каждый `input` (пользователь видит исправление в реальном времени).
4. При сабмите формы — принудительная валидация всех полей независимо от состояния.

```
[ввод] → (не валидируем)
[blur] → валидируем → ошибка
[ввод] → валидируем → ошибка исчезает по мере исправления
[submit] → валидируем все поля
```

## useField

Валидация одного поля. Используется напрямую для кастомных контролов.

```ts
import { useField } from '@dskripchenko/ui'

const value = ref('')

const { error, isDirty, validate, reset, fieldProps } = useField(value, {
  rules: 'required|email',
  label: 'Email',
  name: 'email',
})
```

### Параметры

```ts
interface UseFieldOptions {
  rules?: RuleInput
  label?: string    // подставляется в сообщения вместо имени поля
  name?: string     // имя поля, передаётся в FieldContext
}

function useField(
  value: Ref<unknown>,
  options?: UseFieldOptions,
): UseFieldReturn
```

### Возвращает

```ts
interface UseFieldReturn {
  error: Ref<string | null>      // текущая ошибка
  isDirty: Ref<boolean>          // был ли blur хотя бы раз
  validate: () => boolean        // ручной запуск, возвращает isValid
  reset: () => void              // сбрасывает error и isDirty

  // события для привязки к элементу вручную (если не использовать компонент)
  fieldProps: ComputedRef<{
    onBlur: () => void
    onInput: () => void
  }>
}
```

### Пример с кастомным контролом

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useField } from '@dskripchenko/ui'

const value = ref('')
const { error, fieldProps } = useField(value, { rules: 'required|min:3' })
</script>

<template>
  <div>
    <input v-model="value" v-bind="fieldProps" />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
```

## useForm

Координирует несколько полей, передаёт контекст для cross-field правил.

```ts
import { ref } from 'vue'
import { useForm, sameAs } from '@dskripchenko/ui'

const password = ref('')
const confirm  = ref('')

const form = useForm({
  fields: {
    email:    { value: ref(''), rules: 'required|email', label: 'Email' },
    password: { value: password, rules: 'required|min:8', label: 'Пароль' },
    confirm:  { value: confirm,  rules: ['required', sameAs('password')], label: 'Подтверждение' },
  },
})

async function submit() {
  if (!form.validate()) return
  // все поля валидны
}
```

### Параметры

```ts
interface FormFieldConfig {
  value: Ref<unknown>
  rules?: RuleInput
  label?: string
}

interface UseFormOptions {
  fields: Record<string, FormFieldConfig>
}

function useForm(options: UseFormOptions): UseFormReturn
```

### Возвращает

```ts
interface UseFormReturn {
  errors:  ComputedRef<Record<string, string | null>>  // все ошибки
  isValid: ComputedRef<boolean>                        // нет ни одной ошибки
  isDirty: ComputedRef<boolean>                        // хотя бы одно поле грязное

  validate: () => boolean   // валидирует все поля, помечает все dirty
  reset:    () => void      // сбрасывает все поля

  // доступ к состоянию отдельного поля
  field: (name: string) => UseFieldReturn
}
```

## Кастомные правила

Правило — функция `(value, ctx) => true | string`. Возвращает `true` при успехе, строку с ошибкой при неудаче.

```ts
// Простое правило
const noSpaces: RuleFn = (value) =>
  !String(value).includes(' ') || 'Пробелы не допускаются'

// Параметризованное правило (фабрика)
const startsWith = (prefix: string): RuleFn => (value) =>
  String(value).startsWith(prefix) || `Должно начинаться с "${prefix}"`

// Использование
:rules="[required(), noSpaces, startsWith('https')]"
```

### Cross-field правило

```ts
const sameAs = (fieldName: string): RuleFn => (value, ctx) => {
  if (!ctx.form) return true  // вне useForm — пропускаем
  return value === ctx.form[fieldName] || 'Значения не совпадают'
}
```

### Nullable — остановка цепочки

Правило `nullable` прерывает дальнейшую валидацию, если значение пустое. Аналог Laravel `nullable`:

```ts
// email необязателен, но если введён — должен быть валидным
:rules="'nullable|email|max:255'"
```

## Сообщения

### Дефолтные

Дефолтные сообщения живут в `src/utils/validation/messages.ts`. Поддерживают подстановку параметров:

```ts
const defaultMessages: ValidationMessages = {
  required:     ({ label }) => `Поле «${label ?? 'значение'}» обязательно`,
  email:        () => 'Введите корректный email',
  min:          ({ params }) => `Минимум ${params[0]} символов`,
  max:          ({ params }) => `Максимум ${params[0]} символов`,
  min_value:    ({ params }) => `Значение не менее ${params[0]}`,
  max_value:    ({ params }) => `Значение не более ${params[0]}`,
  same_as:      () => 'Значения не совпадают',
  // ...
}
```

### Глобальное переопределение

При установке плагина:

```ts
import { createUikit } from '@dskripchenko/ui'

app.use(createUikit({
  validation: {
    messages: {
      required: 'Обязательное поле',
      email:    'Некорректный email',
      min:      ({ params }) => `Не менее ${params[0]} символов`,
    },
  },
}))
```

### Переопределение на уровне правила

```ts
// Фабрика принимает кастомное сообщение последним аргументом
:rules="[required('Пожалуйста, заполните поле'), max(100, 'Слишком длинно')]"
```

**Приоритет:** правило > глобальный реестр > дефолт.

## Интеграция с компонентами

Компоненты (`UidInput`, `UidSelect`, и др.) принимают те же пропсы что и `useField`:

```ts
interface ValidatableProps {
  rules?: RuleInput
  name?:  string     // для cross-field правил в useForm
  label?: string     // для подстановки в сообщения
}
```

Ошибка отображается под полем через `UidField` — общую обёртку с label, hint и error-слотом.

При использовании с `useForm` компонент должен получить `name` совпадающий с ключом поля в форме — тогда cross-field правила работают автоматически через provide/inject.

```vue
<template>
  <form @submit.prevent="submit">
    <UidInput v-model="form.field('email').value"  name="email"    rules="required|email" label="Email" />
    <UidInput v-model="form.field('password').value" name="password" rules="required|min:8" label="Пароль" />
    <UidInput v-model="form.field('confirm').value"  name="confirm"
      :rules="['required', sameAs('password')]" label="Подтверждение" />

    <UidButton type="submit" :disabled="!form.isValid.value">Отправить</UidButton>
  </form>
</template>
```

## Структура файлов

```
src/
  utils/
    validation/
      types.ts        # RuleFn, RuleInput, FieldContext, ValidationMessages
      rules.ts        # все встроенные правила (фабрики)
      parseRules.ts   # парсер строки 'required|email|max:255' → RuleFn[]
      messages.ts     # дефолтные сообщения + глобальный реестр (provide/inject)
  composables/
    useField.ts
    useForm.ts
  index.ts            # экспорт: useField, useForm, все правила, типы
```

## Что не входит в v1

- **Async-правила** (проверка уникальности через API) — добавляются позже без изменения API: `RuleFn` уже возвращает `true | string`, расширение до `Promise<true | string>` обратно совместимо.
- **Schema-валидация** (Zod, Yup) — при необходимости адаптируется через обёртку в `RuleFn`.
- **Серверные ошибки** — устанавливаются вручную через `field('email').setError('Уже занят')` (метод добавляется при необходимости).
