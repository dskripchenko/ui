# UidObjectCard

信息流中来自其他系统的对象——文章、工单、订单：编号、状态、标题、一行信息，以及快捷操作和提示的位置。卡片不了解那个系统：它只显示传入的内容，并在状态被点击时通知。

```vue
<UidObjectCard
  code="KB-12"
  title="Refund policy needs the new terms"
  :status="{ label: 'Draft', tone: 'info' }"
  status-action
  status-action-label="Change state"
  href="https://kb.example/KB-12"
  href-label="Open"
  :busy="moving"
  busy-label="Sending to review…"
  :invalid="refused !== null"
  @status="(anchor) => openMoves(anchor)"
>
  <template #icon><FileText :size="14" /></template>
  <template #meta><span>Anna Lee</span><span>Updated 2 days ago</span></template>
  <template #actions>
    <UidButton variant="secondary" size="sm">Assign</UidButton>
    <UidButton variant="secondary" size="sm">Comment</UidButton>
  </template>
  <template #notice>
    <UidAlert v-if="refused" variant="danger" :title="refused.title">{{ refused.why }}</UidAlert>
  </template>
</UidObjectCard>
```

## 属性

| 属性 | 类型 | 默认值 | |
|---|---|---|---|
| `code` | `string` | — | 对象编号，等宽字体 |
| `title` | `string` | — | 必填 |
| `status` | `{ label: string; tone?: 'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' }` | — | 对应色调的标签 |
| `statusAction` | `boolean` | `false` | 状态是按钮：触发 `status` 事件，并以按钮本身作为菜单锚点 |
| `statusActionLabel` | `string` | — | 按钮的无障碍名称，在状态之前读出 |
| `href` / `hrefLabel` | `string` | — | 指向对象所在系统的链接，在新标签页打开 |
| `busy` / `busyLabel` | `boolean` / `string` | `false` | 正在更改：以带加载图标的文字代替状态，操作不可用 |
| `invalid` | `boolean` | `false` | 红色边框；在 `notice` 插槽中说明原因 |
| `size` | `'sm' \| 'md'` | `'md'` | `sm` 用于讨论串或弹出层 |

## 插槽

`icon`（编号之前）、`default`（标题与信息之间）、`meta`、`actions`（分隔线下方）、`notice`（最下方）。

## 事件

`status(anchor: HTMLElement)` —— 状态按钮被点击。

## CSS 变量

`--uid-object-card-max-width`（560px）。
