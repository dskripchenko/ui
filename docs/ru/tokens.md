# Дизайн-токены

Все визуальные значения в kit'е выражены через CSS Custom Properties. Это даёт темизацию без пересборки, runtime-кастомизацию и единый источник правды.

## Уровни токенов

Используется трёхуровневая модель — это позволяет менять темы и палитру независимо от компонентов.

```
primitive  →  semantic  →  component
```

### 1. Primitive (примитивы)

Сырые значения без смысла «где применять». Не зависят от темы.

```css
:root {
  /* Zinc — нейтральная база */
  --uid-color-zinc-50:   #fafafa;
  --uid-color-zinc-100:  #f4f4f5;
  --uid-color-zinc-200:  #e4e4e7;
  --uid-color-zinc-300:  #d4d4d8;
  --uid-color-zinc-400:  #a1a1aa;
  --uid-color-zinc-500:  #71717a;
  --uid-color-zinc-600:  #52525b;
  --uid-color-zinc-700:  #3f3f46;
  --uid-color-zinc-800:  #27272a;
  --uid-color-zinc-900:  #18181b;
  --uid-color-zinc-950:  #09090b;

  /* Teal — акцентный */
  --uid-color-teal-50:   #f0fdfa;
  --uid-color-teal-100:  #ccfbf1;
  --uid-color-teal-300:  #5eead4;
  --uid-color-teal-400:  #2dd4bf;
  --uid-color-teal-500:  #14b8a6;
  --uid-color-teal-600:  #0d9488;
  --uid-color-teal-700:  #0f766e;
  --uid-color-teal-900:  #134e4a;

  /* Rose — danger */
  --uid-color-rose-50:   #fff1f2;
  --uid-color-rose-400:  #fb7185;
  --uid-color-rose-500:  #f43f5e;
  --uid-color-rose-600:  #e11d48;
  --uid-color-rose-700:  #be123c;
  --uid-color-rose-950:  #4c0519;

  /* Emerald — success */
  --uid-color-emerald-50:   #ecfdf5;
  --uid-color-emerald-400:  #34d399;
  --uid-color-emerald-600:  #059669;
  --uid-color-emerald-950:  #022c22;

  /* Amber — warning */
  --uid-color-amber-50:   #fffbeb;
  --uid-color-amber-400:  #fbbf24;
  --uid-color-amber-600:  #d97706;
  --uid-color-amber-950:  #451a03;

  --uid-color-white: #ffffff;

  /* Отступы */
  --uid-space-0:    0;
  --uid-space-xs:   4px;
  --uid-space-sm:   8px;
  --uid-space-md:   16px;
  --uid-space-lg:   24px;
  --uid-space-xl:   32px;
  --uid-space-2xl:  48px;
  --uid-space-3xl:  64px;

  /* Размеры элементов */
  --uid-size-sm:  32px;
  --uid-size-md:  40px;
  --uid-size-lg:  48px;
}
```

Файл: `src/tokens/*.css`. Эти значения **никогда не используются напрямую в компонентах.**

### 2. Semantic (семантические)

Описывают смысл, а не цвет: «фон поверхности», «текст основной», «бордер тонкий». Меняются между темами.

