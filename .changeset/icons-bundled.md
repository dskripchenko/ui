---
"@dskripchenko/ui": patch
---

The kit no longer imports `lucide-vue-next` at run time (since 1.44.0 it did): `UidProductSwitcher`, `UidReactions` and `UidEmojiPicker` took their icons from the `icons` entry, which pulled its `export * from 'lucide-vue-next'` into a chunk the main entry imports — a page loading the kit from a CDN without `lucide-vue-next` in its import map failed to load it. Their icons are bundled again, and the build now fails if any file but the `icons` entry imports `lucide-vue-next`.
