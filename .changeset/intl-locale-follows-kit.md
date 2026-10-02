---
'@dskripchenko/ui': patch
---

`UidStat` no longer hard-codes `ru-RU` for number formatting. It now follows the active kit locale (via `UidLocaleProvider` / `provideLocale`), so an English panel shows `2.9%` instead of `2,9%`. A new optional `locale` prop (BCP 47 tag) overrides it per component. `UidLocale` gains an optional `code` field (`ru` is `ru-RU`, `en` is `en-US`) that custom locales can set; without it the previous `ru-RU` behavior is kept.
