# Гайдлайны компонентов

Единые правила, которым подчиняется каждый компонент в kit'е. Читай этот файл перед добавлением нового компонента.

## Структура папки

```
src/components/Button/
├── UidButton.vue          # шаблон + script setup
├── UidButton.css          # стили (импорт из <script setup>)
├── UidButton.stories.ts   # Storybook
├── UidButton.spec.ts      # Vitest + @vue/test-utils
└── index.ts              # реэкспорт компонента и его типов
```

## Именование

| Сущность | Префикс | Пример |
|---|---|---|
| Имя компонента | `Uid` (PascalCase) | `UidButton`, `UidInputField` |
| CSS-класс корня | `uid-` (kebab-case) | `.uid-button`, `.uid-input-field` |
| Класс модификатора | BEM-double-dash | `.uid-button--primary`, `.uid-button--size-sm` |
| Класс элемента | BEM-double-underscore | `.uid-button__icon`, `.uid-input-field__label` |
| CSS-переменная компонента | `--uid-{component}-*` | `--uid-button-bg`, `--uid-button-radius` |
| Тип пропсов | `{Component}Props` | `UidButtonProps` |
| Enum-варианты как тип | `{Component}{Aspect}` | `UidButtonVariant`, `UidButtonSize` |

## API: props, events, slots

### Props

- Обязательно типизированы. Дефолты — через `withDefaults`.
- Размеры — именованная шкала: `'sm' | 'md' | 'lg'`. Не пропускать произвольные числа.
- Варианты — конечный union: `'primary' | 'secondary' | 'ghost' | 'danger'`.
- Никаких `any`, никаких `Object`-пропсов без интерфейса.

Компоненты, принимающие пользовательский ввод (`UidInput`, `UidSelect`, `UidCheckbox` и др.), расширяют общий интерфейс `ValidatableProps`:

```ts
interface ValidatableProps {
  rules?: RuleInput   // 'required|email' | RuleFn | (string | RuleFn)[]
  name?:  string      // имя поля — нужно для cross-field правил в useForm
  label?: string      // подставляется в сообщения об ошибках
}
```

Подробно — [`VALIDATION.md`](./VALIDATION.md).

```ts
export type UidButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type UidButtonSize = 'sm' | 'md' | 'lg'

export interface UidButtonProps {
  variant?: UidButtonVariant
  size?: UidButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<UidButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})
```

### Events

- Имена событий — kebab-case с префиксом без `on`: `click`, `update:modelValue`, `change`, `close`.
- Типизация через `defineEmits` с дженериком.

```ts
const emit = defineEmits<{
  click: [event: MouseEvent]
  'update:modelValue': [value: string]
}>()
```

### Slots

- Дефолтный слот — основной контент.
- Именованные слоты — для опциональных частей: `prepend`, `append`, `icon`, `header`, `footer`.
- Типизация через `defineSlots` (Vue 3.3+).

```ts
defineSlots<{
  default(): unknown
  prepend?(): unknown
  append?(): unknown
}>()
```

### v-model

- Используем `defineModel()` (Vue 3.4+) — короче и типобезопаснее, чем пара prop+emit.

```ts
const model = defineModel<string>()
```

## Скругления компонентов

Шкала радиусов намеренно маленькая — пять значений, из которых в большинстве компонентов используется одно.

| Компонент | Радиус |
|---|---|
| `UidButton`, `UidInput`, `UidSelect`, `UidTextarea` | `--uid-radius-md` (6px) |
| `UidDropdown`, `UidMenu`, `UidAlert`, `UidToast` | `--uid-radius-md` (6px) |
| `UidCard`, `UidModal`, `UidDrawer`, `UidPopover` | `--uid-radius-lg` (10px) |
| `UidBadge`, `UidTag`, `UidTooltip`, `UidCheckbox` | `--uid-radius-sm` (3px) |
| `UidAvatar` | `--uid-radius-full` (9999px) |
| Таблицы, разделители, code-блоки | `--uid-radius-none` (0) |

Если сомневаешься — `md`. `full` используется только осознанно, не по умолчанию.

## Размеры компонентов

Все интерактивные компоненты поддерживают три размера через проп `size: 'sm' | 'md' | 'lg'`.

