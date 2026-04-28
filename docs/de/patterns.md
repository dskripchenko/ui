# Patterns und Layouts

Über atomare Komponenten hinaus liefert das Kit zwei zusätzliche Ebenen:

- **Patterns** — zusammengesetzte Blöcke: Header, Footer, Sidebar, PageHeader, EmptyState, ErrorState, Result. "Größere Bausteine", aus Komponenten zusammengebaut.
- **Layouts** — Seitenvorlagen: Simple, Sidebar, Auth, Wizard. Eine "Box" insgesamt, die Header / Sidebar / Content / Footer anordnet und Slots für Inhalt lässt.

Die Idee ist einfach: oft brauchst du ein "Dashboard-Layout in 5 Minuten", nicht nur einen `UidButton`. Patterns und Layouts schließen genau diese Lücke.

## Component vs Pattern vs Layout

| Frage | Component | Pattern | Layout |
|---|---|---|---|
| Was ist das? | Atomares UI-Element | Wiedererkennbarer zusammengesetzter Block | Block-Anordnungs-Vorlage |
| Slots | 0–2 (default + opt. prepend/append) | 3–6 (logo, nav, actions, …) | 2–4 (header, sidebar, content, footer) |
| Baut auf | nur Tokens | Components | Patterns + Components |
| Beispiel | `UidButton`, `UidInput` | `UidHeader`, `UidSidebar` | `UidSidebarLayout` |

**Schlüsselregel:** Patterns und Layouts sind für den Konsumenten optional. Du kannst eine Seite nur aus atomaren Komponenten bauen — das Kit unterstützt das.

## Patterns

Jedes Pattern löst eine kanonische Seitenaufgabe. Jedes hat einen festen Slot-Satz, minimale Props und maximale Slot-Anpassung (statt Flag-Inflation).

### `UidHeader` — Top-Bar

App-Top-Bar. Logo links, Navigation in der Mitte, Aktionen (Profil, Theme, Suche) rechts.

| Slot | Zweck |
|---|---|
| `logo` | Markenzeichen, Link zur Startseite |
| `nav` | Hauptmenü (`UidLink`, `UidMenu`) |
| `actions` | Rechte Icons/Buttons: Theme, Benachrichtigungen, Profil |
| `mobile` | Ersetzt `nav` unterhalb des Breakpoints |

Props (minimal): `sticky?`, `bordered?`, `transparent?`.

### `UidFooter` — Fußbereich

Footer mit Navigation, Copyright, Links.

| Slot | Zweck |
|---|---|
| `default` | Inhalt für einfache Fälle |
| `columns` | Link-Spalten (Resources / Company / Legal) |
| `bottom` | Untere Zeile: Copyright + Social-Icons |

Props: `variant?: 'minimal' \| 'columns'`.

### `UidSidebar` — Seitennavigation

Vertikales App-Menü.

| Slot | Zweck |
|---|---|
| `header` | Sidebar-Top: Logo/Marke |
| `nav` | Hauptnavigation (`UidSidebarItem`, `UidSidebarGroup`) |
| `footer` | Sidebar-Unten: Profil / Settings / Collapse |

Props: `collapsed?`, `width?`, `position?: 'left' \| 'right'`.

Sub-Komponenten: `UidSidebarItem`, `UidSidebarGroup`, `UidSidebarDivider`.

### `UidPageHeader` — Seitenkopf

Seiten-Inhaltskopf mit Titel, Beschreibung, Breadcrumbs und Aktionen.

| Slot | Zweck |
|---|---|
| `breadcrumb` | `UidBreadcrumb` oder eigene |
| `title` | Titel (Default aus dem `title`-Prop) |
| `description` | Untertitel |
| `actions` | Rechtsbündige Aktionsbuttons |
| `tabs` | Optionale `UidTabs` darunter |

Props: `title?`, `description?`, `back?`.

### `UidEmptyState`

Fallback, wenn keine Daten da sind ("keine Projekte", "nichts gefunden", "fang an mit…").

| Slot | Zweck |
|---|---|
| `illustration` | Top-Icon oder Illustration |
| `title` | (oder `title`-Prop) |
| `description` | (oder `description`-Prop) |
| `actions` | CTA-Buttons |

### `UidErrorState`

Wie `UidEmptyState`, aber fehlerorientiert. Standard-Icon alarmierend, Farben über `--uid-danger`. Akzeptiert `code?: '404' \| '500' \| 'network' \| string` und `message?: string`.

### `UidResult`

Vollseitiges success/info/warning/error-Ergebnis. Für Bestätigungs-/Fehlerseiten nach Formularsendung, Zahlung, Registrierung etc.

Props: `status?`, `title?`, `description?`, `compact?: boolean`.

Slots: `icon`, `title`, `description`, `default` (Zusatzinhalt), `actions`.

## Layouts

Layout = die "Seitenbox". Nimmt große Slots (header, sidebar, content, footer) entgegen und ordnet sie an. Keine Geschäftslogik — reine strukturelle Hülle.

### `UidSimpleLayout`

Einfachste Vorlage: vertikaler Stack — Header oben, Inhalt mittig, Footer unten.

