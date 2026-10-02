---
"@dskripchenko/ui": patch
---

- `UidDateRangePicker` no longer crashes on a `null` or `undefined` v-model (a form field with no value yet): it reads as an empty range. Clearing still emits `{ start: null, end: null }`.
- Control text follows the control's size like `UidInput` (sm 14px, md 16px, lg 18px) in UidSelect, UidCombobox, UidTagsInput, the date, date-range and time pickers, UidTreeSelect, UidCascader and UidColorPicker. TreeSelect and Cascader stayed 16px at sm, the lg sizes stayed 16px, and UidColorPicker was 14px at every size.
