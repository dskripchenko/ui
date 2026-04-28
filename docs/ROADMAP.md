# Roadmap

Текущий состав библиотеки и планы развития.

## Состояние

Все исходные фазы (Phase 0–10+) закрыты. В библиотеке **59 компонентов**: 47 атомарных, 7 паттернов, 4 лейаута + 9 composables.

## Реализовано

### Phase 0 — Фундамент

- [x] Vite library mode + TypeScript
- [x] ESLint flat config + Prettier
- [x] Storybook 8 (`@storybook/vue3-vite`) + аддоны: `essentials`, `a11y`, `themes`
- [x] Vitest + jsdom + `@vue/test-utils`
- [x] Changesets + GitHub Actions релизный пайплайн
- [x] Дизайн-токены: `colors`, `typography`, `spacing`, `radius`, `shadow`, `motion`, `z-index`
- [x] Семантические токены + темы `:root[data-theme='light' | 'dark']`
- [x] Reset-стили и `global.css`
- [x] `useTheme()` — переключение темы и подписка на `prefers-color-scheme`
- [x] **Иконки** — `lucide-vue-next` + `UidIcon` + sub-export `@dskripchenko/ui/icons`

### Phase 1 — Базовые формы

- [x] `UidButton`, `UidInput`, `UidTextarea`
- [x] `UidCheckbox`, `UidRadio` + `UidRadioGroup`, `UidSwitch`
- [x] `UidLabel`, `UidFormField`
- [x] `useField()` для валидации

### Phase 2 — Обратная связь

- [x] `UidSpinner`, `UidSkeleton`
- [x] `UidBadge`, `UidAlert`, `UidProgress`
- [x] `UidToast` + `UidToastProvider` + `useToast()`

### Phase 3 — Оверлеи

- [x] `useFocusTrap()`, `usePopover()`, `useScrollLock()`
- [x] `UidModal`, `UidDrawer`
- [x] `UidTooltip`, `UidPopover`
- [x] `UidMenu` + `UidMenuItem` + `UidMenuSeparator`

### Phase 4 — Навигация

- [x] `UidTabs` + `UidTab` + `UidTabPanel`
- [x] `UidBreadcrumb` + `UidBreadcrumbItem`, `UidLink`
- [x] `UidPagination`, `UidPaginationCursor`, `UidLoadMore`, `UidInfiniteScroll`, `UidPageSize`

### Phase 5 — Отображение данных

- [x] `UidCard`, `UidAvatar` + `UidAvatarGroup`
- [x] `UidTag`, `UidDivider`
- [x] `UidAccordion` + `UidAccordionItem`
- [x] `UidTable` (sortable)

### Phase 6 — Layout-помощники

- [x] `UidStack`, `UidGrid`, `UidContainer`

### Phase 7 — Patterns

- [x] `UidHeader`, `UidFooter`
- [x] `UidSidebar` + `UidSidebarItem` + `UidSidebarGroup` + `UidSidebarDivider`
- [x] `UidPageHeader`
- [x] `UidEmptyState`, `UidErrorState`
- [x] `UidResult` (success/info/warning/error)

### Phase 8 — Wizards

- [x] `UidStepper`
- [x] `UidWizard` + `UidWizardStep`
- [x] `useWizard()`

### Phase 9 — Layouts

- [x] `UidSimpleLayout`, `UidSidebarLayout`, `UidAuthLayout`, `UidWizardLayout`
- [x] `useSidebar()`

### Phase 10+ — Сложные компоненты

- [x] `UidSelect` (комбобокс с поиском, группами, опциональным clear)
- [x] `UidDatePicker`
- [x] `UidSlider`
- [x] `UidColorPicker` (HSV + alpha + presets)
- [x] `UidCommand` (ctrl+k палитра) + `useCommandPalette()`
- [x] `UidVirtualList`

### Расширение базы (после Phase 10)

**Заход 1 — формы и данные (`v0.2.0`):**
- [x] `UidNumberInput`, `UidTimePicker`, `UidDateRangePicker`
- [x] `UidTagsInput`, `UidCombobox`
- [x] `UidTreeView` + `UidTreeItem`
- [x] `UidTimeline` + `UidTimelineItem`
- [x] `UidFileUpload`, `UidCode`

**Заход 2 — средний приоритет (`v0.3.0`):**
- [x] `UidRating`, `UidSplitter`
- [x] `UidStat`
- [x] `UidDescriptionList` + `UidDescriptionItem`
- [x] `UidResult` (паттерн)

**Заход 3 — низкий приоритет (`v0.4.0`):**
- [x] `UidBackTop`, `UidAffix`, `UidAnchor` (навигация)
- [x] `UidWatermark` (canvas-overlay)
- [x] `UidTour` (onboarding)
- [x] `UidMention` (@-упоминания)
- [x] `UidTreeSelect` (Tree + Select)

## Что дальше

В порядке убывания пользы:

### Качество и DX

- [ ] **i18n** — все строки в компонентах (`Очистить`, `Поиск...`, `Готово` и т.п.) сейчас захардкожены на русском. Вынести в провайдер с переопределением.
- [ ] **A11y-аудит** — пройти Storybook addon-a11y по всем компонентам, исправить замечания.
- [ ] **Bundle-визуализатор** — `rollup-plugin-visualizer`, понять самые жирные компоненты.
- [ ] **Документационный сайт** — VitePress отдельно от Storybook, с гайдами по темизации/токенам/паттернам.

### Возможные компоненты (по запросу)

Не нужны прямо сейчас, но имеют ясные сценарии:

- [ ] `UidCalendar` — полный календарь с событиями (у нас только `UidDatePicker`)
- [ ] `UidCarousel` — слайдер изображений/слайдов
- [ ] `UidCascader` — каскадный выбор уровень за уровнем
- [ ] `UidTransfer` — два списка с переносом элементов между ними
- [ ] `UidNotificationBadge` — точка/число поверх иконки

## Принципы

1. Делай то, что нужно прямо сейчас. Не разрабатывай впрок.
2. Для каждого нового компонента — `.vue` + `.css` + `.spec.ts` + `.stories.ts` + `index.ts`, экспорт через `src/index.ts`.
3. Если компонент сложнее, чем кажется (Calendar, Cascader), — рассмотри headless-библиотеку как peer-dep вместо своей реализации.