Slots: `header`, `default` (Inhalt), `footer`.

```html
<UidSimpleLayout>
  <template #header>
    <UidHeader>
      <template #logo>Project</template>
      <template #nav>…</template>
    </UidHeader>
  </template>

  <main>
    <UidPageHeader title="Startseite" />
    …
  </main>

  <template #footer>
    <UidFooter>© 2026</UidFooter>
  </template>
</UidSimpleLayout>
```

### `UidSidebarLayout`

Zwei-Spalten-Vorlage: feste Sidebar links, Inhalt rechts. Optional Header oben und Footer unten. Häufigstes Admin/Dashboard-Layout.

Slots: `sidebar`, `header?`, `default`, `footer?`.

Props: `sidebarWidth?`, `sidebarCollapsed?`, `sidebarPosition?: 'left' \| 'right'`.

Verhalten:
- Auf Mobile (unter Breakpoint, Default 768 px) klappt die Sidebar zu einem Drawer, der vom Header aus geöffnet wird (über `useSidebar()`).
- Das Composable `useSidebar()` gibt von überall innerhalb des Layouts Zugriff auf den `collapsed`/`expanded`-Zustand.

### `UidAuthLayout`

Vorlage für Login-/Sign-up-/Recovery-Seiten: zentrierte Vollbild-Karte, optionale Aside-Illustration.

Slots: `default` (Formular-Karte), `aside?`, `footer?`.

Props: `variant?: 'centered' \| 'split'`.

### `UidWizardLayout`

Vorlage für mehrschrittige Prozesse (Onboarding, Multi-Step-Forms, Setup-Wizards).

| Slot | Zweck |
|---|---|
| `header` | Optionaler Prozesskopf |
| `stepper` | Schrittindikator (Default: `UidStepper` aus Props) |
| `default` | Inhalt des aktuellen Schritts |
| `nav` | Zurück/Weiter-Buttons |

Wird mit `UidWizard` (siehe unten) verwendet oder eigenständig — das Layout schreibt das State-Management nicht vor.

## Wizards

Drei Bausteine:

- `UidStepper` — visueller Schrittindikator (horizontal/vertikal). Eigenständig nutzbar.
- `UidWizard` — Orchestrator: aktueller Schritt, Validierung, Navigation. Liefert Context an Kinder.
- `UidWizardStep` — Wrapper eines Schritts. Subscribed zum Context, rendert nur, wenn aktiv. Optional sync/async-Validator.

```html
<UidWizard
  :steps="[
    { id: 'profile', title: 'Profil' },
    { id: 'preferences', title: 'Einstellungen' },
    { id: 'review', title: 'Bestätigung' },
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
        <UidButton variant="ghost" :disabled="isFirst" @click="prev">Zurück</UidButton>
        <UidButton @click="next">{{ isLast ? 'Fertig' : 'Weiter' }}</UidButton>
      </template>
    </UidWizardLayout>
  </template>
</UidWizard>
```

Externe Komponenten können sich via `useWizard()` einklinken (z. B. ein eigener Header, der den aktuellen Schritt anzeigt).

## Pagination-Set

Ein einzelnes `UidPagination` mit Varianten deckt nicht alle Fälle ab — die Mechanik unterscheidet sich. Das Kit liefert mehrere Komponenten, jede mit eigenem Zweck.

| Komponente | UI | Wann |
|---|---|---|
| `UidPagination` | `« 1 2 [3] 4 … 10 »` | Gesamtzahl bekannt, direkter Sprung |
| `UidPaginationCursor` | `← Zurück · Weiter →` | Cursor-basierte APIs (Slack, Twitter), unbekannte Gesamtzahl |
| `UidLoadMore` | "Mehr laden"-Button | Feed; Nutzer entscheidet |
| `UidInfiniteScroll` | Sentinel am Ende | Endlos-Feed; Auto-Load beim Scrollen |
| `UidPageSize` | "10 / 25 / 50"-Selector | Ergänzt `UidPagination` |

## Prinzipien

1. **Slots vor Props.** Wenn etwas in einen Slot geht, dort hin. Vermeidet Boolean-Flag-Wälder à la `showLogo`.
2. **Keine Geschäftslogik.** Patterns kennen kein Routing, Auth, API. Router-Link kommt über einen Slot; Navigation via `to`-Prop + `navigate`-Event.
3. **Komposition statt Vererbung.** Layout = `<header-slot> + <content-slot> + <footer-slot>`. Kein "Seitenprotokoll". Etwas Außergewöhnliches? Aus Komponenten bauen.
4. **Theming über dieselben CSS-Variablen.** Patterns/Layouts führen keine neuen semantischen Tokens ein — nur lokale `--uid-header-*`, `--uid-sidebar-*`, `--uid-layout-*` mit Fallback auf Semantik.
5. **Sinnvolles A11y-Gerüst.** `UidSimpleLayout` rendert echtes `<header>`, `<main>`, `<footer>`. `UidSidebarLayout` markiert die Sidebar als `<aside>`. Das ist das Gerüst der Seite — nicht abkürzen.
