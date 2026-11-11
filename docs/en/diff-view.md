# Diff view

`UidDiffView` shows changed files as a review does: a heading with the totals, each file with its lines added and removed, opened or folded; line numbers of the old and the new version; unchanged runs folded and opened on a click. `mode="split"` puts the old and the new side by side.

```vue
<script setup lang="ts">
import { UidDiffView, type DiffFile } from '@dskripchenko/ui'

const files: DiffFile[] = [
  { path: 'app/RetryPolicy.php', patch: '@@ -1,3 +1,4 @@\n line\n-old\n+new\n+more\n line' },
  { path: 'tests/OldTest.php', oldPath: 'tests/Old.php', status: 'renamed', patch: '@@ -0,0 +1 @@\n+test' },
]
</script>

<template>
  <UidDiffView :files="files" title="Retries for payment events">
    <template #actions>
      <a href="https://git.example.com/mr/318">MR !318</a>
    </template>
  </UidDiffView>
</template>
```

A file takes a unified patch (`@@ -a,b +c,d @@` and lines starting with a space, `-` or `+`); `additions` and `deletions`, when not given, are counted from it. `context` (3) is how many unchanged lines stay around a change; `open` (1) is how many files are open at first; `truncated` says the source cut the change, `truncated` on a file — that its patch was cut.

The parsing is exported too: `diffRows(patch, context)` gives rows with old and new line numbers and folds, `diffPairs(rows)` pairs them for the side-by-side view, `diffCounts(file)` counts the lines.
