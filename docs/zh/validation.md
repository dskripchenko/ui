# 表单校验

受 Laravel 启发的轻量内置校验器：声明式规则、可组合、可扩展。基于 composables 实现——无需包装组件。

## 架构

```
src/utils/validation/
  types.ts        # RuleFn、RuleInput、FieldContext、ValidationMessages
  rules.ts        # 内置规则
  parseRules.ts   # 字符串记法解析器
  messages.ts     # 默认消息 + 全局注册表

src/composables/
  useField.ts     # 单字段校验
  useForm.ts      # 整表校验，跨字段规则的 context
```

组件(`UidInput`、`UidSelect`、`UidCheckbox` 等)接受 `rules` prop 并内部使用 `useField`。

## 类型

```ts
// 每条规则收到的 context
interface FieldContext {
  field: string                        // 字段名(来自 useForm 或 `name` prop)
  label?: string                       // 用于消息替换
  form?: Record<string, unknown>       // 兄弟字段值(仅 useForm 中可用)
}

// 规则：成功返回 true，否则返回错误字符串
type RuleFn = (value: unknown, ctx: FieldContext) => true | string

// 三种等价输入格式
type RuleInput = string | RuleFn | (string | RuleFn)[]
```

## 规则格式

```ts
// 1. 管道字符串(类 Laravel)
rules="required|email|max:255"

// 2. 字符串数组
:rules="['required', 'email', 'max:255']"

// 3. 函数数组——用于自定义和参数化规则
:rules="[required(), email(), max(255)]"

// 4. 混合
:rules="['required', email(), max(255), myCustomRule]"
```

带参数的字符串规则：`'min:8'`、`'max:255'`、`'min_value:0'`、`'regex:^[a-z]+$'`、`'in:admin,user,guest'`。

## 内置规则

| 规则 | 字符串 | 函数 | 描述 |
|---|---|---|---|
| Required | `required` | `required()` | 非空(非 `''`、`null`、`undefined`) |
| Nullable | `nullable` | `nullable()` | 值为空时跳过校验 |
| Email | `email` | `email()` | 邮箱格式 |
| URL | `url` | `url()` | URL 格式 |
| Numeric | `numeric` | `numeric()` | 数字(整数或小数) |
| Integer | `integer` | `integer()` | 整数 |
| Min length | `min:n` | `min(n)` | 字符串/数组最小长度 |
| Max length | `max:n` | `max(n)` | 字符串/数组最大长度 |
| Min value | `min_value:n` | `minValue(n)` | 数值下限 |
| Max value | `max_value:n` | `maxValue(n)` | 数值上限 |
| Regex | `regex:pattern` | `regex(pattern)` | 正则匹配 |
| In | `in:a,b,c` | `inList([a, b, c])` | 值属于列表 |
| Same as | `same_as:field` | `sameAs(field)` | 等于另一字段(需 `useForm`) |
| Required if | `required_if:field,value` | `requiredIf(field, value)` | 当另一字段等于值时必填 |
| Required unless | `required_unless:field,value` | `requiredUnless(field, value)` | 当另一字段不等于值时必填 |

## 触发策略：eager

默认且唯一公开文档化的策略。

1. 首次 `blur` 之前 — 不校验(用户还在输入)。
2. `blur` 后 — 字段标记为 "dirty"，开始校验。
3. 出现首个错误后 — 每次 `input` 都校验(用户实时看到修正)。
4. 表单提交时 — 强制校验所有字段，无视状态。

## `useField`

单字段校验。可直接用于自定义控件。

```ts
import { ref } from 'vue'
import { useField } from '@dskripchenko/ui'

const value = ref('')

const { error, isDirty, validate, reset, fieldProps } = useField(value, {
  rules: 'required|email',
  label: '邮箱',
  name: 'email',
})
```

