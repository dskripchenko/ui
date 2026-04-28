# @dskripchenko/ui

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
