# Markdown

`UidMarkdown` 无依赖地渲染 Markdown 文档：带锚点的标题、强调、链接、图片、（嵌套）列表、带对齐的表格、引用、提示框和代码。顶层代码块由 `UidCode` 绘制（高亮、复制按钮）。

```vue
<UidMarkdown :source="text" toc link-base="/docs/zh/" />
```

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `source` | `string` | `''` | Markdown 文本 |
| `toc` | `boolean` | `false` | 根据标题生成目录（右侧固定，窄屏时在顶部） |
| `tocDepth` | `2`–`6` | `3` | 目录中最深的标题级别 |
| `linkBase` | `string` | — | 相对链接据此解析 |
| `tocLabel` | `string` | 本地化 | 目录标题 |
| `stripMdExtension` | `boolean` | 有 `linkBase` 时为 `true` | 去掉相对链接结尾的 `.md` |
| `imageBase` | `string` | — | 相对图片路径据此解析 |
| `calloutTitles` | `Partial<Record<kind, string>>` | 本地化 | 提示框标题（`note`、`tip`、`important`、`warning`、`caution`） |
| `blockRenderers` | `Record<string, UidMarkdownBlockRenderer>` | — | 按语言渲染代码块的渲染器 |

## 安全

源文本在生成任何标记**之前**进行 HTML 转义：原始 HTML 以文本显示，绝不执行。链接和图片只接受 `http(s)`、`mailto`、相对地址和锚点 —— `javascript:`、`data:` 等协议保持为文本。

## 提示框

```md
> [!NOTE]
> GitHub 风格：标记行被替换为来自语言包的标题。

> **Warning** 粗体风格：文本保持原样。
```

类型：`NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`。提示框标题和目录标题来自语言包（`markdown.*`，见 [i18n](./i18n.md)）。

## 代码块渲染器

若某语言注册了渲染器，该语言的代码块由它绘制，而不是 `UidCode` —— 图表、示意图或公式由此接入，组件库本身无需了解它们。

```ts
import { provideMarkdownBlockRenderers, type UidMarkdownBlockRenderer } from '@dskripchenko/ui'
import { render } from '@dskripchenko/diagrams'

const mermaid: UidMarkdownBlockRenderer = (code) => {
  try {
    return { html: render(code).svg }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// 在根组件的 setup 中调用 —— 其下所有 UidMarkdown 都会使用：
provideMarkdownBlockRenderers({ mermaid })
```

- 渲染器接收代码和 `{ language, index }`（在文档代码块中的序号）。
- 返回 `{ html }` 或 `{ error }`，可同步也可为 Promise。Promise 未完成时显示占位；过期渲染（期间源文本已变化）的结果会被丢弃。
- 返回 `error`、抛出异常或 Promise 被拒绝时，代码块以代码形式显示并附提示（`role="alert"`）。
- **`html` 原样插入。** 其安全性由渲染器负责：只返回自己生成、且所有用户文本均已转义的标记。
- `blockRenderers` prop 按语言优先于通过 provide 提供的渲染器。全应用范围：`app.provide(markdownBlockRenderersKey, renderers)`。

## 作为函数使用

同时导出 `renderMarkdown(source, options)` 和 `splitMarkdown(source)` —— 用于组件之外的预览或服务端。选项：`slugger`、`onHeading`、`linkBase`、`stripMdExtension`、`imageBase`、`internalLinksInPlace`、`calloutTitles`。

## 主题

`--uid-markdown-color`、`--uid-markdown-muted`、`--uid-markdown-link`、`--uid-markdown-border`、`--uid-markdown-sunken`、`--uid-markdown-font-size`、`--uid-markdown-line-height`、`--uid-markdown-toc-width` —— 均映射到主题 token，暗色主题无需额外处理。
