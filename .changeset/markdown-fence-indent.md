---
'@dskripchenko/ui': patch
---

Markdown: a code fence closes only with a fence indented at most three spaces more than the opening one (and with nothing after it), in `renderMarkdown` and `splitMarkdown` — an indented ``` inside a code block (an HTML example with a Markdown script in it) no longer ends the block early.
