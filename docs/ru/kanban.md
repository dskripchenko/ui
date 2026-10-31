# Канбан

`UidKanban` — канбан-доска, записанная простой текстовой разметкой и нарисованная через `UidBoard`. Разметка — единственный источник правды: компонент читает её, а каждая правка (перенос, новая или изменённая карточка) переписывает только затронутые строки и отдаётся событием `change` со всем новым текстом. Комментарии, пустые строки и остальной текст остаются как были, поэтому разметку можно хранить в файле, поле базы данных или на странице.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidKanban } from '@dskripchenko/ui'

const source = ref(`# Release 3.0
lanes: Payments, Refunds
tags: payments=info, refunds=warning

## Backlog
- Instant payments #payments {lane: Payments, who: Anna, due: 2026-11-15}
- Partial refunds over the API #refunds !high {lane: Refunds}
  Merchants ask to refund part of an amount without a call.

## In progress {wip: 3}
- [ACME-398](https://example.com/ACME-398) Antifraud v2 {who: Oleg}

## Done {done}
- Signed webhooks #payments
`)
const locked = ref(false)
</script>

<template>
  <UidKanban
    :source="source"
    editable
    lockable
    :locked="locked"
    @change="source = $event"
    @lock="locked = $event"
  />
</template>
```

## Разметка

Разметка читается как markdown:

- `# …` — заголовок доски.
- Строки `key: value` до первой колонки — настройки:
  - `lanes` — дорожки (swimlanes) через запятую, по порядку;
  - `tags` — тон для каждого тега: `tag=tone` через запятую; тоны — `info`, `success`, `warning`, `danger`. Тег без тона получает постоянный тон, вычисленный по имени.
- `## Column {wip: 3, done}` — колонка. `wip` — лимит незавершённой работы (выше него счётчик краснеет); `done` отмечает колонку готовых карточек (они зачёркнуты и никогда не просрочены).
- `- Card title #tag !high {lane: …, who: …, due: YYYY-MM-DD, any: value}` — карточка (вместо `-` подходит и `*`):
  - в заголовке работает строчный markdown: ссылки, `code`, **жирный**, *курсив*;
  - `#tag` — теги (буквы, цифры, `_`, `-`);
  - `!high` / `!low` — приоритет;
  - свойства в фигурных скобках в конце строки: `lane` (дорожка карточки; без него — первая дорожка), `who` (исполнитель), `due` (срок) и любые свои. Часть без двоеточия — флаг (`{blocked}`); часть, не похожая на имя, продолжает предыдущее значение (`{links: a, b}`).
- Строки с отступом под карточкой (два пробела или табуляция) — описание карточки в markdown.
- `<!-- комментарии -->` (однострочные и многострочные) пропускаются и сохраняются.

Строки, не подходящие ни под одно из этих правил, попадают в `parseKanban(source).problems` и перечисляются на вкладке **Исходник**.

## Поведение

Клик по карточке (или Enter на карточке в фокусе) открывает её подробности в выдвижной панели и отдаёт событие `open`. Над доской — фильтры по тегу и по человеку.

При `editable` (и без `locked`):

- карточки перетаскиваются между колонками и дорожками (Alt+←/→ переносит карточку в фокусе);
- `+` в заголовке колонки открывает форму новой карточки;
- в выдвижной панели карточку можно отредактировать (заголовок, колонка, дорожка, теги, приоритет, срок, исполнитель, описание, прочие свойства строками `key: value`) или удалить;
- вкладка **Исходник** редактирует саму разметку, с проблемами по строкам; ввод отдаётся как `change` после паузы в 300 мс.

`locked` делает доску доступной только для чтения независимо от `editable`. `lockable` показывает кнопку замка, которая отдаёт `lock` с новым состоянием: хост хранит его и передаёт обратно в `locked` — так же, как хранит исходник по `change`.

## Пропсы

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `source` | `string` | `''` | Разметка. Новое значение заменяет доску, если только это не то, что компонент сам только что отдал. |
| `editable` | `boolean` | `false` | Переносы, новые и изменённые карточки, вкладка исходника. |
| `locked` | `boolean` | `false` | Только чтение, независимо от `editable`. |
| `lockable` | `boolean` | `false` | Показать кнопку замка. |
| `today` | `string` | сегодня (UTC) | `YYYY-MM-DD`: срок `due` раньше этой даты показывается просроченным. |

## События

| Событие | Данные | |
|---|---|---|
| `change` | `string` | Вся новая разметка после правки. |
| `lock` | `boolean` | Нажата кнопка замка: запрошенное состояние `locked`. |
| `open` | `{ id, title, column }` | Открыта карточка (`KanbanOpen`). |

## Функции

Функции разметки чистые и экспортируются для использования без компонента — на сервере, в скрипте, в тестах. Идентификаторы карточек и колонок позиционные (`card-0`, `col-0`, …), поэтому берите их из свежего `parseKanban` того же текста.

| Функция | |
|---|---|
| `parseKanban(source)` | → `KanbanDoc`: `title`, `settings`, `lanes`, `tagTones`, `columns` (каждая со своими `cards`), `problems`. |
| `moveKanbanCard(source, cardId, toColumnId, beforeCardId, lane?)` | Переносит карточку вместе с описанием перед другой карточкой (`null` — в конец колонки); `lane` меняет её дорожку (`null` убирает её). |
| `addKanbanCard(source, columnId, fields)` | Добавляет карточку в конец колонки. |
| `updateKanbanCard(source, cardId, fields)` | Переписывает строки карточки. |
| `removeKanbanCard(source, cardId)` | Удаляет карточку и её описание. |
| `addKanbanColumn(source, title)` | Добавляет колонку в конец. |
| `serializeKanbanCard(fields)` | Карточка в виде строк разметки. |
| `kanbanInlineMarkdown(title)` | Заголовок карточки в HTML (сначала экранируется; ссылки — только на `http(s)`, `mailto`, `/` и `#`). |
| `parseMarkupProps(inner)`, `serializeMarkupProps(props)`, `splitMarkupProps(text)` | Свойства `{key: value, flag}` (`Map<string, string>`, флагам соответствует `''`). |

```ts
import { parseKanban, moveKanbanCard } from '@dskripchenko/ui'

const doc = parseKanban(source)
const card = doc.columns[0].cards[0]
const next = moveKanbanCard(source, card.id, doc.columns[2].id, null)
```

Типы: `KanbanDoc`, `KanbanColumn`, `KanbanCard`, `KanbanProblem`, `KanbanPriority`, `KanbanCardFields`, `MarkupProps`, `KanbanOpen`, `UidKanbanProps`.

## Тексты

Подписи берутся из локали, раздел `kanban` (см. [i18n](./i18n.md)); частичная локаль переопределяет только перечисленные в ней ключи. Сообщения о проблемах в `problems` — на английском.
