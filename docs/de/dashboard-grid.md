# Dashboard-Raster

`UidDashboardGrid` ordnet Elemente in einem Raster aus Spalten und Zeilen an — wie Widgets auf einem Dashboard. Ein Element steht in Spalte `x` und Zeile `y` (beide ab 0) und belegt `w` Spalten und `h` Zeilen; die Höhe des Rasters folgt dem untersten Element. Im Bearbeitungsmodus werden Elemente an einem Griff gezogen, den der Host rendert, über eine Ecke in der Größe geändert, die das Raster selbst rendert, und per Tastatur verschoben oder skaliert. Das Raster hält keine eigene Kopie des Layouts: Nach jeder abgeschlossenen Geste gibt es ein neues Array von Elementen aus (`v-model:items`), und der Host speichert es.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidDashboardGrid, type DashboardGridItem } from '@dskripchenko/ui'

type Widget = DashboardGridItem & { title: string }

const editing = ref(false)
const items = ref<Widget[]>([
  { id: 'revenue', title: 'Umsatz', x: 0, y: 0, w: 4, h: 2, minW: 2 },
  { id: 'orders', title: 'Bestellungen', x: 4, y: 0, w: 4, h: 2 },
  { id: 'traffic', title: 'Traffic', x: 8, y: 0, w: 4, h: 4, minH: 2 },
  { id: 'notes', title: 'Notizen', x: 0, y: 2, w: 8, h: 2, maxH: 3 },
])

function save(layout: DashboardGridItem[]): void {
  // Positionen speichern: ein Aufruf pro abgeschlossenem Ziehen, Skalieren oder Tastendruck
}
</script>

<template>
  <UidDashboardGrid
    v-model:items="items"
    :editable="editing"
    :item-label="(item) => (item as Widget).title"
    label="Shop-Übersicht"
    @change="save"
  >
    <template #item="{ item, editing: canEdit, handle }">
      <section class="widget">
        <header>
          <button v-if="canEdit" type="button" v-bind="handle">⠿</button>
          <h3>{{ (item as Widget).title }}</h3>
        </header>
        …
      </section>
    </template>
  </UidDashboardGrid>
