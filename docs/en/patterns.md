# Patterns and layouts

Beyond atomic components, the kit ships two extra tiers:

- **Patterns** — composite blocks: Header, Footer, Sidebar, PageHeader, EmptyState, ErrorState, Result. "Bigger bricks" assembled from components.
- **Layouts** — page templates: Simple, Sidebar, Auth, Wizard. Whole-box scaffolding that arranges Header / Sidebar / Content / Footer with slots for content.

The idea is simple: you often need a "dashboard layout in 5 minutes", not just a `UidButton`. Patterns and layouts close that gap.

## Component vs Pattern vs Layout

| Question | Component | Pattern | Layout |
|---|---|---|---|
| What is it? | Atomic UI element | Recognizable composite block | Block-arrangement template |
| Slots | 0–2 (default + opt. prepend/append) | 3–6 (logo, nav, actions, …) | 2–4 (header, sidebar, content, footer) |
| Built on | Tokens only | Components | Patterns + components |
| Example | `UidButton`, `UidInput` | `UidHeader`, `UidSidebar` | `UidSidebarLayout` |

**Key rule:** patterns and layouts are optional for the consumer. You can build a page from atomic components alone — the kit supports that.

## Patterns

Each pattern solves one canonical page task. Each has a fixed set of slots, minimal props, and maximum customization via slots (not flags).

### `UidHeader` — top bar

App top-bar. Logo on the left, navigation in the center, actions (profile, theme, search) on the right.

| Slot | Purpose |
|---|---|
| `logo` | Brand mark, link home |
| `nav` | Main menu (`UidLink`, `UidMenu`) |
| `actions` | Right-side icons/buttons: theme, notifications, profile |
| `mobile` | Replaces `nav` below the breakpoint |

Props (minimal): `sticky?`, `bordered?`, `transparent?`.

### `UidFooter` — bottom bar

Footer with navigation, copyright, links.

| Slot | Purpose |
|---|---|
| `default` | Simple-case content |
| `columns` | Link columns (Resources / Company / Legal) |
| `bottom` | Bottom row: copyright + social icons |

Props: `variant?: 'minimal' \| 'columns'`.

### `UidSidebar` — side navigation

Vertical app menu.

| Slot | Purpose |
|---|---|
| `header` | Sidebar top: logo/brand |
| `nav` | Main navigation (`UidSidebarItem`, `UidSidebarGroup`) |
| `footer` | Sidebar bottom: profile / settings / collapse |

Props: `collapsed?`, `width?`, `position?: 'left' \| 'right'`.

Sub-components: `UidSidebarItem`, `UidSidebarGroup`, `UidSidebarDivider`.

### `UidPageHeader` — page header

Page-content header with title, description, breadcrumbs, and actions.

| Slot | Purpose |
|---|---|
| `breadcrumb` | `UidBreadcrumb` or custom |
| `title` | Title (defaults to the `title` prop) |
| `description` | Subtitle |
| `actions` | Right-aligned action buttons |
| `tabs` | Optional `UidTabs` underneath |

Props: `title?`, `description?`, `back?` (back arrow that emits `back`).

### `UidEmptyState` — empty state

Fallback when there's no data ("no projects", "nothing found", "start by creating…").

| Slot | Purpose |
|---|---|
| `illustration` | Top icon or illustration |
| `title` | (or `title` prop) |
| `description` | (or `description` prop) |
| `actions` | CTA buttons |

### `UidErrorState` — error state

Like `UidEmptyState` but error-focused. Default icon is alarming, colours via `--uid-danger`. Accepts `code?: '404' \| '500' \| 'network' \| string` and `message?: string` for canned cases.

### `UidResult` — operation outcome

Full-page success/info/warning/error result. For confirmation/error pages after a form submission, payment, registration, etc.

Props: `status?: 'success' \| 'info' \| 'warning' \| 'error'`, `title?`, `description?`, `compact?: boolean`.

Slots: `icon`, `title`, `description`, `default` (extra content), `actions`.

## Layouts

Layout = the page "box". Takes large slots (header, sidebar, content, footer) and arranges them. No business logic — pure structural wrapper.

### `UidSimpleLayout`

Simplest template: vertical stack — header on top, content in the middle, footer at the bottom.

Slots: `header`, `default` (content), `footer`.

