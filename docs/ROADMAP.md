# Roadmap

План разработки разбит на фазы. Каждая следующая опирается на предыдущую — фундамент идёт первым.

## Phase 0 — Фундамент

Без чего нельзя начать делать компоненты.

- [ ] Инициализация проекта (`pnpm init`, `tsconfig`, `vite.config.ts` в library mode)
- [ ] ESLint flat config + Prettier
- [ ] Storybook 8 (`@storybook/vue3-vite`) + аддоны: `essentials`, `a11y`, `themes`
- [ ] Vitest + jsdom + `@vue/test-utils`
- [ ] Changesets для версионирования
- [ ] Дизайн-токены (примитивы): `colors`, `typography`, `spacing`, `radius`, `shadow`, `motion`, `z-index`
- [ ] Семантические токены + темы: `:root[data-theme='light' | 'dark']`
- [ ] Reset-стили + базовый `global.css`
- [ ] Composable `useTheme()` — переключение темы и подписка на `prefers-color-scheme`
- [ ] **Иконки** — `lucide-vue-next` как `dependency`, sub-export `@dskripchenko/ui/icons` (см. [ICONS.md](./ICONS.md)):
  - [ ] `UidIcon` — обёртка с пропами `icon` / `name` / `size` / `strokeWidth` / `color` / `title` / `spin`
  - [ ] `registerIcons()` + `getRegisteredIcon()` — динамический реестр для способа C
  - [ ] Re-export `lucide-vue-next` через `src/icons/index.ts`
  - [ ] Каталог иконок в Storybook (`Foundations/Icons`) — поиск по имени, превью всех 1500
- [ ] CI: lint + типы + тесты + сборка на каждом PR
- [ ] Tokens-каталог в Storybook (`Foundations/Colors`, `Foundations/Spacing` и т.д.)

## Phase 1 — Базовые формы

Минимум, без которого нельзя собрать ни одну форму.

- [ ] `UidButton` — variants: primary/secondary/ghost/danger, sizes, loading, icon-slots
- [ ] `UidInput` — text/email/number/password, prefix/suffix-слоты, error-state
- [ ] `UidTextarea` — auto-grow опционально
- [ ] `UidCheckbox`
- [ ] `UidRadio` + `UidRadioGroup`
- [ ] `UidSwitch`
- [ ] `UidLabel` + `UidFormField` (label + helper + error wrapper)
- [ ] Composable `useId()` — детерминированные id для связки label↔input

## Phase 2 — Обратная связь

- [ ] `UidSpinner`
- [ ] `UidSkeleton`
- [ ] `UidBadge`
- [ ] `UidAlert` — info/success/warning/danger
- [ ] `UidToast` + `useToast()` (provider + composable)
- [ ] `UidProgress` (linear, опционально circular в Phase 3)

## Phase 3 — Оверлеи

Самая сложная фаза с точки зрения a11y и фокус-менеджмента.

- [ ] Composable `useFocusTrap()`
- [ ] Composable `usePopover()` (позиционирование через Floating UI как peer-dep, или собственная реализация)
- [ ] `UidModal` / `UidDialog` — на нативном `<dialog>`
- [ ] `UidDrawer` — боковая панель
- [ ] `UidTooltip`
- [ ] `UidPopover`
- [ ] `UidMenu` / `UidDropdown`

## Phase 4 — Навигация

- [ ] `UidTabs` + `UidTab` + `UidTabPanel`
- [ ] `UidBreadcrumb`
- [ ] `UidLink` (тонкая обёртка, с поддержкой router-link)
- [ ] **Пагинация** — отдельные компоненты под разные сценарии (см. [PATTERNS.md](./PATTERNS.md#пагинация-набор-подходов)):
  - [ ] `UidPagination` — классическая нумерованная
  - [ ] `UidPaginationCursor` — prev/next для cursor-based API
  - [ ] `UidLoadMore` — кнопка «показать ещё»
  - [ ] `UidInfiniteScroll` — sentinel + IntersectionObserver
  - [ ] `UidPageSize` — селектор размера страницы

## Phase 5 — Отображение данных

- [ ] `UidCard`
- [ ] `UidAvatar` + `UidAvatarGroup`
- [ ] `UidTag` / `UidChip`
- [ ] `UidDivider`
- [ ] `UidAccordion`
- [ ] `UidTable` (минимально: thead/tbody, sortable как опция)

## Phase 6 — Layout-помощники

Утилитарные компоненты для типовых layout-задач (опционально, если станет лень руками писать flex/grid).

- [ ] `UidStack` — vertical/horizontal flex с gap
- [ ] `UidGrid` — простой grid wrapper
- [ ] `UidContainer` — max-width контейнер

## Phase 7 — Patterns (составные блоки)

«Крупные кирпичи» страниц. Опираются на компоненты из предыдущих фаз. См. [PATTERNS.md](./PATTERNS.md).

- [ ] `UidHeader` — top-bar (logo / nav / actions / mobile)
- [ ] `UidFooter` — подвал (variants: minimal, columns)
- [ ] `UidSidebar` + `UidSidebarItem` + `UidSidebarGroup` + `UidSidebarDivider`
- [ ] `UidPageHeader` — заголовок страницы (title / description / breadcrumb / actions / tabs)
- [ ] `UidEmptyState` — пустое состояние (illustration / title / description / actions)
- [ ] `UidErrorState` — состояние ошибки (включая типовые `404`, `500`, `network`)

## Phase 8 — Wizards (мастера)

Многошаговые процессы. Состоит из трёх частей.

- [ ] `UidStepper` — визуальный индикатор шагов (horizontal/vertical), используется отдельно
- [ ] `UidWizard` — orchestrator: state, current step, валидация, навигация (provide-контекст детям)
- [ ] `UidWizardStep` — обёртка шага с опциональным `validate`
- [ ] Composable `useWizard()` — доступ к контексту изнутри произвольных детей

## Phase 9 — Layouts (шаблоны страниц)

Готовые «коробки» страниц. Слоты вместо пропсов, никакой бизнес-логики.

- [ ] `UidSimpleLayout` — header / content / footer
- [ ] `UidSidebarLayout` — sidebar + (header / content / footer), мобильный drawer-режим
- [ ] `UidAuthLayout` — центрированная форма, варианты `centered` / `split`
- [ ] `UidWizardLayout` — header / stepper / content / nav, работает в паре с `UidWizard`
- [ ] Composable `useSidebar()` — collapsed/expanded из любого места внутри `UidSidebarLayout`

## Phase 10+ — По запросу

Что добавлять по необходимости:

- `UidSelect` (комбобокс с поиском — это полноценный сложный компонент, лучше отложить или взять headless-библиотеку)
- `UidDatePicker`
- `UidSlider`
- `UidColorPicker`
- `UidCommand` (ctrl+k палитра)
- `UidVirtualList`

## Принципы выбора что делать дальше

1. Делай то, что нужно прямо сейчас. Не разрабатывай впрок.
2. Сначала закрывай фазу целиком, потом переходи к следующей. Хвостовые компоненты текущей фазы важнее новых из следующей.
3. Phase 7 (patterns) и Phase 9 (layouts) можно начинать параллельно с Phase 4–6, если они уже нужны. Главное — не делать pattern, который зависит от ещё не готового компонента.
4. Если компонент сложнее, чем кажется (Select, DatePicker), — рассмотри headless-библиотеку как peer-dep вместо своей реализации.
