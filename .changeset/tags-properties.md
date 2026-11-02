---
"@dskripchenko/ui": minor
---

Markdown: `#tags` as `<span class="uid-markdown__tag" data-tag>` chips (`tags: false` turns them off), and a YAML front matter at the start of a document as a table of properties (`UidMarkdown` reads it; `renderMarkdown(source, { frontMatter: true })`; `readFrontMatter(source)` gives it as data).
