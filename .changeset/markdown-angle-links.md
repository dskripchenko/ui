---
"@dskripchenko/ui": patch
---

Markdown: a link or picture destination in angle brackets, as CommonMark allows — `[text](<my notes/plan.md>)` — is read as the address inside the brackets, spaces and all (a space becomes `%20`). Before, the brackets went into the address (`%3Cplan.md%3E`) and a destination with a space was no link at all.
