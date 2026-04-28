<script setup lang="ts">
import './UidWatermark.css'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

export interface UidWatermarkProps {
  content?: string | string[]
  font?: string
  color?: string
  rotate?: number
  gap?: [number, number]
  zIndex?: number
}

const props = withDefaults(defineProps<UidWatermarkProps>(), {
  content: '',
  font: '600 16px system-ui, -apple-system, sans-serif',
  color: 'rgba(0, 0, 0, 0.12)',
  rotate: -22,
  gap: () => [120, 120],
  zIndex: 9,
})

defineSlots<{
  default?(): unknown
}>()

const dataUrl = ref('')
const tileSize = ref<[number, number]>([0, 0])

function build(): void {
  if (typeof document === 'undefined') return
  const lines = Array.isArray(props.content) ? props.content : [props.content]
  if (lines.length === 0 || lines.every(s => !s)) {
    dataUrl.value = ''
    return
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

  ctx.font = props.font
  const lineHeight = parseInt(props.font, 10) * 1.4 || 24
  let textWidth = 0
  for (const line of lines) {
    textWidth = Math.max(textWidth, ctx.measureText(line).width)
  }
  const textHeight = lineHeight * lines.length

  const angle = (props.rotate * Math.PI) / 180
  const sin = Math.abs(Math.sin(angle))
  const cos = Math.abs(Math.cos(angle))
  const rotatedW = textWidth * cos + textHeight * sin
  const rotatedH = textWidth * sin + textHeight * cos

  const tileW = rotatedW + props.gap[0]
  const tileH = rotatedH + props.gap[1]
  canvas.width = tileW * dpr
  canvas.height = tileH * dpr
  canvas.style.width = `${tileW}px`
  canvas.style.height = `${tileH}px`

  ctx.scale(dpr, dpr)
  ctx.translate(tileW / 2, tileH / 2)
  ctx.rotate(angle)
  ctx.font = props.font
  ctx.fillStyle = props.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const startY = -((lines.length - 1) * lineHeight) / 2
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, startY + i * lineHeight)
  })

  dataUrl.value = canvas.toDataURL('image/png')
  tileSize.value = [tileW, tileH]
}

const overlayStyle = computed(() => ({
  '--uid-watermark-image': dataUrl.value ? `url(${dataUrl.value})` : 'none',
  '--uid-watermark-size': `${tileSize.value[0]}px ${tileSize.value[1]}px`,
  '--uid-watermark-z': props.zIndex,
}))

watch(
  () => [props.content, props.font, props.color, props.rotate, props.gap],
  () => build(),
  { deep: true },
)

onMounted(() => {
  build()
})

onUnmounted(() => {
  dataUrl.value = ''
})
</script>

<template>
  <div class="uid-watermark">
    <div
      class="uid-watermark__overlay"
      :style="overlayStyle"
      aria-hidden="true"
    />
    <div class="uid-watermark__content">
      <slot />
    </div>
  </div>
</template>