```css
:root[data-theme='light'] {
  --uid-surface-base:     var(--uid-color-zinc-50);     /* фон страницы */
  --uid-surface-raised:   var(--uid-color-white);       /* карточки, панели */
  --uid-surface-overlay:  var(--uid-color-white);       /* модалки, поповеры */

  --uid-text-primary:     var(--uid-color-zinc-900);
  --uid-text-secondary:   var(--uid-color-zinc-500);
  --uid-text-tertiary:    var(--uid-color-zinc-400);
  --uid-text-on-accent:   var(--uid-color-white);

  --uid-border-subtle:    var(--uid-color-zinc-200);
  --uid-border-default:   var(--uid-color-zinc-300);

  --uid-accent:           var(--uid-color-teal-500);
  --uid-accent-hover:     var(--uid-color-teal-600);
  --uid-accent-subtle:    var(--uid-color-teal-50);
  --uid-accent-text:      var(--uid-color-teal-700);

  --uid-danger:           var(--uid-color-rose-600);
  --uid-danger-hover:     var(--uid-color-rose-700);
  --uid-danger-subtle:    var(--uid-color-rose-50);

  --uid-success:          var(--uid-color-emerald-600);
  --uid-success-subtle:   var(--uid-color-emerald-50);

  --uid-warning:          var(--uid-color-amber-600);
  --uid-warning-subtle:   var(--uid-color-amber-50);

  --uid-shadow-sm:  0 1px 2px rgb(0 0 0 / 0.05);
  --uid-shadow-md:  0 4px 12px rgb(0 0 0 / 0.08);
  --uid-shadow-lg:  0 8px 24px rgb(0 0 0 / 0.12);
}

:root[data-theme='dark'] {
  --uid-surface-base:     #1c1c1e;   /* soft dark */
  --uid-surface-raised:   #2c2c2e;
  --uid-surface-overlay:  #3a3a3c;

  --uid-text-primary:     var(--uid-color-zinc-100);
  --uid-text-secondary:   var(--uid-color-zinc-400);
  --uid-text-tertiary:    var(--uid-color-zinc-600);
  --uid-text-on-accent:   var(--uid-color-white);

  --uid-border-subtle:    var(--uid-color-zinc-700);
  --uid-border-default:   var(--uid-color-zinc-600);

  --uid-accent:           var(--uid-color-teal-400);   /* ярче для тёмного фона */
  --uid-accent-hover:     var(--uid-color-teal-300);
  --uid-accent-subtle:    var(--uid-color-teal-900);
  --uid-accent-text:      var(--uid-color-teal-300);

  --uid-danger:           var(--uid-color-rose-400);
  --uid-danger-hover:     var(--uid-color-rose-500);
  --uid-danger-subtle:    var(--uid-color-rose-950);

  --uid-success:          var(--uid-color-emerald-400);
  --uid-success-subtle:   var(--uid-color-emerald-950);

  --uid-warning:          var(--uid-color-amber-400);
  --uid-warning-subtle:   var(--uid-color-amber-950);

  --uid-shadow-sm:  0 1px 2px rgb(0 0 0 / 0.2);
  --uid-shadow-md:  0 4px 12px rgb(0 0 0 / 0.4);
  --uid-shadow-lg:  0 8px 24px rgb(0 0 0 / 0.6);
}
```

Файл: `src/styles/themes.css`. Это слой, который переопределяется в темах.

### 3. Component (компонентные)

Локальные «ручки» компонента. Имеют фолбэк на семантику. Пользователь переопределяет их, чтобы кастомизировать конкретный компонент.

```css
.uid-button {
  --uid-button-bg:           var(--uid-accent);
  --uid-button-bg-hover:     var(--uid-accent-hover);
  --uid-button-color:        var(--uid-color-neutral-0);
  --uid-button-radius:       var(--uid-radius-md);
  --uid-button-padding-x:    var(--uid-space-4);
  --uid-button-padding-y:    var(--uid-space-2);

  background: var(--uid-button-bg);
  color: var(--uid-button-color);
  border-radius: var(--uid-button-radius);
  padding: var(--uid-button-padding-y) var(--uid-button-padding-x);
}

.uid-button:hover { background: var(--uid-button-bg-hover); }
```

Кастомизация снаружи — без `!important`:

```css
.my-page .uid-button {
  --uid-button-radius: 999px;
}
```

## Категории токенов

