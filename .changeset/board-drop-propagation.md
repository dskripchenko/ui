---
'@dskripchenko/ui': patch
---

UidBoard: while a card is dragged, `dragover` and `drop` stay with the board — they no longer bubble to the page, whose own drop handlers (a wiki's file upload, for one) took the card for a file.
