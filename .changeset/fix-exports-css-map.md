---
"@dskripchenko/ui": patch
---

Сборка: исправлен `exports`-map для CSS — раньше пакет декларировал `./styles/{tokens,themes,reset,global}.css`, но физически в `dist/styles/` лежал только агрегированный `index.css` (компонентные стили без тем и primitives). Strict-резолверы (Vite, Node 20+) падали с `Missing specifier`, и даже deep-import к `index.css` приводил к UI без палитры.

Теперь `pnpm build` дополнительно эмитит:

- `dist/styles/tokens.css` — primitives (палитра, типографика, spacing, sizing, radius, motion, z-index, breakpoints).
- `dist/styles/themes.css` — `:root[data-theme="light|dark"]` + семантические алиасы.
- `dist/styles/reset.css` — нормализация HTML.
- `dist/styles/global.css` — :root font-family и базовая типографика.
- `dist/styles/all.css` — barrel: tokens + themes + reset + global + компоненты, для one-line подключения.
- `dist/styles/index.css` (без изменений) — только компонентные стили; путь добавлен в `exports` для backward-compat с потребителями, которые уже хакнули deep-import.

Минимальное подключение в потребителе:

```ts
import '@dskripchenko/ui/styles/all.css'
```

Гранулярное:

```ts
import '@dskripchenko/ui/styles/tokens.css'
import '@dskripchenko/ui/styles/themes.css'
import '@dskripchenko/ui/styles/reset.css'   // опционально
import '@dskripchenko/ui/styles/global.css'  // опционально
import '@dskripchenko/ui/styles/index.css'   // компоненты
```
