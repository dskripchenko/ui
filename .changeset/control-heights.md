---
"@dskripchenko/ui": minor
---

Form controls of one size share one height, so a select next to an input lines up in a form row. Every control box takes its height from `--uid-size-sm|md|lg` (32/40/48px): UidSelect's trigger was 31/42/50px, the date, date-range and time picker triggers 42px, UidColorPicker 39px, UidTagsInput sm 38px, UidCombobox sm 34px. UidDatePicker, UidDateRangePicker, UidTimePicker, UidTreeSelect, UidCascader and UidColorPicker gain a `size` prop (`sm` | `md` | `lg`, default `md`). A guard spec keeps literal heights out of the control boxes.
