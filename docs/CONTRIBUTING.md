# Контрибьютинг

Это репозиторий одного автора, но workflow всё равно зафиксирован — чтобы не забывать «как мы это делаем».

## Окружение

- Node.js 20 LTS+
- pnpm 9+

```bash
pnpm install
pnpm dev          # Storybook
pnpm test         # Vitest в watch
pnpm test --run   # Vitest one-shot
pnpm lint
pnpm typecheck
pnpm build        # сборка библиотеки в dist/
```

## Workflow добавления компонента

1. **Завести ветку**: `feat/component-button`, `feat/tokens-shadow`, `fix/input-focus-ring` и т.п.
2. **Создать структуру** (см. [COMPONENT_GUIDELINES](./COMPONENT_GUIDELINES.md#структура-папки)):
   ```
   src/components/Foo/
     UidFoo.vue
     UidFoo.css
     UidFoo.stories.ts
     UidFoo.spec.ts
     index.ts
   ```
3. **Реализовать компонент** по гайдлайнам:
   - Props/Events/Slots типизированы.
   - Стили — только через токены и локальные CSS-переменные.
   - A11y минимум.
4. **Написать stories** — минимум `Default`, `Variants`/`Sizes`, `Playground`.
5. **Написать тесты** — props → render, события, ключевые состояния.
6. **Добавить экспорт** в `src/index.ts`:
   ```ts
   export { default as UidFoo } from './components/Foo/UidFoo.vue'
   export type { UidFooProps, UidFooVariant, UidFooSize } from './components/Foo'
   ```
7. **Пройти чек-лист** Definition of Done из [COMPONENT_GUIDELINES](./COMPONENT_GUIDELINES.md#definition-of-done).
8. **Создать changeset**:
   ```bash
   pnpm changeset
   ```
   Выбери тип бампа (см. ниже) и опиши изменение в свободной форме.
9. **Открыть PR**, дождаться CI, мерджить.

## Версионирование

Используется [Changesets](https://github.com/changesets/changesets) и SemVer.

| Тип | Когда |
|---|---|
| `patch` | Багфиксы, изменения стилей без изменения API, доки |
| `minor` | Новый компонент, новый проп/вариант (с дефолтом), новая story |
| `major` | Удаление/переименование пропа, изменение поведения по умолчанию, удаление компонента |

До `1.0.0` действует «zero-major»: ломающие изменения идут как `minor`. Не повышать в `1.0.0` пока API хотя бы 5 ключевых компонентов не устоится.

## Релиз

Релиз делается локально (CI релиз можно настроить позже):

```bash
pnpm changeset version    # применит changesets, обновит версии и CHANGELOG
git add -A && git commit -m "release: версии"
pnpm build
pnpm changeset publish    # опубликует в npm + проставит git-теги
git push --follow-tags
```

Перед `pnpm changeset publish` проверь:

- [ ] `pnpm test --run` проходит
- [ ] `pnpm typecheck` проходит
- [ ] `pnpm build` без warning'ов
- [ ] `dist/` содержит `index.mjs`, `index.cjs`, `index.d.ts` и стили
- [ ] `npm pack --dry-run` показывает только нужные файлы

## Коммиты

Формат — Conventional Commits (нестрого, но желательно):

```
feat(button): добавить вариант ghost
fix(input): не терять фокус при ререндере
docs(tokens): описать категорию shadow
chore: обновить storybook до 8.4
```

Тип: `feat | fix | docs | chore | refactor | test | style`. Скоуп — имя компонента или общая область (`tokens`, `themes`, `build`).

## Что менять без PR не стоит

- `package.json` `name` / `version` (версии рулит Changesets)
- Структуру `exports` в `package.json` — это часть публичного API, изменения только через major
- Перенос файлов внутри `src/components/*` — ломает импорты у внешних пользователей, если они импортируют не из barrel'a
