---
'@dskripchenko/ui': minor
---

Markdown: GitHub task lists. `- [ ] item` and `- [x] item` render as disabled checkboxes (in bullet, ordered and nested lists); a list of tasks only goes without bullets. The checkboxes are named for screen readers from the locale (`markdown.taskDone`, `markdown.taskOpen`; `taskLabels` option of `renderMarkdown`).

A block renderer's context carries the markdown's `imageBase` and `linkBase` (`UidMarkdownBlockRenderContext`), so a block that names files — a ```video with `src: intro.mp4` — resolves relative paths as the markdown's own images and links do.
