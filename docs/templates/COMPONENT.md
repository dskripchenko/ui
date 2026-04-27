# Шаблон описания компонента

Используй этот шаблон при добавлении нового компонента — копируй в `src/components/{Name}/README.md` (опционально) или используй как чек-лист в PR-описании.

---

## `Uk{Name}`

> Одна-две строки: что это и зачем.

### API

#### Props

| Имя | Тип | Дефолт | Описание |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Визуальный вариант |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `disabled` | `boolean` | `false` | Запрет взаимодействия |

#### Events

| Имя | Payload | Когда |
|---|---|---|
| `click` | `MouseEvent` | Пользователь кликнул |
| `update:modelValue` | `string` | Изменилось значение (v-model) |

#### Slots

| Имя | Контент |
|---|---|
| `default` | Основной контент |
| `prepend` | Контент перед основным (например, иконка) |
| `append` | Контент после основного |

#### v-model

- Обычный `v-model` биндится на `modelValue` / `update:modelValue` — значение типа `…`.

### CSS API (переменные)

Локальные переменные компонента, доступные для переопределения снаружи:

| Переменная | Дефолт (фолбэк на токен) | Что управляет |
|---|---|---|
| `--uid-{name}-bg` | `var(--uid-accent)` | Фон |
| `--uid-{name}-bg-hover` | `var(--uid-accent-hover)` | Фон при hover |
| `--uid-{name}-color` | `var(--uid-text-on-accent)` | Цвет текста |
| `--uid-{name}-radius` | `var(--uid-radius-md)` | Скругление |
| `--uid-{name}-height` | `var(--uid-size-md)` | Высота (интерактивные элементы) |
| `--uid-{name}-padding-x` | `var(--uid-space-md)` | Горизонтальный padding |
| `--uid-{name}-padding-y` | `var(--uid-space-sm)` | Вертикальный padding |

### Доступность

- Семантический корневой элемент: `<button>` / `<input>` / `<role="…">`.
- Поддерживаемые клавиши: `Tab`, `Enter`, `Space`, `Esc` (если применимо).
- ARIA-атрибуты, которые проставляются автоматически: `aria-disabled`, `aria-invalid`, …
- Что должен сделать пользователь kit'a: предоставить `aria-label` / `label`, если нет видимого текста.

### Примеры

```html
<UidFoo variant="primary" size="md" @click="handleClick">
  Кнопка
</UidFoo>
```

```html
<UidFoo v-model="value" :disabled="loading">
  <template #prepend><Icon name="check" /></template>
  Сохранить
</UidFoo>
```

### Definition of Done

- [ ] Папка компонента соответствует структуре из [COMPONENT_GUIDELINES](../COMPONENT_GUIDELINES.md)
- [ ] Props/Events/Slots типизированы
- [ ] Стили только через токены / локальные переменные
- [ ] Работает в light и dark
- [ ] Storybook: Default + Variants + States + Playground
- [ ] `addon-a11y` без критики
- [ ] Юнит-тесты на props → render + события
- [ ] Экспорт из `src/index.ts`
- [ ] Changeset добавлен
