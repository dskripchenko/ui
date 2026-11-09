# QR-Code

`UidQrCode` zeichnet einen QR-Code als ein einziges SVG. Der Encoder gehört zur Bibliothek (ohne Abhängigkeiten) und folgt ISO/IEC 18004: numerischer, alphanumerischer und Byte-Modus (Text in UTF-8), Versionen 1–40, Fehlerkorrekturstufen L, M, Q und H und die Maske mit der niedrigsten Strafwertung. Verwendet wird die kleinste Version, in die der Text auf der gewählten Stufe passt; bei jeder Änderung von `value` wird der Code neu berechnet.

```vue
<script setup lang="ts">
import { UidQrCode } from '@dskripchenko/ui'

const uri = 'otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example'
</script>

<template>
  <UidQrCode :value="uri" label="Mit einer Authenticator-App scannen" />
</template>
```

## Props

| Prop | Typ | Standard | |
|---|---|---|---|
| `value` | `string` | — | Der zu kodierende Text: eine URL, eine `otpauth://`-URI, jede Zeichenkette. |
| `size` | `number` | `176` | Breite und Höhe in px. |
| `errorCorrection` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | Wie viel des Codes beschädigt sein darf und er trotzdem lesbar bleibt: etwa 7 %, 15 %, 25 % und 30 %. Höhere Stufen brauchen für denselben Text eine größere Version. |
| `margin` | `number` | `4` | Die Ruhezone um den Code, in Modulen. Der Standard verlangt vier; weniger nur, wenn der Code ohnehin auf einer breiten hellen Fläche steht. |
| `label` | `string` | Locale `label` | Der zugängliche Name (`role="img"` + `aria-label`). |

## Events

| Event | Nutzlast | |
|---|---|---|
| `error` | `Error` | Der Wert passt auf dieser Stufe nicht in einen Code der Version 40. Die Komponente zeigt dann nur das helle Quadrat. |

Byte-Kapazität des größten Codes: 2953 Bytes bei L, 2331 bei M, 1663 bei Q, 1273 bei H. Kyrillische Buchstaben belegen in UTF-8 je zwei Bytes, CJK-Zeichen drei.

## Darstellung

Das SVG enthält ein `<rect>` für den Hintergrund (samt Ruhezone) und einen `<path>` mit allen dunklen Modulen, gezeichnet mit `shape-rendering="crispEdges"`. So bleibt der Code in jeder Größe scharf und schrumpft mit `max-width: 100%`. Für zuverlässiges Scannen sollte jedes Modul mindestens 2–3 px groß sein: ein Code der Version 7 (45 Module plus Ruhezone) liest sich bei den standardmäßigen 176 px gut.

## Gestaltung

| Variable | Standard | |
|---|---|---|
| `--uid-qr-code-dark` | `--uid-color-zinc-950` | Dunkle Module. |
| `--uid-qr-code-light` | `--uid-color-white` | Hintergrund und Ruhezone. |

Beide bleiben im dunklen Theme gleich: Scanner brauchen dunkle Module auf hellem Grund, und viele können einen invertierten Code nicht lesen. Wer sie ändert, sollte starken Kontrast und die dunkle Farbe auf den Modulen beibehalten.

## Encoder

Der Encoder wird auch für die Nutzung ohne Komponente exportiert — auf dem Server, in einem Canvas, in Tests.

```ts
import { encodeQr } from '@dskripchenko/ui'

const { version, size, modules, mask } = encodeQr('https://example.com/', { errorCorrection: 'Q' })
// modules[row][column] ist true für ein dunkles Modul; die Ruhezone ist nicht enthalten.
```

| Option | Typ | Standard | |
|---|---|---|---|
| `errorCorrection` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | Fehlerkorrekturstufe. |
| `minVersion` | `number` | `1` | Die kleinste zu verwendende Version, 1–40. |
| `mask` | `number` | — | Erzwingt ein Maskenmuster 0–7 statt der Maske mit der niedrigsten Wertung. |

Das Ergebnis ist ein `QrCode`: `version`, `size` (17 + 4 × Version), `modules`, `errorCorrection` und `mask`. Passt der Text auf dieser Stufe nicht in Version 40, wirft `encodeQr` einen `RangeError` mit der Anzahl der Bytes oder Zeichen.

Typen: `UidQrCodeProps`, `QrCode`, `QrEncodeOptions`, `QrErrorCorrection`.

## Texte

Die Standardbeschriftung stammt aus dem Locale-Bündel, Abschnitt `qrCode` (siehe [i18n](./i18n.md)): `label`.
