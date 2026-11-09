# 验证码输入

`UidCodeInput` 用于输入一次性验证码——登录确认、双重验证码、邮件中的验证码——每个字符输入到一排独立的格子中。输入后焦点移到下一格，Backspace 返回上一格，粘贴或自动填充的整段验证码会立即分布到各个格子。所有格子填满时触发 `complete`，宿主无需提交按钮即可校验验证码。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidCodeInput } from '@dskripchenko/ui'

const code = ref('')
const invalid = ref(false)
const field = ref<InstanceType<typeof UidCodeInput> | null>(null)

async function verify(value: string): Promise<void> {
  invalid.value = !(await checkCode(value)) // 你自己的请求
  if (invalid.value) {
    field.value?.clear()
    field.value?.focus()
  }
}
</script>

<template>
  <UidCodeInput
    ref="field"
    v-model="code"
    name="code"
    autofocus
    :invalid="invalid"
    @complete="verify"
  />
</template>
```

## 行为

- 输入的字符填入当前格，焦点移到下一格。在已填的格子中输入会替换其字符；格子获得焦点时会选中其内容。
- Backspace 清空当前格；在空格子中则清空上一格并移过去。Delete 原地清空当前格。
- ← 和 → 在格子间移动，Home 和 End 跳到第一格和最后一格。
- 在任意格子中粘贴，或浏览器自动填充整段验证码，都会从第一格开始分布；空格、短横线以及 `mode` 不允许的字符会被丢弃，因此 `123 456` 和 `12-34-56` 都得到 `123456`。较短的验证码会填入前几格并清空其余格子。
- `numeric` 模式只接受数字，手机会显示数字键盘（`inputmode="numeric"`）；`alphanumeric` 模式接受拉丁字母和数字，字母转为大写。
- 第一格带有 `autocomplete="one-time-code"`，iOS 和 Android 会提示通过短信收到的验证码。

值为按顺序排列的已填字符。每个新的完整值只触发一次 `complete`：用户修改完整验证码中的某个字符时会再次触发，从外部设置 `v-model` 时从不触发。

## Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `modelValue` | `string` | `''` | 验证码；配合 `v-model` 使用。`mode` 不允许的字符会被丢弃，其余截断到 `length`。 |
| `length` | `number` | `6` | 格子数量。 |
| `mode` | `'numeric' \| 'alphanumeric'` | `'numeric'` | 格子接受哪些字符。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 格子尺寸：36 × 44、44 × 52 或 52 × 60 px。 |
| `disabled` | `boolean` | `false` | 禁用所有格子。 |
| `invalid` | `boolean` | `false` | 错误样式，并为每个格子设置 `aria-invalid="true"`。 |
| `autofocus` | `boolean` | `false` | 挂载时聚焦第一个空格子。 |
| `name` | `string` | — | 承载完整值的隐藏字段名称，使普通表单能提交它。格子本身没有名称。 |
| `label` | `string` | 语言包 `label` | 分组的无障碍名称。 |
| `id` | `string` | — | 第一格的 id，供外部 `<label for>` 使用。 |

## 事件

| 事件 | 载荷 | |
|---|---|---|
| `update:modelValue` | `string` | 每次变化后触发。 |
| `complete` | `string` | 所有格子都已填满。 |

## 方法

通过模板 ref 调用：`focus()` 聚焦第一个空格子（验证码已完整时聚焦最后一格）；`clear()` 清空所有格子并更新 `v-model`，不移动焦点。

## 无障碍

格子位于 `role="group"` 中，名称来自 `label`（默认为当前语言包的“Verification code”）。每个格子是一个 `<input>`，标签为“Character 2 of 6”。获得焦点的格子显示强调色边框和柔和的光圈（`invalid` 时为错误色）。请在字段旁用文字说明验证码——来源、字符数——并在那里显示错误信息：`invalid` 只会给格子着色。

## 样式

| 变量 | 默认值 | |
|---|---|---|
| `--uid-code-input-cell-width` | `44px` | `md` 下的格子宽度；一行放不下时格子会变窄。 |
| `--uid-code-input-cell-height` | `52px` | `md` 下的格子高度。 |
| `--uid-code-input-font-size` | `22px` | `md` 下的字符大小。 |
| `--uid-code-input-gap` | `--uid-space-sm` | 格子间距。 |
| `--uid-code-input-font` | `--uid-font-family-mono` | 字符字体。 |
| `--uid-code-input-bg`、`--uid-code-input-color` | 表面色、文字色 | 格子的背景和文字。 |
| `--uid-code-input-border`、`--uid-code-input-border-hover`、`--uid-code-input-border-focus` | 主题边框、强调色 | 格子边框。 |
| `--uid-code-input-ring` | `--uid-accent` | 焦点光圈颜色。 |
| `--uid-code-input-radius` | `--uid-radius-md` | 格子圆角。 |

整行在容器中居中。浅色与深色主题来自主题 token。

类型：`UidCodeInputProps`。

## 文本

标签来自语言包的 `codeInput` 部分（参见 [i18n](./i18n.md)）：`label`、`cell(n, total)`。
