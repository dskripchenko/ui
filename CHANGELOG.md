# @dskripchenko/ui

## 0.6.0

### Minor Changes

- 286f079: Заход 5 — графики (SVG-примитивы, без runtime-зависимостей):
  - **UidSparkline** — мини-график тренда: line/bar/area, smoothing, dots, zero-line; для KPI-карточек и инлайн-вставок
  - **UidProgressRing** — круговой прогресс на SVG `stroke-dasharray`, indeterminate-режим, кастомный лейбл/слот
  - **UidGauge** — полукруг-циферблат с цветовыми диапазонами (`ranges`) и опциональной стрелкой; aria-meter
  - **UidHeatmap** — календарный heatmap GitHub-style с авто-пресчётом уровней, легендой и tooltip через `<title>`

  Полные графики (Line/Bar/Pie/Area) намеренно не входят в kit — рекомендации по парной интеграции с Chart.js / ECharts описаны в `docs/CHARTS.md`.

### Patch Changes

- 1ee3a22: Закрыт остаток a11y-аудита:
  - **TreeView** — roving tabindex (только активный узел в Tab order, остальные `-1`), полная клавиатурная навигация: ArrowUp/Down между видимыми соседями, ArrowRight раскрывает или переходит вглубь, ArrowLeft сворачивает или возвращает к родителю, Home/End на первый/последний видимый узел.
  - **TimePicker** — каждая колонка получила `role="listbox"` + `aria-label`, ячейки `role="option"` + `aria-selected`. ArrowUp/Down/Home/End навигирует по значениям внутри колонки с плавной прокруткой, Enter подтверждает выбор, Escape закрывает.
  - **ColorPicker** — hue/alpha-треки получили `role="slider"` + `aria-valuemin/max/now` + `tabindex`. Стрелки регулируют значение (Shift = шаг 10), Home/End — крайние значения. Sat/Brightness-область — `role="application"` с двумерной навигацией стрелками.

## 0.5.0

### Minor Changes

- 81c1186: Заход 4 — 5 новых компонентов:
  - **UidCalendar** — полноразмерный месячный календарь с событиями, навигацией по месяцам, кнопкой «Сегодня», compact-вариантом и `min`/`max`
  - **UidCarousel** — слайдер с автоплеем, индикаторами, стрелками, горизонтальным/вертикальным режимом и keyboard-навигацией; generic-типизация для items
  - **UidCascader** — каскадный выбор уровень за уровнем (страна → город → район), с поддержкой hover/click expand-trigger, отображением пути и кастомным separator
  - **UidTransfer** — два списка с переносом элементов между ними, опциональным поиском, выбором всех в текущей фильтрации
  - **UidNotificationBadge** — счётчик/точка поверх любого элемента (иконки, аватара, кнопки) с настройкой placement, tone, max и offset

- 22f2c82: **i18n**: все строки в компонентах вынесены в локали с возможностью переопределения.

  Новые экспорты:
  - `UidLocaleProvider` — обёртка-компонент с пропом `locale: UidLocale | UidPartialLocale`
  - `useLocale()` — composable для чтения текущей локали
  - `provideLocale(source)` — программное предоставление локали
  - Готовые локали: `ru` (по умолчанию) и `en`
  - Типы: `UidLocale`, `UidPartialLocale`

  Поддержано переопределение строк во всех ключевых компонентах: Select, Combobox, DatePicker, DateRangePicker, TimePicker, TreeSelect, NumberInput, TagsInput, FileUpload, Mention, BackTop, Tour, TreeView, Pagination, Modal, Drawer, Toast, Alert, Tag, Code, DescriptionList.

  Использование:

  ```vue
  <UidLocaleProvider :locale="en">
    <App />
  </UidLocaleProvider>
  ```

  Или частичное переопределение:

  ```vue
  <UidLocaleProvider :locale="{ tour: { next: 'Forward' } }">
    <App />
  </UidLocaleProvider>
  ```

  Дефолт остался `ru` — без оборачивания всё работает как раньше.

### Patch Changes

