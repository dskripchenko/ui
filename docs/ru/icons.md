# Иконки

В kit'e встроена обширная иконографика — ~1500 иконок из [Lucide](https://lucide.dev/), доступных «из коробки», без дополнительной установки. Поверх Lucide идёт тонкая обёртка `UidIcon` для единого API размеров, цвета, темизации и a11y.

## Подход

- **Источник** — `lucide-vue-next` (MIT). Идёт как обычная `dependency` kit'a, ставится автоматически.
- **Не свой набор.** Поддерживать ~1500 SVG в актуальном виде — лишняя нагрузка.
- **Не bundling.** Все иконки tree-shakable: что не импортировал — в финальный бандл не попало.
- **Не классы CSS.** Иконки — Vue-компоненты, не sprite-sheet и не webfont. Это даёт бескомпромиссный tree-shake и инлайн SVG в DOM.

## Способы использования

В kit'е два пути использования иконок. Они дополняют друг друга — выбирается под задачу.

### A. Static import (основной путь)

Стандартный способ. Импортируешь иконку как Vue-компонент и передаёшь в `<UidIcon :icon>`. Bundler видит явную зависимость — финальный бандл содержит только использованные иконки.

```vue
<script setup lang="ts">
import { UidIcon, UidButton } from '@dskripchenko/ui'
import { Check, X, ChevronRight } from 'lucide-vue-next'
</script>

<template>
  <UidIcon :icon="Check" />
  <UidIcon :icon="X" size="sm" />

  <UidButton variant="primary">
    <UidIcon :icon="ChevronRight" /> Далее
  </UidButton>
</template>
```

Эквивалентный импорт через kit (тот же набор, единый ментальный namespace):

```ts
import { Check, X, ChevronRight } from '@dskripchenko/ui/icons'
```

`@dskripchenko/ui/icons` — sub-export, просто реэкспортирует всё из `lucide-vue-next`. Используй любой вариант.

### C. Динамический реестр

