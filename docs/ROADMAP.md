# Roadmap

Current state of the library and what's next.

## Status

All originally planned phases (0–10+) are closed. The library currently ships **70+ components**: ~60 atomic, 7 patterns, 4 layouts, 4 chart primitives, plus 10 composables and an i18n provider.

## Done

### Phase 0 — Foundation

- [x] Vite library mode + TypeScript
- [x] ESLint flat config + Prettier
- [x] Storybook 8 + addons (`essentials`, `a11y`, `themes`)
- [x] Vitest + jsdom + `@vue/test-utils`
- [x] Changesets + GitHub Actions release pipeline
- [x] Storybook deploy to GitHub Pages
- [x] Design tokens: colors, typography, spacing, radius, shadow, motion, z-index
- [x] Semantic tokens + themes (`:root[data-theme='light' | 'dark']`)
- [x] Reset and `global.css`
- [x] `useTheme()` — toggle theme + subscribe to `prefers-color-scheme`
- [x] Icons — `lucide-vue-next` + `UidIcon` + `@dskripchenko/ui/icons` sub-export

### Phase 1–6 — Core components

- [x] Forms: Button, Input, Textarea, Checkbox, Radio, Switch, Label, FormField
- [x] Feedback: Spinner, Skeleton, Badge, Alert, Progress, Toast
- [x] Overlays: Modal, Drawer, Tooltip, Popover, Menu
- [x] Navigation: Tabs, Breadcrumb, Link, Pagination (+ Cursor/LoadMore/InfiniteScroll/PageSize)
- [x] Data: Card, Avatar, Tag, Divider, Accordion, Table
- [x] Layout helpers: Stack, Grid, Container

### Phase 7 — Patterns

- [x] Header, Footer, Sidebar (+ Item, Group, Divider)
- [x] PageHeader, EmptyState, ErrorState, Result

### Phase 8 — Wizards

- [x] Stepper, Wizard, WizardStep + `useWizard()`

### Phase 9 — Layouts

- [x] SimpleLayout, SidebarLayout, AuthLayout, WizardLayout + `useSidebar()`

### Phase 10+ — Advanced

- [x] Select, DatePicker, Slider, ColorPicker, Command, VirtualList

### Expansion (after Phase 10)

**Round 1 — forms & data (`v0.2.0`):** NumberInput, TimePicker, DateRangePicker, TagsInput, Combobox, TreeView, Timeline, FileUpload, Code

**Round 2 — medium priority (`v0.3.0`):** Rating, Splitter, Stat, DescriptionList, Result (pattern)

**Round 3 — low priority (`v0.4.0`):** BackTop, Affix, Anchor, Watermark, Tour, Mention, TreeSelect

**Round 4 — niche (`v0.5.0`):** Calendar, Carousel, Cascader, Transfer, NotificationBadge

### Quality & DX

- [x] Bundle visualizer (`pnpm build:analyze`)
- [x] A11y audit (roving tabindex, keyboard nav, ARIA)
- [x] i18n — `UidLocaleProvider` + `useLocale` + `ru`/`en` built-in locales
- [x] Charts — Sparkline, ProgressRing, Gauge, Heatmap (SVG, no runtime deps)
- [x] Multi-language documentation (en/ru/de/zh)

## What's next

In order of decreasing usefulness:

### Possible components (on demand)

- [ ] Dual range slider with two thumbs
- [ ] TimePicker with seconds support and 24-hour AM/PM hybrid
- [ ] Tree-grid (table whose rows expand into trees)

### Quality & DX

- [ ] Visual regression tests (Chromatic / Percy)
- [ ] Bundle-size budget enforced in CI

## Principles

1. Build for what's needed now. Don't build for hypotheticals.
2. Every new component ships with `.vue` + `.css` + `.spec.ts` + `.stories.ts` + `index.ts`, exported from `src/index.ts`.
3. If a component is harder than it looks (Calendar, Cascader), consider a headless library as a peer-dep instead of a custom build.
