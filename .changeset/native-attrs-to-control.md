---
'@dskripchenko/ui': minor
---

fix(fields): forward native attributes to the control instead of the wrapper

`UidInput`, `UidTextarea`, `UidNumberInput`, `UidCheckbox`, `UidSwitch`, `UidRadio`, `UidSlider`, `UidTagsInput`, `UidCombobox`, `UidMention` and `UidPageSize` now use `inheritAttrs: false`. `class` and `style` stay on the root element; every other unknown attribute (`list`, `maxlength`, `minlength`, `pattern`, `inputmode`, `autocomplete`, `name`, `spellcheck`, `data-*`, `aria-*`) and fallthrough listener (`onInput`, `onClick`, ...) now lands on the native `<input>`/`<textarea>`/`<select>`, so they actually take effect. `UidNumberInput` keeps `inputmode="decimal"` as a default that can be overridden.

Fallthrough listeners (e.g. `@click`) now bind to the native control rather than the root, so they no longer fire on clicks on the label or hint.
