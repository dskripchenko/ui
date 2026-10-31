# Календарь событий

`UidEventCalendar` показывает события, записанные простой текстовой разметкой, в `UidCalendar` — в видах «день», «неделя», «месяц», «год» и «повестка». Повторы разворачиваются только для дней на экране. Как и у [`UidKanban`](./kanban.md), разметка — единственный источник правды: каждая правка переписывает одну строку (две, когда одно вхождение повтора отделяется) и отдаётся событием `change` со всем новым текстом.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidEventCalendar } from '@dskripchenko/ui'

const source = ref(`# Releases and duty
tags: release=danger

2026-11-03 10:00-11:00 Release demo #release {where: Room 4}
2026-11-10..2026-11-14 Code freeze #release
every mon 11:00-11:30 Sprint planning {from: 2026-11-02, until: 2026-12-28, except: 2026-11-30}
every 2 weeks fri 16:00-17:00 Retro {from: 2026-11-06}
every month last fri Release to production #release
every year 12-31 New year freeze
`)
</script>

<template>
  <UidEventCalendar
    :source="source"
    view="month"
    editable
    @change="source = $event"
  />
</template>
```

## Разметка

Сначала необязательные `# Title` и настройки (`key: value`):

- `view` — вид, показываемый первым: `day`, `week`, `month`, `year` или `agenda`;
- `date` — дата, показываемая первой (`YYYY-MM-DD`);
- `tags` — тон для каждого тега: `tag=tone` через запятую (`info`, `success`, `warning`, `danger` или любой CSS-цвет).

Дальше по одному событию на строку:

- **Когда**: дата `2026-11-03` или диапазон `2026-11-10..2026-11-14`, затем необязательное время `10:00` или `10:00-11:00` (без него — весь день).
- **Что**: заголовок, `#теги` (первый задаёт цвет), `{свойства}` в конце — `where`, `description` (markdown, показывается в подробностях) или свои.
- **Повторы** начинаются с `every` вместо даты — это подмножество RRULE из RFC 5545, записанное словами:

  | Строка | Повторяется |
  |---|---|
  | `every day`, `every 3 days` | каждый (каждый третий) день |
  | `every mon,wed`, `every 2 weeks fri` | в эти дни недели, каждую (каждую вторую) неделю |
  | `every month 15`, `every month last` | в этот день месяца, в его последний день |
  | `every month 2nd tue`, `every month last fri` | в n-й / последний такой день недели |
  | `every year 12-31` | каждый год в эту дату |

  Дни недели — `mon` … `sun`, полные английские названия или `пн` … `вс`. Границы и исключения задаются в свойствах: `from` (первая дата; нужна для `count` и для «каждые N»), `until`, `count`, `except` (даты через запятую). `{rrule: FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=2}` принимает правило как есть — например, скопированное из iCal (`FREQ`, `INTERVAL`, `BYDAY`, `BYMONTHDAY`, `BYMONTH`, `COUNT`, `UNTIL`); дата перед ним становится `from`.

`<!-- комментарии -->` пропускаются и сохраняются. Строки, не являющиеся событиями, попадают в `parseEventCalendar(source).problems` и перечисляются на вкладке **Исходник**.

## Поведение

Клик по событию открывает его подробности в выдвижной панели и отдаёт событие `open`.

При `editable` (и без `locked`): событие перетаскивается на другой день или час, растягивается в видах «день» и «неделя», клик по пустому слоту (или по дню в виде «месяц», или по **+ Событие**) создаёт новое событие. **Конструктор события** собирает событие из вариантов — дата или диапазон, весь день или время, повтор («каждые 2 недели по пн и ср», «последняя пятница каждого месяца», до даты / N раз), пропускаемые даты — и показывает строку, которую он запишет. При правке одного вхождения повтора спрашивается, изменить только его или всю серию: это вхождение становится отдельным событием, а серия пропускает его дату (перетаскивание вхождения делает то же самое); **Пропустить эту дату** только добавляет дату в `except`. Вкладка **Исходник** редактирует разметку, с проблемами по строкам.

`locked` и `lockable` работают как в [`UidKanban`](./kanban.md): `locked` — только чтение независимо от `editable`, кнопка замка отдаёт `lock`.

## Пропсы

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `source` | `string` | `''` | Разметка. Новое значение заменяет события, если только это не то, что компонент сам только что отдал. |
| `editable` | `boolean` | `false` | Перетаскивание, растягивание, конструктор события, вкладка исходника. |
| `locked` | `boolean` | `false` | Только чтение, независимо от `editable`. |
| `lockable` | `boolean` | `false` | Показать кнопку замка. |
| `view` | `CalendarView \| ''` | `''` | Вид, показываемый первым; пусто — `view:` из разметки, иначе `month`. |
| `date` | `string` | `''` | Дата, показываемая первой; пусто — `date:` из разметки, иначе сегодня. |
| `views` | `CalendarView[]` | все пять | Доступные виды. |

`view:` и `date:` из разметки применяются и тогда, когда разметка приходит после первой отрисовки, — если только их не задали пропсы или пользователь уже не перешёл на другой вид или дату.

## События

| Событие | Данные | |
|---|---|---|
| `change` | `string` | Вся новая разметка после правки. |
| `lock` | `boolean` | Нажата кнопка замка: запрошенное состояние `locked`. |
| `open` | `{ id, date, title }` | Открыто событие (`EventCalendarOpen`); `id` — событие строки, `date` — вхождение. |
| `range` | `{ view, start, end }` | Изменились дни на экране. |

## Функции

Чистые и экспортируются для использования без компонента. Идентификаторы событий позиционные (`ev-0`, `ev-1`, …); вхождение повтора — `<id>@<date>`.

| Функция | |
|---|---|
| `parseEventCalendar(source)` | → `EventCalendarDoc`: `title`, `settings`, `tagTones`, `items`, `problems`. |
| `parseEventLine(line)` | Одна строка события → `EventCalendarItem` или причина, почему это не событие (строка). |
| `parseEventRRule(text)` | `FREQ=…;…` → `EventCalendarRule` или `null`. |
| `expandEventCalendar(doc, start, end)` | Все события и вхождения, затрагивающие дни `start` … `end` → `EventCalendarOccurrence[]`. |
| `eventOccurrences(rule, start, end)` | Даты, которые правило даёт в диапазоне. |
| `eventRuleText(rule)` | Правило обратно в словах (`every 2 weeks fri`). |
| `serializeCalendarEvent(fields)` | Событие в виде строки разметки. |
| `addCalendarEvent(source, fields)` | Добавляет событие в конец. |
| `updateCalendarEvent(source, id, fields)` | Переписывает строку события. |
| `removeCalendarEvent(source, id)` | Удаляет строку события. |
| `detachCalendarOccurrence(source, id, date, fields)` | Серия пропускает `date`; под ней добавляется отдельное событие (`fields`). |

```ts
import { parseEventCalendar, expandEventCalendar } from '@dskripchenko/ui'

const shown = expandEventCalendar(parseEventCalendar(source), '2026-11-01', '2026-11-30')
```

Типы: `EventCalendarDoc`, `EventCalendarItem`, `EventCalendarRule`, `EventCalendarByDay`, `EventCalendarFreq`, `EventCalendarOccurrence`, `EventCalendarFields`, `EventCalendarProblem`, `EventCalendarOpen`, `UidEventCalendarProps`.

## Тексты

Подписи берутся из локали, раздел `eventCalendar` (см. [i18n](./i18n.md)); сама сетка календаря использует `calendar` и `datePicker`. Сообщения о проблемах в `problems` — на английском.
