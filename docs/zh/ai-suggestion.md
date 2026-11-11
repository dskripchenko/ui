# AI 建议

`UidAiSuggestionCard` 展示模型向某个人提出的建议，在其采取行动之前：虚线边框、带“仅你可见”标记的标题，以及三种状态之一。

- `pending` — 骨架屏、一行说明模型正在做什么，以及“取消”（`cancel`）。
- `result` — Markdown 文本、元信息行（`meta`，然后是 `model`）以及插槽 `actions` 中的按钮。设置 `editing` 后文本变为输入框；与 `original` 不同时，元信息行会注明已编辑，“恢复”会还原为 `original`。
- `error` — 按 `error.kind`（`off`、`setup`、`limit`、`failed`）显示图标、标题、说明和代码；仅在 `retryable` 时显示“重试”（`retry`）。

```vue
<UidAiSuggestionCard
  v-model:text="text"
  v-model:editing="editing"
  :original="proposed"
  title="讨论摘要"
  meta="9 条消息 · 10:24–11:52"
  model="qwen2.5:7b"
>
  <template #actions>
    <UidButton size="sm">发布</UidButton>
  </template>
</UidAiSuggestionCard>
```

在手机上（480 px 及更窄），× 和按钮高 44 px，按钮纵向排列。`UidAiModelTag` 标记模型生成的内容：“✦ summary · qwen2.5:7b”。
