---
'@dskripchenko/ui': minor
---

feat(heatmap): `UidHeatmapMatrix` — a rows × columns matrix heatmap

The calendar `UidHeatmap` computes dates itself, so it cannot show an arbitrary matrix with axis labels. `UidHeatmapMatrix` draws exactly the matrix it is given:

- `rows`, `cols` and `values[row][col]` (`number | null`); `null` or a missing cell is an empty outlined "no data" cell, distinct from `0`;
- every column is labelled; labels that do not fit are rotated 45° and thinned (`colLabels: 'auto' | 'horizontal' | 'rotated'`);
- `colorScale`: `default` (the theme accent), `viridis`, `magma`, `plasma`, `inferno`, `blues`, `greens`, `reds`, a single CSS colour, or custom stops (`string[]`); `min` / `max` fix the domain;
- a "row × column: value" tooltip (`formatValue`, or the `#tooltip` slot), a min → max legend with a "no data" key;
- `role="grid"` semantics with row/column headers, per-cell `aria-label`s and arrow-key navigation; cells stretch to the container and scroll below `minCellWidth`.

Also exported: `heatmapColorScales`, `resolveHeatmapStops`, `heatmapColorAt`. Locale bags gain `heatmap.matrixSummary` and `heatmap.noData`. `UidHeatmap` is unchanged.
