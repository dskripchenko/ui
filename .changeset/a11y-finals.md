---
"@dskripchenko/ui": patch
---

Закрыт остаток a11y-аудита:

- **TreeView** — roving tabindex (только активный узел в Tab order, остальные `-1`), полная клавиатурная навигация: ArrowUp/Down между видимыми соседями, ArrowRight раскрывает или переходит вглубь, ArrowLeft сворачивает или возвращает к родителю, Home/End на первый/последний видимый узел.
- **TimePicker** — каждая колонка получила `role="listbox"` + `aria-label`, ячейки `role="option"` + `aria-selected`. ArrowUp/Down/Home/End навигирует по значениям внутри колонки с плавной прокруткой, Enter подтверждает выбор, Escape закрывает.
- **ColorPicker** — hue/alpha-треки получили `role="slider"` + `aria-valuemin/max/now` + `tabindex`. Стрелки регулируют значение (Shift = шаг 10), Home/End — крайние значения. Sat/Brightness-область — `role="application"` с двумерной навигацией стрелками.
