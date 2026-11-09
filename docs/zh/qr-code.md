# 二维码

`UidQrCode` 用一个 SVG 绘制二维码。编码器内置于组件库（无依赖），遵循 ISO/IEC 18004：数字、字母数字和字节模式（文本按 UTF-8 编码），版本 1–40，纠错等级 L、M、Q、H，并选用惩罚分最低的掩模。会选用在所选等级下能容纳文本的最小版本；`value` 每次变化都会重新计算。

```vue
<script setup lang="ts">
import { UidQrCode } from '@dskripchenko/ui'

const uri = 'otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example'
</script>

<template>
  <UidQrCode :value="uri" label="用身份验证器应用扫描" />
</template>
```

## Props

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `value` | `string` | — | 要编码的文本：URL、`otpauth://` URI 或任意字符串。 |
| `size` | `number` | `176` | 宽和高，单位 px。 |
| `errorCorrection` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | 二维码受损多少仍可读取：约 7 %、15 %、25 % 和 30 %。等级越高，同样的文本需要的版本越大。 |
| `margin` | `number` | `4` | 二维码四周的静区，单位为模块。标准要求为 4；只有当二维码本身已位于大片浅色区域上时才可减小。 |
| `label` | `string` | 语言包 `label` | 无障碍名称（`role="img"` + `aria-label`）。 |

## 事件

| 事件 | 载荷 | |
|---|---|---|
| `error` | `Error` | 在该等级下，值无法放入版本 40 的二维码。此时组件只显示浅色方块。 |

最大二维码的字节容量：L 为 2953 字节，M 为 2331，Q 为 1663，H 为 1273。在 UTF-8 中，西里尔字母每个占两个字节，中日韩字符占三个。

## 渲染

SVG 中有一个 `<rect>` 作为背景（含静区），一个 `<path>` 包含所有深色模块，并使用 `shape-rendering="crispEdges"`，因此在任何尺寸下都清晰，并可通过 `max-width: 100%` 缩小。为了可靠扫描，每个模块至少应有 2–3 px：版本 7 的二维码（45 个模块加静区）在默认的 176 px 下即可顺利读取。

## 样式

| 变量 | 默认值 | |
|---|---|---|
| `--uid-qr-code-dark` | `--uid-color-zinc-950` | 深色模块。 |
| `--uid-qr-code-light` | `--uid-color-white` | 背景与静区。 |

在深色主题下两者保持不变：扫描器需要浅色背景上的深色模块，很多扫描器无法读取反色二维码。如需修改，请保持强对比度，并让模块使用深色。

## 编码器

编码器也单独导出，可在组件之外使用——服务器端、canvas、测试中。

```ts
import { encodeQr } from '@dskripchenko/ui'

const { version, size, modules, mask } = encodeQr('https://example.com/', { errorCorrection: 'Q' })
// modules[row][column] 为 true 表示深色模块；不包含静区。
```

| 选项 | 类型 | 默认值 | |
|---|---|---|---|
| `errorCorrection` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | 纠错等级。 |
| `minVersion` | `number` | `1` | 使用的最小版本，1–40。 |
| `mask` | `number` | — | 强制使用掩模 0–7，而不是惩罚分最低的掩模。 |

结果为 `QrCode`：`version`、`size`（17 + 4 × 版本）、`modules`、`errorCorrection` 和 `mask`。如果文本在该等级下无法放入版本 40，`encodeQr` 会抛出 `RangeError`，并说明字节数或字符数。

类型：`UidQrCodeProps`、`QrCode`、`QrEncodeOptions`、`QrErrorCorrection`。

## 文本

默认标签来自语言包的 `qrCode` 部分（参见 [i18n](./i18n.md)）：`label`。
