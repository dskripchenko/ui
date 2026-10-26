---
'@dskripchenko/ui': minor
---

Embed support. `provideAppLocale(app, source)` provides the kit locale on a whole app (`app.provide`) for widgets and embed scripts without a wrapping `UidLocaleProvider`: the source is a locale, a ref/computed or a getter, partial locales merge over `en`, validation messages follow it; returns `stop()` and stops on `app.unmount()` (Vue 3.5+). The injection key is exported as `uidLocaleKey`; `provideLocale` now also accepts a ref or a getter. UidVideo exposes the chapters track: `chapters` (`UidMediaChapter[]`, `{ start, end, title }`), `chapterIndex`, `seekToChapter(index | title)` and a `chapterchange` event. `@dskripchenko/ui/package.json` is exported. The main entry no longer imports `lucide-vue-next` at runtime: the ~45 icons the kit's components use are bundled (ISC notice kept), so the kit loads from an ESM CDN without lucide in the import map; `@dskripchenko/ui/icons` still re-exports `lucide-vue-next`.
