---
'@dskripchenko/ui': minor
---

Добавлен `UidMarkdown` — markdown-документ без зависимостей: безопасный рендерер (исходник экранируется до разметки, ссылки только http(s)/mailto/относительные), код через `UidCode`, оглавление, `linkBase`, врезки `[!NOTE]`. Блоки кода выбранных языков можно отдать своим рендерерам (`blockRenderers` или `provideMarkdownBlockRenderers`) — так подключаются диаграммы.
