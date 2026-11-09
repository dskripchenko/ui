# Лента сообщений

`UidMessageFeed` — лента сообщений как в чате: старые сверху, новые снизу. Отрисовывает только то, что рядом с окном просмотра, поэтому десятки тысяч сообщений прокручиваются плавно; высота сообщений любая — они измеряются при отрисовке.

- **Разделители дней** строятся по `itemDate`; **группы** сообщений одного автора — по `continues`, слот получает `grouped`, чтобы не повторять шапку.
- **Разделитель «новые»** ставится перед сообщением, ключ которого передан в `newMarker`.
- **Подгрузка старых** не сдвигает читателя: элементы добавляются в начало, и ничего не прыгает, даже если новые строки окажутся выше оценки.
- **Следование за низом**: пока читатель внизу, новые сообщения остаются в виду; прокрутил вверх — лента стоит на месте.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidMessageFeed } from '@dskripchenko/ui'

interface Note { id: number; author: string; text: string; at: string }

const notes = ref<Note[]>(await loadLatest())   // ваш запрос
const loading = ref(false)
const more = ref(true)

async function loadOlder(): Promise<void> {
  loading.value = true
  const older = await loadBefore(notes.value[0].id)
  notes.value = [...older, ...notes.value]
  more.value = older.length > 0
  loading.value = false
}
</script>

<template>
  <UidMessageFeed
    :items="notes"
    :item-key="n => n.id"
    :item-date="n => n.at"
    :continues="(a, b) => a.author === b.author"
    :new-marker="firstUnreadId"
    :has-more-before="more"
    :loading-before="loading"
    label="Заметки команды"
    style="height: 100%"
    @load-before="loadOlder"
    @visible="range => markRead(range?.last)"
  >
    <template #item="{ item, grouped }">
      <NoteRow :note="item" :compact="grouped" />
    </template>
  </UidMessageFeed>
</template>
```

Ленте нужна высота: задайте её или поставьте ленту во flex-колонку с `min-height: 0`.

## Свойства

| Свойство | Тип | По умолчанию | |
|---|---|---|---|
| `items` | `T[]` | — | Сообщения, старые первыми |
| `itemKey` | `(item) => string \| number` | — | Стабильный ключ |
| `itemDate` | `(item) => Date \| string \| number` | — | Разделители дней; без него их нет |
| `continues` | `(previous, item) => boolean` | — | Продолжает ли сообщение группу предыдущего |
| `newMarker` | ключ | `null` | Первое новое сообщение; разделитель — перед ним |
| `estimatedItemHeight` | `number` | `56` | Высота до измерения |
| `overscan` | `number` | `600` | Сколько пикселей отрисовывать за окном |
| `hasMoreBefore` / `hasMoreAfter` | `boolean` | `false` | Есть более старые / более новые |
| `loadingBefore` / `loadingAfter` | `boolean` | `false` | Страница в пути; новых запросов нет |
| `followOutput` | `boolean` | `true` | Держать последнее сообщение в виду, пока читатель внизу |
| `loadThreshold` | `number` | `400` | Расстояние до края, на котором просить ещё |
| `dayLabel` | `(date) => string` | Сегодня / Вчера / дата | Текст разделителя дня |
| `newLabel` | `string` | из локали | Текст разделителя «новые» |
| `label` | `string` | — | Доступное имя |

Разделитель разрывает группу: первое сообщение дня и первое новое всегда показывают шапку.

## События

| Событие | Данные | |
|---|---|---|
| `loadBefore` | — | Читатель у верха, `hasMoreBefore` |
| `loadAfter` | — | Читатель у низа, `hasMoreAfter` |
| `atBottom` | `boolean` | Читатель дошёл до низа или ушёл — показать или скрыть «к последним» |
| `visible` | `{ first, last } \| null` | Ключи сообщений в окне — чтобы отметить прочитанное |

## Слоты

`item` (`{ item, index, grouped }`), `day` (`{ date, label }`), `new` (`{ label }`), `before` и `after` (у верхнего / нижнего края во время загрузки), `empty`.

## Методы

Через ref: `scrollToBottom()` — к последнему сообщению и снова следовать за низом; `scrollToKey(key, 'start' | 'center')` — показать сообщение (открыть ленту на первом новом, перейти к цитате); вернёт `false`, если сообщение не загружено.

Если лента открыта в середине (`hasMoreAfter`), она не следует за низом, пока не загружена последняя страница.

## Доступность

Лента — `role="feed"` с `aria-busy` во время загрузки; каждое сообщение — `article` с `aria-posinset` и `aria-setsize` (`-1`, пока можно подгрузить ещё); разделители — `separator`. Задайте ленте `label`.
