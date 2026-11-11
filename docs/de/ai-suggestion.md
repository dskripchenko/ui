# KI-Vorschlag

`UidAiSuggestionCard` zeigt, was ein Modell einer Person vorgeschlagen hat, bevor sie damit etwas tut: gestrichelter Rahmen, Überschrift mit dem Hinweis, dass nur sie es sieht, und einer von drei Zuständen.

- `pending` — Skeleton, eine Zeile dazu, was das Modell tut, und «Abbrechen» (`cancel`).
- `result` — Markdown-Text, Metazeile (`meta`, dann `model`) und die Schaltflächen des Slots `actions`. Mit `editing` wird der Text zum Feld; weicht er von `original` ab, nennt die Metazeile ihn bearbeitet, und «Revert» stellt `original` wieder her.
- `error` — Symbol nach `error.kind` (`off`, `setup`, `limit`, `failed`), Titel, Erklärung und Code; «Retry» (`retry`) nur mit `retryable`.

```vue
<UidAiSuggestionCard
  v-model:text="text"
  v-model:editing="editing"
  :original="proposed"
  title="Zusammenfassung"
  meta="9 Nachrichten · 10:24–11:52"
  model="qwen2.5:7b"
>
  <template #actions>
    <UidButton size="sm">Veröffentlichen</UidButton>
  </template>
</UidAiSuggestionCard>
```

Auf Telefonen (480 px und schmaler) werden × und Schaltflächen 44 px hoch und stehen untereinander. `UidAiModelTag` markiert, was ein Modell erstellt hat: «✦ summary · qwen2.5:7b».
