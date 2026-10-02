---
"@dskripchenko/ui": minor
---

Every caption follows the kit locale, and number inputs keep their value readable.

- Hard-coded Russian captions, aria-labels and defaults moved into the locale bags (`ru`/`en`, typed in `UidLocale`) and read through `useLocale()`; the props stay as overrides. New sections: `sidebar`, `header`, `pageHeader`, `emptyState`, `errorState`, `wizard`, `calendar`, `carousel`, `stepper`, `transfer`, `sparkline`, `table`, `avatarGroup`, `command`, `anchor`, `heatmap`, `validation`; new keys in `datePicker`, `dateRangePicker`, `timePicker`, `colorPicker`, `rating`, `pagination`, `breadcrumb`. Affected: UidTable (empty text, select-all and row labels), UidPagination/UidPaginationCursor/UidPageSize/UidLoadMore, UidEmptyState, UidErrorState presets, UidCalendar "today", UidSpinner, UidCommand, UidBreadcrumb, UidSidebar, UidHeader, UidPageHeader, UidWizardStep, UidCarousel, UidStepper, UidTransfer, UidSparkline, UidHeatmap, UidAvatarGroup, UidAnchor, UidRating, and the picker dialogs' labels. Props whose defaults were Russian strings now default to `undefined` and fall back to the locale.
- Default validation messages follow the locale too: `provideLocale()` switches them; `setValidationLocale()` is exported for use outside Vue. `setMessages()` overrides still win.
- A guard spec fails on any Cyrillic outside `src/locales` in components, patterns, layouts, composables and utils (comments, stories and specs excepted).
- `UidNumberInput` drops its steppers when disabled or readonly, and hides them through a container query when the control is too narrow for the steppers and the value (a 95px column showed "82" for 82.99).
