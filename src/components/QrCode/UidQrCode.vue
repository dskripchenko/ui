<script setup lang="ts">
import './UidQrCode.css'
import { computed, watch } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import { encodeQr, type QrCode, type QrErrorCorrection } from './qrEncode.js'

export interface UidQrCodeProps {
  /** The text to encode: a URL, an otpauth:// URI, any UTF-8 string. */
  value: string
  /** Width and height in px. Default 176. */
  size?: number
  /** Error correction level. Default 'M'. */
  errorCorrection?: QrErrorCorrection
  /** Quiet zone around the code, in modules. Default 4, the minimum scanners expect. */
  margin?: number
  /** Accessible name. Default from the locale: "QR code". */
  label?: string
}

const props = withDefaults(defineProps<UidQrCodeProps>(), {
  size: 176,
  errorCorrection: 'M',
  margin: 4,
  label: undefined,
})

const emit = defineEmits<{
  /** The value does not fit a version 40 code at this level; the code renders empty. */
  error: [error: Error]
}>()

const locale = useLocale()

const encoded = computed<{ code: QrCode | null; error: Error | null }>(() => {
  try {
    return { code: encodeQr(props.value, { errorCorrection: props.errorCorrection }), error: null }
  } catch (e) {
    return { code: null, error: e instanceof Error ? e : new Error(String(e)) }
  }
})

watch(() => encoded.value.error, (error) => {
  if (error) emit('error', error)
}, { immediate: true })

const quiet = computed(() => Math.max(0, Math.floor(props.margin)))
const extent = computed(() => (encoded.value.code?.size ?? 21) + quiet.value * 2)

/** One path for every dark module: horizontal runs, each a 1-module-high rectangle. */
const path = computed(() => {
  const code = encoded.value.code
  if (!code) return ''
  const q = quiet.value
  let d = ''
  code.modules.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (!row[x]) {
        x++
        continue
      }
      const start = x
      while (x < row.length && row[x]) x++
      d += `M${start + q} ${y + q}h${x - start}v1h-${x - start}z`
    }
  })
  return d
})

const accessibleName = computed(() => props.label ?? locale.value.qrCode.label)
</script>

<template>
  <svg
    class="uid-qr-code"
    role="img"
    :aria-label="accessibleName"
    :width="size"
    :height="size"
    :viewBox="`0 0 ${extent} ${extent}`"
    shape-rendering="crispEdges"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      class="uid-qr-code__background"
      :width="extent"
      :height="extent"
    />
    <path
      v-if="path"
      class="uid-qr-code__modules"
      :d="path"
    />
  </svg>
</template>