| Категория | Префикс | Файл | Что внутри |
|---|---|---|---|
| Цвет (primitive) | `--uid-color-*` | `tokens/colors.css` | Zinc (нейтраль), Teal (акцент), Rose/Emerald/Amber (семантика) |
| Цвет (semantic) | `--uid-surface-*`, `--uid-text-*`, `--uid-border-*`, `--uid-accent-*`, `--uid-danger-*`, `--uid-success-*`, `--uid-warning-*` | `styles/themes.css` | Семантика, разная между темами |
| Типографика | `--uid-font-family-*`, `--uid-font-size-*`, `--uid-font-weight-*`, `--uid-line-height-*` | `tokens/typography.css` | Шрифт — Inter (см. ниже), шкала размеров xs/sm/md/lg/xl/2xl… |
| Отступы | `--uid-space-*` | `tokens/spacing.css` | Шкала 0/xs/sm/md/lg/xl/2xl/3xl (шаг 4px, t-shirt именование) |
| Размеры элементов | `--uid-size-*` | `tokens/sizing.css` | sm=32px / md=40px / lg=48px — высоты интерактивных элементов |
| Брейкпоинты | `--uid-bp-*` | `tokens/breakpoints.css` | sm/md/lg/xl/2xl, mobile-first |
| Скругления | `--uid-radius-*` | `tokens/radius.css` | none/sm(3px)/md(6px)/lg(10px)/full — см. секцию ниже |
| Тени | `--uid-shadow-*` | `tokens/shadow.css` | sm/md/lg/xl, может зависеть от темы |
| Анимация | `--uid-duration-*`, `--uid-ease-*` | `tokens/motion.css` | fast/base/slow + easing-функции |
| Z-index | `--uid-z-*` | `tokens/z-index.css` | dropdown/sticky/overlay/modal/toast/tooltip |

## Соглашения именования

- Префикс всегда `--uid-`.
- Категория идёт после префикса: `--uid-{category}-{variant}-{tone?}`.
- Состояния — суффиксом: `-hover`, `-active`, `-disabled`, `-focus`.
- Размеры используют именованную шкалу (`xs/sm/md/lg/xl`), не числа, чтобы не привязываться к пиксельным значениям.

Хорошо: `--uid-color-blue-500`, `--uid-text-primary`, `--uid-button-bg-hover`.
Плохо: `--blue`, `--main-color`, `--btn-h-bg`.

## Как добавлять новый токен

1. **Это новый смысл или новое значение?**
   - Новое сырое значение → primitive в `tokens/`.
   - Новый смысл (например, `--uid-surface-overlay`) → semantic в `styles/themes.css`, обязательно для **обеих** тем.
   - Кастомизация одного компонента → component-уровень в его `.css`.
2. Используется ли значение хотя бы в **двух** местах? Если нет — оставь его инлайн в стиле компонента, не плоди токены.
3. Обнови соответствующий файл и добавь story в `Tokens.stories.ts` (визуальный каталог).

## Скругления

**Принцип:** скругления должны «исчезнуть» — их не замечаешь, но заметил бы их отсутствие. Интерфейс не острый и не пухлый — лёгкий и консистентный.

```css
/* tokens/radius.css */
:root {
  --uid-radius-none:  0;
  --uid-radius-sm:    3px;
  --uid-radius-md:    6px;
  --uid-radius-lg:    10px;
  --uid-radius-full:  9999px;
}
```

| Токен | Значение | Где используется |
|---|---|---|
| `--uid-radius-none` | 0 | Таблицы, разделители, code-блоки |
| `--uid-radius-sm` | 3px | Badge, tag, tooltip, checkbox |
| `--uid-radius-md` | 6px | **Главный** — кнопки, инпуты, селекты, дропдауны, alert |
| `--uid-radius-lg` | 10px | Карточки, модалки, поповеры, боковые панели |
| `--uid-radius-full` | 9999px | Аватары, pill-теги — только осознанно |

**Правило консистентности:** все интерактивные контролы в одном визуальном ряду используют одинаковый радиус. Кнопка рядом с инпутом — оба `md` (6px).

`xl` (16px) и крупнее намеренно отсутствуют — избыточное скругление создаёт «пухлость», от которой устаёт глаз.

## Отступы

Шаг — **4px**, именование — **t-shirt**. Числа не используются.

```css
/* tokens/spacing.css */
:root {
  --uid-space-0:    0;
  --uid-space-xs:   4px;   /* gap между иконкой и текстом, tight-списки */
  --uid-space-sm:   8px;   /* padding компактных элементов */
  --uid-space-md:   16px;  /* стандартный padding карточки */
  --uid-space-lg:   24px;  /* gap между блоками */
  --uid-space-xl:   32px;  /* отступы между секциями */
  --uid-space-2xl:  48px;  /* крупные страничные отступы */
  --uid-space-3xl:  64px;  /* hero, page-level */
}
```

12px не является токеном — если это значение нужно в компоненте, используется локальная CSS-переменная с явным значением.

