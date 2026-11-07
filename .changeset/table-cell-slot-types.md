---
'@dskripchenko/ui': patch
---

`UidTable`: the cell slots are typed as they are called — `<template #name="{ row }">` — instead of `(row?: Record<string, unknown>)`. Templates that destructured `{ row }` failed `vue-tsc` with "Property 'row' does not exist"; the `empty` slot is typed separately.
