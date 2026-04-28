---
"@dskripchenko/ui": major
---

🎉 **Version 1.0 — stable release**

Public commitment to API stability. From now on:

- All breaking changes (renamed/removed props, changed default behaviour, removed components/composables) will only ship in major bumps.
- New features and components — `minor`.
- Bug fixes, doc tweaks, internal refactors that don't change the API — `patch`.

No code changes from `0.6.x`; this release simply formalizes the API surface as stable.

Library highlights at 1.0:

- 70+ components: forms, navigation, overlays, data display, charts, patterns, layouts
- Light + Dark themes via `data-theme`, full design-token system
- i18n via `UidLocaleProvider` + built-in `ru` / `en` locales
- A11y: roving tabindex, keyboard nav, ARIA across all interactive components
- Built-in SVG charts (Sparkline, ProgressRing, Gauge, Heatmap) — no runtime chart deps
- Multi-language docs (en / ru / de / zh)
- Storybook deployed at [dskripchenko.github.io/ui](https://dskripchenko.github.io/ui/)
