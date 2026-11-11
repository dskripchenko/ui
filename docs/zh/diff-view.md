# 差异视图

`UidDiffView` 以代码评审的方式展示变更文件：带总计的标题，每个文件显示新增和删除的行数，可展开或折叠；旧版本和新版本的行号；未变更的片段默认折叠，点击展开。`mode="split"` 将旧内容与新内容并排显示。

```vue
<script setup lang="ts">
import { UidDiffView, type DiffFile } from '@dskripchenko/ui'

const files: DiffFile[] = [
  { path: 'app/RetryPolicy.php', patch: '@@ -1,3 +1,4 @@\n line\n-old\n+new\n+more\n line' },
]
</script>

<template>
  <UidDiffView :files="files" title="支付事件的重试" />
</template>
```

文件接收 unified 补丁；未提供 `additions` 和 `deletions` 时从补丁统计。`context`（3）为变更周围保留的未变更行数；`open`（1）为初始展开的文件数；`truncated` 表示来源截断了变更。同时导出 `diffRows`、`diffPairs` 和 `diffCounts`。
