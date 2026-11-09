# QR code

`UidQrCode` draws a QR code as a single SVG. The encoder is part of the library (no dependencies) and follows ISO/IEC 18004: numeric, alphanumeric and byte modes (text is UTF-8), versions 1–40, error correction levels L, M, Q and H, and the mask with the lowest penalty. The smallest version that fits the text at the chosen level is used; the code is recomputed whenever `value` changes.

```vue
<script setup lang="ts">
import { UidQrCode } from '@dskripchenko/ui'

const uri = 'otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example'
</script>

<template>
  <UidQrCode :value="uri" label="Scan with an authenticator app" />
</template>
```

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `value` | `string` | — | The text to encode: a URL, an `otpauth://` URI, any string. |
| `size` | `number` | `176` | Width and height, px. |
| `errorCorrection` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | How much of the code may be damaged and still read: about 7 %, 15 %, 25 % and 30 %. Higher levels need a larger version for the same text. |
| `margin` | `number` | `4` | The quiet zone around the code, in modules. Four is what the standard asks for; keep it unless the code already sits on a wide light area. |
| `label` | `string` | locale `label` | The accessible name (`role="img"` + `aria-label`). |

## Events

| Event | Payload | |
|---|---|---|
| `error` | `Error` | The value does not fit a version 40 code at this level. The component then shows only the light square. |

Byte capacity of the largest code: 2953 bytes at L, 2331 at M, 1663 at Q, 1273 at H. Cyrillic letters take two bytes each in UTF-8, CJK characters three.

## Rendering

The SVG holds one `<rect>` for the background (quiet zone included) and one `<path>` with every dark module, drawn with `shape-rendering="crispEdges"`, so the code stays sharp at any size and scales down with `max-width: 100%`. For reliable scanning give each module at least 2–3 px: a version 7 code (45 modules plus the quiet zone) reads well at the default 176 px.

## Styling

| Variable | Default | |
|---|---|---|
| `--uid-qr-code-dark` | `--uid-color-zinc-950` | Dark modules. |
| `--uid-qr-code-light` | `--uid-color-white` | Background and quiet zone. |

Both stay the same in the dark theme: scanners need dark modules on a light ground, and many cannot read an inverted code. If you change them, keep a strong contrast and the dark colour on the modules.

## Encoder

The encoder is exported for use outside the component — on a server, in a canvas, in tests.

```ts
import { encodeQr } from '@dskripchenko/ui'

const { version, size, modules, mask } = encodeQr('https://example.com/', { errorCorrection: 'Q' })
// modules[row][column] is true for a dark module; no quiet zone is included.
```

| Option | Type | Default | |
|---|---|---|---|
| `errorCorrection` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | Error correction level. |
| `minVersion` | `number` | `1` | The smallest version to use, 1–40. |
| `mask` | `number` | — | Force a mask pattern 0–7 instead of the one with the lowest penalty. |

The result is a `QrCode`: `version`, `size` (17 + 4 × version), `modules`, `errorCorrection` and `mask`. When the text does not fit version 40 at the level, `encodeQr` throws a `RangeError` that says how many bytes or characters it got.

Types: `UidQrCodeProps`, `QrCode`, `QrEncodeOptions`, `QrErrorCorrection`.

## Texts

The default label comes from the locale bag, section `qrCode` (see [i18n](./i18n.md)): `label`.
