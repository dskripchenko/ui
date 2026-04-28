# Темизация

Light и dark — обязательный минимум, который kit поддерживает «из коробки». Любая другая кастомизация — переопределение CSS-переменных снаружи.

## Принцип

1. Примитивы (палитра) **не меняются** между темами — это сырые значения.
2. Семантические токены (`--uid-surface-*`, `--uid-text-*`, `--uid-border-*` и т.д.) **переопределяются** под `:root[data-theme='light']` и `:root[data-theme='dark']`.
3. Компоненты ссылаются **только** на семантические токены, никогда напрямую на примитив. Поэтому смена темы не требует ничего, кроме переключения атрибута.

## Подключение

```ts
// в проекте, использующем kit
import '@dskripchenko/ui/styles/tokens.css'   // primitives
import '@dskripchenko/ui/styles/themes.css'   // light + dark
import '@dskripchenko/ui/styles/reset.css'    // опционально
```

Атрибут на корневом элементе:

```html
<html data-theme="light">
```

## Палитра и цветовые решения

Базовые темы построены на трёх составляющих:

- **Zinc** — нейтральная база. Тёплый серый, не стерильный. Задаёт «температуру» всего интерфейса.
- **Teal** — акцентный цвет. Достаточно нейтральный чтобы не кричать, достаточно заметный чтобы направлять взгляд.
- **Soft dark** (`#1c1c1e`) — тёмная тема в стиле iOS/macOS. Не глубокий чёрный, а мягкий угольный, комфортный для глаз.

Семантические цвета (danger/success/warning) намеренно приглушены: насыщенные версии берутся только для тёмной темы, где контраст критичнее.

## Структура `themes.css`

```css
:root[data-theme='light'] {
  /* поверхности — zinc-50 как фон, белый как «поднятая» карточка */
  --uid-surface-base:     var(--uid-color-zinc-50);     /* #fafafa */
  --uid-surface-raised:   var(--uid-color-white);       /* #ffffff */
  --uid-surface-overlay:  var(--uid-color-white);       /* модалки */

  --uid-text-primary:     var(--uid-color-zinc-900);    /* #18181b */
  --uid-text-secondary:   var(--uid-color-zinc-500);    /* #71717a */
  --uid-text-tertiary:    var(--uid-color-zinc-400);    /* #a1a1aa */
  --uid-text-on-accent:   var(--uid-color-white);

  --uid-border-subtle:    var(--uid-color-zinc-200);    /* #e4e4e7 */
  --uid-border-default:   var(--uid-color-zinc-300);    /* #d4d4d8 */

  /* teal-500 на светлом фоне — достаточный контраст (WCAG AA) */
  --uid-accent:           var(--uid-color-teal-500);    /* #14b8a6 */
  --uid-accent-hover:     var(--uid-color-teal-600);    /* #0d9488 */
  --uid-accent-subtle:    var(--uid-color-teal-50);     /* фон active-item, badge */
  --uid-accent-text:      var(--uid-color-teal-700);    /* текст поверх accent-subtle */

  --uid-danger:           var(--uid-color-rose-600);    /* #e11d48 */
  --uid-danger-hover:     var(--uid-color-rose-700);
  --uid-danger-subtle:    var(--uid-color-rose-50);

  --uid-success:          var(--uid-color-emerald-600); /* #059669 */
  --uid-success-subtle:   var(--uid-color-emerald-50);

  --uid-warning:          var(--uid-color-amber-600);   /* #d97706 */
  --uid-warning-subtle:   var(--uid-color-amber-50);

  --uid-shadow-sm:  0 1px 2px rgb(0 0 0 / 0.05);
  --uid-shadow-md:  0 4px 12px rgb(0 0 0 / 0.08);
  --uid-shadow-lg:  0 8px 24px rgb(0 0 0 / 0.12);
}

:root[data-theme='dark'] {
  /* soft dark — iOS-style, не zinc-900 (#18181b), а чуть теплее */
  --uid-surface-base:     #1c1c1e;
  --uid-surface-raised:   #2c2c2e;
  --uid-surface-overlay:  #3a3a3c;

  --uid-text-primary:     var(--uid-color-zinc-100);    /* #f4f4f5 */
  --uid-text-secondary:   var(--uid-color-zinc-400);    /* #a1a1aa */
  --uid-text-tertiary:    var(--uid-color-zinc-600);    /* #52525b */
  --uid-text-on-accent:   var(--uid-color-white);

  --uid-border-subtle:    var(--uid-color-zinc-700);    /* #3f3f46 */
  --uid-border-default:   var(--uid-color-zinc-600);    /* #52525b */

  /* teal-400 — светлее чем teal-500, чтобы держать контраст на тёмном */
  --uid-accent:           var(--uid-color-teal-400);    /* #2dd4bf */
  --uid-accent-hover:     var(--uid-color-teal-300);    /* #5eead4 */
  --uid-accent-subtle:    var(--uid-color-teal-900);    /* #134e4a */
  --uid-accent-text:      var(--uid-color-teal-300);

  /* семантика ярче — нужен контраст на тёмном фоне */
  --uid-danger:           var(--uid-color-rose-400);    /* #fb7185 */
  --uid-danger-hover:     var(--uid-color-rose-500);
  --uid-danger-subtle:    var(--uid-color-rose-950);

  --uid-success:          var(--uid-color-emerald-400); /* #34d399 */
  --uid-success-subtle:   var(--uid-color-emerald-950);

  --uid-warning:          var(--uid-color-amber-400);   /* #fbbf24 */
  --uid-warning-subtle:   var(--uid-color-amber-950);

  --uid-shadow-sm:  0 1px 2px rgb(0 0 0 / 0.2);
  --uid-shadow-md:  0 4px 12px rgb(0 0 0 / 0.4);
  --uid-shadow-lg:  0 8px 24px rgb(0 0 0 / 0.6);
}
```