## Размеры элементов

Единая шкала высот для всех интерактивных элементов: `UidButton`, `UidInput`, `UidSelect`, `UidTag` и т.д.

```css
/* tokens/sizing.css */
:root {
  --uid-size-sm:  32px;
  --uid-size-md:  40px;  /* дефолт */
  --uid-size-lg:  48px;
}
```

В компонентах — через `min-height`:
```css
.uid-button        { min-height: var(--uid-button-height, var(--uid-size-md)); }
.uid-button--sm    { --uid-button-height: var(--uid-size-sm); }
.uid-button--lg    { --uid-button-height: var(--uid-size-lg); }
```

## Брейкпоинты

Стратегия — **mobile-first** (`min-width`). Базовые стили пишутся без медиа-запроса, переопределения — от меньшего к большему.

```css
/* tokens/breakpoints.css */
:root {
  --uid-bp-sm:   480px;
  --uid-bp-md:   768px;
  --uid-bp-lg:   1024px;
  --uid-bp-xl:   1280px;
  --uid-bp-2xl:  1536px;
}
```

CSS custom properties нельзя использовать в `@media`, поэтому значения дублируются как константы в документации и применяются напрямую:

```css
/* Правильно */
@media (min-width: 768px) { … }

/* Неправильно — CSS-переменные в медиа-запросах не работают */
@media (min-width: var(--uid-bp-md)) { … }
```

| Токен | Значение | Устройство |
|---|---|---|
| `--uid-bp-sm` | 480px | Большой телефон |
| `--uid-bp-md` | 768px | Планшет |
| `--uid-bp-lg` | 1024px | Ноутбук |
| `--uid-bp-xl` | 1280px | Десктоп |
| `--uid-bp-2xl` | 1536px | Широкий экран |

## Сетка

Сетка реализована двумя компонентами: `UidContainer` и `UidGrid`.

**`UidContainer`** — центрирует контент, задаёт `max-width` и горизонтальный padding.

```css
.uid-container {
  --uid-container-max-width:  1280px;
  --uid-container-padding-x:  var(--uid-space-md);  /* 16px */

  width: 100%;
  max-width: var(--uid-container-max-width);
  margin-inline: auto;
  padding-inline: var(--uid-container-padding-x);
}

@media (min-width: 768px) {
  .uid-container { --uid-container-padding-x: var(--uid-space-lg); }  /* 24px */
}

@media (min-width: 1024px) {
  .uid-container { --uid-container-padding-x: var(--uid-space-xl); }  /* 32px */
}
```

**`UidGrid`** — CSS Grid-обёртка с настраиваемыми колонками и gap.

```css
.uid-grid {
  --uid-grid-columns:  12;
  --uid-grid-gap:      var(--uid-space-md);  /* 16px */

  display: grid;
  grid-template-columns: repeat(var(--uid-grid-columns), 1fr);
  gap: var(--uid-grid-gap);
}
```

Пропсы `UidGrid`: `columns` (1–12, дефолт 12), `gap` (xs/sm/md/lg/xl, дефолт md).  
Пропсы `UidContainer`: `maxWidth` (дефолт xl=1280px), `padding` (можно переопределить).

## Типографика

Базовый шрифт — **Inter**. Выбран за нейтральность, отличную читаемость на экранах и качественную поддержку кириллицы и латиницы.

```css
/* tokens/typography.css */
:root {
  /* семейства */
  --uid-font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --uid-font-family-mono: 'IBM Plex Mono', 'Fira Code', ui-monospace, monospace;

  /* размеры */
  --uid-font-size-xs:   12px;
  --uid-font-size-sm:   14px;
  --uid-font-size-md:   16px;
  --uid-font-size-lg:   18px;
  --uid-font-size-xl:   20px;
  --uid-font-size-2xl:  24px;
  --uid-font-size-3xl:  30px;
  --uid-font-size-4xl:  36px;

  /* насыщенность */
  --uid-font-weight-regular:   400;
  --uid-font-weight-medium:    500;
  --uid-font-weight-semibold:  600;
  --uid-font-weight-bold:      700;

  /* межстрочные интервалы */
  --uid-line-height-tight:   1.25;
  --uid-line-height-snug:    1.375;
  --uid-line-height-normal:  1.5;
  --uid-line-height-relaxed: 1.625;
}
```

