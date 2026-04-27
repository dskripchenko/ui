# CLAUDE.md

Инструкции для Claude Code при работе с этим репозиторием.

## Контекст проекта

Это `@dskripchenko/ui` — набор Vue 3 компонентов с CSS custom properties. Не enterprise-решение. **Простота важнее покрытия фич.**

## Стек и ключевые решения

- **Vue 3 + TypeScript** (Composition API, `<script setup>`)
- **Стилизация — только CSS custom properties.** Никаких Tailwind, CSS-in-JS, CSS Modules, SCSS. Препроцессинг — максимум PostCSS для nesting/autoprefixer.
- **Темы** — через `data-theme="light|dark"` на `:root`. Семантические токены переопределяются, примитивы остаются неизменными.
- **Документация компонентов — Storybook.** Каждый компонент = одна `.stories.ts`.
- **Сборка** — Vite library mode, выходные форматы `es` + `cjs`, `.d.ts` через `vite-plugin-dts`.
- **Иконки** — `lucide-vue-next` как `dependency`, обёртка `UidIcon`. Sub-export `@dskripchenko/ui/icons` реэкспортирует всю Lucide. Подробно — `docs/ICONS.md`.
- **Публикация** — npm, scope `@dskripchenko`.

## Структура

```
src/
  tokens/        # CSS-переменные: primitives + semantic
  styles/        # reset, themes, global
  icons/         # UidIcon + registry + re-export lucide-vue-next (sub-export /icons)
  components/    # атомарные компоненты (Button, Input, Modal…)
  patterns/      # составные блоки (Header, Footer, Sidebar, PageHeader, EmptyState)
  layouts/       # шаблоны страниц (Simple, Sidebar, Auth, Wizard)
  composables/   # переиспользуемая логика (use*.ts)
  utils/         # утилиты без зависимостей от Vue
  index.ts       # публичный barrel-экспорт

docs/            # вся проектная документация (см. README)
```

Три слоя сущностей с разными правилами:

- **Components** — атомарные, опираются только на токены. Используются везде.
- **Patterns** — составные блоки, опираются на components. Минимум пропсов, максимум слотов.
- **Layouts** — каркас целой страницы. Слоты для header/sidebar/content/footer, никакой бизнес-логики.

Подробно — `docs/PATTERNS.md`.

## Правила компонентов

- Префикс класса в DOM — `uid-` (`uid-button`, `uid-input`). Не использовать `scoped`-стили — они мешают темизации и переопределению снаружи.
- Префикс имени компонента — `Uid` (`UidButton`, `UidInput`).
- Стили компонента — отдельный `.css` рядом с `.vue`, импортируется в `<script setup>`.
- Все настраиваемые значения (цвета, отступы, скругления) — через CSS-переменные с фолбэком на токен. Пример: `color: var(--uid-button-color, var(--uid-color-text-on-primary))`.
- Props/Events/Slots — строго типизированные. Дефолты через `withDefaults`.
- A11y — обязателен минимум: корректные роли, поддержка клавиатуры, focus-ring через `:focus-visible`.

## Команды (после установки)

| Что | Команда |
|---|---|
| Storybook | `pnpm dev` (alias к `storybook dev`) |
| Сборка библиотеки | `pnpm build` |
| Тесты | `pnpm test` |
| Линт | `pnpm lint` |
| Релиз | `pnpm changeset` → `pnpm release` |

## Что НЕ делать

- Не предлагать переезд на CSS-in-JS, Tailwind или препроцессоры.
- Не вводить монорепо, multi-package структуру до явного запроса.
- Не добавлять runtime-зависимости без обсуждения — у kit'a должна быть лёгкая инсталляция.
- Не использовать `scoped` стили в `.vue` (см. выше).
- Не писать docstrings и многострочные комментарии в коде. Документация живёт в `docs/` и Storybook'е.

## Язык

Документы (`*.md`), описания stories, сообщения коммитов — на русском. Идентификаторы, имена файлов, props, events — на английском.