</template>
```

## Elemente

| Feld | Typ | |
|---|---|---|
| `id` | `string \| number` | Die ID des Elements. |
| `x`, `y` | `number` | Spalte und Zeile, ab 0. |
| `w`, `h` | `number` | Breite in Spalten und Höhe in Zeilen. |
| `minW`, `minH`, `maxW`, `maxH` | `number` | Größengrenzen in Zellen. Die Breite übersteigt nie `columns`. |

Elemente dürfen beliebige weitere Felder tragen: Das ausgegebene Array enthält die Objekte des Hosts mit neuen `x`, `y`, `w`, `h`, alles andere bleibt erhalten.

## Bearbeiten

Mit `editable` bindet der Host `handle` an sein eigenes Griff-Element — meist ein Button in der Kopfzeile des Elements. Drücken und Bewegen des Zeigers (Maus, Stift oder Touch) hebt das Element an: Es folgt dem Zeiger leicht erhöht, ein gestrichelter Platzhalter „Drop here · 4 × 2" zeigt die eingerastete Zelle, und die anderen Elemente machen Platz. Loslassen legt es ab; Escape während des Ziehens bricht ab und stellt das Layout wieder her. Die Ecke unten rechts an jedem Element ändert seine Größe auf dieselbe Weise.

Layout-Regeln:

- Positionen und Größen rasten auf ganze Zellen ein und werden auf die Spalten und `minW`…`maxH` begrenzt;
- ein auf andere abgelegtes Element schiebt diese nach unten; ein Element, das an einem anderen vorbei nach unten gezogen wird, tauscht mit ihm den Platz;
- danach wird das Layout vertikal verdichtet: Jedes Element steigt so weit wie möglich nach oben, in Lesereihenfolge (nach Zeile, dann nach Spalte). Das Ergebnis ist deterministisch und überlappt nie.

`update:items` und `change` feuern einmal pro abgeschlossener Geste, mit demselben neuen Array, und nur, wenn sich etwas bewegt hat.

Ohne `editable` ist das Layout statisch: `handle` ist ein leeres Objekt, es gibt keine Ecken, nichts ist ziehbar.

## Tastatur

Griff und Ecke sind fokussierbare Buttons.

| Tasten | Auf dem Griff | Auf der Ecke |
|---|---|---|
| ←, →, ↑, ↓ | Um eine Zelle verschieben | Breite oder Höhe um eins ändern |
| Shift + Pfeile | Breite oder Höhe um eins ändern | — |
| Escape | Laufendes Ziehen mit dem Zeiger abbrechen | Laufendes Skalieren abbrechen |

Ein Schritt nach unten, den die Schwerkraft rückgängig machen würde, bewegt das Element stattdessen am unteren Nachbarn vorbei. Der Fokus bleibt nach einer Verschiebung auf dem Griff. Jede Änderung wird über eine unsichtbare Live-Region angesagt („Umsatz moved to column 5, row 1"); die Beschriftung des Griffs enthält Position und Größe, ein verborgener Hinweis erklärt die Tasten.

## Schmale Container

Ist das Raster selbst schmaler als `stackBelow` (standardmäßig 640 px; gemessen mit einem `ResizeObserver`), stapeln sich die Elemente in einer Spalte in Lesereihenfolge, jedes `h × rowHeight` hoch, und die Bearbeitung ist aus (`editing` im Slot ist `false`, `handle` leer).

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `items` | `DashboardGridItem[]` | — | Das Layout; mit `v-model:items`. |
| `columns` | `number` | `12` | Anzahl der Spalten. |
| `rowHeight` | `number` | `80` | Höhe einer Zeile, px. |
| `gap` | `number` | `16` | Abstand zwischen Zellen, px. |
| `editable` | `boolean` | `false` | Elemente lassen sich verschieben und skalieren. |
| `stackBelow` | `number` | `640` | Containerbreite in px, unter der die Elemente einspaltig gestapelt werden. |
| `label` | `string` | `label` der Locale | Der zugängliche Name des Rasters. |
| `itemLabel` | `(item) => string` | „Item 3" | Name eines Elements in den Beschriftungen von Griff und Ecke und in Ansagen. |

## Events

| Event | Payload | |
|---|---|---|
| `update:items` | `DashboardGridItem[]` | Ein neues Array nach Ablegen, Skalieren oder Tastendruck. |
| `change` | `DashboardGridItem[]` | Dasselbe Array; einmal pro abgeschlossener Geste. |

## Slots

| Slot | Props | |
|---|---|---|
| `item` | `{ item, editing, dragging, handle }` | Inhalt einer Zelle. `editing` — das Raster ist bearbeitbar und nicht gestapelt; `dragging` — dieses Element wird gerade gezogen oder skaliert; `handle` — `DashboardGridHandleBindings` zum `v-bind` auf den Griff. |
| `placeholder` | `{ w, h }` | Der Text im Ablage-Platzhalter. |

`handle` enthält `onPointerdown`, `onKeydown`, `tabindex: 0`, `role: 'button'`, `aria-roledescription`, `aria-label`, `aria-describedby`, `aria-keyshortcuts` und `data-uid-grid-handle`. Das Raster gibt dem Griff `cursor: grab` und `touch-action: none`.

Typen: `UidDashboardGridProps`, `DashboardGridItem`, `DashboardGridHandleBindings`, `DashboardGridItemSlotProps`.

## Layout-Funktionen

Die obigen Regeln sind reine Funktionen und werden für Server oder Tests exportiert. Jede gibt neue Objekte in der Reihenfolge der Eingabe zurück und behält zusätzliche Felder.

| Funktion | |
|---|---|
| `collides(a, b)` | Ob sich zwei Elemente überlappen (nie mit sich selbst). |
| `clampItem(item, columns)` | Rastet ein Element auf ganze Zellen, seine Grenzen und die Spalten ein. |
| `compactLayout(items, columns)` | Vertikale Verdichtung, löst Überlappungen auf. |
| `moveItem(items, id, x, y, columns)` | Verschiebt ein Element, löst Kollisionen und verdichtet. |
| `resizeItem(items, id, w, h, columns)` | Skaliert ein Element, schiebt Verdecktes und verdichtet. |
| `layoutHeight(items)` | Wie viele Zeilen das Layout belegt. |
| `sortByPosition(items)` | Die Elemente in Lesereihenfolge. |
| `sameLayout(a, b)` | Ob zwei Layouts jedes Element auf dieselben Zellen setzen. |

## Gestaltung

Die Hülle eines Elements hat kein eigenes Aussehen — die Karte zeichnet der Inhalt des Hosts. Variablen: `--uid-dashboard-grid-placeholder-bg` und `--uid-dashboard-grid-placeholder-border` (standardmäßig der Akzent). Übergänge folgen `--uid-duration-base` und sind bei `prefers-reduced-motion` aus. Helles und dunkles Theme kommen aus den Theme-Tokens.

## Texte

Beschriftungen stammen aus dem Locale-Bündel, Abschnitt `dashboardGrid` (siehe [i18n](./i18n.md)): `label`, `item(n)`, `handleRole`, `handle(title, x, y, w, h)`, `resize(title, w, h)`, `hint`, `dropHere(w, h)`, `moved(title, x, y)`, `resized(title, w, h)`, `cancelled(title)`. Spalten und Zeilen zählen in den Texten ab 1.
