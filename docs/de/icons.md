# Icons

Das Kit liefert eine umfangreiche Ikonographie — ~1500 [Lucide](https://lucide.dev/)-Icons sofort einsatzbereit, ohne zusätzliche Installation. Darüber liegt der dünne Wrapper `UidIcon` für ein einheitliches API für Größe, Farbe, Theming und A11y.

## Ansatz

- **Quelle** — `lucide-vue-next` (MIT). Wird automatisch als reguläre `dependency` installiert.
- **Kein eigenes Set.** ~1500 SVGs aktuell zu halten ist überflüssiger Aufwand.
- **Kein Bundling.** Alle Icons sind tree-shakable: Was du nicht importierst, landet nicht im Bundle.
- **Keine CSS-Klassen.** Icons sind Vue-Komponenten, kein Sprite oder Webfont. Inline-SVGs im DOM mit vollem Tree-Shaking.

## Zwei Wege

Das Kit unterstützt zwei Pfade. Sie ergänzen sich — wähle nach Aufgabe.

### A. Static Import (Hauptweg)

Standard. Icon als Vue-Komponente importieren und an `<UidIcon :icon>` übergeben. Der Bundler sieht eine explizite Abhängigkeit — nur verwendete Icons landen im Bundle.

```vue
<script setup lang="ts">
import { UidIcon, UidButton } from '@dskripchenko/ui'
import { Check, X, ChevronRight } from 'lucide-vue-next'
</script>

<template>
  <UidIcon :icon="Check" />
  <UidIcon :icon="X" size="sm" />

  <UidButton variant="primary">
    <UidIcon :icon="ChevronRight" /> Weiter
  </UidButton>
</template>
```

Äquivalenter Import über das Kit (gleiches Set, einheitlicher Namespace):

```ts
import { Check, X, ChevronRight } from '@dskripchenko/ui/icons'
```

`@dskripchenko/ui/icons` ist ein Sub-Export, der einfach alles aus `lucide-vue-next` re-exportiert.

### B. Dynamisches Register

Wenn der Icon-Name aus Daten kommt (Menü-Konfig, DB-Spalte, externer Prop) — der Compiler sieht keine konkrete Komponente. Registriere die nötigen Icons einmal und greife per String-Name darauf zu.

```ts
// app-bootstrap.ts (einmal beim Start)
import { registerIcons } from '@dskripchenko/ui'
import { Check, X, Home, Settings, User, Bell } from 'lucide-vue-next'

registerIcons({
  check: Check,
  close: X,
  home: Home,
  settings: Settings,
  user: User,
  bell: Bell,
})
```

```vue
<script setup lang="ts">
import { UidIcon } from '@dskripchenko/ui'

const menu = [
  { label: 'Startseite', icon: 'home' },
  { label: 'Profil', icon: 'user' },
  { label: 'Einstellungen', icon: 'settings' },
]
</script>

<template>
  <ul>
    <li v-for="item in menu" :key="item.label">
      <UidIcon :name="item.icon" /> {{ item.label }}
    </li>
  </ul>
</template>
```

Wenn das Register kein Icon mit dem Namen kennt — `console.warn` im Dev-Modus, im Prod nichts gerendert. **Das dynamische Register ist ein bewusster Trade-off:** du listest explizit, welche Icons per Name kommen können. So bleibt Tree-Shaking erhalten — nicht Registriertes landet nicht im Bundle.

### Wann was

| Szenario | Methode |
|---|---|
| Icon ist beim Schreiben des Templates bekannt | **A** |
| Innerhalb von Kit-Komponenten (Button-Slot, Input-Prefix) | **A** |
| Icon-Name kommt aus Daten (Menü, Konfig, props.iconName) | **B** |
| 90 % der Fälle | **A** |

## `UidIcon` — Komponente

### Props

| Name | Typ | Default | Beschreibung |
|---|---|---|---|
| `icon` | `Component` | — | Lucide-Komponente. Methode A. |
| `name` | `string` | — | Name aus dem Register. Methode B. |
| `size` | `UidIconSize` | `'md'` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` oder Zahl (px) |
| `strokeWidth` | `number \| string` | `2` | Lucide-Linienstärke (1–3 sinnvoll) |
| `color` | `string` | `'currentColor'` | Farbe überschreiben (meist unnötig — erbt vom Text) |
| `title` | `string` | — | Macht das Icon "sprechend": `role="img" + aria-label`. Ohne Title ist es dekorativ (`aria-hidden`). |
| `spin` | `boolean` | `false` | Endlose Rotation (Loader) |

### Größen

| Größe | Default |
|---|---|
| `xs` | 12 px |
| `sm` | 16 px |
| `md` | 20 px |
| `lg` | 24 px |
| `xl` | 32 px |
| Zahl | `${value}px` |

Wenn das Icon mit dem Text mitskalieren soll — kein `size` setzen. Standardmäßig ist es `1em` und folgt der `font-size` des Elternelements:

```html
<UidButton size="sm">  <!-- font-size: 14px -->
  <UidIcon :icon="Check" /> <!-- Icon ebenfalls 14px -->
  Speichern
</UidButton>
```

## Farben und Theming

Das Icon erbt die `color` des Elternelements via `currentColor`. In `<UidButton variant="primary">` wird es automatisch weiß; in `<UidButton variant="ghost">` text-farben.

Punktuelle Überschreibung:

```html
<UidIcon :icon="AlertTriangle" style="--uid-icon-color: var(--uid-warning)" />
<UidIcon :icon="AlertTriangle" color="var(--uid-warning)" />
```

Im Dark-Theme werden Icons automatisch hell, weil `--uid-text-primary` in `themes.css` umschaltet. Keine Logik im Icon nötig.

## Barrierefreiheit

Icons sind zweierlei — das Kit unterscheidet das explizit über `title`.

### Dekorativ (ohne Title)

Das Icon dupliziert die Bedeutung des umgebenden Texts. Für den Screenreader Lärm.

```html
<UidButton>
  <UidIcon :icon="Save" />  <!-- aria-hidden="true", Screenreader überspringt -->
  Speichern
</UidButton>
<!-- angekündigt als "Speichern, Schaltfläche" -->
```

### Sprechend (mit Title)

Das Icon trägt allein die Bedeutung (icon-only Button). Dann ist `title` Pflicht.

```html
<UidButton variant="ghost" aria-label="Schließen">
  <UidIcon :icon="X" title="Schließen" />
</UidButton>
```

In `UidIcon` wird das zu:

```html
<svg role="img" aria-label="Schließen"> ... </svg>
```

Wenn das Icon der einzige Inhalt eines klickbaren Elements ist, dupliziere `aria-label` zusätzlich am Button (wie oben) — bessere Kompatibilität mit älteren Screenreadern.

### Faustregel

- Icon neben Text → ohne `title` (dekorativ).
- Icon allein → mit `title` oder `aria-label` am Eltern-Button.

## Loading-Zustand (spin)

```html
<UidIcon :icon="Loader" spin />
<UidIcon :icon="RefreshCw" spin size="sm" />
```

CSS-Animation, kein JS. Geschwindigkeit über `--uid-icon-spin-duration` (Default `1s`).

## Eigene Icons

Manchmal brauchst du ein Icon, das Lucide nicht hat (Logo, projektspezifisch). Eine einfache Vue-Komponente, die SVG rendert, funktioniert genauso wie Lucide.

```vue
<!-- src/icons/MyLogo.vue in deiner App -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="..." />
  </svg>
</template>
```

```vue
<script setup lang="ts">
import { UidIcon } from '@dskripchenko/ui'
import MyLogo from './icons/MyLogo.vue'
</script>

<template>
  <UidIcon :icon="MyLogo" size="lg" />
</template>
```

Wichtig: SVG mit `fill="none" stroke="currentColor"` (oder `fill="currentColor"`), sonst übernimmt das Icon nicht die Elternfarbe und folgt dem Theme nicht.

## Anti-Patterns

- ❌ Größen im SVG hardcodieren (`width="24"`). `UidIcon` steuert width/height per CSS — hardcodierte Attribute brechen den `size`-Prop.
- ❌ Farben im SVG hardcodieren (`fill="#000"`). Verwende `currentColor`.
- ❌ Icon-only ohne `title`/`aria-label`. Screenreader verpasst die Bedeutung.
- ❌ `import * as icons from 'lucide-vue-next'` — killt Tree-Shaking. Nur Benötigtes importieren.
- ❌ Alle 1500 Icons "vorsichtshalber" registrieren. Nur wirklich per Name benötigte registrieren.
- ❌ `UidIcon name="..."` für statisch bekannte Icons. `:icon=` ist typsicherer und tree-shakable.
