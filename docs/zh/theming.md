# 主题

组件库默认提供 `light` 和 `dark` 主题。其余一切都是通过覆盖 CSS 变量实现的。

## 原则

1. **原始 token**(原始调色板)在主题之间**不变**。
2. **语义 token**(`--uid-surface-*`、`--uid-text-*`、`--uid-border-*` 等)在 `:root[data-theme='light']` 与 `:root[data-theme='dark']` 下被**覆盖**。
3. 组件**只**引用语义 token，绝不直接使用原始 token。因此切换主题除了切换属性外不需要任何额外操作。

## 接入

```ts
import '@dskripchenko/ui/styles/tokens.css'   // 原始
import '@dskripchenko/ui/styles/themes.css'   // light + dark
import '@dskripchenko/ui/styles/reset.css'    // 可选
```

在根元素上设置属性：

```html
<html data-theme="light">
```

## 调色板

基础主题构建在三层之上：

- **Zinc** — 中性基底。暖灰，不冷峻。决定整个 UI 的"温度"。
- **Teal** — 强调色。安静到不至于喧嚣，鲜明到能引导视线。
- **Soft dark** (`#1c1c1e`) — iOS/macOS 风格的深色主题。不是纯黑，而是柔和的炭黑，看着舒服。

语义颜色(danger / success / warning)有意压低饱和度；高饱和版本仅用于深色主题，那里对比度更重要。

## 主题结构

```css
:root[data-theme='light'] {
  --uid-surface-base:     var(--uid-color-zinc-50);
  --uid-surface-raised:   var(--uid-color-white);
  --uid-surface-overlay:  var(--uid-color-white);

  --uid-text-primary:     var(--uid-color-zinc-900);
  --uid-text-secondary:   var(--uid-color-zinc-500);
  --uid-text-tertiary:    var(--uid-color-zinc-400);

  --uid-border-subtle:    var(--uid-color-zinc-200);
  --uid-border-default:   var(--uid-color-zinc-300);

  --uid-accent:           var(--uid-color-teal-500);
  --uid-accent-hover:     var(--uid-color-teal-600);
  --uid-accent-subtle:    var(--uid-color-teal-50);

  --uid-danger:           var(--uid-color-rose-600);
  --uid-success:          var(--uid-color-emerald-600);
  --uid-warning:          var(--uid-color-amber-600);
}

:root[data-theme='dark'] {
  --uid-surface-base:     #1c1c1e;
  --uid-surface-raised:   #2c2c2e;
  --uid-surface-overlay:  #3a3a3c;

  --uid-text-primary:     var(--uid-color-zinc-100);
  --uid-text-secondary:   var(--uid-color-zinc-400);

  --uid-accent:           var(--uid-color-teal-400);
  --uid-danger:           var(--uid-color-rose-400);
  --uid-success:          var(--uid-color-emerald-400);
  --uid-warning:          var(--uid-color-amber-400);
}
```

## 默认值与 `prefers-color-scheme`

组件库**不会替你选择主题**。无 `data-theme` 时，应用 `:root` 默认值(等同于 `light`)。

要跟随系统主题，请在应用层处理：

```ts
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light'
```

组件库提供 `useTheme()` composable，封装了属性读写和系统偏好订阅。

## 用户的选择：`useColorTheme()`

`useColorTheme()` 在 `useTheme()` 之上保存用户的选择 —— `light`、`dark` 或 `system`：存于 `localStorage`（键 `theme`，`COLOR_THEME_STORAGE_KEY`）以便下次首屏渲染；传入 `save` 时，同时保存到用户所有应用都读取的地方。选择为 `system` 时，页面跟随系统变化。

```ts
import { useColorTheme } from '@dskripchenko/ui'

const { theme, choice, init, choose, toggle, adopt } = useColorTheme({
  save: (choice) => api.savePreferences({ theme: choice }),
})

init()                       // 启动时：已记住的选择
choose('dark')               // 在此处选择：应用、记住、保存
adopt(session.preferences.theme) // 在其他应用中选择：应用，不回写
```

`choose()` 与 `toggle()` 会调用 `save`；`adopt()` 不会，且忽略未知的值。整个页面共享同一状态。

## 静默登录

共享同一 OpenID Connect 提供方的应用，可让已在其中一个应用登录的用户无需点击“登录”即可进入下一个：应用服务器以 `prompt=none` 发起登录。`shouldSignInSilently()` 在导航时判断，`silentSignInUrl()` 返回发起地址 —— 仅对服务器提供该选项的访客生效，退出后（`?out`）或带有失败原因（`?sso`）时不生效。

## 自定义主题

定义自己的主题——只是另一个选择器：

```css
:root[data-theme='midnight'] {
  --uid-surface-base:   #0d0b1f;
  --uid-text-primary:   #e0d8ff;
  --uid-accent:         #b794f4;
  /* 其余可继承 dark */
}
```

```html
<html data-theme="midnight">
```

规则：**只覆盖语义变量**，不要碰原始 token。

## 单组件覆盖

每个组件都有本地变量，回退到语义。可以在作用域内覆盖：

```css
.landing-cta .uid-button {
  --uid-button-radius: 999px;
  --uid-button-bg: linear-gradient(90deg, #f43f5e, #f59e0b);
}
```

这不会破坏主题——覆盖只在选择器范围内生效。

例如，更紧凑的表格可以缩小单元格内边距：

```css
.issues .uid-table {
  --uid-table-head-padding-y: 8px;
  --uid-table-cell-padding-y: 6px;
  --uid-table-cell-padding-x: 12px;
}
```

## 打印

在纸面上（`@media print`），嵌在页面中的组件按内容而非控件打印：看板的筛选、操作、锁定和添加按钮，
日历的视图切换与翻页箭头、事件日历的操作，代码块的复制按钮以及视频的控制栏都会隐藏；看板的列平分页面宽度而不是横向滚动，
卡片不会被拆到两页；markdown 文档以单栏打印、不含目录，标题不会与其后的内容分开；代码块显示所有行并自动换行。

## Storybook

`@storybook/addon-themes` 工具栏切换 story iframe 上的 `data-theme`：

```ts
import { withThemeByDataAttribute } from '@storybook/addon-themes'

export const decorators = [
  withThemeByDataAttribute({
    themes: { light: 'light', dark: 'dark' },
    defaultTheme: 'light',
    attributeName: 'data-theme',
  }),
]
```

每个组件在 Storybook 中都必须在两种主题下表现正确——这是 Definition of Done 的一部分。

## 反模式

- ❌ 在组件样式中硬编码颜色(`color: #333`)。
- ❌ 在组件中直接使用原始 token(`color: var(--uid-color-neutral-900)`)。
- ❌ 通过 `class="dark"` 切换主题——我们使用 `data-theme`，不要混用。
- ❌ 在组件中放置 JS 主题逻辑。主题是 CSS；组件对主题一无所知。
