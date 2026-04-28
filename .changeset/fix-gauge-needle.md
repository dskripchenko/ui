---
"@dskripchenko/ui": patch
---

`UidGauge`: исправлено позиционирование стрелки (`showNeedle`). Из-за `transform-box: fill-box` SVG-атрибут `rotate(angle x y)` работал относительно bounding-box линии, а не центра гейджа — стрелка визуализировалась маленькой точкой или линией не из центра.
