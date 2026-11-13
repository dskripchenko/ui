---
'@dskripchenko/ui': minor
---

`trackFocusModality()`: the keyboard focus ring no longer flashes on a clicked element when a modifier key (Shift, Cmd) is pressed — while the last input was a pointer the ring colour is transparent. `UidAvatar` gets `seed` (a stable id picks the fill), a stronger hash (FNV-1a), and fuchsia in place of teal in the palette, so avatars stop reading as all green next to a teal accent.
