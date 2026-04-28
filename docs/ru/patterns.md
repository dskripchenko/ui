# Паттерны и шаблоны страниц

Помимо атомарных компонентов kit предоставляет два дополнительных слоя:

- **Patterns** — составные блоки: Header, Footer, Sidebar, PageHeader, EmptyState. Это «крупные кирпичи», собранные из компонентов.
- **Layouts** — готовые шаблоны страниц: Simple, Sidebar, Auth, Wizard. Это «коробка целиком» — задаёт расположение Header / Sidebar / Content / Footer и оставляет слоты под контент.

Идея простая: часто нужен не «UidButton», а «вёрстка приборной панели за 5 минут». Patterns и layouts закрывают именно это.

## Граница: Component vs Pattern vs Layout

| Вопрос | Component | Pattern | Layout |
|---|---|---|---|
| Что это? | Атомарный UI-элемент | Узнаваемый составной блок страницы | Шаблон расположения блоков |
| Сколько слотов? | 0–2 (default + опционально prepend/append) | 3–6 (logo, nav, actions, …) | 2–4 (header, sidebar, content, footer) |
| Опираается на | Только токены | Components | Patterns + components |
| Пример | `UidButton`, `UidInput` | `UidHeader`, `UidSidebar` | `UidSidebarLayout` |
| Когда использовать в проекте | Везде | Когда нужен типовой блок и не хочется собирать руками | Для целой страницы со стандартной формой |

**Ключевое правило:** patterns и layouts опциональны для пользователя. Можно собрать страницу из одних компонентов и не подключать ни одного pattern'a — kit это поддерживает.

## Структура

```
src/
  patterns/
    Header/
      UidHeader.vue
      UidHeader.css
      UidHeader.stories.ts
      index.ts
    Footer/
    Sidebar/
    PageHeader/
    EmptyState/
    ErrorState/

  layouts/
    SimpleLayout/
      UidSimpleLayout.vue
      UidSimpleLayout.css
      UidSimpleLayout.stories.ts
      index.ts
    SidebarLayout/
    AuthLayout/
    WizardLayout/
```

Префикс именования — тот же `Uk*`. CSS-классы — `uid-pattern-*` (для патернов) и `uid-layout-*` (для лэйаутов), чтобы по DOM было видно слой.

## Patterns

Все patterns решают одну типовую задачу страницы. У каждого фиксированный набор слотов, минимум пропсов и максимум кастомизации через слоты, а не через флажки.

### `UidHeader` — верхняя панель

Назначение: top-bar приложения. Логотип слева, навигация в центре, действия (профиль, тема, поиск) справа.

Слоты:

| Слот | Назначение |
|---|---|
| `logo` | Логотип, бренд, ссылка на главную |
| `nav` | Основное меню (`UidLink`, `UidMenu`) |
| `actions` | Иконки/кнопки справа: тема, нотификации, профиль |
| `mobile` | Контент, который показывается вместо `nav` ниже breakpoint'a |

Пропсы (минимум): `sticky?: boolean`, `bordered?: boolean`, `transparent?: boolean`.

CSS-переменные для кастомизации:

```css
.uid-pattern-header {
  --uid-header-height:   64px;
  --uid-header-bg:       var(--uid-surface-base);
  --uid-header-border:   var(--uid-border-subtle);
  --uid-header-padding:  0 var(--uid-space-6);
  --uid-header-z:        var(--uid-z-sticky);
}
```

### `UidFooter` — нижняя панель

Назначение: подвал с навигацией, копирайтом, ссылками.

Слоты:

| Слот | Назначение |
|---|---|
| `default` | Основной контент, если простой случай |
| `columns` | Колонки со ссылками (Resources / Company / Legal) |
| `bottom` | Нижняя строка: копирайт + соц-иконки |

Пропсы: `variant?: 'minimal' \| 'columns'`.

### `UidSidebar` — боковая навигация

Назначение: вертикальное меню приложения.

Слоты:

| Слот | Назначение |
|---|---|
| `header` | Верх сайдбара: логотип/бренд |
| `nav` | Основная навигация (вложенные `UidSidebarItem`/`UidSidebarGroup` — это под-компоненты) |
| `footer` | Низ сайдбара: профиль / settings / collapse-кнопка |

Пропсы: `collapsed?: boolean`, `width?: string`, `position?: 'left' \| 'right'`.

Сайдбар состоит из под-компонентов (живут внутри `patterns/Sidebar/`):