```ts
interface UseFieldOptions {
  rules?: RuleInput
  label?: string
  name?: string
}

interface UseFieldReturn {
  error: Ref<string | null>
  isDirty: Ref<boolean>
  validate: () => boolean
  reset: () => void
  fieldProps: ComputedRef<{ onBlur: () => void; onInput: () => void }>
}
```

### 自定义控件示例

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

## `useForm`

协调多个字段，为跨字段规则提供 context。

```ts
import { ref } from 'vue'
import { useForm, sameAs } from '@dskripchenko/ui'

const password = ref('')
const confirm  = ref('')

const form = useForm({
  fields: {
    email:    { value: ref(''), rules: 'required|email', label: '邮箱' },
    password: { value: password, rules: 'required|min:8', label: '密码' },
    confirm:  { value: confirm,  rules: ['required', sameAs('password')], label: '确认密码' },
  },
})

async function submit() {
  if (!form.validate()) return
  // 所有字段已通过校验
}
```

```ts
interface UseFormReturn {
  errors:  ComputedRef<Record<string, string | null>>
  isValid: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>

  validate: () => boolean
  reset:    () => void

  field: (name: string) => UseFieldReturn
}
```

## 自定义规则

规则是函数 `(value, ctx) => true | string`。成功返回 `true`，失败返回错误字符串。

```ts
// 简单规则
const noSpaces: RuleFn = (value) =>
  !String(value).includes(' ') || '不允许出现空格'

// 参数化(工厂)
const startsWith = (prefix: string): RuleFn => (value) =>
  String(value).startsWith(prefix) || `必须以 "${prefix}" 开头`

:rules="[required(), noSpaces, startsWith('https')]"
```

### 跨字段规则

```ts
const sameAs = (fieldName: string): RuleFn => (value, ctx) => {
  if (!ctx.form) return true  // 在 useForm 之外 — 跳过
  return value === ctx.form[fieldName] || '两次输入不一致'
}
```

### Nullable — 链式停止

`nullable` 在值为空时短路后续校验：

```ts
:rules="'nullable|email|max:255'"
```

## 消息

### 默认值

默认消息位于 `src/utils/validation/messages.ts`，支持参数替换：

```ts
const defaultMessages: ValidationMessages = {
  required:  ({ label }) => `字段 "${label ?? '值'}" 必填`,
  email:     () => '请输入有效邮箱',
  min:       ({ params }) => `至少 ${params[0]} 个字符`,
  max:       ({ params }) => `最多 ${params[0]} 个字符`,
}
```

### 单规则覆盖

```ts
:rules="[required('请填写此字段'), max(100, '太长了')]"
```

**优先级：**规则 > 全局注册 > 默认。

## 组件集成

表单输入组件接受与 `useField` 相同的形态：

```ts
interface ValidatableProps {
  rules?: RuleInput
  name?:  string
  label?: string
}
```

错误通过 `UidFormField` 渲染在字段下方——这是带 label、hint 和 error slot 的包装。

与 `useForm` 一起使用时，组件应收到与表单字段键一致的 `name` ——跨字段规则会通过 provide/inject 自动工作。

```vue
<form @submit.prevent="submit">
  <UidInput v-model="form.field('email').value"    name="email"    rules="required|email" label="邮箱" />
  <UidInput v-model="form.field('password').value" name="password" rules="required|min:8" label="密码" />
  <UidInput v-model="form.field('confirm').value"  name="confirm"
    :rules="['required', sameAs('password')]" label="确认密码" />

  <UidButton type="submit" :disabled="!form.isValid">提交</UidButton>
</form>
```

## v1 不包含

- **异步规则**(通过 API 检查唯一性) — 后续以非破坏方式加入：`RuleFn` 已返回 `true | string`，扩展为 `Promise<true | string>` 向后兼容。
- **Schema 校验**(Zod、Yup) — 按需通过 `RuleFn` 包装适配。
- **服务器错误** — 通过 `field('email').setError('已被占用')` 手动设置(按需添加 helper)。