```html
<UidSimpleLayout>
  <template #header>
    <UidHeader>
      <template #logo>Project</template>
      <template #nav>…</template>
    </UidHeader>
  </template>

  <main>
    <UidPageHeader title="Home" />
    …
  </main>

  <template #footer>
    <UidFooter>© 2026</UidFooter>
  </template>
</UidSimpleLayout>
```

### `UidSidebarLayout`

Two-column template: fixed sidebar on the left, content on the right. Optional header above and footer below. The most common admin/dashboard layout.

Slots: `sidebar`, `header?`, `default`, `footer?`.

Props: `sidebarWidth?`, `sidebarCollapsed?`, `sidebarPosition?: 'left' \| 'right'`.

Behaviour:
- On mobile (below the breakpoint, default 768px) the sidebar collapses into a drawer toggled from the header (via the `useSidebar()` composable).
- The `useSidebar()` composable gives access to `collapsed`/`expanded` state from anywhere inside the layout.

### `UidAuthLayout`

Template for sign-in / sign-up / recovery pages: a centered full-screen card, optional aside illustration.

Slots: `default` (form card), `aside?`, `footer?`.

Props: `variant?: 'centered' \| 'split'`.

### `UidWizardLayout`

Template for stepwise processes (onboarding, multi-step forms, setup wizards).

| Slot | Purpose |
|---|---|
| `header` | Optional process header |
| `stepper` | Step indicator (defaults to `UidStepper` from props) |
| `default` | Current step content |
| `nav` | Back/Next buttons |

Used together with `UidWizard` (below) or standalone — the layout doesn't dictate state management.

## Wizards

Three pieces:

- `UidStepper` — visual step indicator (horizontal/vertical). Standalone-usable.
- `UidWizard` — orchestrator: tracks current step, validation, navigation. Provides context to children.
- `UidWizardStep` — single-step wrapper. Subscribes to context, renders only when active. Optional sync/async validator.

```html
<UidWizard
  :steps="[
    { id: 'profile', title: 'Profile' },
    { id: 'preferences', title: 'Preferences' },
    { id: 'review', title: 'Review' },
  ]"
  @finish="onFinish"
>
  <template #default="{ current, next, prev, isFirst, isLast }">
    <UidWizardLayout>
      <template #stepper>
        <UidStepper :steps="steps" :current="current" />
      </template>

      <UidWizardStep id="profile" :validate="validateProfile">
        <ProfileForm v-model="form.profile" />
      </UidWizardStep>
      <UidWizardStep id="preferences"><PreferencesForm v-model="form.preferences" /></UidWizardStep>
      <UidWizardStep id="review"><Review :data="form" /></UidWizardStep>

      <template #nav>
        <UidButton variant="ghost" :disabled="isFirst" @click="prev">Back</UidButton>
        <UidButton @click="next">{{ isLast ? 'Finish' : 'Next' }}</UidButton>
      </template>
    </UidWizardLayout>
  </template>
</UidWizard>
```

External components can subscribe via `useWizard()` (e.g. a custom header that shows current step name).

## Pagination set

A single `UidPagination` with variants doesn't cover all cases — they have different mechanics. The kit ships several components, each with its own purpose.

| Component | UI | When to use |
|---|---|---|
| `UidPagination` | `« 1 2 [3] 4 … 10 »` | Total count is known, direct jumps |
| `UidPaginationCursor` | `← Prev · Next →` | Cursor-based APIs (Slack, Twitter), unknown total |
| `UidLoadMore` | "Show more" button | Feed; user opts into more |
| `UidInfiniteScroll` | sentinel element at the end | Endless feed; auto-load on scroll |
| `UidPageSize` | "10 / 25 / 50" selector | Pairs with `UidPagination` |

## Principles

1. **Slots over props.** If you can move it to a slot, do. Avoids a forest of boolean flags like `showLogo`.
2. **No business logic.** Patterns don't know about routing, auth, or APIs. router-link goes through a slot; navigation through a `to` prop + `navigate` event.
3. **Composition over inheritance.** Layout = `<header-slot> + <content-slot> + <footer-slot>`. No "page protocol". Want non-standard? Assemble from components.
4. **Theming via the same CSS variables.** Patterns/layouts don't introduce new semantic tokens — just local `--uid-header-*`, `--uid-sidebar-*`, `--uid-layout-*` with a fallback to semantics.
5. **Sensible a11y scaffolding.** `UidSimpleLayout` renders proper `<header>`, `<main>`, `<footer>`. `UidSidebarLayout` marks the sidebar as `<aside>`. This is the page's bones — don't cut corners.
