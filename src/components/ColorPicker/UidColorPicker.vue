<script setup lang="ts">
import './UidColorPicker.css'
import { computed, onUnmounted, ref, watch } from 'vue'

export interface UidColorPickerProps {
  disabled?: boolean
  presets?: string[]
  alpha?: boolean
}

const props = withDefaults(defineProps<UidColorPickerProps>(), {
  disabled: false,
  presets: undefined,
  alpha: false,
})

const emit = defineEmits<{
  change: [value: string | null]
}>()

const model = defineModel<string | null>({ default: null })

const hue = ref(0)
const saturation = ref(100)
const brightness = ref(100)
const alphaValue = ref(100)

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const gradientRef = ref<HTMLElement | null>(null)
const hueSliderRef = ref<HTMLElement | null>(null)
const alphaSliderRef = ref<HTMLElement | null>(null)
const hexInput = ref('')

const isDraggingGradient = ref(false)
const isDraggingHue = ref(false)
const isDraggingAlpha = ref(false)

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const sv = s / 100
  const vv = v / 100
  const c = vv * sv
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vv - c
  let r = 0; let g = 0; let b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rr = r / 255; const gg = g / 255; const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const delta = max - min
  let h = 0
  const s = max === 0 ? 0 : delta / max
  const v = max
  if (delta !== 0) {
    if (max === rr) h = ((gg - bb) / delta) % 6
    else if (max === gg) h = (bb - rr) / delta + 2
    else h = (rr - gg) / delta + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }
  return [h, Math.round(s * 100), Math.round(v * 100)]
}

function hex2(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
}

