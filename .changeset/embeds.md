---
"@dskripchenko/ui": minor
---

Markdown: `![[note]]` and `![[note#heading]]` are embeds — `<span class="uid-markdown__embed" data-embed>` around the note's link, for the host to fill (styled as a quoted frame with `is-filled`); without a host the link stays.