Когда имя иконки приходит из данных (конфиг меню, поле в БД, prop'ы извне) — компилятор не видит конкретного компонента. Тогда регистрируешь нужные иконки один раз и обращаешься по строковому имени.

```ts
// app-bootstrap.ts (один раз при старте приложения)
import { registerIcons } from '@dskripchenko/ui'
import { Check, X, Home, Settings, User, Bell } from 'lucide-vue-next'

registerIcons({
  check: Check,
  close: X,
  home: Home,
  settings: Settings,
  user: User,
  bell: Bell,
})
```

```vue
<script setup lang="ts">
import { UidIcon } from '@dskripchenko/ui'

const menu = [
  { label: 'Главная', icon: 'home' },
  { label: 'Профиль', icon: 'user' },
  { label: 'Настройки', icon: 'settings' },
]
</script>

<template>
  <ul>
    <li v-for="item in menu" :key="item.label">
      <UidIcon :name="item.icon" /> {{ item.label }}
    </li>
  </ul>
</template>
```

Если в реестре нет иконки с таким именем — в dev-режиме `console.warn`, в проде ничего не рендерится. **Динамический реестр — осознанный trade-off:** ты явно перечисляешь иконки, которые могут прийти по имени. Это сохраняет tree-shake (всё, что не зарегистрировано, в бандл не попадает).

### Когда что использовать

| Сценарий | Способ |
|---|---|
| Иконка известна на момент написания шаблона | **A** |
| Внутри компонентов kit'а (Button slot, Input prefix) | **A** |
| Имя иконки приходит из данных (меню, конфиг, props.iconName) | **C** |
| Иконка в Storybook-демо | **A** |
| 90% случаев | **A** |

## Компонент `UidIcon`

### Props

| Имя | Тип | Дефолт | Описание |
|---|---|---|---|
| `icon` | `Component` | — | Lucide-компонент. Способ A. |
| `name` | `string` | — | Имя из реестра. Способ C. |
| `size` | `UidIconSize` | `'md'` | Размер: `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` или число (px) |
| `strokeWidth` | `number \| string` | `2` | Толщина линии Lucide (1–3 разумно) |
| `color` | `string` | `'currentColor'` | Переопределяет цвет (обычно не нужно — наследуется от текста) |
| `title` | `string` | — | Делает иконку «озвученной»: `role="img" + aria-label`. Без title иконка декоративная (`aria-hidden`). |
| `spin` | `boolean` | `false` | Бесконечное вращение (для loader'ов) |

### Events

Нет. Если нужен клик — оборачивай в `<UidButton variant="ghost">` или `<button>`.

### Slots

Нет.

### Типы

```ts
export type UidIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number

export interface UidIconProps {
  icon?: Component
  name?: string
  size?: UidIconSize
  strokeWidth?: number | string
  color?: string
  title?: string
  spin?: boolean
}
```

## Размеры

Шкала размеров завязана на CSS-переменные — их можно переопределить в любой точке.

| Размер | Дефолт |
|---|---|
| `xs` | 12px |
| `sm` | 16px |
| `md` | 20px |
| `lg` | 24px |
| `xl` | 32px |
| число | `${value}px` |

```css
.uid-icon {
  --uid-icon-size: 1em;
  --uid-icon-color: currentColor;

  width: var(--uid-icon-size);
  height: var(--uid-icon-size);
  color: var(--uid-icon-color);
  flex-shrink: 0;
  vertical-align: middle;
}

.uid-icon--size-xs { --uid-icon-size: 12px; }
.uid-icon--size-sm { --uid-icon-size: 16px; }
.uid-icon--size-md { --uid-icon-size: 20px; }
.uid-icon--size-lg { --uid-icon-size: 24px; }
.uid-icon--size-xl { --uid-icon-size: 32px; }
```

Если хочешь, чтобы иконка масштабировалась с текстом — не задавай `size`. По умолчанию она `1em`, то есть подстраивается под `font-size` родителя. Это удобно для inline-иконок в кнопках и тексте.

```html
<UidButton size="sm">  <!-- font-size: 14px -->
  <UidIcon :icon="Check" /> <!-- иконка тоже 14px -->
  Сохранить
</UidButton>
```

## Цвета и темизация

Иконка по умолчанию наследует `color` родителя через `currentColor`. Это значит, что в `<UidButton variant="primary">` иконка автоматически белая, а в `<UidButton variant="ghost">` — текстовая.

Точечное переопределение:

```html
<!-- через CSS-переменную (приоритетный путь) -->
<UidIcon :icon="AlertTriangle" style="--uid-icon-color: var(--uid-warning)" />

<!-- через пропс (короче, эквивалентно) -->
<UidIcon :icon="AlertTriangle" color="var(--uid-warning)" />
```

В тёмной теме иконки автоматически становятся светлыми, потому что `--uid-text-primary` меняется в `themes.css`. Никакой логики в иконке для этого не нужно.

## Доступность

Иконки бывают двух типов — kit это разделяет явно через наличие `title`.

### Декоративные (без title)

Иконка дублирует смысл соседнего текста. Для скринридера это шум.

```html
<UidButton>
  <UidIcon :icon="Save" />  <!-- aria-hidden="true", скринридер пропускает -->
  Сохранить
</UidButton>
<!-- Озвучивается как «Сохранить, кнопка» -->
```

### Озвученные (с title)

Иконка несёт смысл сама по себе (только иконка, без текста). Тогда `title` обязателен.

```html
<UidButton variant="ghost" aria-label="Закрыть">
  <UidIcon :icon="X" title="Закрыть" />
</UidButton>
```

Внутри `UidIcon` это превращается в:

```html
<svg role="img" aria-label="Закрыть"> ... </svg>
```

Если иконка — единственный контент кликабельного элемента, лучше всё же дублировать `aria-label` на кнопке (как выше): это повышает совместимость со старыми скринридерами.

### Правило большого пальца

- Иконка рядом с текстом → без `title` (декоративная).
- Иконка одна → с `title` или с `aria-label` на родительской кнопке.

## Loading-состояние (spin)

```html
<UidIcon :icon="Loader" spin />
<UidIcon :icon="RefreshCw" spin size="sm" />
```

Реализовано через CSS-анимацию, не требует JS. Скорость задаётся `--uid-icon-spin-duration` (дефолт `1s`).

## Категории доступных иконок

Все иконки Lucide импортируются по PascalCase-именам. Полный каталог с поиском — на [lucide.dev/icons](https://lucide.dev/icons). Ниже шпаргалка по категориям с самыми частыми именами.

### Стрелки и навигация

`ChevronUp`, `ChevronDown`, `ChevronLeft`, `ChevronRight`, `ChevronsLeft`, `ChevronsRight`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `ArrowUpRight`, `MoveLeft`, `Undo2`, `Redo2`, `CornerDownLeft`

### Действия

`Plus`, `Minus`, `X`, `Check`, `Edit`, `Edit2`, `Edit3`, `Pencil`, `Trash`, `Trash2`, `Save`, `Copy`, `ClipboardCopy`, `Share`, `Share2`, `Download`, `Upload`, `Send`, `Search`, `Filter`, `RefreshCw`, `RotateCw`, `Lock`, `Unlock`

### Статус и обратная связь

`Check`, `CheckCircle`, `CheckCircle2`, `X`, `XCircle`, `AlertCircle`, `AlertTriangle`, `Info`, `HelpCircle`, `Loader`, `Loader2`, `CircleSlash`, `Ban`, `Star`, `Heart`

### Навигация по приложению

`Home`, `Menu`, `MoreHorizontal`, `MoreVertical`, `Settings`, `Settings2`, `User`, `Users`, `LogIn`, `LogOut`, `Bell`, `BellOff`, `Search`, `Globe`, `Bookmark`

### Файлы и папки

`File`, `FileText`, `FileCode`, `FileJson`, `FileImage`, `FilePlus`, `FileX`, `Folder`, `FolderOpen`, `FolderPlus`, `Archive`, `Paperclip`

### Коммуникация

`Mail`, `MailOpen`, `MessageCircle`, `MessageSquare`, `Phone`, `Send`, `AtSign`, `Inbox`

### Медиа

`Play`, `Pause`, `Square` (stop), `SkipBack`, `SkipForward`, `Volume`, `Volume1`, `Volume2`, `VolumeX`, `Image`, `ImageOff`, `Video`, `Mic`, `MicOff`, `Camera`

### Layout и просмотр

`LayoutGrid`, `LayoutList`, `LayoutDashboard`, `LayoutPanelLeft`, `Grid`, `List`, `Columns`, `Rows`, `Eye`, `EyeOff`, `Maximize`, `Minimize`, `PanelLeft`, `PanelRight`, `Sidebar`

### Устройства

`Monitor`, `Smartphone`, `Tablet`, `Laptop`, `Server`, `HardDrive`, `Cpu`, `Wifi`, `WifiOff`, `Bluetooth`

### Время и календарь

`Calendar`, `CalendarDays`, `Clock`, `Timer`, `Hourglass`, `History`

### Финансы и e-commerce

`CreditCard`, `Wallet`, `DollarSign`, `Euro`, `ShoppingCart`, `ShoppingBag`, `Package`, `Truck`, `Tag`, `Receipt`

### Графики и данные

`BarChart`, `BarChart2`, `BarChart3`, `LineChart`, `PieChart`, `TrendingUp`, `TrendingDown`, `Activity`, `Database`

### Социальные / бренды

В Lucide ограниченный набор брендов: `Github`, `Gitlab`, `Twitter`, `Facebook`, `Instagram`, `Linkedin`, `Youtube`. Если нужен полный набор — см. раздел «Дополнительные иконки» ниже.

### Погода

`Sun`, `Moon`, `SunMoon`, `Cloud`, `CloudRain`, `CloudSnow`, `CloudLightning`, `Wind`, `Droplet`, `Thermometer`

### Темизация / переключатели

`Sun`, `Moon`, `MonitorSmartphone` (для system theme), `Palette`, `Paintbrush`

## Кастомные иконки

Иногда нужна иконка, которой нет в Lucide (логотип, специфичная для проекта). Простая стратегия — Vue-компонент, который рендерит SVG, и передаётся в `UidIcon` так же, как Lucide.

```vue
<!-- src/icons/MyLogo.vue в твоём приложении -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="..." />
  </svg>
</template>
```

```vue
<script setup lang="ts">
import { UidIcon } from '@dskripchenko/ui'
import MyLogo from './icons/MyLogo.vue'
</script>

<template>
  <UidIcon :icon="MyLogo" size="lg" />
</template>
```

Главное условие — SVG должен быть с `fill="none" stroke="currentColor"` (или `fill="currentColor"`), иначе иконка не подцепит цвет родителя и не станет тёмной/светлой при смене темы.

Для динамического реестра кастомные иконки регистрируются так же:

```ts
import { registerIcons } from '@dskripchenko/ui'
import MyLogo from './icons/MyLogo.vue'

registerIcons({ 'my-logo': MyLogo })
```

## Дополнительные иконки

Если 1500 Lucide-иконок мало (например, нужны брендовые иконки или иной стиль) — рекомендуемые опции:

- **simple-icons** — ~3000 брендовых иконок (Discord, Slack, Vercel, npm и т.д.). Установи `simple-icons-vue` или импортируй SVG напрямую — `UidIcon` примет любой Vue-компонент в `:icon`.
- **unplugin-icons** — Vite/Webpack-плагин, который превращает любую Iconify-иконку в Vue-компонент: `import IconHome from '~icons/lucide/home'`. Не часть kit'а — настраивается на стороне проекта.
- **Phosphor / Tabler / Material Symbols** — есть Vue-обёртки. Все совместимы с `UidIcon` через `:icon`.

Kit намеренно поддерживает только один источник по умолчанию (Lucide). Любая иконка-Vue-компонент совместима с `UidIcon` — это и есть точка расширения.

## Где живёт реализация

```
src/
  icons/
    UidIcon.vue           # обёртка
    UidIcon.css
    UidIcon.stories.ts
    UidIcon.spec.ts
    registry.ts          # registerIcons + lookup
    index.ts             # реэкспорт UidIcon, registerIcons + re-export Lucide
```

`@dskripchenko/ui/icons` маппится на `src/icons/index.ts`. Этот sub-export содержит:

- `UidIcon`
- `registerIcons`, `getRegisteredIcon`
- весь `lucide-vue-next` (через `export *`)

`UidIcon` дополнительно реэкспортируется из главного `@dskripchenko/ui`, чтобы базовые сценарии не требовали отдельного импорта.

## Анти-паттерны

- ❌ Хардкод размера в SVG (`width="24"`). У `UidIcon` width/height приходят из CSS — захардкоженные атрибуты ломают `size`.
- ❌ Хардкод цвета в SVG (`fill="#000"`). Используй `currentColor`.
- ❌ Использование иконки без текста и без `title`/`aria-label`. Скринридер пропустит весь смысл.
- ❌ Импорт `import * as icons from 'lucide-vue-next'` — убивает tree-shake. Импортируй только нужное.
- ❌ Регистрация в `registerIcons` всех 1500 иконок «на всякий случай». Регистрируй только то, что реально приходит по имени.
- ❌ Использование `UidIcon name="..."` для статически известных иконок. Для них существует `:icon=`, и он лучше тайпится и тришейкается.
