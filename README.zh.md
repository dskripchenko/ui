# @dskripchenko/ui

基于 CSS Custom Properties 的 Vue 3 组件、token 与主题库。

[English](./README.md) · [Русский](./README.ru.md) · [Deutsch](./README.de.md) · [**中文**](./README.zh.md)

[![npm](https://img.shields.io/npm/v/@dskripchenko/ui.svg)](https://www.npmjs.com/package/@dskripchenko/ui)
[![bundle](https://img.shields.io/bundlephobia/minzip/@dskripchenko/ui)](https://bundlephobia.com/package/@dskripchenko/ui)
[![license](https://img.shields.io/npm/l/@dskripchenko/ui.svg)](./LICENSE)

> **状态：** 早期开发阶段。`1.0` 之前 API 不稳定。

📖 **Storybook：**[dskripchenko.github.io/ui](https://dskripchenko.github.io/ui/)

## 亮点

- **70+ 组件** — 表单、导航、浮层、数据展示、图表、Patterns、Layouts
- **Vue 3 + TypeScript** — Composition API、`<script setup>`、完整类型
- **CSS 自定义属性** — 不用 CSS-in-JS、Tailwind 或预处理器；一切都是变量
- **Light / Dark 主题** — 通过 `:root` 上的 `data-theme` 切换，便于覆盖
- **可 tree-shake** — 按组件导入，ESM + CJS 构建
- **无障碍** — `:focus-visible`、ARIA 属性、所有交互组件支持键盘
- **i18n** — 内置 `ru` + `en` locale，`UidLocaleProvider` 支持部分覆盖与自定义 locale
- **~1500 图标** — 底层使用 `lucide-vue-next` + 子导出 `@dskripchenko/ui/icons`
- **零图表运行时依赖** — 内置 SVG 原语(Sparkline、ProgressRing、Gauge、Heatmap)

## 安装

```bash
pnpm add @dskripchenko/ui
# 或
npm install @dskripchenko/ui
```

## 快速开始

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

import '@dskripchenko/ui/styles/tokens.css'
import '@dskripchenko/ui/styles/themes.css'

createApp(App).mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { UidButton, UidIcon, UidLocaleProvider, en } from '@dskripchenko/ui'
import { Check } from '@dskripchenko/ui/icons'
</script>

<template>
  <UidLocaleProvider :locale="en">
    <UidButton variant="primary">
      <UidIcon :icon="Check" /> 保存
    </UidButton>
  </UidLocaleProvider>
</template>
```

通过 `<html>` 上的属性切换主题：

```html
<html data-theme="dark">
```

## 内容速览

精简列表 — 完整目录在 [Storybook](https://dskripchenko.github.io/ui/)。

**表单与输入：** Button、Input、Textarea、NumberInput、Checkbox、Radio、Switch、Label、FormField、Select、Combobox、TagsInput、DatePicker、DateRangePicker、TimePicker、ColorPicker、Slider、Rating、FileUpload、Mention、TreeSelect、Cascader

**反馈：** Spinner、Skeleton、Badge、Alert、Progress、Toast、Tour

**浮层：** Modal、Drawer、Tooltip、Popover、Menu、Command

**导航：** Tabs、Breadcrumb、Link、Pagination(+ Cursor / LoadMore / InfiniteScroll / PageSize)、BackTop、Affix、Anchor

**数据展示：** Card、Avatar、AvatarGroup、Tag、Divider、Accordion、Table、VirtualList、Stat、DescriptionList、Timeline、TreeView、Code、Watermark、Carousel、Calendar、NotificationBadge

**布局辅助：** Stack、Grid、Container、Splitter

**图表：** Sparkline、ProgressRing、Gauge、Heatmap

**Wizards：** Stepper、Wizard、WizardStep

**Patterns：** Header、Footer、Sidebar、PageHeader、EmptyState、ErrorState、Result

**Layouts：** SimpleLayout、SidebarLayout、AuthLayout、WizardLayout

**Composables：** useTheme、useLocale、useField、useToast、useWizard、useSidebar、useCommandPalette、useFocusTrap、useScrollLock、usePopover

## 文档

用户文档已译为四种语言 — 选择你的：

- 🇬🇧 **English**(default)：[docs/en/](./docs/en/)
- 🇷🇺 **Русский**：[docs/ru/](./docs/ru/)
- 🇩🇪 **Deutsch**：[docs/de/](./docs/de/)
- 🇨🇳 **中文**：[快速开始](./docs/zh/getting-started.md)、[主题](./docs/zh/theming.md)、[Tokens](./docs/zh/tokens.md)、[图标](./docs/zh/icons.md)、[Patterns](./docs/zh/patterns.md)、[表单校验](./docs/zh/validation.md)、[图表](./docs/zh/charts.md)、[i18n](./docs/zh/i18n.md)

贡献者文档(仅英文)：[Architecture](./docs/ARCHITECTURE.md)、[Component guidelines](./docs/COMPONENT_GUIDELINES.md)、[Contributing](./docs/CONTRIBUTING.md)、[Roadmap](./docs/ROADMAP.md)。

## 主题

所有颜色、间距、字体都是 CSS 变量。覆盖主题——在 `:root` 或容器上设置 token：

```css
:root[data-theme='dark'] {
  --uid-color-primary: #8b5cf6;
  --uid-color-bg: #0a0a0a;
}
```

详见 [主题](./docs/zh/theming.md) 与 [Tokens](./docs/zh/tokens.md)。

## 图标

子导出 `@dskripchenko/ui/icons` re-export 了全部 ~1500 个 Lucide 图标：

```ts
import { UidIcon } from '@dskripchenko/ui'
import { Heart, Star } from '@dskripchenko/ui/icons'
```

详见 [图标](./docs/zh/icons.md)。

## 开发

```bash
pnpm install
pnpm dev               # Storybook，端口 6006
pnpm test              # Vitest
pnpm build             # 库构建
pnpm build-storybook   # Storybook → storybook-static
pnpm build:analyze     # Bundle visualizer
pnpm changeset         # 描述下一次发布的变更
```

## 许可证

MIT
