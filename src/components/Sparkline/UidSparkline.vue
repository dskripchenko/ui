<script setup lang="ts">
import './UidSparkline.css'
import { computed } from 'vue'

export type SparklineType = 'line' | 'area' | 'bar'

export interface UidSparklineProps {
  data: number[]
  type?: SparklineType
  width?: number
  height?: number
  color?: string
  smooth?: boolean
  showDots?: boolean
  showLast?: boolean
  showZero?: boolean
  strokeWidth?: number
  ariaLabel?: string
}

const props = withDefaults(defineProps<UidSparklineProps>(), {
  type: 'line',
  width: 120,
  height: 32,
  smooth: false,
  showDots: false,
  showLast: false,
  showZero: false,
  strokeWidth: 1.5,
})

const padding = 2

const range = computed(() => {
  if (props.data.length === 0) return { min: 0, max: 1 }
  const min = Math.min(...props.data, 0)
  const max = Math.max(...props.data, 0)
  if (min === max) return { min: min - 1, max: max + 1 }
  return { min, max }
})

function xCoord(i: number, count: number): number {
  if (count <= 1) return props.width / 2
  return padding + (i / (count - 1)) * (props.width - padding * 2)
}

function yCoord(v: number): number {
  const r = range.value
  const norm = (v - r.min) / (r.max - r.min)
  return props.height - padding - norm * (props.height - padding * 2)
}

const points = computed(() => {
  return props.data.map((v, i) => ({ x: xCoord(i, props.data.length), y: yCoord(v), v }))
})

const linePath = computed(() => {
  const pts = points.value
  if (pts.length === 0) return ''
  if (!props.smooth || pts.length < 3) {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  }
  const segments: string[] = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`]
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpX = (prev.x + curr.x) / 2
    segments.push(`C ${cpX.toFixed(2)} ${prev.y.toFixed(2)}, ${cpX.toFixed(2)} ${curr.y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`)
  }
  return segments.join(' ')
})

const areaPath = computed(() => {
  const pts = points.value
  if (pts.length === 0) return ''
  const baseY = props.height - padding
  return `${linePath.value} L ${pts[pts.length - 1].x.toFixed(2)} ${baseY.toFixed(2)} L ${pts[0].x.toFixed(2)} ${baseY.toFixed(2)} Z`
})

const bars = computed(() => {
  const pts = points.value
  const count = pts.length
  if (count === 0) return []
  const totalWidth = props.width - padding * 2
  const barWidth = Math.max(1, (totalWidth / count) * 0.7)
  const baseY = yCoord(0)
  return pts.map((p, i) => {
    const xCenter = padding + ((i + 0.5) / count) * totalWidth
    const x = xCenter - barWidth / 2
    const isNegative = p.v < 0
    const top = isNegative ? baseY : p.y
    const bottom = isNegative ? p.y : baseY
    return {
      x,
      y: top,
      width: barWidth,
      height: Math.max(1, bottom - top),
      negative: isNegative,
    }
  })
})

const zeroLineY = computed(() => yCoord(0))
const showZeroLine = computed(() => props.showZero && range.value.min < 0 && range.value.max > 0)

const last = computed(() => points.value[points.value.length - 1])

const styleVars = computed(() => ({
  ...(props.color ? { '--uid-sparkline-color': props.color } : {}),
  '--uid-sparkline-stroke': String(props.strokeWidth),
}))

const accessibleLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  if (props.data.length === 0) return ''
  const first = props.data[0]
  const lastV = props.data[props.data.length - 1]
  return `Тренд: с ${first} до ${lastV}, ${props.data.length} точек`
})
</script>

<template>
  <span
    class="uid-sparkline"
    :style="styleVars"
    role="img"
    :aria-label="accessibleLabel"
  >
    <svg
      class="uid-sparkline__svg"
      :viewBox="`0 0 ${width} ${height}`"
      :width="width"
      :height="height"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        v-if="showZeroLine"
        class="uid-sparkline__zero"
        :x1="0"
        :x2="width"
        :y1="zeroLineY"
        :y2="zeroLineY"
      />

      <template v-if="type === 'bar'">
        <rect
          v-for="(b, i) in bars"
          :key="i"
          class="uid-sparkline__bar"
          :class="{ 'uid-sparkline__bar--negative': b.negative }"
          :x="b.x"
          :y="b.y"
          :width="b.width"
          :height="b.height"
        />
      </template>

      <template v-else>
        <path
          v-if="type === 'area'"
          class="uid-sparkline__area"
          :d="areaPath"
        />
        <path
          class="uid-sparkline__line"
          :d="linePath"
        />
        <template v-if="showDots">
          <circle
            v-for="(p, i) in points"
            :key="i"
            class="uid-sparkline__dot"
            :cx="p.x"
            :cy="p.y"
            r="2.5"
          />
        </template>
        <circle
          v-if="showLast && last && !showDots"
          class="uid-sparkline__dot uid-sparkline__dot--last"
          :cx="last.x"
          :cy="last.y"
          r="2.5"
        />
      </template>
    </svg>
  </span>
</template>