- `UidSidebarItem` — одиночный пункт (иконка + label + опциональный badge)
- `UidSidebarGroup` — секция со заголовком и набором item'ов
- `UidSidebarDivider`

### `UidPageHeader` — заголовок страницы

Назначение: шапка контентной зоны с заголовком, описанием, breadcrumb'ом и набором действий.

Слоты:

| Слот | Назначение |
|---|---|
| `breadcrumb` | `UidBreadcrumb` или произвольная навигация |
| `title` | Заголовок (по умолчанию рендерится из проп `title`) |
| `description` | Подзаголовок |
| `actions` | Кнопки действий справа |
| `tabs` | Опциональные `UidTabs` под заголовком |

Пропсы: `title?: string`, `description?: string`, `back?: boolean` (показать стрелку «назад» с эмитом `back`).

### `UidEmptyState` — пустое состояние

Назначение: фолбэк, когда данных нет («нет проектов», «ничего не найдено», «начни с создания…»).

Слоты:

| Слот | Назначение |
|---|---|
| `illustration` | Иконка или иллюстрация сверху |
| `title` | Заголовок (или проп `title`) |
| `description` | Объяснение (или проп `description`) |
| `actions` | CTA-кнопки |

### `UidErrorState` — состояние ошибки

То же, что `UidEmptyState`, но с акцентом на ошибку. По умолчанию иконка тревожная, цвета через `--uid-danger`. Принимает `code?: string \| number` и `message?: string` для типовых случаев (`404`, `500`, `network`).

## Layouts

Layout = «коробка» страницы. Принимает крупные слоты (header, sidebar, content, footer) и расставляет их в нужную сетку. Сам не содержит логики — это структурная обёртка.

### `UidSimpleLayout`

Самый простой шаблон: вертикальный stack — header сверху, контент в центре, footer снизу.

Слоты: `header`, `default` (контент), `footer`.

Использование:

```html
<UidSimpleLayout>
  <template #header>
    <UidHeader>
      <template #logo>Project</template>
      <template #nav>…</template>
    </UidHeader>
  </template>

  <main>
    <UidPageHeader title="Главная" />
    …
  </main>

  <template #footer>
    <UidFooter>© 2026</UidFooter>
  </template>
</UidSimpleLayout>
```

### `UidSidebarLayout`

Двухколоночный шаблон: фиксированный sidebar слева, контент справа. Опционально header сверху и footer снизу. Самый частый layout для админки/дашборда.

Слоты: `sidebar`, `header?`, `default`, `footer?`.

Пропсы: `sidebarWidth?: string`, `sidebarCollapsed?: boolean`, `sidebarPosition?: 'left' \| 'right'`.

Поведение:

- На мобильном (ниже breakpoint'a, по умолчанию 768px) sidebar схлопывается в drawer, открываемый по клику в header'е (через `useSidebar()` composable).
- Composable `useSidebar()` экспортируется из `layouts/SidebarLayout/` — даёт доступ к состоянию collapsed/expanded из любого места внутри layout'a.

### `UidAuthLayout`

Шаблон для страниц логина/регистрации/восстановления: центрированная карточка на полный экран, опциональная иллюстрация сбоку.

Слоты: `default` (карточка с формой), `aside?` (картинка/брендинг сбоку), `footer?` (мелкие ссылки внизу: ToS, Privacy).

Пропсы: `variant?: 'centered' \| 'split'`.

### `UidWizardLayout`

Шаблон для пошаговых процессов (онбординг, многошаговые формы, мастер настройки).

Слоты:

| Слот | Назначение |
|---|---|
| `header` | Опциональный заголовок процесса |
| `stepper` | Индикатор шагов (по умолчанию рендерит `UidStepper` из props) |
| `default` | Контент текущего шага |
| `nav` | Кнопки Назад/Далее (по умолчанию `UidButton`) |

Используется вместе с `UidWizard` (см. ниже) или самостоятельно — layout не диктует state-management.

## Wizards (мастера)

Визард — не один компонент, а набор:

- `UidStepper` — визуальный индикатор шагов (горизонтальный/вертикальный). Используется самостоятельно.
- `UidWizard` — orchestrator: хранит current-step, валидацию, навигацию. Provide'ит контекст детям.
- `UidWizardStep` — обёртка одного шага. Подписывается на контекст, рендерит свой контент только если активен. Может содержать validator (sync или async).

Пример сборки:

```html
<UidWizard
  :steps="[
    { id: 'profile', title: 'Профиль' },
    { id: 'preferences', title: 'Настройки' },
    { id: 'review', title: 'Подтверждение' },
  ]"
  @finish="onFinish"
>
  <template #default="{ current, next, prev, isFirst, isLast }">
    <UidWizardLayout>
      <template #stepper>
        <UidStepper :steps="$wizard.steps" :current="current" />
      </template>

      <UidWizardStep id="profile" :validate="validateProfile">
        <ProfileForm v-model="form.profile" />
      </UidWizardStep>

      <UidWizardStep id="preferences">
        <PreferencesForm v-model="form.preferences" />
      </UidWizardStep>

      <UidWizardStep id="review">
        <Review :data="form" />
      </UidWizardStep>

      <template #nav>
        <UidButton variant="ghost" :disabled="isFirst" @click="prev">Назад</UidButton>
        <UidButton @click="next">{{ isLast ? 'Готово' : 'Далее' }}</UidButton>
      </template>
    </UidWizardLayout>
  </template>
</UidWizard>
```

Состояние можно достать снаружи через composable `useWizard()` — для случаев, когда navigator'у нужно знать про шаги (например, кастомный header).

## Пагинация: набор подходов

Один `UidPagination` с вариантами не покрывает все случаи — у них разная механика и API. Поэтому в kit идут несколько компонентов, у каждого своё назначение.

| Компонент | UI | Когда применять |
|---|---|---|
| `UidPagination` | `« 1 2 [3] 4 … 10 »` | Известно общее число страниц, нужен прямой переход |
| `UidPaginationCursor` | `← Назад · Далее →` | Cursor-based API (Slack, Twitter), общее число неизвестно |
| `UidLoadMore` | Кнопка «Показать ещё» | Лента, где пользователь сам решает докручивать |
| `UidInfiniteScroll` | sentinel-элемент в конце списка | Бесконечный feed, автоподгрузка при доскролле |
| `UidPageSize` | Селектор «10 / 25 / 50» | Дополнение к `UidPagination`, чтобы менять размер страницы |

### `UidPagination` (классический)

Пропсы: `total: number`, `pageSize: number`, `current: number`, `siblingCount?: number`, `boundaryCount?: number`.

События: `update:current` (v-model:current).

Слоты: `prev`, `next`, `page` (для кастомизации каждого пункта).

### `UidPaginationCursor`

Пропсы: `hasPrev: boolean`, `hasNext: boolean`, `loading?: boolean`.

События: `prev`, `next`.

Не знает про номера — только направление.

### `UidLoadMore`

Кнопка с состоянием loading и опциональным счётчиком.

Пропсы: `loading?: boolean`, `disabled?: boolean`, `remaining?: number` (для текста «Показать ещё (42)»).

Событие: `load`.

### `UidInfiniteScroll`

Невидимый sentinel + IntersectionObserver. Эмитит `load`, когда пользователь приблизился к концу.

Пропсы: `disabled?: boolean`, `rootMargin?: string` (по умолчанию `200px`), `loading?: boolean`.

Событие: `load`.

Слот по умолчанию — индикатор загрузки внизу (`UidSpinner` или Skeleton'ы).

### `UidPageSize`

Просто `UidSelect` с заранее заданными вариантами.

Пропсы: `modelValue: number`, `options?: number[]` (по умолчанию `[10, 25, 50, 100]`).

Поддерживает `v-model`.

## Принципы для patterns/layouts

1. **Слоты важнее пропсов.** Если можно вынести часть в слот — выноси. Это снимает зависимость от десятка булевых флагов и пропсов вроде `showLogo`.
2. **Никакой бизнес-логики.** Patterns не знают про роутер, auth, API. Если нужен router-link — пользователь передаёт его в слот, или это делается через проп `to` + событие `navigate`.
3. **Композиция, а не наследование.** Layout = `<header-slot> + <content-slot> + <footer-slot>`, без своего «протокола страницы». Захотел нестандартное — собирай руками из компонентов.
4. **Темизация через те же CSS-переменные.** Patterns/layouts не вводят новых семантических токенов — только локальные `--uid-header-*`, `--uid-sidebar-*`, `--uid-layout-*` с фолбэком на семантику.
5. **A11y-каркас должен быть осмысленным.** `UidSimpleLayout` рендерит `<header>`, `<main>`, `<footer>` правильно. `UidSidebarLayout` помечает sidebar как `<aside>`. Это базовая структура страницы — нельзя халтурить.
