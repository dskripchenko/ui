---
"@dskripchenko/ui": patch
---

UidVideo: no dark hairline around the rounded corners over light video (the player clips its whole subtree with `clip-path`; the letterbox is painted by the media element in `--uid-video-bg`, centred with `object-fit: contain`), the focus ring is drawn inset. The control bar follows the player's own width (ResizeObserver): under 440 px subtitles and picture-in-picture fold into the settings menu, under 360 px the time shows only the position; play, settings and full screen always stay inside the player. HLS quality menu: the current level is a muted hint of "Auto" ("Auto · 720p"), and levels with the same label are told apart by bitrate.