## Дефолт и `prefers-color-scheme`

Kit **не выбирает тему за пользователя**. По умолчанию `data-theme` отсутствует — в этом случае применяются значения, эквивалентные `light` (через `:root` без селектора-атрибута).

Если приложение хочет реагировать на системную тему — это делается на стороне приложения:

```ts
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light'
```

Внутри kit'а есть composable `useTheme()` (см. фазу 0 в [ROADMAP](./ROADMAP.md)), который инкапсулирует чтение/запись атрибута и подписку на системные изменения.

## Кастомные темы

Пользователь может определить свою тему — это просто ещё один селектор:

```css
:root[data-theme='midnight'] {
  --uid-surface-base:   #0d0b1f;
  --uid-text-primary:   #e0d8ff;
  --uid-accent:         #b794f4;
  /* остальное — такое же, как в dark */
}
```

```html
<html data-theme="midnight">
```

Главное правило: переопределяются **только семантические переменные**, примитивы остаются как есть.

## Точечная кастомизация компонентов

Любой компонент имеет локальные переменные с фолбэком на семантику. Их можно переопределить точечно:

```css
.landing-cta .uid-button {
  --uid-button-radius: 999px;
  --uid-button-bg: linear-gradient(90deg, #f43f5e, #f59e0b);
}
```

Это не ломает темизацию — переопределение действует только в скоупе селектора.

## Storybook

Используется аддон `@storybook/addon-themes`, переключатель в тулбаре. Конфиг (`.storybook/preview.ts`) выставляет `data-theme` на `<html>` story-iframe'a:

```ts
import { withThemeByDataAttribute } from '@storybook/addon-themes'

export const decorators = [
  withThemeByDataAttribute({
    themes: { light: 'light', dark: 'dark' },
    defaultTheme: 'light',
    attributeName: 'data-theme',
  }),
]
```

Любой компонент в Storybook'e должен корректно выглядеть в обеих темах — это часть definition of done.

## Анти-паттерны

- ❌ Захардкоженные цвета в стилях компонента (`color: #333`).
- ❌ Использование примитивов напрямую в компоненте (`color: var(--uid-color-neutral-900)`).
- ❌ Темизация через `class="dark"` — выбран `data-theme`, не смешиваем подходы.
- ❌ JS-логика темизации внутри компонентов. Тема — это CSS, компонент про неё ничего не знает.
