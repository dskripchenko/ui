# 仪表盘网格（Dashboard grid）

`UidDashboardGrid` 把元素排列在由列和行组成的网格上——就像仪表盘上的小部件。元素位于第 `x` 列、第 `y` 行（均从 0 开始），占 `w` 列、`h` 行；网格高度随最低的元素变化。在编辑模式下，元素通过宿主渲染的拖动手柄拖动，通过网格自己渲染的右下角把手调整大小，也可以用键盘移动或调整大小。网格不保存自己的布局副本：每完成一次操作，它就发出一个新的元素数组（`v-model:items`），由宿主保存。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidDashboardGrid, type DashboardGridItem } from '@dskripchenko/ui'

type Widget = DashboardGridItem & { title: string }

const editing = ref(false)
const items = ref<Widget[]>([
  { id: 'revenue', title: '收入', x: 0, y: 0, w: 4, h: 2, minW: 2 },
  { id: 'orders', title: '订单', x: 4, y: 0, w: 4, h: 2 },
  { id: 'traffic', title: '流量', x: 8, y: 0, w: 4, h: 4, minH: 2 },
  { id: 'notes', title: '备注', x: 0, y: 2, w: 8, h: 2, maxH: 3 },
])

function save(layout: DashboardGridItem[]): void {
  // 保存位置：每完成一次拖动、调整大小或按键调用一次
}
</script>

<template>
  <UidDashboardGrid
    v-model:items="items"
    :editable="editing"
    :item-label="(item) => (item as Widget).title"
    label="商店概览"
    @change="save"
  >
    <template #item="{ item, editing: canEdit, handle }">
      <section class="widget">
        <header>
          <button v-if="canEdit" type="button" v-bind="handle">⠿</button>
          <h3>{{ (item as Widget).title }}</h3>
        </header>
        …
      </section>
    </template>
  </UidDashboardGrid>