| Размер | Высота | Padding-x | Шрифт | Иконка |
|---|---|---|---|---|
| `sm` | 32px (`--uid-size-sm`) | `--uid-space-sm` (8px) | `--uid-font-size-sm` (14px) | 16px |
| `md` | 40px (`--uid-size-md`) | `--uid-space-md` (16px) | `--uid-font-size-md` (16px) | 20px |
| `lg` | 48px (`--uid-size-lg`) | `--uid-space-lg` (24px) | `--uid-font-size-lg` (18px) | 20px |

Высота задаётся через `min-height`, не `height` — чтобы многострочный контент мог растянуть элемент.  
Компоненты без текстового контента (иконки, аватары) используют `width` + `height` напрямую.  
Иконка в `lg` остаётся 20px — увеличение до 24px создаёт зрительный дисбаланс с текстом.

## Стили

- Файл `Component.css` импортируется в `<script setup>`: `import './UidButton.css'`.
- **Без `scoped`.** Изоляция — через префикс `.uid-{component}` и BEM.
- Все настраиваемые значения — через локальные CSS-переменные с фолбэком на семантику ([TOKENS.md](./TOKENS.md)).
- Состояния — через атрибуты или классы-модификаторы:
  - `:hover`, `:focus-visible`, `:active` — псевдоклассы.
  - `disabled` — атрибут `disabled` или `[aria-disabled="true"]`, не класс.
  - `loading`, `selected`, `expanded` — `data-*` атрибуты или классы-модификаторы.
- Focus-ring — всегда через `:focus-visible` (не `:focus`). Единый стиль для всех компонентов:
  ```css
  .uid-button:focus-visible {
    outline: 2px solid var(--uid-accent);
    outline-offset: 2px;
    border-radius: inherit; /* следует скруглению элемента */
  }

  /* В состоянии error — ring меняет цвет */
  .uid-input--error:focus-visible {
    outline-color: var(--uid-danger);
  }
  ```

### Шаблон CSS-файла

```css
.uid-button {
  --uid-button-bg:        var(--uid-accent);
  --uid-button-bg-hover:  var(--uid-accent-hover);
  --uid-button-color:     var(--uid-text-on-accent);
  --uid-button-radius:    var(--uid-radius-md);
  --uid-button-height:    var(--uid-size-md);
  --uid-button-padding-x: var(--uid-space-md);
  --uid-button-padding-y: var(--uid-space-sm);

  display: inline-flex;
  align-items: center;
  gap: var(--uid-space-xs);
  min-height: var(--uid-button-height);
  padding: var(--uid-button-padding-y) var(--uid-button-padding-x);
  border: 0;
  border-radius: var(--uid-button-radius);
  background: var(--uid-button-bg);
  color: var(--uid-button-color);
  font: inherit;
  cursor: pointer;
  transition: background var(--uid-duration-fast) var(--uid-ease-out);
}

.uid-button:hover { background: var(--uid-button-bg-hover); }

.uid-button:focus-visible {
  outline: 2px solid var(--uid-accent);
  outline-offset: 2px;
}

.uid-button[disabled],
.uid-button[aria-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Варианты */
.uid-button--secondary {
  --uid-button-bg:       var(--uid-surface-raised);
  --uid-button-bg-hover: var(--uid-border-subtle);
  --uid-button-color:    var(--uid-text-primary);
}

/* Размеры */
.uid-button--sm { --uid-button-height: var(--uid-size-sm); --uid-button-padding-x: var(--uid-space-sm); font-size: var(--uid-font-size-sm); }
.uid-button--lg { --uid-button-height: var(--uid-size-lg); --uid-button-padding-x: var(--uid-space-lg); font-size: var(--uid-font-size-lg); }
```

## Состояния

Единые правила для всех компонентов. Без консистентности состояний интерфейс ощущается «рваным».

### Hover

Элементы с семантическим `-hover` токеном используют его напрямую:
```css
.uid-button:hover { background: var(--uid-button-bg-hover); }
```

Поверхности без выделенного `-hover` токена (пункты меню, строки таблицы, nav-элементы) — через полупрозрачный overlay:
```css
.uid-menu-item:hover {
  background: rgb(0 0 0 / 0.04);       /* light theme */
}
:root[data-theme='dark'] .uid-menu-item:hover {
  background: rgb(255 255 255 / 0.06); /* dark theme */
}
```

Переход всегда: `transition: <свойство> var(--uid-duration-fast) var(--uid-ease-out)`.

### Active / Pressed

