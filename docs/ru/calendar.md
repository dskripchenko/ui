# Календарь

`UidCalendar` — календарь с видами «день», «неделя», «месяц», «год» и «повестка». Он показывает события, выбирает дату (`v-model`) и при `editable` позволяет переносить и растягивать события. Как и доска, сам события не меняет: отдаёт `event-move`, а хост применяет изменение. [`UidEventCalendar`](./event-calendar.md) — календарь на разметке, построенный поверх него.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidCalendar, type CalendarEvent, type CalendarEventMove, type CalendarSlot, type CalendarView } from '@dskripchenko/ui'

const events = ref<CalendarEvent[]>([
  { id: 1, date: '2026-11-03', time: '10:00', endTime: '11:00', title: 'Демо релиза' },
  { id: 2, date: '2026-11-10', endDate: '2026-11-14', title: 'Код-фриз' },
  { id: 3, date: '2026-11-20', title: 'Импортированный праздник', editable: false },
])
const view = ref<CalendarView>('month')

function onMove(m: CalendarEventMove): void {
  events.value = events.value.map((e) => (e === m.event
    ? { ...e, date: m.date, endDate: m.endDate, time: m.time ?? e.time, endTime: m.endTime ?? e.endTime }
    : e))
}

function onSlot(s: CalendarSlot): void {
  // открыть форму нового события на s.date (и s.time)
}
</script>

<template>
  <UidCalendar
    v-model:view="view"
    :views="['day', 'week', 'month', 'year', 'agenda']"
    :events="events"
    editable
    @event-move="onMove"
    @slot-click="onSlot"
  />
</template>
```

## События календаря

| Поле | Тип | |
|---|---|---|
| `id` | `string \| number` | Необязательный идентификатор (используется как ключ). |
| `date` | `string` | `YYYY-MM-DD`: первый день. |
| `endDate` | `string` | Последний день, **включительно**: `date: '2026-11-10', endDate: '2026-11-14'` — пять дней. Не задан или равен `date` — один день. |
| `time`, `endTime` | `string` | `HH:MM`. Без `time` событие на весь день. |
| `title` | `string` | Название. |
| `color` | `string` | Любой CSS-цвет. |
| `editable` | `boolean` | `false` — событие не переносится и не растягивается (ручки нет), даже если календарь `editable`; по клику оно по-прежнему открывается. `true` или не задано — как у календаря. |

## Поведение

С `editable`:

- событие переносится на другой день (месяц, строка «весь день») или на другой день и время (сетка дня и недели);
- событие со временем растягивается за нижний край в сетке дня и недели — новый `endTime`;
- событие на весь день или многодневное растягивается за ручку на его конце (правый край в последний день) в сетке месяца и в строке «весь день» — протяжка по дням даёт новый `endDate`, включительно; раньше `date` он не уходит.

Каждый законченный перенос отдаёт `event-move` один раз; Escape его отменяет.

`selectable` (по умолчанию равен `editable`) делает так, что клик по пустому месту отдаёт `slot-click`: время в сетке дня и недели (с округлением вниз до получаса), день в строке «весь день». Поэтому календарь только для чтения может предложить «создать здесь» одним `selectable`. Курсор-ячейка следует за `selectable`.

Клик по дню в виде «месяц» выбирает его: `update:modelValue`, `date-click`, `change`. В виде «год» клик по дню сначала открывает его — `update:anchor` и `update:view` в `day`, если `views` его предлагает, — а затем выбирает так же, включая `date-click`. Поскольку вид меняется раньше, обработчик `date-click`, читающий текущий вид (например, через `v-model:view`), отличит этот переход от клика в месяце. Клик по названию месяца в виде «год» только открывает месяц; клик по дню в шапке недели только открывает день.

## Props

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `events` | `CalendarEvent[]` | `[]` | События. |
| `views` | `CalendarView[]` | `['month']` | Доступные виды; если их больше одного, показывается переключатель. |
| `editable` | `boolean` | `false` | Перенос и растягивание событий. |
| `selectable` | `boolean` | `editable` | Отдавать `slot-click` на клик по пустому месту. |
| `min`, `max` | `string` | — | `YYYY-MM-DD`: дни вне диапазона не выбираются. |
| `compact` | `boolean` | `false` | Уменьшенная сетка месяца. |
| `maxEventsPerDay` | `number` | `3` | Сколько событий в дне месяца; остальные — под «+N». |
| `todayLabel` | `string` | из локали | Подпись кнопки «Сегодня». |
| `hourHeight` | `number` | `48` | Пикселей на час в сетке дня и недели. |
| `scrollToHour` | `number` | `8` | К какому часу прокручивается сетка дня и недели. |

`v-model` — выбранная дата, `v-model:view` — вид, `v-model:anchor` — дата, вокруг которой строится вид.

## Отдаваемые события

| Событие | Payload | |
|---|---|---|
| `event-click` | `CalendarEvent` | Клик по событию. |
| `event-move` | `CalendarEventMove` | `{ event, date, endDate?, time?, endTime? }`: исходное событие и куда оно переходит. Перенос даёт новый `date` (плюс `endDate` у многодневного, `time`/`endTime` у события со временем); растягивание в сетке времени — новый `endTime`; растягивание в сетке месяца или в строке «весь день» — новый `endDate`. |
| `slot-click` | `CalendarSlot` | `{ date, time? }`: клик по пустому месту (при `selectable`). |
| `date-click` | `string` | Выбран день. |
| `change` | `string \| null` | Выбранная дата. |
| `range` | `CalendarRange` | `{ view, start, end }`: изменились дни на экране — загрузите для них события. |

Типы: `UidCalendarProps`, `CalendarEvent`, `CalendarEventMove`, `CalendarSlot`, `CalendarRange`, `CalendarView`.

## Тексты

Подписи берутся из словаря локали, разделы `calendar` и `datePicker` (см. [i18n](./i18n.md)); `calendar.resize` — подсказка ручек растягивания.
