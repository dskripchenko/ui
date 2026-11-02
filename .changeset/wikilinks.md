---
'@dskripchenko/ui': minor
---

Markdown reads internal links as note-taking apps write them: `[[note]]`, `[[note#heading]]`, `[[note|text]]` become links with `data-wikilink` (the host resolves where a note is; the address is the note's file beside the document, with the heading's anchor) and the class `uid-markdown__wikilink`; `![[picture.png]]` is the picture. `wikiLinks: false` turns it off. A link the host marks `is-missing` is drawn muted.