Кнопки и кликабельные элементы дают тактильный отклик:
```css
.uid-button:active {
  transform: scale(0.98);
}
```

### Disabled

```css
.uid-button[disabled],
.uid-button[aria-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

`pointer-events: none` **не используется** — это ломает тултипы на задизейбленных элементах, которые объясняют причину блокировки.

### Error

Применяется к контролам форм (`UidInput`, `UidSelect`, `UidTextarea`):
```css
.uid-input--error {
  border-color: var(--uid-danger);
}
.uid-input--error:focus-visible {
  outline-color: var(--uid-danger);
}
```

Ошибка всегда сопровождается текстом — только цвет бордера недостаточен для a11y.

### Loading

```css
.uid-button[data-loading='true'] {
  opacity: 0.7;
  cursor: wait;
  pointer-events: none; /* здесь pointer-events уместен — действие уже выполняется */
}
```

## Доступность (a11y)

Минимум, который должен соблюдать каждый компонент:

- Семантические теги в первую очередь (`<button>`, `<input>`, `<dialog>`). Если нативного нет — корректные `role`.
- Все интерактивные элементы достижимы клавиатурой (Tab/Shift+Tab, Enter/Space, Esc для закрытия).
- Состояния отражаются через ARIA: `aria-disabled`, `aria-expanded`, `aria-selected`, `aria-invalid`, `aria-describedby`.
- У контролов формы должен быть label (через слот `label`, проп `label`, или `aria-label`/`aria-labelledby`).
- Focus-ring виден, не убирать `outline` без замены через `:focus-visible`.
- Не использовать только цвет для передачи смысла (ошибка — это цвет + текст/иконка, а не только красный бордер).

В Storybook включён `@storybook/addon-a11y`. Перед PR компонент должен пройти его проверки без критичных нарушений.

## Тесты

Юнит-тесты на компонент — обязательны для:

- проп → классы/атрибуты;
- эмиссия событий;
- v-model двусторонняя связь;
- a11y-инварианты (например, `aria-disabled` при `disabled`).

Визуальные кейсы покрываются Storybook'ом.

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidButton from './UidButton.vue'

describe('UidButton', () => {
  it('эмитит click при нажатии', async () => {
    const wrapper = mount(UidButton, { slots: { default: 'OK' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('не эмитит click при disabled', async () => {
    const wrapper = mount(UidButton, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
```

## Storybook

Каждый компонент = одна `.stories.ts` минимум со следующими кейсами:

- `Default` — базовый, без пропсов.
- По одной story на каждый `variant`.
- По одной story на каждый `size` (или единая `Sizes` со всеми вариантами рядом).
- `Disabled`, `Loading` — если применимо.
- `Playground` — все аргументы как `argTypes`, чтобы тыкать в панели.

Шаблон story:

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import UidButton from './UidButton.vue'

const meta: Meta<typeof UidButton> = {
  title: 'Inputs/Button',
  component: UidButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size:    { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading:  { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidButton>

export const Playground: Story = {
  args: { variant: 'primary', size: 'md' },
  render: (args) => ({
    components: { UidButton },
    setup: () => ({ args }),
    template: `<UidButton v-bind="args">Кнопка</UidButton>`,
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { UidButton },
    template: `
      <div style="display:flex; gap:12px;">
        <UidButton variant="primary">Primary</UidButton>
        <UidButton variant="secondary">Secondary</UidButton>
        <UidButton variant="ghost">Ghost</UidButton>
        <UidButton variant="danger">Danger</UidButton>
      </div>
    `,
  }),
}
```

## Definition of Done

Компонент считается готовым к мерджу, когда:

- [ ] Структура папки соответствует разделу выше.
- [ ] Props/Events/Slots типизированы и описаны через JSDoc там, где смысл не очевиден из имени.
- [ ] Стили используют только семантические токены или локальные переменные с фолбэком на них.
- [ ] Корректно работает в light и dark в Storybook'е.
- [ ] Storybook содержит все обязательные кейсы (Default + Variants + States).
- [ ] `addon-a11y` не показывает критичных нарушений.
- [ ] Юнит-тесты покрывают props → render и события.
- [ ] Компонент экспортирован из `src/index.ts`.
- [ ] Добавлен changeset (`pnpm changeset`).

См. также шаблон в [`templates/COMPONENT.md`](./templates/COMPONENT.md).
