---
'@dskripchenko/ui': minor
---

`renderMarkdown` / `UidMarkdown`: block ids, as Obsidian writes them. ` ^id` at the end of a paragraph, a heading, a list item or a quote is hidden, the block gets the anchor `^id` (`id` and `data-block-id`), and `[[note#^id]]` links to it (`#%5Eid`) — before, the `^` was dropped and the link pointed at a heading-like `#id`. An id needs at least one letter, so `x ^2` stays text; `blockIds: false` turns it off.
