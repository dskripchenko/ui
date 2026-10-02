---
'@dskripchenko/ui': patch
---

UidGrid: the default `var(--uid-space-md)` gap was lost in the browser. The grid wrote `gap` together with unset `rowGap`/`columnGap` keys, Vue cleared those longhands with `''`, and clearing a longhand of a shorthand that holds a `var()` drops the whole shorthand. The gaps are now always written as `row-gap`/`column-gap`, and unset keys are left out of the style.
