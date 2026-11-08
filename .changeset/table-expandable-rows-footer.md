---
"@dskripchenko/ui": minor
---

UidTable: expandable rows and a footer row.

- `v-model:expanded` (`expanded?: Set<string | number>` of ids by `rowKey`, empty by default) with the slot `expanded` (`{ row }`): an expanded row is followed by a `uid-table__row-expansion` row with one full-width `uid-table__td--expansion` cell holding the slot. The row gets `uid-table__row--expanded` and, while the slot is given, `aria-expanded`. The table never expands rows by itself: the host updates the set (on `row-click`, say) or calls the exposed `toggleExpanded(id)`, which emits `update:expanded`. The tint comes from `--uid-table-row-bg-expanded` (the raised surface by default).
- Slots `footer-<column key>`: once any is given, a `<tfoot class="uid-table__foot">` with one `uid-table__foot-row` puts each in its column's `uid-table__td--foot` cell; other columns and the selection column get empty cells. The footer has a top border and semibold text.
