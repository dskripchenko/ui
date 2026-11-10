# Milestone strip

`UidMilestoneStrip` shows a few milestones (three to five read best) on a month scale: month names on top, a row per milestone with a diamond at its date, the label and a caption beside it, and an optional vertical line for today. It is a roadmap at a glance, not a Gantt chart: there are no durations, only dates.

```vue
<script setup lang="ts">
import { UidMilestoneStrip, type Milestone } from '@dskripchenko/ui'

const items: Milestone[] = [
  { key: 'design', label: 'Design approved', date: '2026-09-12', caption: 'Done' },
  { key: 'beta', label: 'Public beta', date: '2026-10-20', caption: 'Two blockers open', risk: true },
  { key: 'docs', label: 'Docs complete', date: '2026-11-18', caption: 'On track' },
  { key: 'release', label: 'Release 2.0', date: '2026-12-15', caption: 'Planned', href: '/releases/2.0' },
]

function open(item: Milestone) {
  // show the milestone's details
}
</script>

<template>
  <UidMilestoneStrip
    :items="items"
    today="2026-11-10"
    today-label="Today, November 10"
    @select="open"
  />
</template>
```

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `items` | `Milestone[]` | — | `{ key, label, date, caption?, risk?, href? }`; `date` is `YYYY-MM-DD`. |
| `start` | `string` | the first day of the earliest month | `YYYY-MM-DD`, the first day of the scale. The earliest month is taken over the items and `today`. |
| `end` | `string` | the last day of the latest month | `YYYY-MM-DD`, the last day of the scale (inclusive). |
| `today` | `string` | — | `YYYY-MM-DD`: a 2 px vertical line in the danger colour across all rows. |
| `todayLabel` | `string` | — | A footnote under the strip with a short mark in the same colour. Omit it to explain the line in your own markup. |
| `monthFormat` | `'short' \| 'long'` | `'short'` | Month names in the header, exactly as `Intl.DateTimeFormat` gives them for the locale (`Oct` / `October`, `окт.` / `октябрь`). |
| `ariaLabel` | `string` | locale (`Milestones`) | The accessible name of the list. |

Event `select(item: Milestone)` — a milestone without `href` was activated (click, Enter or Space). A milestone with `href` is a plain link `<a :href>` and emits nothing. There are no slots.

## Layout

- A milestone's position is the start of its day on the scale: `(date − start) / (end − start + 1)`. Dates outside the scale are pinned to its edges.
- Month names sit at the first day of each month; a partial first month (a custom `start`) is named only when it is wide enough.
- Each row is at least 44 px high with a thin rule below. The diamond is a 12 px square turned 45°, a 2 px border in `--uid-accent` and no fill; `risk` turns the border to `--uid-warning` and the caption to `--uid-color-warning-text`.
- The label (14 px semibold) and the caption (12 px, secondary) sit to the right of the diamond. From 70 % of the width on they move to its left and align right, so they never run past the edge. Long labels wrap — at 390 px expect two lines.
- Where the today line crosses the text, the text is backed by `--uid-milestone-surface` (default `--uid-color-surface`): set it to the background the strip sits on.

CSS variables: `--uid-milestone-marker`, `--uid-milestone-risk`, `--uid-milestone-today`, `--uid-milestone-surface`, `--uid-milestone-row-h`. Only theme tokens are used, so the light and dark themes work as they are.

## Accessibility

- The milestones are an ordered list (`<ol>`) named by `ariaLabel`; the month header and the today line are decorative (`aria-hidden`).
- Every milestone is a link or a button with the name "label, date, caption" — the date written out for the locale (`October 20, 2026`) — and, for `risk`, the locale's `milestoneStrip.atRisk` ("at risk").
- Milestones are in the tab order and show the kit's focus ring.

Locale keys: `milestoneStrip.label`, `milestoneStrip.atRisk`. Types: `UidMilestoneStripProps`, `UidMilestoneStripMonthFormat`, `Milestone`.
