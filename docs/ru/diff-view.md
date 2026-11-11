# Просмотр диффа

`UidDiffView` показывает изменённые файлы как при ревью: заголовок с итогом, каждый файл со счётом добавленных и удалённых строк, открытым или свёрнутым; номера строк старой и новой версии; неизменённые участки свёрнуты и раскрываются по клику. `mode="split"` ставит старое и новое рядом.

```vue
<script setup lang="ts">
import { UidDiffView, type DiffFile } from '@dskripchenko/ui'

const files: DiffFile[] = [
  { path: 'app/RetryPolicy.php', patch: '@@ -1,3 +1,4 @@\n line\n-old\n+new\n+more\n line' },
  { path: 'tests/OldTest.php', oldPath: 'tests/Old.php', status: 'renamed', patch: '@@ -0,0 +1 @@\n+test' },
]
</script>

<template>
  <UidDiffView :files="files" title="Повторы для платёжных событий">
    <template #actions>
      <a href="https://git.example.com/mr/318">MR !318</a>
    </template>
  </UidDiffView>
</template>
```

Файл принимает unified-патч (`@@ -a,b +c,d @@` и строки с пробелом, `-` или `+` в начале); `additions` и `deletions`, если не заданы, считаются по нему. `context` (3) — сколько неизменённых строк остаётся вокруг изменения; `open` (1) — сколько файлов открыто сразу; `truncated` — источник обрезал изменение, `truncated` у файла — обрезан его патч.

Разбор тоже экспортируется: `diffRows(patch, context)` даёт строки с номерами и свёртками, `diffPairs(rows)` раскладывает их для режима рядом, `diffCounts(file)` считает строки.
