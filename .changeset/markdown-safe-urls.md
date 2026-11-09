---
'@dskripchenko/ui': patch
---

Markdown: link, image and wiki-link URLs are checked after escapes are restored; unsafe schemes can no longer slip through a backslash escape or a wiki link. The scheme check also decodes character references and ignores whitespace, control characters and letter case, and alt, title and data attributes no longer take markup from code spans or math.
