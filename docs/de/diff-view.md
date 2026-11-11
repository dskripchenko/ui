# Diff-Ansicht

`UidDiffView` zeigt geänderte Dateien wie in einem Review: eine Überschrift mit den Summen, jede Datei mit hinzugefügten und entfernten Zeilen, geöffnet oder eingeklappt; Zeilennummern der alten und der neuen Fassung; unveränderte Abschnitte eingeklappt und per Klick geöffnet. `mode="split"` stellt Alt und Neu nebeneinander.

```vue
<script setup lang="ts">
import { UidDiffView, type DiffFile } from '@dskripchenko/ui'

const files: DiffFile[] = [
  { path: 'app/RetryPolicy.php', patch: '@@ -1,3 +1,4 @@\n line\n-old\n+new\n+more\n line' },
]
</script>

<template>
  <UidDiffView :files="files" title="Wiederholungen für Zahlungsereignisse" />
</template>
```

Eine Datei nimmt einen Unified-Patch; `additions` und `deletions` werden daraus gezählt, wenn sie fehlen. `context` (3) — unveränderte Zeilen um eine Änderung; `open` (1) — wie viele Dateien anfangs offen sind; `truncated` — die Quelle hat die Änderung gekürzt. Exportiert sind auch `diffRows`, `diffPairs` und `diffCounts`.
