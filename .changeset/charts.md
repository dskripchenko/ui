---
"@dskripchenko/ui": minor
---

Заход 5 — графики (SVG-примитивы, без runtime-зависимостей):

- **UidSparkline** — мини-график тренда: line/bar/area, smoothing, dots, zero-line; для KPI-карточек и инлайн-вставок
- **UidProgressRing** — круговой прогресс на SVG `stroke-dasharray`, indeterminate-режим, кастомный лейбл/слот
- **UidGauge** — полукруг-циферблат с цветовыми диапазонами (`ranges`) и опциональной стрелкой; aria-meter
- **UidHeatmap** — календарный heatmap GitHub-style с авто-пресчётом уровней, легендой и tooltip через `<title>`

Полные графики (Line/Bar/Pie/Area) намеренно не входят в kit — рекомендации по парной интеграции с Chart.js / ECharts описаны в `docs/CHARTS.md`.