### Типографические роли

Шкала токенов → конкретные роли в интерфейсе. Каждый компонент должен использовать именно эти сочетания, не изобретая свои.

| Роль | Размер | Насыщенность | Line-height | Применение |
|---|---|---|---|---|
| `h1` | `4xl` / 36px | `bold` / 700 | `tight` / 1.25 | Заголовок страницы |
| `h2` | `3xl` / 30px | `bold` / 700 | `tight` / 1.25 | Заголовок секции |
| `h3` | `2xl` / 24px | `semibold` / 600 | `snug` / 1.375 | Подзаголовок |
| `h4` | `xl` / 20px | `semibold` / 600 | `snug` / 1.375 | Заголовок карточки |
| `body` | `md` / 16px | `regular` / 400 | `normal` / 1.5 | Основной текст |
| `body-sm` | `sm` / 14px | `regular` / 400 | `normal` / 1.5 | Вторичный текст, описания |
| `caption` | `xs` / 12px | `regular` / 400 | `normal` / 1.5 | Подписи, метаданные |
| `label` | `sm` / 14px | `medium` / 500 | `normal` / 1.5 | Лейблы форм, навигация |
| `button` | `sm` / 14px | `medium` / 500 | — | Текст в кнопках |
| `code` | `sm` / 14px | `regular` / 400 | `normal` / 1.5 | Инлайн-код, моно |

### Подключение шрифта

Kit **не подключает Inter самостоятельно** — это обязанность потребителя. Рекомендуемые способы:

**@fontsource (npm, предпочтительно):**
```bash
npm install @fontsource-variable/inter
```
```js
// в точке входа приложения
import '@fontsource-variable/inter';
```

**Google Fonts (CDN):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Фолбэк `system-ui` в `--uid-font-family-sans` гарантирует приемлемый вид, даже если Inter не загружен.

## Анимации

Три скорости и три кривые — всё. Интерфейс двигается предсказуемо, без сюрпризов.

```css
/* tokens/motion.css */
:root {
  --uid-duration-fast:  100ms;
  --uid-duration-base:  200ms;
  --uid-duration-slow:  350ms;

  --uid-ease-out:      cubic-bezier(0, 0, 0.2, 1);    /* элемент появляется */
  --uid-ease-in:       cubic-bezier(0.4, 0, 1, 1);    /* элемент исчезает */
  --uid-ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);  /* элемент перемещается */
}
```

| Ситуация | Duration | Easing |
|---|---|---|
| Hover, active, checkbox | `fast` (100ms) | `ease-out` |
| Dropdown, tooltip — появление | `base` (200ms) | `ease-out` |
| Dropdown, tooltip — исчезновение | `fast` (100ms) | `ease-in` |
| Modal, drawer — открытие | `slow` (350ms) | `ease-out` |
| Modal, drawer — закрытие | `base` (200ms) | `ease-in` |
| Перемещение, reorder | `base` (200ms) | `ease-in-out` |

Правило: элементы **появляются медленнее, чем исчезают** — так интерфейс ощущается отзывчивым.

## Z-index

Фиксированная шкала предотвращает конфликты слоёв. Значения кратны 100 — чтобы было место для исключений внутри слоя.

```css
/* tokens/z-index.css */
:root {
  --uid-z-base:      0;
  --uid-z-raised:    1;     /* карточки с тенью внутри контента */
  --uid-z-dropdown:  100;   /* дропдауны, комбобоксы, контекстные меню */
  --uid-z-sticky:    200;   /* sticky-шапка, прилипающий sidebar */
  --uid-z-overlay:   300;   /* backdrop под модалкой */
  --uid-z-modal:     400;   /* модальные окна, диалоги */
  --uid-z-toast:     500;   /* тосты — выше модалок */
  --uid-z-tooltip:   600;   /* тултипы — всегда поверх всего */
}
```

## Что не является токеном

- Уникальные значения для одного компонента, не предполагающие переиспользования.
- Magic-числа из дизайна, которые ещё не устоялись (положи их инлайн с TODO, повышай до токена, когда увидишь повтор).
