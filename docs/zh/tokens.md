# 设计 Token

组件库中所有视觉值都通过 CSS Custom Properties 暴露。带来的好处是：无需重新构建即可换主题、运行时定制、单一事实来源。

## 三层模型

```
primitive  →  semantic  →  component
```

### 1. Primitive(原始)

无"在何处使用"语义的原始值。与主题无关。

```css
:root {
  /* Zinc — 中性基底 */
  --uid-color-zinc-50:   #fafafa;
  --uid-color-zinc-100:  #f4f4f5;
  --uid-color-zinc-200:  #e4e4e7;
  --uid-color-zinc-300:  #d4d4d8;
  --uid-color-zinc-400:  #a1a1aa;
  --uid-color-zinc-500:  #71717a;
  --uid-color-zinc-600:  #52525b;
  --uid-color-zinc-700:  #3f3f46;
  --uid-color-zinc-800:  #27272a;
  --uid-color-zinc-900:  #18181b;
  --uid-color-zinc-950:  #09090b;

  /* Teal — 强调色 */
  --uid-color-teal-400:  #2dd4bf;
  --uid-color-teal-500:  #14b8a6;
  --uid-color-teal-600:  #0d9488;
  /* … */

  /* Rose / Emerald / Amber 用于 danger / success / warning */
}
```

这些值**绝不在组件中直接使用**。

### 2. Semantic(语义)

描述含义而非颜色：「凸起表面」「主要文本」「细微边框」。它们随主题变化。

```css
:root[data-theme='light'] {
  --uid-surface-base:     var(--uid-color-zinc-50);
  --uid-surface-raised:   var(--uid-color-white);

  --uid-text-primary:     var(--uid-color-zinc-900);
  --uid-text-secondary:   var(--uid-color-zinc-500);

  --uid-border-default:   var(--uid-color-zinc-300);

  --uid-accent:           var(--uid-color-teal-500);
  --uid-danger:           var(--uid-color-rose-600);
  --uid-success:          var(--uid-color-emerald-600);
  --uid-warning:          var(--uid-color-amber-600);
}
```

主题就是覆盖这一层。

### 3. Component(组件级)

组件本地"旋钮"。带回退到语义 token。需要定制单个组件时覆盖它们。

```css
.uid-button {
  --uid-button-bg:       var(--uid-accent);
  --uid-button-bg-hover: var(--uid-accent-hover);
  --uid-button-color:    var(--uid-text-on-accent);
  --uid-button-radius:   var(--uid-radius-md);
}
```

外部覆盖 — 无需 `!important`：

```css
.my-page .uid-button {
  --uid-button-radius: 999px;
}
```

## 类别

| 类别 | 前缀 | 文件 | 备注 |
|---|---|---|---|
| 颜色(原始) | `--uid-color-*` | `tokens/colors.css` | Zinc / Teal / Rose / Emerald / Amber |
| 颜色(语义) | `--uid-surface-*`、`--uid-text-*`、`--uid-border-*`、`--uid-accent-*` 等 | `styles/themes.css` | 主题间不同 |
| 排版 | `--uid-font-*` | `tokens/typography.css` | 默认 Inter |
| 间距 | `--uid-space-*` | `tokens/spacing.css` | xs/sm/md/lg/xl/2xl/3xl，4 px 步进 |
| 尺寸 | `--uid-size-*` | `tokens/sizing.css` | sm=32 / md=40 / lg=48 |
| 断点 | `--uid-bp-*` | `tokens/breakpoints.css` | sm/md/lg/xl/2xl，移动优先 |
| 圆角 | `--uid-radius-*` | `tokens/radius.css` | none/sm/md/lg/full |
| 阴影 | `--uid-shadow-*` | `styles/themes.css` | sm/md/lg，主题感知 |
| 动效 | `--uid-duration-*`、`--uid-ease-*` | `tokens/motion.css` | fast/base/slow + 缓动 |
| Z-index | `--uid-z-*` | `tokens/z-index.css` | dropdown/sticky/overlay/modal/toast/tooltip |

## 命名约定

