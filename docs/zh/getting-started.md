# 快速开始

## 安装

```bash
pnpm add @dskripchenko/ui
# 或 npm install @dskripchenko/ui
```

Vue 3.4+ 是 peer 依赖。Lucide 图标已随包提供。

## 引入样式

在应用入口处引入样式表：

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

import '@dskripchenko/ui/styles/tokens.css'   // 原始设计 token
import '@dskripchenko/ui/styles/themes.css'   // light + dark 语义 token
import '@dskripchenko/ui/styles/reset.css'    // 可选：极简 reset

createApp(App).mount('#app')
```

如果你的应用已有 CSS reset，可以省略 `reset.css`。`tokens.css` 和 `themes.css` 是必需的。

## 第一个组件

```vue
<script setup lang="ts">
import { UidButton, UidIcon } from '@dskripchenko/ui'
import { Check } from '@dskripchenko/ui/icons'
</script>

<template>
  <UidButton variant="primary">
    <UidIcon :icon="Check" /> 保存
  </UidButton>
</template>
```

就这样 — 无需全局注册或安装插件。每个组件都是独立的 Vue 组件。

## 主题

组件库自带 `light` 和 `dark` 两套主题，通过 `<html>`(或任意祖先元素)上的 `data-theme` 属性切换:

```html
<html data-theme="dark">
```

不带该属性时使用 light 主题。详见 [主题](./theming.md) 中的主题切换、自定义主题及 `useTheme()`。

## 语言

默认情况下，所有内置组件文案为俄文。要切换为英文(或其他语言)，用 `UidLocaleProvider` 包裹应用：

```vue
<script setup lang="ts">
import { UidLocaleProvider, en } from '@dskripchenko/ui'
</script>

<template>
  <UidLocaleProvider :locale="en">
    <App />
  </UidLocaleProvider>
</template>
```

详见 [i18n](./i18n.md) 中的部分覆盖与自定义 locale。

## 表单

组件库内置一个轻量校验器(`useField`、`useForm`)，简单场景下无需独立的表单库。详见 [表单校验](./validation.md)。

```vue
<UidInput v-model="email" rules="required|email" label="邮箱" />
```

## 下一步

- **[主题](./theming.md)** — 颜色、主题、自定义调色板
- **[Tokens](./tokens.md)** — 设计 token 参考(间距、排版、圆角…)
- **[图标](./icons.md)** — `UidIcon` 与 1500+ Lucide 图标
- **[Patterns 与 Layouts](./patterns.md)** — Header、Sidebar、Wizard、页面模板
- **[表单校验](./validation.md)** — 表单校验
- **[图表](./charts.md)** — Sparkline、ProgressRing、Gauge、Heatmap
- **[i18n](./i18n.md)** — 多语言支持

完整在线目录见 [Storybook 站点](https://dskripchenko.github.io/ui/)。
