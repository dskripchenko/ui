---
'@dskripchenko/ui': minor
---

UidQrCode: a QR code drawn as one SVG (`role="img"`, one `<path>` for the dark modules, `shape-rendering="crispEdges"`) from `value`, with `size`, `errorCorrection` (L, M, Q, H; default M), `margin` (quiet zone, default 4 modules) and `label`. Dark modules on a white ground in both themes, set by `--uid-qr-code-dark` and `--uid-qr-code-light`; an `error` event when the value does not fit version 40. The encoder is the library's own, after ISO/IEC 18004: numeric, alphanumeric and UTF-8 byte modes, versions 1–40, Reed–Solomon error correction with block interleaving, all eight masks scored by the standard penalty rules. No dependencies. Also exports `encodeQr` (with the `QrCode`, `QrEncodeOptions`, `QrErrorCorrection` types) and the `qrCode` locale strings (en, ru).
