---
'@dskripchenko/ui': minor
---

Markdown: `![[picture.png|300]]` and `|300x200` size an embedded picture as in Obsidian (`width`/`height`, `data-size`), and the picture carries its name in `data-embed` (class `uid-markdown__embed-image`) so a host can find the file by name — the `src` is only a guess beside the document. An embed of a note or a video gets `data-size` too. `.ico` and `.apng` count as pictures.
