---
"@dskripchenko/ui": patch
---

A11y-улучшения и инструмент анализа размера:

- **Bundle visualizer** — подключён `rollup-plugin-visualizer`, новый скрипт `pnpm build:analyze` генерирует интерактивный treemap в `stats.html`
- **DatePicker** — полная клавиатурная навигация по сетке дней (стрелки, PageUp/Down, Home/End, Enter, Escape) с roving tabindex; trigger получил `role="combobox"`, `aria-haspopup="dialog"`, `aria-label`
- **Triggers пиков** в DateRangePicker, TimePicker, TreeSelect — добавлены `role="combobox"`/`aria-haspopup`/`aria-controls`/`aria-label`
- **UidMenu trigger** — `tabindex="0"`, `role="button"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`
- **UidPopover trigger** — `role="button"`, `tabindex`, `aria-haspopup="dialog"`, Enter/Space; popover с `role="dialog"`
- **UidCombobox** — `role="combobox"` перенесён с обёртки на `<input>` (по WAI-ARIA 1.2)
- **UidCard** при `clickable` — получает `role="button"`, `tabindex`, обработку Enter/Space, событие `click`
- **UidTable** — sortable заголовки получили `tabindex`, `role="button"`, обработку Enter/Space
- **UidAnchor** — активная ссылка получает `aria-current="location"`
- **UidTour** — Escape закрывает тур, ArrowLeft/Right переключают шаги, фокус переносится в попап при открытии и возвращается на исходный элемент при закрытии
- **UidFileUpload** — устранён двойной tabstop (input получил `tabindex="-1"` и `aria-hidden`)
