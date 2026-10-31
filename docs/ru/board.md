# Доска

`UidBoard` — доска из колонок с карточками, по желанию разбитая на дорожки (swimlanes). Карточки перетаскиваются между колонками (или переносятся Alt+←/→); сама доска их не двигает — она отдаёт событие `move` с соседями в точке броска, а хост применяет перенос к своим данным (если нужно — после сохранения). [`UidKanban`](./kanban.md) — доска на разметке, построенная поверх неё.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidBoard, UidButton, type BoardColumn, type BoardMove } from '@dskripchenko/ui'

const columns = ref<BoardColumn[]>([
  { key: 'todo', title: 'К выполнению', total: 42, cards: [
    { key: 1, title: 'Страница входа', assignee: 'Анна Смирнова', due: '2026-11-15', tags: [{ label: 'backend', tone: 'info' }] },
    { key: 2, title: 'Экспорт в CSV', assignee: { name: 'Борис', avatar: '/avatars/boris.png' } },
  ] },
  { key: 'doing', title: 'В работе', wip: 3, cards: [] },
  { key: 'done', title: 'Готово', cards: [{ key: 3, title: 'Фильтры поиска', due: '2026-11-01', done: true }] },
])

function onMove(move: BoardMove): void {
  // сохранить, затем поставить move.card в move.to перед move.beforeKey (null — в конец)
}
</script>

<template>
  <UidBoard
    :columns="columns"
    @move="onMove"
    @open="(card) => console.log(card.key)"
  >
    <template #column-footer="{ column }">
      <UidButton
        v-if="column.total && column.cards.length < column.total"
        variant="ghost"
        size="sm"
      >
        Загрузить ещё
      </UidButton>
    </template>
  </UidBoard>
</template>
```

## Колонки

| Поле | Тип | |
|---|---|---|
| `key` | `string \| number` | Идентификатор колонки. |
| `title` | `string` | Заголовок. |
| `cards` | `BoardCard[]` | Показанные карточки, по порядку. |
| `total` | `number` | Настоящее число карточек в колонке, когда загружена только часть. Его используют счётчик в заголовке, проверка WIP, подсветка превышения и `count` слота `column-header`; не задано — `cards.length`. Колонка с `total` больше нуля без загруженных карточек не показывается пустой. |
| `wip` | `number \| null` | Лимит незавершённой работы: выше него счётчик краснеет и получает подсказку «лимит превышен». |

## Карточки

| Поле | Тип | |
|---|---|---|
| `key` | `string \| number` | Идентификатор карточки. |
| `title` | `string` | Заголовок. |
| `subtitle` | `string` | Вторая строка. |
| `tags` | `{ label, tone? }[]` | Теги; `tone` — `info`, `success`, `warning`, `danger` или `default`. |
| `assignee` | `string \| { name, avatar?, color? }` | Показывается в подвале карточки картинкой-аватаром или инициалами на фоне `color` (любой CSS-цвет; по умолчанию акцентный). Имя — подсказка и доступная подпись аватара. |
| `due` | `string` | `YYYY-MM-DD`: срок, показывается в подвале в локали кита (год — только если он не совпадает с годом `today`). Раньше `today` — просрочено: цвет опасности и озвучивание «Просрочено». |
| `done` | `boolean` | Завершённая карточка: приглушена (заголовок зачёркнут) и никогда не просрочена. |
| `lane` | `string \| number` | Дорожка, в которой лежит карточка. |
| `targets` | `(string \| number)[]` | Колонки, куда карточку можно перенести; не задано — любые. |

Слот `card` заменяет карточку целиком, включая подвал с `assignee` и `due`.

## Props

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `columns` | `BoardColumn[]` | — | Колонки с карточками. |
| `lanes` | `BoardLane[]` | `[]` | Дорожки `{ key, title }`; каждая дорожка — строка из всех колонок. |
| `busy` | `boolean` | `false` | Заморозить доску, пока перенос сохраняется. |
| `readonly` | `boolean` | `false` | Карточки открываются, но не двигаются. |
| `today` | `string` | локальная дата | `YYYY-MM-DD`: `due` карточки раньше этой даты — просрочен. |

## События

| Событие | Payload | |
|---|---|---|
| `move` | `BoardMove` | `{ card, from, to, beforeKey, afterKey, lane }`: карточку бросили; `beforeKey`/`afterKey` — её новые соседи (`null` на краю). |
| `open` | `BoardCard` | По карточке кликнули или нажали на ней Enter. |

## Слоты

| Слот | Props | |
|---|---|---|
| `card` | `{ card, column }` | Карточка целиком. |
| `column-header` | `{ column, count, over }` | Заголовок колонки; `count` — `total ?? cards.length`, `over` — выше `wip`. |
| `column-footer` | `{ column }` | Низ колонки под карточками — например, кнопка «Загрузить ещё». С дорожками выводится один раз на колонку, внизу последней дорожки (заголовок — в первой). Без слота элемента подвала нет. |

Типы: `UidBoardProps`, `BoardColumn`, `BoardCard`, `BoardCardTag`, `BoardAssignee`, `BoardLane`, `BoardMove`, `BoardKey`.

## Тексты

Подписи берутся из словаря локали, раздел `board` (см. [i18n](./i18n.md)): `label`, `empty`, `wipExceeded`, `due`, `overdue`, `assignee(name)`. Даты форматируются по `code` локали.