function buildHex(): string {
  const [r, g, b] = hsvToRgb(hue.value, saturation.value, brightness.value)
  if (props.alpha && alphaValue.value < 100) {
    return `#${hex2(r)}${hex2(g)}${hex2(b)}${hex2(alphaValue.value / 100 * 255)}`
  }
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`
}

function parseHex(str: string): [number, number, number, number] | null {
  const h = str.replace('#', '').toLowerCase()
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null
    return [r, g, b, 100]
  }
  if (h.length === 8) {
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    const a = parseInt(h.slice(6, 8), 16)
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) return null
    return [r, g, b, Math.round(a / 255 * 100)]
  }
  return null
}

function syncFromModel() {
  if (!model.value) return
  const parsed = parseHex(model.value)
  if (!parsed) return
  const [r, g, b, a] = parsed
  const [h, s, v] = rgbToHsv(r, g, b)
  hue.value = h
  saturation.value = s
  brightness.value = v
  alphaValue.value = a
  hexInput.value = buildHex().toUpperCase()
}

function emitColor() {
  const hex = buildHex()
  model.value = hex
  emit('change', hex)
  hexInput.value = hex.toUpperCase()
}

const pureHue = computed(() => `hsl(${hue.value}, 100%, 50%)`)
const thumbLeft = computed(() => `${saturation.value}%`)
const thumbTop = computed(() => `${100 - brightness.value}%`)
const huePercent = computed(() => `${(hue.value / 360) * 100}%`)
const alphaPercent = computed(() => `${alphaValue.value}%`)
const [rC, gC, bC] = [
  computed(() => hsvToRgb(hue.value, saturation.value, brightness.value)[0]),
  computed(() => hsvToRgb(hue.value, saturation.value, brightness.value)[1]),
  computed(() => hsvToRgb(hue.value, saturation.value, brightness.value)[2]),
]
const currentRgb = computed(() => `rgb(${rC.value}, ${gC.value}, ${bC.value})`)

function pickFromEl(el: HTMLElement | null, e: PointerEvent): { x: number; y: number } | null {
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return {
    x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
  }
}

function onGradientPointerDown(e: PointerEvent) {
  isDraggingGradient.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const pos = pickFromEl(gradientRef.value, e)
  if (!pos) return
  saturation.value = Math.round(pos.x * 100)
  brightness.value = Math.round((1 - pos.y) * 100)
  emitColor()
}

function onGradientPointerMove(e: PointerEvent) {
  if (!isDraggingGradient.value) return
  const pos = pickFromEl(gradientRef.value, e)
  if (!pos) return
  saturation.value = Math.round(pos.x * 100)
  brightness.value = Math.round((1 - pos.y) * 100)
  emitColor()
}

function onGradientPointerUp() { isDraggingGradient.value = false }

function onHuePointerDown(e: PointerEvent) {
  isDraggingHue.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const pos = pickFromEl(hueSliderRef.value, e)
  if (!pos) return
  hue.value = Math.round(pos.x * 360)
  emitColor()
}

function onHuePointerMove(e: PointerEvent) {
  if (!isDraggingHue.value) return
  const pos = pickFromEl(hueSliderRef.value, e)
  if (!pos) return
  hue.value = Math.round(pos.x * 360)
  emitColor()
}

function onHuePointerUp() { isDraggingHue.value = false }

function onAlphaPointerDown(e: PointerEvent) {
  isDraggingAlpha.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const pos = pickFromEl(alphaSliderRef.value, e)
  if (!pos) return
  alphaValue.value = Math.round(pos.x * 100)
  emitColor()
}

function onAlphaPointerMove(e: PointerEvent) {
  if (!isDraggingAlpha.value) return
  const pos = pickFromEl(alphaSliderRef.value, e)
  if (!pos) return
  alphaValue.value = Math.round(pos.x * 100)
  emitColor()
}

function onAlphaPointerUp() { isDraggingAlpha.value = false }

function onHexInput(e: Event) {
  hexInput.value = (e.target as HTMLInputElement).value
}

function applyHexInput() {
  const parsed = parseHex(hexInput.value)
  if (parsed) {
    const [r, g, b, a] = parsed
    const [h, s, v] = rgbToHsv(r, g, b)
    hue.value = h
    saturation.value = s
    brightness.value = v
    if (props.alpha) alphaValue.value = a
    emitColor()
  } else {
    hexInput.value = buildHex().toUpperCase()
  }
}

function onHexKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') applyHexInput()
}

function selectPreset(color: string) {
  const parsed = parseHex(color)
  if (!parsed) return
  const [r, g, b, a] = parsed
  const [h, s, v] = rgbToHsv(r, g, b)
  hue.value = h
  saturation.value = s
  brightness.value = v
  if (props.alpha) alphaValue.value = a
  emitColor()
}

function open() {
  if (props.disabled) return
  syncFromModel()
  if (!model.value) hexInput.value = ''
  isOpen.value = true
}

function close() { isOpen.value = false }

function toggle() {
  if (isOpen.value) close(); else open()
}

function onOutsideClick(e: PointerEvent) {
  if (!containerRef.value?.contains(e.target as Node)) close()
}

watch(isOpen, (val) => {
  if (val) document.addEventListener('pointerdown', onOutsideClick)
  else document.removeEventListener('pointerdown', onOutsideClick)
})

onUnmounted(() => document.removeEventListener('pointerdown', onOutsideClick))
</script>

<template>
  <div
    ref="containerRef"
    class="uid-colorpicker"
    :class="{ 'uid-colorpicker--open': isOpen, 'uid-colorpicker--disabled': disabled }"
  >
    <button
      type="button"
      class="uid-colorpicker__trigger"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      @click="toggle"
    >
      <span
        class="uid-colorpicker__swatch"
        :style="model ? { background: model } : {}"
      />
      <span
        class="uid-colorpicker__trigger-label"
        :class="{ 'uid-colorpicker__trigger-label--empty': !model }"
      >
        {{ model ? model.toUpperCase() : 'Выберите цвет' }}
      </span>
    </button>

    <Transition name="uid-colorpicker-panel">
      <div
        v-if="isOpen"
        class="uid-colorpicker__panel"
        role="dialog"
        aria-label="Выбор цвета"
      >
        <div
          ref="gradientRef"
          class="uid-colorpicker__gradient"
          :style="{ '--_hue': pureHue }"
          @pointerdown="onGradientPointerDown"
          @pointermove="onGradientPointerMove"
          @pointerup="onGradientPointerUp"
        >
          <div
            class="uid-colorpicker__gradient-thumb"
            :style="{ left: thumbLeft, top: thumbTop }"
          />
        </div>

        <div class="uid-colorpicker__controls">
          <div class="uid-colorpicker__sliders">
            <div
              ref="hueSliderRef"
              class="uid-colorpicker__hue-track"
              @pointerdown="onHuePointerDown"
              @pointermove="onHuePointerMove"
              @pointerup="onHuePointerUp"
            >
              <div
                class="uid-colorpicker__track-thumb"
                :style="{ left: huePercent }"
              />
            </div>

            <div
              v-if="alpha"
              ref="alphaSliderRef"
              class="uid-colorpicker__alpha-track"
              :style="{ '--_color': currentRgb }"
              @pointerdown="onAlphaPointerDown"
              @pointermove="onAlphaPointerMove"
              @pointerup="onAlphaPointerUp"
            >
              <div
                class="uid-colorpicker__track-thumb"
                :style="{ left: alphaPercent }"
              />
            </div>
          </div>

          <span
            class="uid-colorpicker__preview"
            :style="{ background: currentRgb }"
          />
        </div>

        <div class="uid-colorpicker__inputs">
          <label class="uid-colorpicker__input-label">HEX</label>
          <input
            class="uid-colorpicker__hex-input"
            type="text"
            :value="hexInput"
            maxlength="9"
            spellcheck="false"
            @input="onHexInput"
            @blur="applyHexInput"
            @keydown="onHexKeydown"
          />
        </div>

        <div
          v-if="presets && presets.length"
          class="uid-colorpicker__presets"
        >
          <button
            v-for="preset in presets"
            :key="preset"
            type="button"
            class="uid-colorpicker__preset"
            :class="{ 'uid-colorpicker__preset--active': model === preset || model === preset.toLowerCase() || model?.toUpperCase() === preset.toUpperCase() }"
            :style="{ background: preset }"
            :aria-label="preset"
            @click="selectPreset(preset)"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
