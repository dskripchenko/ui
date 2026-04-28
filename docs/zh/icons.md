# 图标

组件库自带丰富的图标 — 开箱即用 ~1500 个 [Lucide](https://lucide.dev/) 图标，无需额外安装。Lucide 之上是一层薄包装 `UidIcon`，统一了尺寸、颜色、主题与 a11y 的 API。

## 思路

- **来源** — `lucide-vue-next`(MIT)。作为常规 `dependency` 自动安装。
- **不维护自有图标集。** 维护 ~1500 个 SVG 是不必要的负担。
- **不打包。** 所有图标都可 tree-shake：未导入的不会进入 bundle。
- **不用 CSS 类。** 图标是 Vue 组件，不是 sprite 或 webfont。DOM 中是内联 SVG，可完整 tree-shake。

## 两种使用方式

组件库支持两种路径，互为补充——按任务选用。

### A. 静态导入(主路径)

标准方式。把图标当 Vue 组件导入并传给 `<UidIcon :icon>`。打包器看到显式依赖——只有用到的图标进入 bundle。

```vue
<script setup lang="ts">
import { UidIcon, UidButton } from '@dskripchenko/ui'
import { Check, X, ChevronRight } from 'lucide-vue-next'
</script>

<template>
  <UidIcon :icon="Check" />
  <UidIcon :icon="X" size="sm" />

  <UidButton variant="primary">
    <UidIcon :icon="ChevronRight" /> 下一步
  </UidButton>
</template>
```

通过组件库的等效导入(同一套，统一心智命名空间)：

```ts
import { Check, X, ChevronRight } from '@dskripchenko/ui/icons'
```

`@dskripchenko/ui/icons` 是子导出，简单地 re-export 整个 `lucide-vue-next`。

### B. 动态注册表

当图标名来自数据(菜单配置、数据库字段、外部 prop)时，编译器看不到具体组件。注册一次需要的图标，再按字符串名查找。

```ts
// app-bootstrap.ts(启动时一次)
import { registerIcons } from '@dskripchenko/ui'
import { Check, X, Home, Settings, User, Bell } from 'lucide-vue-next'

registerIcons({
  check: Check,
  close: X,
  home: Home,
  settings: Settings,
  user: User,
  bell: Bell,
})
```

```vue
<script setup lang="ts">
import { UidIcon } from '@dskripchenko/ui'

const menu = [
  { label: '首页', icon: 'home' },
  { label: '个人资料', icon: 'user' },
  { label: '设置', icon: 'settings' },
]
</script>

<template>
  <ul>
    <li v-for="item in menu" :key="item.label">
      <UidIcon :name="item.icon" /> {{ item.label }}
    </li>
  </ul>
</template>
```

注册表中无对应名称时——dev 模式下 `console.warn`，生产环境不渲染。**动态注册表是个有意识的取舍：**你显式列出可能按名引用的图标，从而保留 tree-shake——未注册的不会进入 bundle。

### 何时用哪种

| 场景 | 方法 |
|---|---|
| 写模板时已知图标 | **A** |
| 在组件库内部组件中(Button slot、Input prefix) | **A** |
| 图标名来自数据(menu、config、props.iconName) | **B** |
| 90% 的情形 | **A** |

## `UidIcon` 组件

### Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `icon` | `Component` | — | Lucide 组件。方法 A。 |
| `name` | `string` | — | 注册表中的名称。方法 B。 |
| `size` | `UidIconSize` | `'md'` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` 或数字(px) |
| `strokeWidth` | `number \| string` | `2` | Lucide 描边粗细(1–3 合理) |
| `color` | `string` | `'currentColor'` | 覆盖颜色(通常无需 — 继承文本) |
| `title` | `string` | — | 让图标"被读出"：`role="img" + aria-label`。无 title 则视为装饰性(`aria-hidden`)。 |
| `spin` | `boolean` | `false` | 无限旋转(loader) |

### 尺寸

| 尺寸 | 默认 |
|---|---|
| `xs` | 12 px |
| `sm` | 16 px |
| `md` | 20 px |
| `lg` | 24 px |
| `xl` | 32 px |
| 数字 | `${value}px` |

要让图标随文字缩放——不设 `size`。默认是 `1em`，跟随父级 `font-size`。适合按钮和文字内的内联图标：

```html
<UidButton size="sm">  <!-- font-size: 14px -->
  <UidIcon :icon="Check" /> <!-- 图标也是 14px -->
  保存
</UidButton>
```

## 颜色与主题

图标默认通过 `currentColor` 继承父级 `color`。所以在 `<UidButton variant="primary">` 中自动变白；在 `<UidButton variant="ghost">` 中跟随文本色。

按需覆盖：

```html
<UidIcon :icon="AlertTriangle" style="--uid-icon-color: var(--uid-warning)" />
<UidIcon :icon="AlertTriangle" color="var(--uid-warning)" />
```

深色主题下，图标自动变亮，因为 `--uid-text-primary` 在 `themes.css` 中切换。图标侧不需要任何逻辑。

## 无障碍

图标分两类——组件库通过 `title` 显式区分。

### 装饰性(无 title)

图标重复了相邻文本的含义。对屏幕阅读器是噪音。

```html
<UidButton>
  <UidIcon :icon="Save" />  <!-- aria-hidden="true"，屏幕阅读器跳过 -->
  保存
</UidButton>
<!-- 朗读为 "保存，按钮" -->
```

### 有声(带 title)

图标本身承载含义(只有图标的按钮)。这时 `title` 必填。

```html
<UidButton variant="ghost" aria-label="关闭">
  <UidIcon :icon="X" title="关闭" />
</UidButton>
```

`UidIcon` 内部变成：

```html
<svg role="img" aria-label="关闭"> ... </svg>
```

如果图标是可点击元素的唯一内容，最好同时在按钮上重复 `aria-label`(如上所示)：兼容老旧屏幕阅读器更佳。

### 经验法则

- 图标紧邻文字 → 不写 `title`(装饰性)。
- 图标单独使用 → 写 `title`，或在父按钮上写 `aria-label`。

## 加载状态(spin)

```html
<UidIcon :icon="Loader" spin />
<UidIcon :icon="RefreshCw" spin size="sm" />
```

CSS 动画，无需 JS。速度通过 `--uid-icon-spin-duration` 控制(默认 `1s`)。

## 自定义图标

有时需要 Lucide 没有的图标(logo、项目专用)。一个简单的 Vue 组件渲染 SVG 即可，与 Lucide 一样传给 `UidIcon`。

```vue
<!-- src/icons/MyLogo.vue 在你的应用中 -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="..." />
  </svg>
</template>
```

```vue
<script setup lang="ts">
import { UidIcon } from '@dskripchenko/ui'
import MyLogo from './icons/MyLogo.vue'
</script>

<template>
  <UidIcon :icon="MyLogo" size="lg" />
</template>
```

关键：SVG 必须使用 `fill="none" stroke="currentColor"`(或 `fill="currentColor"`)，否则图标无法承接父级颜色，主题切换时不会跟随。

## 反模式

- ❌ 在 SVG 中硬编码尺寸(`width="24"`)。`UidIcon` 通过 CSS 控制 width/height — 硬编码会破坏 `size`。
- ❌ 在 SVG 中硬编码颜色(`fill="#000"`)。请用 `currentColor`。
- ❌ 仅图标但没有 `title`/`aria-label`。屏幕阅读器会丢失含义。
- ❌ `import * as icons from 'lucide-vue-next'` — 杀死 tree-shake。只导入需要的。
- ❌ "以防万一"注册全部 1500 个图标。只注册真正按名引用的。
- ❌ 对静态已知图标使用 `UidIcon name="..."`。`:icon=` 类型更安全且 tree-shake 更好。