- 始终使用 `--uid-` 前缀。
- 类别紧随前缀：`--uid-{category}-{variant}-{tone?}`。
- 状态作为后缀：`-hover`、`-active`、`-disabled`、`-focus`。
- 尺寸使用 t-shirt 命名(`xs/sm/md/lg/xl`)，避免与具体像素值耦合。

## 间距

步长 **4 px**，t-shirt 命名。不使用数字。

```css
:root {
  --uid-space-0:    0;
  --uid-space-2xs:  2px;
  --uid-space-xs:   4px;
  --uid-space-sm:   8px;
  --uid-space-md:   16px;
  --uid-space-lg:   24px;
  --uid-space-xl:   32px;
  --uid-space-2xl:  48px;
  --uid-space-3xl:  64px;
}
```

12 px 和 20 px 不是 token——组件内需要时使用带显式值的本地 CSS 变量。

## 尺寸

所有交互元素的统一高度：

```css
:root {
  --uid-size-sm:  32px;
  --uid-size-md:  40px;  /* 默认 */
  --uid-size-lg:  48px;
}
```

## 圆角

刻度有意保持小——五个值，多数组件使用一个。

| Token | 值 | 用于 |
|---|---|---|
| `--uid-radius-none` | 0 | 表格、分隔线、代码块 |
| `--uid-radius-sm` | 3 px | Badge、tag、tooltip、checkbox |
| `--uid-radius-md` | 6 px | **默认** — 按钮、输入框、下拉框 |
| `--uid-radius-lg` | 10 px | 卡片、模态框、弹出层 |
| `--uid-radius-full` | 9999 px | 头像、胶囊标签——慎用 |

## 断点

**移动优先**(`min-width`)。基础样式不带媒体查询，从小到大覆盖。

```css
:root {
  --uid-bp-sm:   480px;
  --uid-bp-md:   768px;
  --uid-bp-lg:   1024px;
  --uid-bp-xl:   1280px;
  --uid-bp-2xl:  1536px;
}
```

CSS 自定义属性**不能在 `@media` 中使用**——值作为文档常量重复出现，并直接使用：

```css
@media (min-width: 768px) { … }            /* OK */
@media (min-width: var(--uid-bp-md)) { … }  /* 不工作 */
```

## 排版

默认字体 — **Inter**。中性、屏幕可读性优秀，西里尔字母与拉丁字母覆盖良好。

```css
:root {
  --uid-font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --uid-font-family-mono: 'IBM Plex Mono', 'Fira Code', ui-monospace, monospace;

  --uid-font-size-xs:   12px;
  --uid-font-size-sm:   14px;
  --uid-font-size-md:   16px;
  --uid-font-size-lg:   18px;
  --uid-font-size-xl:   20px;
  --uid-font-size-2xl:  24px;

  --uid-font-weight-regular:   400;
  --uid-font-weight-medium:    500;
  --uid-font-weight-semibold:  600;
  --uid-font-weight-bold:      700;
}
```

组件库**不会自行加载 Inter**——这是使用方的责任：

```bash
pnpm add @fontsource-variable/inter
```
```ts
import '@fontsource-variable/inter'
```

`system-ui` 后备字体在 Inter 未加载时也能保证 UI 看起来不错。

## 动效

三种时长，三种曲线。UI 移动可预测。

```css
:root {
  --uid-duration-fast:  100ms;
  --uid-duration-base:  200ms;
  --uid-duration-slow:  350ms;

  --uid-ease-out:    cubic-bezier(0, 0, 0.2, 1);
  --uid-ease-in:     cubic-bezier(0.4, 0, 1, 1);
  --uid-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

规则：**进入比退出慢**——这让 UI 显得灵敏。

## Z-index

固定刻度避免层级冲突。100 的倍数让每层内部仍有空间。

```css
:root {
  --uid-z-base:      0;
  --uid-z-raised:    1;
  --uid-z-dropdown:  100;
  --uid-z-sticky:    200;
  --uid-z-overlay:   300;
  --uid-z-modal:     400;
  --uid-z-toast:     500;
  --uid-z-tooltip:   600;
}
```

## 不属于 token 的

- 单组件中只用一次的一次性值。
- 设计稿中尚未稳定的魔法数字——内联并加 TODO；看到重复时再升级为 token。