- a7c0e6b: A11y-улучшения и инструмент анализа размера:
  - **Bundle visualizer** — подключён `rollup-plugin-visualizer`, новый скрипт `pnpm build:analyze` генерирует интерактивный treemap в `stats.html`
  - **DatePicker** — полная клавиатурная навигация по сетке дней (стрелки, PageUp/Down, Home/End, Enter, Escape) с roving tabindex; trigger получил `role="combobox"`, `aria-haspopup="dialog"`, `aria-label`
  - **Triggers пиков** в DateRangePicker, TimePicker, TreeSelect — добавлены `role="combobox"`/`aria-haspopup`/`aria-controls`/`aria-label`
  - **UidMenu trigger** — `tabindex="0"`, `role="button"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`
  - **UidPopover trigger** — `role="button"`, `tabindex`, `aria-haspopup="dialog"`, Enter/Space; popover с `role="dialog"`
  - **UidCombobox** — `role="combobox"` перенесён с обёртки на `<input>` (по WAI-ARIA 1.2)
  - **UidCard** при `clickable` — получает `role="button"`, `tabindex`, обработку Enter/Space, событие `click`
  - **UidTable** — sortable заголовки получили `tabindex`, `role="button"`, обработку Enter/Space
  - **UidAnchor** — активная ссылка получает `aria-current="location"`
  - **UidTour** — Escape закрывает тур, ArrowLeft/Right переключают шаги, фокус переносится в попап при открытии и возвращается на исходный элемент при закрытии
  - **UidFileUpload** — устранён двойной tabstop (input получил `tabindex="-1"` и `aria-hidden`)

## 0.4.0

### Minor Changes

- cfb6467: Добавлено 7 компонентов низкого приоритета:
  - **UidBackTop** — кнопка «наверх», появляется при достижении порога скролла, с smooth-возвратом
  - **UidAffix** — sticky-обёртка с `offsetTop`/`offsetBottom` через position:sticky + IntersectionObserver, эмит `change(affixed)`
  - **UidWatermark** — диагональный водяной знак через canvas → data-URL с настройкой шрифта, цвета, наклона, шага
  - **UidAnchor** — навигация по якорям с подсветкой активного раздела через IntersectionObserver и smooth-scroll
  - **UidTour** — гид-тултипы по UI: spotlight на target-элементе, шаги, центрированный modal-режим, маска
  - **UidMention** — textarea с @-упоминаниями: триггер по символу/символам, popup со списком, навигация ↑↓ Enter/Tab
  - **UidTreeSelect** — гибрид TreeView + Select: trigger с выбранным значением, single/multiple, чипы с maxTagCount

## 0.3.0

### Minor Changes

- 5e93139: Добавлено 5 компонентов среднего приоритета:
  - **UidRating** — 5-звёздная (или N) оценка с поддержкой half-step, кастомных иконок, тонов и клавиатурной навигации
  - **UidSplitter** — resizable-панели по горизонтали/вертикали с min/max, step, drag и keyboard-управлением
  - **UidStat** — KPI-карточка с числом, дельтой (up/down/flat), форматированием через locale или formatter, иконкой по тонам и loading-состоянием
  - **UidResult** — паттерн-страница для success/info/warning/error с заголовком, описанием, дополнительным content и actions
  - **UidDescriptionList** / **UidDescriptionItem** — список пар «ключ-значение» с горизонтальным/вертикальным режимом, multi-column сеткой, bordered-вариантом и copy-to-clipboard

## 0.2.0

### Minor Changes

- ede4523: Добавлено 9 новых компонентов:
  - **UidNumberInput** — числовой ввод с кнопками +/−, шагом, precision и clamp по min/max
  - **UidTimePicker** — выбор времени HH:MM(:SS), 12/24-часовой режим, настраиваемый шаг
  - **UidDateRangePicker** — выбор диапазона дат с двумя месяцами и пресетами
  - **UidTagsInput** — поле, превращающее ввод в чипы по Enter/comma/paste, с валидацией
  - **UidCombobox** — Select с поиском по введённому тексту и опц. allow-create
  - **UidTreeView** — иерархическое дерево с expand/collapse, single/multiple selection, чекбоксами с пропагацией состояния родитель↔потомки
  - **UidTimeline** / **UidTimelineItem** — лента событий с тонами и alternate-раскладкой
  - **UidFileUpload** — загрузка с drag-and-drop, прогрессом, accept/maxSize/maxFiles
  - **UidCode** — блок кода и инлайн-вариант с копированием, номерами строк, max-height

## 0.1.0

### Minor Changes

- eba13c8: Начальный релиз библиотеки компонентов.

  Компоненты: Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, ColorPicker, Command, Container, DatePicker, Divider, Drawer, FormField, Grid, Input, Link, Menu, Modal, Pagination, Popover, Progress, Radio, Select, Skeleton, Slider, Spinner, Stack, Stepper, Switch, Table, Tabs, Tag, Textarea, Toast, Tooltip, VirtualList.

  Паттерны: EmptyState, ErrorState, Footer, Header, PageHeader, Sidebar, Wizard.

  Лейауты: Auth, Sidebar, Simple, Wizard.
