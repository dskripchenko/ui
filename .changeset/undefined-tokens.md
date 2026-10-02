---
"@dskripchenko/ui": patch
---

Tokens the components used but no token file defined now exist, so their declarations no longer silently fall back:

- `--uid-font-size-base` (= `--uid-font-size-md`, 16px): UidPageHeader, UidEmptyState, UidErrorState and UidAccordion used it with no fallback; Select, DatePicker and Command already fell back to 16px, so sizes are unchanged.
- `--uid-shadow-xl` (light `0 20px 60px rgb(0 0 0 / 0.3)`, dark `… / 0.6`): UidCommand had no shadow; Modal and Drawer keep their former fallback value in light.
- `--uid-focus-ring` (the 3px primary-subtle halo the fallbacks already drew).
- `--uid-z-affix` (100) and `--uid-z-fixed` (150) join the stacking scale: UidBackTop no longer floats above modals and toasts at 1000.
- UidTooltip referenced the non-existent `--uid-color-neutral-900/50`, so a tooltip had a transparent background; it now uses the zinc scale.
- A guard spec fails on any `var(--uid-…)` without a fallback that neither `src/tokens`, `src/styles` nor the component's own stylesheet defines.
