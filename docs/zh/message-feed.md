# 消息流

`UidMessageFeed` 是聊天式的消息列表：最早的在上，最新的在下。只渲染视口附近的内容，因此数万条消息也能流畅滚动；消息高度任意——渲染时实时测量。

- **日期分隔线**由 `itemDate` 生成；同一作者的**消息分组**由 `continues` 决定，插槽会收到 `grouped`，以便省略重复的头部。
- **“新消息”分隔线**位于 `newMarker` 指定的消息之前。
- **加载更早的消息**时阅读位置保持不变：在开头插入条目不会跳动，即使新行的实际高度高于估计值。
- **跟随底部**：读者位于底部时，新消息始终可见；向上滚动后，列表保持原位。

```vue
<template>
  <UidMessageFeed
    :items="notes"
    :item-key="n => n.id"
    :item-date="n => n.at"
    :continues="(a, b) => a.author === b.author"
    :new-marker="firstUnreadId"
    :has-more-before="more"
    :loading-before="loading"
    label="Team notes"
    style="height: 100%"
    @load-before="loadOlder"
    @visible="range => markRead(range?.last)"
  >
    <template #item="{ item, grouped }">
      <NoteRow :note="item" :compact="grouped" />
    </template>
  </UidMessageFeed>
</template>
```

消息流需要高度：直接设置，或放入带 `min-height: 0` 的 flex 列中。

## 属性

| 属性 | 类型 | 默认值 | |
|---|---|---|---|
| `items` | `T[]` | — | 消息，按时间从早到晚 |
| `itemKey` | `(item) => string \| number` | — | 稳定的键 |
| `itemDate` | `(item) => Date \| string \| number` | — | 日期分隔线；不提供则没有 |
| `continues` | `(previous, item) => boolean` | — | 该消息是否延续上一条的分组 |
| `newMarker` | 键 | `null` | 第一条新消息；分隔线位于其前 |
| `estimatedItemHeight` | `number` | `56` | 测量前假定的高度 |
| `overscan` | `number` | `600` | 视口外额外渲染的像素 |
| `hasMoreBefore` / `hasMoreAfter` | `boolean` | `false` | 存在更早 / 更新的消息 |
| `loadingBefore` / `loadingAfter` | `boolean` | `false` | 正在加载一页；期间不再请求 |
| `followOutput` | `boolean` | `true` | 位于底部时保持最新消息可见 |
| `loadThreshold` | `number` | `400` | 距边缘多少像素时请求更多 |
| `dayLabel` | `(date) => string` | 今天 / 昨天 / 日期 | 日期分隔线文字 |
| `newLabel` | `string` | 本地化文案 | “新消息”分隔线文字 |
| `label` | `string` | — | 无障碍名称 |

分隔线会打断分组：每天的第一条消息和第一条新消息总是显示头部。

## 事件

| 事件 | 数据 | |
|---|---|---|
| `loadBefore` | — | 接近顶部且 `hasMoreBefore` |
| `loadAfter` | — | 接近底部且 `hasMoreAfter` |
| `atBottom` | `boolean` | 读者到达或离开底部——用于“跳到最新”按钮 |
| `visible` | `{ first, last } \| null` | 可见消息的键——用于标记已读 |

## 插槽

`item`（`{ item, index, grouped }`）、`day`（`{ date, label }`）、`new`（`{ label }`）、`before` 与 `after`（加载时显示在顶部 / 底部边缘）、`empty`。

## 方法

通过模板 ref：`scrollToBottom()` 跳到最新消息并重新跟随；`scrollToKey(key, 'start' | 'center')` 将消息滚入视口，消息未加载时返回 `false`。

当消息流从中间打开（`hasMoreAfter`）时，在加载到最新一页之前不会跟随底部。

## 无障碍

消息流为 `role="feed"`，加载时带 `aria-busy`；每条消息是带 `aria-posinset` 与 `aria-setsize`（仍可加载时为 `-1`）的 `article`；分隔线为 `separator`。请为消息流设置 `label`。