</template>
```

## 元素

| 字段 | 类型 | |
|---|---|---|
| `id` | `string \| number` | 元素的 id。 |
| `x`, `y` | `number` | 列和行，从 0 开始。 |
| `w`, `h` | `number` | 以列计的宽度和以行计的高度。 |
| `minW`, `minH`, `maxW`, `maxH` | `number` | 以单元格计的尺寸限制。宽度不会超过 `columns`。 |

元素可以带任意其他字段：发出的数组包含宿主自己的对象，`x`、`y`、`w`、`h` 为新值，其余保持不变。

## 编辑

开启 `editable` 时，宿主把 `handle` 绑定到自己的拖动手柄元素上——通常是元素标题栏里的一个按钮。按下并移动指针（鼠标、触控笔或触摸）即可拿起元素：它略微浮起并跟随指针，虚线占位框 "Drop here · 4 × 2" 显示吸附后的目标单元格，其他元素让出位置。松开即放下；拖动过程中按 Escape 取消并恢复布局。每个元素右下角的把手以同样方式调整大小。

布局规则：

- 位置和尺寸吸附到整格，并限制在列数和 `minW`…`maxH` 之内；
- 放到其他元素上的元素会把它们往下推；把一个元素向下拖过另一个元素时，两者交换位置；
- 之后进行纵向压缩：每个元素按阅读顺序（先行后列）尽可能向上浮动。结果是确定的，且从不重叠。

`update:items` 和 `change` 在每次完成的操作后各触发一次，携带同一个新数组，并且只在有变化时触发。

不开启 `editable` 时布局是静态的：`handle` 是空对象，没有把手，什么都不能拖动。

## 键盘

手柄和把手都是可聚焦的按钮。

| 按键 | 在手柄上 | 在把手上 |
|---|---|---|
| ←、→、↑、↓ | 移动一个单元格 | 宽度或高度增减一 |
| Shift + 方向键 | 宽度或高度增减一 | — |
| Escape | 取消正在进行的指针拖动 | 取消正在进行的调整大小 |

向下移动一行时，如果"重力"会把元素拉回原处，它会改为越过下方的元素。移动后焦点保持在手柄上。每次变化都通过一个视觉上隐藏的 live 区域播报（"收入 moved to column 5, row 1"）；手柄的标签包含元素的位置和尺寸，隐藏的提示说明按键用法。

## 窄容器

当网格本身比 `stackBelow`（默认 640 px，通过 `ResizeObserver` 测量）窄时，元素按阅读顺序堆叠成一列，每个高 `h × rowHeight`，编辑关闭（插槽里的 `editing` 为 `false`，`handle` 为空）。

## Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `items` | `DashboardGridItem[]` | — | 布局；配合 `v-model:items` 使用。 |
| `columns` | `number` | `12` | 列数。 |
| `rowHeight` | `number` | `80` | 一行的高度，px。 |
| `gap` | `number` | `16` | 单元格间距，px。 |
| `editable` | `boolean` | `false` | 元素可以移动和调整大小。 |
| `stackBelow` | `number` | `640` | 容器宽度（px）低于此值时元素堆叠成一列。 |
| `label` | `string` | 语言包的 `label` | 网格的无障碍名称。 |
| `itemLabel` | `(item) => string` | "Item 3" | 元素在手柄、把手标签和播报中的名称。 |

## 事件

| 事件 | 载荷 | |
|---|---|---|
| `update:items` | `DashboardGridItem[]` | 放下、调整大小或按键后的新数组。 |
| `change` | `DashboardGridItem[]` | 同一个数组；每次完成的操作触发一次。 |

## 插槽

| 插槽 | Props | |
|---|---|---|
| `item` | `{ item, editing, dragging, handle }` | 单元格内容。`editing`——网格可编辑且未堆叠；`dragging`——该元素正在被拖动或调整大小；`handle`——要 `v-bind` 到拖动手柄上的 `DashboardGridHandleBindings`。 |
| `placeholder` | `{ w, h }` | 放置占位框里的文字。 |

`handle` 包含 `onPointerdown`、`onKeydown`、`tabindex: 0`、`role: 'button'`、`aria-roledescription`、`aria-label`、`aria-describedby`、`aria-keyshortcuts` 和 `data-uid-grid-handle`。网格为手柄设置 `cursor: grab` 和 `touch-action: none`。

类型：`UidDashboardGridProps`、`DashboardGridItem`、`DashboardGridHandleBindings`、`DashboardGridItemSlotProps`。

## 布局函数

上述规则都是纯函数，导出后可在服务端或测试中使用。每个函数按输入顺序返回新对象，并保留额外字段。

| 函数 | |
|---|---|
| `collides(a, b)` | 两个元素是否重叠（与自身永不重叠）。 |
| `clampItem(item, columns)` | 把元素吸附到整格、自身限制和列数内。 |
| `compactLayout(items, columns)` | 纵向压缩并消除重叠。 |
| `moveItem(items, id, x, y, columns)` | 移动元素、解决碰撞并压缩。 |
| `resizeItem(items, id, w, h, columns)` | 调整元素大小、推开被覆盖的元素并压缩。 |
| `layoutHeight(items)` | 布局占用的行数。 |
| `sortByPosition(items)` | 按阅读顺序排列的元素。 |
| `sameLayout(a, b)` | 两个布局是否把每个元素放在相同的单元格上。 |

## 样式

元素外层容器本身没有视觉样式——卡片由宿主内容绘制。变量：`--uid-dashboard-grid-placeholder-bg` 和 `--uid-dashboard-grid-placeholder-border`（默认为强调色）。过渡使用 `--uid-duration-base`，在 `prefers-reduced-motion` 下关闭。浅色和深色主题来自主题 token。

## 文案

文案来自语言包的 `dashboardGrid` 部分（见 [i18n](./i18n.md)）：`label`、`item(n)`、`handleRole`、`handle(title, x, y, w, h)`、`resize(title, w, h)`、`hint`、`dropHere(w, h)`、`moved(title, x, y)`、`resized(title, w, h)`、`cancelled(title)`。文案中的列和行从 1 开始计数。
