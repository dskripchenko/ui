---
'@dskripchenko/ui': minor
---

Text on fills and tints keeps WCAG AA contrast (4.5:1) in both themes. New tokens: `--uid-accent-solid` and `--uid-accent-solid-hover` for fills that carry text; `--uid-{success,warning,danger,info}-text` for status pills, tags and alerts on their `-subtle` tint; `--uid-{success,warning,danger,info}-solid` for status fills with text; `--uid-neutral-text` for neutral pills; `--uid-color-*` aliases for each. New palette steps: teal-800, emerald-700, amber-700, blue-700. In the dark theme `--uid-text-on-accent` is now zinc-900. Primary and danger buttons, sidebar and notification counters, pagination, steppers, timeline markers, calendar and picker selections, the tour and time picker buttons, the auth layout's brand panel and board avatars use the solid fills; Badge, Tag, Alert, Stat trends, Kanban and Board counters and invalid TagsInput chips use the text tokens. `--uid-accent` itself is unchanged and stays for borders, focus rings and charts.
