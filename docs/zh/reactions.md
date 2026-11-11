# 表情回应、表情选择与在线状态

适用于聊天类界面的三个部件：消息下方的表情回应、表情选择器，以及头像上的在线状态标记。

## `UidReactions`

“表情 · 数量”胶囊按钮，末尾为“+”。自己的回应为按下状态（`aria-pressed`）；无障碍名称包含表情、数量和回应者（`👍 3: 你、Bob 和 Ilya`），提示框显示回应者。

```vue
<UidReactions :reactions="reactions" :max="20" @toggle="react" @add="openPicker" />
```

属性：`reactions`（`emoji`、`count`、`mine`、`who`）、`max`、`readonly`、`touch`。事件：`toggle(emoji)`、`add(anchor)`。

## `UidEmojiPicker`

对话框面板：搜索（焦点保持在输入框中，当前单元格为其 `aria-activedescendant`）、分类标签、每行 8 个的网格、“最近使用”在前，底部为表情名称和肤色（六项单选组）。↑↓←→ 移动，↵ 选择，Esc 关闭。

```vue
<UidEmojiPicker v-model:skin-tone="tone" :recent="recent" @select="react" @close="close" />
```

数据（Unicode 15.1，CLDR 的俄语和英语名称与关键词）在首次打开时作为独立代码块加载（gzip 后约 40 KB）；来源为 Unicode 的 `emoji-test.txt` 与 CLDR 注释，遵循 Unicode License v3，可用 `scripts/emoji/build.mjs` 重新生成。

## `UidAvatar` 的在线状态

`presence`：`online`（实心点）、`away`（圆环）、`dnd`（带横线的点）、`call`（带点的圆环）、`offline`（灰色圆环）——形状与颜色同时表达；无障碍名称包含该状态。

`color` 设置首字母下的填充色，取代按姓名选取的颜色——用于区分账户类型，例如服务或机器人（其上为白色首字母，请保持 4.5:1）。首字母中连字符视为单词分隔：«Anne-Marie» 为 «AM»。

```vue
<UidAvatar name="Build bot" shape="square" color="#52525b" size="sm" />
```
