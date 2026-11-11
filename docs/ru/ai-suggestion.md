# Предложение AI

`UidAiSuggestionCard` держит то, что модель предложила одному человеку, пока он не решил, что с этим делать: пунктирная рамка, заголовок с меткой «видно только вам» и одно из трёх состояний.

- `pending` — скелетон, строка о том, что делает модель, и «Отмена» (`cancel`).
- `result` — текст Markdown, строка меты (`meta`, затем `model`) и кнопки слота `actions`. С `editing` текст становится полем; если он отличается от `original`, мета говорит, что текст поправлен, а «Вернуть как было» возвращает `original`.
- `error` — иконка по `error.kind` (`off`, `setup`, `limit`, `failed`), заголовок, пояснение и код; «Повторить» (`retry`) — только с `retryable`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidAiSuggestionCard, UidButton } from '@dskripchenko/ui'

const proposed = '- **Решили:** повторять с паузой.\n- **Дальше:** ревью.'
const text = ref(proposed)
const editing = ref(false)
</script>

<template>
  <UidAiSuggestionCard
    v-model:text="text"
    v-model:editing="editing"
    :original="proposed"
    title="Резюме треда"
    meta="9 сообщений · 10:24–11:52"
    model="qwen2.5:7b"
  >
    <template #actions="{ editing: on }">
      <UidButton size="sm">Опубликовать</UidButton>
      <UidButton v-if="!on" size="sm" variant="secondary" @click="editing = true">Изменить</UidButton>
    </template>
  </UidAiSuggestionCard>
</template>
```

`privateLabel` заменяет метку «видно только вам», `false` её убирает; `closable: false` убирает ×. На телефоне (480 px и уже) × и кнопки — 44 px, кнопки — столбцом.

`UidAiModelTag` помечает сделанное моделью: `<UidAiModelTag model="qwen2.5:7b" label="резюме" />` — «✦ резюме · qwen2.5:7b».
