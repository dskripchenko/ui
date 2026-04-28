---
"@dskripchenko/ui": minor
---

Добавлено 7 компонентов низкого приоритета:

- **UidBackTop** — кнопка «наверх», появляется при достижении порога скролла, с smooth-возвратом
- **UidAffix** — sticky-обёртка с `offsetTop`/`offsetBottom` через position:sticky + IntersectionObserver, эмит `change(affixed)`
- **UidWatermark** — диагональный водяной знак через canvas → data-URL с настройкой шрифта, цвета, наклона, шага
- **UidAnchor** — навигация по якорям с подсветкой активного раздела через IntersectionObserver и smooth-scroll
- **UidTour** — гид-тултипы по UI: spotlight на target-элементе, шаги, центрированный modal-режим, маска
- **UidMention** — textarea с @-упоминаниями: триггер по символу/символам, popup со списком, навигация ↑↓ Enter/Tab
- **UidTreeSelect** — гибрид TreeView + Select: trigger с выбранным значением, single/multiple, чипы с maxTagCount
