# AI suggestion

`UidAiSuggestionCard` holds what a model proposed to one person before they act on it: a dashed frame, a heading with a mark that only they see it, and one of three states.

- `pending` — a skeleton, a line on what the model is doing and «Cancel» (`cancel`).
- `result` — the Markdown text, a meta line (`meta`, then `model`), and the buttons of the `actions` slot. With `editing` the text becomes a field; when it differs from `original`, the meta line says it was edited and «Revert» puts `original` back.
- `error` — an icon by `error.kind` (`off`, `setup`, `limit`, `failed`), the title, the message and the code; «Retry» (`retry`) only with `retryable`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidAiSuggestionCard, UidButton } from '@dskripchenko/ui'

const proposed = '- **Decided:** retry with backoff.\n- **Next:** review.'
const text = ref(proposed)
const editing = ref(false)
</script>

<template>
  <UidAiSuggestionCard
    v-model:text="text"
    v-model:editing="editing"
    :original="proposed"
    title="Thread summary"
    meta="9 messages · 10:24–11:52"
    model="qwen2.5:7b"
    @close="/* drop it */"
  >
    <template #actions="{ editing: on }">
      <UidButton size="sm">Publish</UidButton>
      <UidButton v-if="!on" size="sm" variant="secondary" @click="editing = true">Edit</UidButton>
    </template>
  </UidAiSuggestionCard>
</template>
```

`privateLabel` replaces the «only you see this» mark, `false` hides it; `closable: false` hides the ×. On phones (480 px and narrower) the × and the buttons grow to 44 px and the buttons stand in a column.

`UidAiModelTag` marks content a model made: `<UidAiModelTag model="qwen2.5:7b" label="summary" />` shows «✦ summary · qwen2.5:7b».
