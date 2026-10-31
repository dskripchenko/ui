---
'@dskripchenko/ui': minor
---

`renderMarkdown` / UidMarkdown follow CommonMark in more places: backslash escapes of punctuation (`\*`, `\_`, `\[`, `\#` at a line start — and nothing else, so `C:\Users` stays as written), code spans of several backticks with their padding space (``` `` a ` b `` ```), hard breaks with `\` or two spaces at the end of a line, `title` on links and images, and code fences longer than three characters (a fence closes only with one at least as long, so a ```` block can hold ``` ones).
